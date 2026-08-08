import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mastery = await prisma.mastery.findMany({
      where: { userId: req.userId! },
      include: { microSkillRef: { select: { id: true, name: true, code: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(mastery);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch mastery' }); }
});

router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mastery = await prisma.mastery.findMany({ where: { userId: req.userId! } });
    const weakest = mastery.filter(m => m.level === 'beginning' || m.level === 'needsReview').sort((a, b) => a.firstAttemptCorrect / Math.max(a.firstAttemptCount, 1) - b.firstAttemptCorrect / Math.max(b.firstAttemptCount, 1)).slice(0, 5);
    const strongest = mastery.filter(m => m.level === 'mastered' || m.level === 'approaching').sort((a, b) => b.firstAttemptCorrect / Math.max(b.firstAttemptCount, 1) - a.firstAttemptCorrect / Math.max(a.firstAttemptCount, 1)).slice(0, 5);
    const mastered = mastery.filter(m => m.level === 'mastered').length;
    const total = mastery.length;
    res.json({ weakest, strongest, mastered, total, overallProgress: total > 0 ? (mastered / total * 100).toFixed(0) : 0 });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch mastery summary' }); }
});

export { router as masteryRouter };
