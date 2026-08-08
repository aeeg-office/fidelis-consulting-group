import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Start a practice session
router.post('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionType, examId, subjectId, domainId, categoryId, subcategoryId, difficulty, isTimed, timeLimit, questionCount, deviceType, deviceId } = req.body;
    
    const session = await prisma.practiceSession.create({
      data: {
        userId: req.userId!, sessionType: sessionType || 'targeted', examId, subjectId,
        domainId, categoryId, subcategoryId, difficulty, isTimed: isTimed || false,
        timeLimit: timeLimit ? parseInt(timeLimit) : null, questionCount: parseInt(questionCount) || 10,
        deviceType, deviceId,
      }
    });

    // Pick questions based on filters
    const where: any = { publicationStatus: 'active' };
    if (subjectId) where.subjectId = String(subjectId);
    if (domainId) where.domainId = String(domainId);
    if (categoryId) where.categoryId = String(categoryId);
    if (subcategoryId) where.subcategoryId = String(subcategoryId);
    if (difficulty && difficulty !== 'mixed' && difficulty !== 'adaptive') where.difficulty = String(difficulty);
    if (examId) where.examId = String(examId);

    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true, aeeqId: true, difficulty: true, questionFormat: true,
        passageType: true, passageText: true, pairedPassageText: true,
        passageAttribution: true, questionStem: true, answerOptions: true,
        calculatorAllowed: true, desmosRecommended: true,
        figureAsset: true, figureAltText: true, isPaired: true,
        hasChart: true, hasTable: true, hasEquation: true,
        estimatedTime: true, microSkill: true,
        category: { select: { name: true, code: true } },
        subcategory: { select: { name: true, code: true } },
        domain: { select: { name: true, code: true } },
      },
      take: parseInt(questionCount) || 10,
      orderBy: { createdAt: 'desc' },
    });

    res.status(201).json({ session, questions, totalQuestions: questions.length });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Submit an answer
router.post('/sessions/:sessionId/answer', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, selectedAnswer, attemptNumber, timeSpent, confidence } = req.body;
    const sessionId = req.params.sessionId as string;

    // Get the correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, correctAnswer: true, acceptedResponses: true, firstAttemptStrategy: true, firstAttemptHint: true, shortExplanation: true, expandedExplanation: true, wrongAnswerRationales: true, commonMisconceptions: true, solutionSteps: true, categoryId: true, subcategoryId: true, difficulty: true, questionFormat: true }
    });
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Check if answer is correct
    let isCorrect = false;
    if (question.questionFormat === 'studentProducedResponse') {
      const accepted = question.acceptedResponses as string[] || [question.correctAnswer];
      isCorrect = accepted.some(a => {
        const clean = (s: string) => s.trim().toLowerCase();
        return clean(a) === clean(selectedAnswer) || Math.abs(parseFloat(a) - parseFloat(selectedAnswer)) < 0.005;
      });
    } else {
      isCorrect = selectedAnswer === question.correctAnswer;
    }

    // Save attempt
    const attempt = await prisma.studentAttempt.create({
      data: {
        userId: req.userId!, questionId, sessionId: sessionId || undefined,
        attemptNumber: attemptNumber || 1, selectedAnswer, isCorrect,
        timeSpent: timeSpent ? parseInt(timeSpent) : null,
        confidence: confidence ? parseInt(confidence) : null,
      }
    });

    // Update session stats
    if (sessionId) {
      const session = await prisma.practiceSession.findUnique({ where: { id: sessionId } });
      if (session) {
        await prisma.practiceSession.update({
          where: { id: sessionId },
          data: {
            questionsAnswered: { increment: 1 },
            timeElapsed: timeSpent ? { increment: parseInt(timeSpent) } : undefined,
            ...(isCorrect && attemptNumber === 1 ? { firstAttemptCorrect: { increment: 1 } } : {}),
            ...(isCorrect && attemptNumber === 2 ? { secondAttemptCorrect: { increment: 1 } } : {}),
          }
        });
      }
    }

    // Update mastery
    await updateMastery(req.userId!, question);

    // Return response based on attempt number
    const response: any = {
      attemptId: attempt.id,
      isCorrect,
      attemptNumber: attemptNumber || 1,
      strategy: question.firstAttemptStrategy,
    };

    if (isCorrect && attemptNumber === 1) {
      response.message = getRandomPraise();
      response.explanation = question.shortExplanation;
    } else if (!isCorrect && attemptNumber === 1) {
      response.message = "Not quite. Review the strategy and try again.";
      response.hint = question.firstAttemptHint;
      response.showStrategy = true;
    } else if (isCorrect && attemptNumber === 2) {
      response.message = "Correct on the second attempt! You identified the right approach.";
      response.explanation = question.shortExplanation;
      response.expandedExplanation = question.expandedExplanation;
      response.wrongAnswerRationales = question.wrongAnswerRationales;
    } else {
      response.message = `The correct answer is ${question.correctAnswer}.`;
      response.explanation = question.shortExplanation;
      response.expandedExplanation = question.expandedExplanation;
      response.wrongAnswerRationales = question.wrongAnswerRationales;
      response.solutionSteps = question.solutionSteps;
      response.commonMisconceptions = question.commonMisconceptions;
      response.showCorrectAnswer = true;
    }

    res.json(response);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get sessions
