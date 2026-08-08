import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Redeem access code
router.post('/redeem', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const accessCode = await prisma.accessCode.findUnique({ where: { code } });
    if (!accessCode || !accessCode.isActive) return res.status(404).json({ error: 'Invalid or expired code' });
    if (accessCode.endDate && accessCode.endDate < new Date()) return res.status(410).json({ error: 'Code has expired' });
    if (accessCode.maxUses && accessCode.currentUses >= accessCode.maxUses) return res.status(410).json({ error: 'Code has reached maximum uses' });
    
    const existing = await prisma.accessCodeRedemption.findUnique({
      where: { accessCodeId_userId: { accessCodeId: accessCode.id, userId: req.userId! } }
    });
    if (existing) return res.status(409).json({ error: 'Code already redeemed' });

    await prisma.accessCodeRedemption.create({ data: { accessCodeId: accessCode.id, userId: req.userId! } });
    await prisma.accessCode.update({ where: { id: accessCode.id }, data: { currentUses: { increment: 1 } } });
    res.json({ message: 'Code redeemed successfully', features: accessCode.allowedFeatures });
  } catch (error) { res.status(500).json({ error: 'Failed to redeem code' }); }
});

// Admin: Create access code
router.post('/', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const code = req.body.code || Math.random().toString(36).substring(2, 10).toUpperCase();
    const accessCode = await prisma.accessCode.create({ data: { ...req.body, code, createdBy: req.userId! } });
    res.status(201).json(accessCode);
  } catch (error) { res.status(500).json({ error: 'Failed to create code' }); }
});

router.get('/', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const codes = await prisma.accessCode.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { redemptions: true } } } });
    res.json(codes);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch codes' }); }
});

export { router as accessCodesRouter };
