import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/subscriptions/licenses — Get licenses for the current user
router.get('/licenses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = { userId: req.userId! };
    if (status) where.status = status as string;

    const licenses = await prisma.subscriptionLicense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

// GET /api/subscriptions/licenses/all — Admin: Get all licenses
router.get('/licenses/all', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, type } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (type) where.type = type as string;

    const licenses = await prisma.subscriptionLicense.findMany({
      where,
      include: { user: { select: { id: true, username: true, displayName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all licenses' });
  }
});

// GET /api/subscriptions/licenses/:id — Get license details
router.get('/licenses/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const license = await prisma.subscriptionLicense.findFirst({
      where: { id: req.params.id as string},
    });
    if (!license) return res.status(404).json({ error: 'License not found' });

    // Check ownership or admin
    if (license.userId !== req.userId && !['administrator', 'superAdministrator'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(license);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch license' });
  }
});

// POST /api/subscriptions/activate — Activate a new license
router.post('/activate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, type, maxStudents, startDate, endDate } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    // Check for existing active license of same type
    const existing = await prisma.subscriptionLicense.findFirst({
      where: { userId: req.userId!, planId, status: 'active' },
    });
    if (existing) {
      return res.status(409).json({ error: 'An active license for this plan already exists' });
    }

    const license = await prisma.subscriptionLicense.create({
      data: {
        userId: req.userId!,
        planId,
        type: type || 'individual',
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json(license);
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate license' });
  }
});

// POST /api/subscriptions/activate/admin — Admin: Activate license for any user
router.post('/activate/admin', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, planId, type, maxStudents, startDate, endDate } = req.body;
    if (!userId || !planId) {
      return res.status(400).json({ error: 'userId and planId are required' });
    }

    const license = await prisma.subscriptionLicense.create({
      data: {
        userId,
        planId,
        type: type || 'individual',
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { user: { select: { id: true, username: true, displayName: true } } },
    });

    res.status(201).json(license);
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate license for user' });
  }
});

// PUT /api/subscriptions/cancel — Cancel a license
router.put('/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { licenseId } = req.body;
    if (!licenseId) {
      return res.status(400).json({ error: 'licenseId is required' });
    }

    const license = await prisma.subscriptionLicense.findUnique({ where: { id: licenseId } });
    if (!license) return res.status(404).json({ error: 'License not found' });

    // Only owner or admin can cancel
    if (license.userId !== req.userId && !['administrator', 'superAdministrator'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.subscriptionLicense.update({
      where: { id: licenseId },
      data: { status: 'canceled', endDate: new Date() },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel license' });
  }
});

// PUT /api/subscriptions/suspend — Admin: Suspend a license
router.put('/suspend', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { licenseId } = req.body;
    if (!licenseId) return res.status(400).json({ error: 'licenseId is required' });

    const updated = await prisma.subscriptionLicense.update({
      where: { id: licenseId },
      data: { status: 'suspended' },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to suspend license' });
  }
});

// PUT /api/subscriptions/reactivate — Admin: Reactivate a suspended/canceled license
router.put('/reactivate', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { licenseId, endDate } = req.body;
    if (!licenseId) return res.status(400).json({ error: 'licenseId is required' });

    const data: any = { status: 'active' };
    if (endDate) data.endDate = new Date(endDate);

    const updated = await prisma.subscriptionLicense.update({
      where: { id: licenseId },
      data,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reactivate license' });
  }
});

// POST /api/subscriptions/assign-seat — Assign a seat within a license
router.post('/assign-seat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { licenseId, studentId } = req.body;
    if (!licenseId || !studentId) {
      return res.status(400).json({ error: 'licenseId and studentId are required' });
    }

    const license = await prisma.subscriptionLicense.findUnique({ where: { id: licenseId } });
    if (!license) return res.status(404).json({ error: 'License not found' });

    // Check authorization
    if (license.userId !== req.userId && !['administrator', 'superAdministrator', 'teacher', 'seniorTeacher'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check seat availability
    if (license.maxStudents) {
      const currentStudents = await prisma.subscriptionLicense.findMany({
        where: { planId: license.planId },
      });
      // Count distinct users assigned under this license type
      // For simplicity, we track via the license's maxStudents
      if (license.maxStudents <= 0) {
        return res.status(403).json({ error: 'No available seats' });
      }

      // Decrement maxStudents as a seat counter
      await prisma.subscriptionLicense.update({
        where: { id: licenseId },
        data: { maxStudents: { decrement: 1 } },
      });
    }

    res.json({ message: 'Seat assigned', licenseId, studentId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign seat' });
  }
});

// GET /api/subscriptions/plans — Get available subscription plans
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

export { router as subscriptionLicensesRouter };