import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authenticate);
router.use(requireRole('administrator', 'superAdministrator', 'curriculumEditor', 'contentReviewer'));

// ============ QUESTION MANAGEMENT ============

// Create question
router.post('/questions', async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    // Auto-generate AEEG ID
    const prefix = 'AEEG-SAT';
    const subjectCode = data.subjectId?.slice(0, 3).toUpperCase() || 'GEN';
    const categoryCode = data.categoryId?.slice(0, 3).toUpperCase() || 'GEN';
    const count = await prisma.question.count();
    const aeeqId = `${prefix}-${subjectCode}-${categoryCode}-${String(count + 1).padStart(6, '0')}`;

    const question = await prisma.question.create({
      data: { ...data, aeeqId, author: req.userId }
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.put('/questions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.question.findUnique({ where: { id: req.params.id as string } });
    if (!existing) return res.status(404).json({ error: 'Question not found' });

    // Create a version snapshot
    await prisma.questionVersion.create({
      data: { questionId: existing.id, version: existing.version, snapshot: existing as any }
    });

    const question = await prisma.question.update({
      where: { id: req.params.id as string },
      data: { ...req.body, version: { increment: 1 }, reviewer: req.userId }
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Bulk update questions
router.post('/questions/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const { questionIds, updates } = req.body;
    const result = await prisma.question.updateMany({
      where: { id: { in: questionIds } },
      data: updates
    });
    res.json({ updated: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

// Get question versions
router.get('/questions/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const versions = await prisma.questionVersion.findMany({
      where: { questionId: req.params.id as string },
      orderBy: { version: 'desc' }
    });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Rollback question
router.post('/questions/:id/rollback/:version', async (req: AuthRequest, res: Response) => {
  try {
    const version = await prisma.questionVersion.findFirst({
      where: { questionId: req.params.id as string, version: parseInt(req.params.version as string) }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });

    await prisma.question.update({
      where: { id: req.params.id as string },
      data: { ...(version.snapshot as any), version: { increment: 1 } }
    });
    res.json({ message: 'Question rolled back' });
  } catch (error) {
    res.status(500).json({ error: 'Rollback failed' });
  }
});

// ============ HIERARCHY MANAGEMENT ============

router.post('/exams', async (req: AuthRequest, res: Response) => {
  try {
    const exam = await prisma.exam.create({ data: req.body });
    res.status(201).json(exam);
  } catch (error) { res.status(500).json({ error: 'Failed to create exam' }); }
});

router.put('/exams/:id', async (req: AuthRequest, res: Response) => {
  try {
    const exam = await prisma.exam.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(exam);
  } catch (error) { res.status(500).json({ error: 'Failed to update exam' }); }
});

router.post('/subjects', async (req: AuthRequest, res: Response) => {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json(subject);
  } catch (error) { res.status(500).json({ error: 'Failed to create subject' }); }
});

router.post('/domains', async (req: AuthRequest, res: Response) => {
  try {
    const domain = await prisma.domain.create({ data: req.body });
    res.status(201).json(domain);
  } catch (error) { res.status(500).json({ error: 'Failed to create domain' }); }
});

router.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (error) { res.status(500).json({ error: 'Failed to create category' }); }
});

router.post('/subcategories', async (req: AuthRequest, res: Response) => {
  try {
    const subcategory = await prisma.subcategory.create({ data: req.body });
    res.status(201).json(subcategory);
  } catch (error) { res.status(500).json({ error: 'Failed to create subcategory' }); }
});

// List hierarchy
router.get('/exams', async (_req: AuthRequest, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { active: true },
      include: {
        subjects: {
          include: {
            domains: {
              include: {
                categories: {
                  include: { subcategories: true }
                }
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(exams);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch exams' }); }
});

// ============ USER MANAGEMENT ============

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, limit, offset } = req.query;
    const where: any = {};
    if (role) where.role = String(role);
    if (search) {
      where.OR = [
        { username: { contains: String(search) } },
        { email: { contains: String(search) } },
        { displayName: { contains: String(search) } },
      ];
    }
    const users = await prisma.user.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(String(limit)) || 50, 100),
      skip: parseInt(String(offset)) || 0,
      select: { id: true, username: true, email: true, displayName: true, role: true, isActive: true, createdAt: true, lastLoginAt: true }
    });
    const total = await prisma.user.count({ where });
    res.json({ users, total });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch users' }); }
});

router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const data: any = { ...rest };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }
    const user = await prisma.user.update({ where: { id: req.params.id as string }, data });
    res.json({ id: user.id, username: user.username, role: user.role, isActive: user.isActive });
  } catch (error) { res.status(500).json({ error: 'Failed to update user' }); }
});

// ============ FLAGS ============

router.get('/flags', async (req: AuthRequest, res: Response) => {
  try {
    const flags = await prisma.questionFlag.findMany({
      where: { status: 'pending' },
      include: { question: { select: { aeeqId: true, difficulty: true } }, user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(flags);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch flags' }); }
});

router.put('/flags/:id', async (req: AuthRequest, res: Response) => {
  try {
    const flag = await prisma.questionFlag.update({
      where: { id: req.params.id as string },
      data: { status: req.body.status, resolvedBy: req.userId, resolvedAt: new Date() }
    });
    res.json(flag);
  } catch (error) { res.status(500).json({ error: 'Failed to update flag' }); }
});

// ============ AUDIT LOG ============

router.get('/audit', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch audit log' }); }
});

export { router as adminRouter };
