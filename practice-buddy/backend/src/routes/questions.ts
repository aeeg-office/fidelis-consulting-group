import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get questions (with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, domainId, categoryId, subcategoryId, difficulty, examId, limit, offset, format } = req.query;
    
    const where: any = { publicationStatus: 'active' };
    if (subjectId) where.subjectId = String(subjectId);
    if (domainId) where.domainId = String(domainId);
    if (categoryId) where.categoryId = String(categoryId);
    if (subcategoryId) where.subcategoryId = String(subcategoryId);
    if (difficulty) where.difficulty = String(difficulty);
    if (examId) where.examId = String(examId);
    if (format) where.questionFormat = String(format);

    // Students don't get answer keys
    const selectFields: any = {
      id: true, aeeqId: true, examId: true, subjectId: true, domainId: true,
      categoryId: true, subcategoryId: true, microSkill: true, difficulty: true,
      questionFormat: true, passageType: true, passageText: true, pairedPassageText: true,
      passageAttribution: true, questionStem: true, answerOptions: true,
      calculatorAllowed: true, desmosRecommended: true,
      figureAsset: true, figureAltText: true, isPaired: true, hasChart: true,
      hasTable: true, hasEquation: true, estimatedTime: true,
      category: { select: { name: true, code: true } },
      subcategory: { select: { name: true, code: true } },
      domain: { select: { name: true, code: true } },
      subject: { select: { name: true, code: true } },
    };

    // Teachers and admins see answers
    const role = req.userRole || '';
    if (['teacher', 'seniorTeacher', 'curriculumEditor', 'contentReviewer', 'administrator', 'superAdministrator'].includes(role)) {
      selectFields.correctAnswer = true;
      selectFields.acceptedResponses = true;
      selectFields.firstAttemptStrategy = true;
      selectFields.firstAttemptHint = true;
      selectFields.shortExplanation = true;
      selectFields.expandedExplanation = true;
      selectFields.solutionSteps = true;
      selectFields.wrongAnswerRationales = true;
    }

    const take = Math.min(parseInt(String(limit || '20')), 50);
    const skip = parseInt(String(offset || '0'));
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        select: selectFields,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    res.json({ questions, total, limit: take, offset: skip });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get single question (no answer for students)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.params.id);
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        category: { select: { name: true, code: true } },
        subcategory: { select: { name: true, code: true } },
        domain: { select: { name: true, code: true } },
        subject: { select: { name: true, code: true } },
      }
    });

    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Strip answer for non-staff students
    const role = req.userRole || '';
    const isStaff = ['teacher', 'seniorTeacher', 'curriculumEditor', 'contentReviewer', 'administrator', 'superAdministrator'].includes(role);
    if (!isStaff) {
      const { correctAnswer, acceptedResponses, ...safe } = question as any;
      res.json(safe);
    } else {
      res.json(question);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Get question with answers for practice session (after attempt)
router.post('/:id/reveal', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.params.id);
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true, correctAnswer: true, acceptedResponses: true,
        firstAttemptStrategy: true, firstAttemptHint: true,
        shortExplanation: true, expandedExplanation: true,
        solutionSteps: true, wrongAnswerRationales: true,
        commonMisconceptions: true, difficulty: true,
        categoryId: true, subcategoryId: true,
      }
    });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reveal answer' });
  }
});

// Flag a question
router.post('/:id/flag', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.params.id);
    const { flagType, description } = req.body;
    const flag = await prisma.questionFlag.create({
      data: { userId: req.userId!, questionId, flagType: flagType || 'error', description: description || 'No description' }
    });
    res.status(201).json(flag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to flag question' });
  }
});

// Bookmark a question
router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.params.id);
    const existing = await prisma.bookmark.findUnique({
      where: { userId_questionId: { userId: req.userId!, questionId } }
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      res.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: { userId: req.userId!, questionId, note: req.body?.note }
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

export { router as questionsRouter };