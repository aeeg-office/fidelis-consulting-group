import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/diagnostics/exams — List available diagnostic exams
router.get('/exams', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const exams = await prisma.diagnosticExam.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagnostic exams' });
  }
});

// POST /api/diagnostics/start — Start a diagnostic assessment
router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { examId, subjectId } = req.body;
    if (!examId && !subjectId) {
      return res.status(400).json({ error: 'examId or subjectId is required' });
    }

    // Initialize a diagnostic session — returns metadata and questions
    const whereQuestions: any = {};
    if (examId) whereQuestions.examId = examId;
    if (subjectId) whereQuestions.subjectId = subjectId;

    // Pick diagnostic cohort questions (balanced across difficulty and categories)
    const questions = await prisma.question.findMany({
      where: { ...whereQuestions, publicationStatus: 'active' },
      select: {
        id: true, aeeqId: true, difficulty: true, questionFormat: true,
        passageType: true, questionStem: true, answerOptions: true,
        estimatedTime: true, categoryId: true,
      },
      take: 40, // diagnostic cap
      orderBy: { createdAt: 'desc' },
    });

    // Track what was assigned
    if (req.userId) {
      await prisma.user.update({
        where: { id: req.userId },
        data: {
          diagnosticCohort: {
            examId,
            subjectId,
            questionCount: questions.length,
            startedAt: new Date().toISOString(),
          },
        },
      });
    }

    res.json({
      examId,
      subjectId,
      questions,
      totalQuestions: questions.length,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start diagnostic' });
  }
});

// POST /api/diagnostics/submit — Submit diagnostic answers and get results
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { examId, subjectId, answers } = req.body; // answers: [{ questionId, answer, timeSpent }]
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    const userId = req.userId!;

    // Grade the diagnostic
    const questionIds = answers.map((a: any) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true, difficulty: true, microSkillId: true, categoryId: true },
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));
    let correctCount = 0;
    const skillResults: Record<string, { correct: number; total: number }> = {};

    for (const answer of answers) {
      const q = questionMap.get(answer.questionId);
      if (!q) continue;
      const isCorrect = q.correctAnswer === answer.answer;
      if (isCorrect) correctCount++;

      const skillId = q.microSkillId || q.categoryId;
      if (skillId) {
        if (!skillResults[skillId]) skillResults[skillId] = { correct: 0, total: 0 };
        skillResults[skillId].total++;
        if (isCorrect) skillResults[skillId].correct++;
      }
    }

    const totalQuestions = answers.length;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Identify learning gaps (skills below 70% accuracy)
    const learningGaps = Object.entries(skillResults)
      .filter(([, v]) => v.total > 0 && (v.correct / v.total) < 0.7)
      .map(([skillId, v]) => ({ skillId, accuracy: v.correct / v.total, correct: v.correct, total: v.total }));

    // Determine readiness level
    let readiness = '';
    if (score >= 90) readiness = 'exceeded';
    else if (score >= 75) readiness = 'ready';
    else if (score >= 50) readiness = 'developing';
    else readiness = 'not_ready';

    // Estimate scaled score (simplified heuristic)
    const estimatedScore = Math.round(200 + (score / 100) * 600); // 200-800 scale

    // Save diagnostic result
    const result = await prisma.diagnosticResult.create({
      data: {
        userId,
        examId: examId || null,
        subjectId: subjectId || null,
        score,
        baseline: score,
        readiness,
        estimatedScore,
        learningGaps,
        completedAt: new Date(),
      },
    });

    res.json({
      resultId: result.id,
      score,
      correctCount,
      totalQuestions,
      readiness,
      estimatedScore,
      learningGaps,
      skillBreakdown: skillResults,
      completedAt: result.completedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit diagnostic' });
  }
});

// GET /api/diagnostics/results — Get user's diagnostic results
router.get('/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const results = await prisma.diagnosticResult.findMany({
      where: { userId: req.userId! },
      include: {
        exam: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true } },
        skill: { select: { id: true, name: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagnostic results' });
  }
});

// GET /api/diagnostics/results/:id — Get specific diagnostic result
router.get('/results/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.diagnosticResult.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
      include: {
        exam: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true } },
        skill: { select: { id: true, name: true, code: true } },
      },
    });
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagnostic result' });
  }
});

// GET /api/diagnostics/recommendations — Get curriculum recommendations based on gaps
router.get('/recommendations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get latest diagnostic result
    const latestResult = await prisma.diagnosticResult.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    if (!latestResult) {
      return res.status(404).json({ error: 'No diagnostic results found. Take a diagnostic first.' });
    }

    // Find learning objects for gap skills
    const gaps = (latestResult.learningGaps as any[]) || [];
    const recommendations: any[] = [];

    for (const gap of gaps) {
      if (!gap.skillId) continue;

      const learningObjects = await prisma.learningObject.findMany({
        where: { microSkillId: gap.skillId },
        select: { id: true, title: true, objective: true, lesson: true },
        take: 3,
      });

      const skill = await prisma.microSkill.findUnique({
        where: { id: gap.skillId },
        select: { id: true, name: true, code: true, category: { select: { name: true } } },
      });

      if (learningObjects.length > 0 || skill) {
        recommendations.push({
          skill: skill || { id: gap.skillId },
          accuracy: gap.accuracy,
          learningObjects,
          priority: gap.accuracy < 0.4 ? 'high' : gap.accuracy < 0.6 ? 'medium' : 'low',
        });
      }
    }

    // Also recommend weak areas from mastery data
    const weakMastery = await prisma.mastery.findMany({
      where: { userId, level: { in: ['notAssessed', 'beginning', 'developing'] } },
      include: {
        microSkillRef: { select: { id: true, name: true } },
      },
      orderBy: { level: 'asc' },
      take: 5,
    });

    res.json({
      diagnosticId: latestResult.id,
      score: latestResult.score,
      readiness: latestResult.readiness,
      estimatedScore: latestResult.estimatedScore,
      gapRecommendations: recommendations,
      weakAreas: weakMastery.map(m => ({
        skill: m.microSkillRef?.name || m.microSkill || 'Unknown',
        level: m.level,
        needsReview: m.needsReview,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// DELETE /api/diagnostics/results/:id — Delete a diagnostic result (student or admin)
router.delete('/results/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.diagnosticResult.findFirst({
      where: { id: req.params.id as string},
    });
    if (!result) return res.status(404).json({ error: 'Result not found' });
    if (result.userId !== req.userId && !['administrator', 'superAdministrator'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.diagnosticResult.delete({ where: { id: req.params.id as string} });
    res.json({ message: 'Diagnostic result deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete diagnostic result' });
  }
});

export { router as diagnosticsRouter };