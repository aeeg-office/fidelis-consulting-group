import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get plans
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    res.json(plans);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch plans' }); }
});

// Get user subscriptions
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const subs = await prisma.subscription.findMany({
      where: { ownerId: req.userId! },
      include: { plan: { select: { name: true, code: true, features: true } }, seatAssignments: { include: { student: { select: { id: true, username: true, displayName: true } } } } }
    });
    res.json(subs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch subscriptions' }); }
});

// Admin: Create plan
router.post('/plans', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.subscriptionPlan.create({ data: req.body });
    res.status(201).json(plan);
  } catch (error) { res.status(500).json({ error: 'Failed to create plan' }); }
});

// Admin: Create subscription
router.post('/create', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { planId, ownerId, seatCount, endDate } = req.body;
    const sub = await prisma.subscription.create({ data: { planId, ownerId, seatCount: parseInt(seatCount) || 1, endDate: endDate ? new Date(endDate) : null } });
    res.status(201).json(sub);
  } catch (error) { res.status(500).json({ error: 'Failed to create subscription' }); }
});

// Assign seat
router.post('/seats', authenticate, requireRole('administrator', 'superAdministrator', 'teacher', 'seniorTeacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId, studentId } = req.body;
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    if (sub.seatsUsed >= sub.seatCount) return res.status(403).json({ error: 'No available seats' });

    const seat = await prisma.subscriptionSeat.create({ data: { subscriptionId, studentId } });
    await prisma.subscription.update({ where: { id: subscriptionId }, data: { seatsUsed: { increment: 1 } } });
    res.status(201).json(seat);
  } catch (error) { res.status(500).json({ error: 'Failed to assign seat' }); }
});

export { router as subscriptionsRouter };
