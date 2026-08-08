import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get student assignments
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await prisma.studentAssignment.findMany({
      where: { studentId: req.userId! },
      include: { assignment: { include: { class: { select: { name: true } }, creator: { select: { displayName: true } }, _count: { select: { questions: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch assignments' }); }
});

// Start assignment
router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sa = await prisma.studentAssignment.update({
      where: { assignmentId_studentId: { assignmentId: req.params.id as string, studentId: req.userId! } },
      data: { status: 'inProgress', startedAt: new Date() }
    });
    // Get questions
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id as string },
      include: { questions: { include: { question: { select: { id: true, aeeqId: true, difficulty: true, questionFormat: true, passageText: true, questionStem: true, answerOptions: true, figureAsset: true, figureAltText: true, calculatorAllowed: true, hasChart: true, hasTable: true, hasEquation: true, category: { select: { name: true } }, subcategory: { select: { name: true } } } } }, orderBy: { sortOrder: 'asc' } } }
    });
    res.json({ assignment: sa, questions: assignment?.questions.map(q => q.question) || [] });
  } catch (error) { res.status(500).json({ error: 'Failed to start assignment' }); }
});

// Submit assignment
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sa = await prisma.studentAssignment.update({
      where: { assignmentId_studentId: { assignmentId: req.params.id as string, studentId: req.userId! } },
      data: { status: 'completed', completedAt: new Date() }
    });
    res.json(sa);
  } catch (error) { res.status(500).json({ error: 'Failed to submit assignment' }); }
});

export { router as assignmentsRouter };