router.get('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.practiceSession.findMany({
      where: { userId: req.userId! },
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: {
        _count: { select: { attempts: true } },
      }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get session detail
router.get('/sessions/:sessionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.practiceSession.findFirst({
      where: { id: req.params.sessionId as string, userId: req.userId! },
      include: {
        attempts: {
          include: {
            question: { select: { id: true, aeeqId: true, difficulty: true, questionStem: true, answerOptions: true, category: { select: { name: true } }, subcategory: { select: { name: true } } } }
          }
        }
      }
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Complete a session
router.post('/sessions/:sessionId/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.practiceSession.update({
      where: { id: req.params.sessionId as string },
      data: { status: 'completed', completedAt: new Date() }
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Helper functions
function getRandomPraise(): string {
  const messages = [
    "Excellent!", "Correct — well done!", "Strong reasoning.",
    "You identified the key clue.", "Nice work.",
    "Correct. Your method matches the recommended strategy.",
    "Perfect!", "Great answer!", "You're on the right track.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

async function updateMastery(userId: string, question: any) {
  try {
    const categoryId = question.categoryId;
    const subcategoryId = question.subcategoryId;
    const microSkill = question.microSkill || null;
    const difficulty = question.difficulty;

    // Get recent attempts for this skill area
    const where: any = { userId, questionId: { in: (await prisma.question.findMany({ where: { categoryId }, select: { id: true } })).map(q => q.id) } };
    
    const attempts = await prisma.studentAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const firstAttempts = attempts.filter(a => a.attemptNumber === 1);
    const firstCorrect = firstAttempts.filter(a => a.isCorrect).length;
    const firstTotal = firstAttempts.length;
    const secondAttempts = attempts.filter(a => a.attemptNumber === 2);
    const secondCorrect = secondAttempts.filter(a => a.isCorrect).length;

    let level = 'beginning';
    const firstRate = firstTotal > 0 ? firstCorrect / firstTotal : 0;
    const secondRate = secondAttempts.length > 0 ? secondCorrect / secondAttempts.length : 0;

    if (firstTotal >= 10 && firstRate >= 0.85) level = 'mastered';
    else if (firstTotal >= 5 && firstRate >= 0.70) level = 'approaching';
    else if (firstTotal >= 3 && firstRate >= 0.50) level = 'developing';
    else if (firstTotal >= 1) level = 'beginning';

    // Upsert mastery
    const uniqueFields: any = { userId, categoryId, subcategoryId: subcategoryId || '', microSkill: microSkill || '', difficulty: difficulty || 'medium' };
    const existing = await prisma.mastery.findFirst({ where: uniqueFields });

    if (existing) {
      await prisma.mastery.update({
        where: { id: existing.id },
        data: {
          level: level as any, firstAttemptCount: firstTotal, firstAttemptCorrect: firstCorrect,
          secondAttemptCount: secondAttempts.length, secondAttemptCorrect: secondCorrect,
          totalAttempts: attempts.length, totalCorrect: firstCorrect + secondCorrect,
          lastPracticedAt: new Date(), needsReview: firstTotal > 0 && firstRate < 0.5,
        }
      });
    } else {
      await prisma.mastery.create({
        data: {
          ...uniqueFields, userId,
          level: level as any, firstAttemptCount: firstTotal, firstAttemptCorrect: firstCorrect,
          secondAttemptCount: secondAttempts.length, secondAttemptCorrect: secondCorrect,
          totalAttempts: attempts.length, totalCorrect: firstCorrect + secondCorrect,
          lastPracticedAt: new Date(), needsReview: firstTotal > 0 && firstRate < 0.5,
        }
      });
    }
  } catch (error) {
    console.error('Error updating mastery:', error);
  }
}

export { router as practiceRouter };
