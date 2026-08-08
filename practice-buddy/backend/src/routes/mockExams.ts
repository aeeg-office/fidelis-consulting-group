import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/mock-exams — List available mock exams
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { examId } = req.query;
    const where: any = {};
    if (examId) where.examId = examId as string;

    const exams = await prisma.mockExam.findMany({
      where,
      include: {
        exam: { select: { id: true, name: true, code: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: [{ isOfficial: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mock exams' });
  }
});

// GET /api/mock-exams/:id — Get a specific mock exam with modules
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const exam = await prisma.mockExam.findUnique({
      where: { id: req.params.id as string},
      include: {
        exam: { select: { id: true, name: true, code: true } },
        _count: { select: { attempts: true } },
      },
    });
    if (!exam) return res.status(404).json({ error: 'Mock exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mock exam' });
  }
});

// POST /api/mock-exams/start — Start a mock exam attempt
router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mockExamId } = req.body;
    if (!mockExamId) {
      return res.status(400).json({ error: 'mockExamId is required' });
    }

    const mockExam = await prisma.mockExam.findUnique({
      where: { id: mockExamId },
    });
    if (!mockExam) return res.status(404).json({ error: 'Mock exam not found' });

    // Check for existing incomplete attempt
    const existing = await prisma.mockExamAttempt.findFirst({
      where: { userId: req.userId!, mockExamId, completed: false },
    });
    if (existing) {
      return res.json({
        attemptId: existing.id,
        mockExam,
        startTime: existing.startTime,
        isResume: true,
      });
    }

    const attempt = await prisma.mockExamAttempt.create({
      data: { userId: req.userId!, mockExamId, startTime: new Date() },
    });

    res.status(201).json({
      attemptId: attempt.id,
      mockExam,
      startTime: attempt.startTime,
      isResume: false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start mock exam' });
  }
});

// POST /api/mock-exams/submit — Submit mock exam answers
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId, answers, scores } = req.body; // answers: [{ questionId, answer, isCorrect, timeSpent }]
    if (!attemptId) {
      return res.status(400).json({ error: 'attemptId is required' });
    }

    const attempt = await prisma.mockExamAttempt.findFirst({
      where: { id: attemptId, userId: req.userId! },
      include: { mockExam: true },
    });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    // Calculate scores per module if not provided
    let finalScores = scores;
    if (!finalScores && answers) {
      finalScores = [];
      const moduleGroups: Record<string, any> = {};
      for (const a of answers) {
        const modName = a.moduleName || 'Module 1';
        if (!moduleGroups[modName]) moduleGroups[modName] = { correct: 0, total: 0 };
        moduleGroups[modName].total++;
        if (a.isCorrect) moduleGroups[modName].correct++;
      }
      for (const [name, data] of Object.entries(moduleGroups)) {
        finalScores.push({ module: name, score: data.correct, total: data.total });
      }
    }

    const updatedAttempt = await prisma.mockExamAttempt.update({
      where: { id: attemptId },
      data: {
        endTime: new Date(),
        answers: answers || undefined,
        scores: finalScores || undefined,
        completed: true,
      },
    });

    res.json(updatedAttempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit mock exam' });
  }
});

// GET /api/mock-exams/results — Get user's mock exam results
router.get('/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { mockExamId } = req.query;
    const where: any = { userId: req.userId! };
    if (mockExamId) where.mockExamId = mockExamId as string;

    const attempts = await prisma.mockExamAttempt.findMany({
      where,
      include: {
        mockExam: { select: { id: true, name: true, code: true, isOfficial: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 20,
    });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mock exam results' });
  }
});

// GET /api/mock-exams/results/:attemptId — Get specific attempt detail
router.get('/results/:attemptId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attempt = await prisma.mockExamAttempt.findFirst({
      where: { id: req.params.attemptId as string, userId: req.userId! },
      include: {
        mockExam: {
          select: { id: true, name: true, code: true, module: true, duration: true, isOfficial: true },
        },
      },
    });
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
});

// POST /api/mock-exams/create — Admin: Create a mock exam
router.post('/create', authenticate, requireRole('administrator', 'superAdministrator', 'curriculumEditor'), async (req: AuthRequest, res: Response) => {
  try {
    const { examId, name, code, module, duration, isOfficial } = req.body;
    if (!examId || !name || !code) {
      return res.status(400).json({ error: 'examId, name, and code are required' });
    }

    const existing = await prisma.mockExam.findUnique({ where: { code } });
    if (existing) return res.status(409).json({ error: 'Mock exam code already exists' });

    const mockExam = await prisma.mockExam.create({
      data: {
        examId,
        name,
        code,
        module: module || undefined,
        duration: duration ? parseInt(duration) : null,
        isOfficial: isOfficial || false,
        createdBy: req.userId!,
      },
      include: { exam: { select: { id: true, name: true } } },
    });
    res.status(201).json(mockExam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mock exam' });
  }
});

// PUT /api/mock-exams/:id — Admin: Update a mock exam
router.put('/:id', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, module, duration, isOfficial } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (module !== undefined) data.module = module;
    if (duration !== undefined) data.duration = parseInt(duration);
    if (isOfficial !== undefined) data.isOfficial = isOfficial;

    const exam = await prisma.mockExam.update({ where: { id: req.params.id as string}, data });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mock exam' });
  }
});

// DELETE /api/mock-exams/:id — Admin: Delete a mock exam
router.delete('/:id', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const attemptCount = await prisma.mockExamAttempt.count({ where: { mockExamId: req.params.id as string} });
    if (attemptCount > 0) {
      return res.status(409).json({ error: `Cannot delete: ${attemptCount} attempt(s) exist. Deactivate instead.` });
    }
    await prisma.mockExam.delete({ where: { id: req.params.id as string} });
    res.json({ message: 'Mock exam deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mock exam' });
  }
});

export { router as mockExamsRouter };