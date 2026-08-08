import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/micro-skills — List all micro-skills (with optional category filter)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;

    const skills = await prisma.microSkill.findMany({
      where,
      include: { category: { select: { id: true, name: true, code: true } } },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch micro-skills' });
  }
});

// GET /api/micro-skills/by-category/:categoryId — Get micro-skills by category
router.get('/by-category/:categoryId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const skills = await prisma.microSkill.findMany({
      where: { categoryId: req.params.categoryId as string},
      include: { _count: { select: { questions: true, learningObjects: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch micro-skills by category' });
  }
});

// GET /api/micro-skills/:id — Get a single micro-skill
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const skill = await prisma.microSkill.findUnique({
      where: { id: req.params.id as string},
      include: {
        category: { select: { id: true, name: true, code: true, domain: { select: { id: true, name: true } } } },
        _count: { select: { questions: true, learningObjects: true } },
      },
    });
    if (!skill) return res.status(404).json({ error: 'Micro-skill not found' });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch micro-skill' });
  }
});

// POST /api/micro-skills — Create a micro-skill (admin/editor)
router.post('/', authenticate, requireRole('curriculumEditor', 'contentReviewer', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, categoryId } = req.body;
    if (!name || !code || !categoryId) {
      return res.status(400).json({ error: 'name, code, and categoryId are required' });
    }

    // Check unique constraint
    const existing = await prisma.microSkill.findUnique({
      where: { categoryId_code: { categoryId, code } },
    });
    if (existing) return res.status(409).json({ error: 'Duplicate micro-skill code within this category' });

    const skill = await prisma.microSkill.create({
      data: { name, code, description, categoryId },
      include: { category: { select: { id: true, name: true } } },
    });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create micro-skill' });
  }
});

// PUT /api/micro-skills/:id — Update a micro-skill (admin/editor)
router.put('/:id', authenticate, requireRole('curriculumEditor', 'contentReviewer', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, categoryId } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (code) data.code = code;
    if (description !== undefined) data.description = description;
    if (categoryId) data.categoryId = categoryId;

    const skill = await prisma.microSkill.update({
      where: { id: req.params.id as string},
      data,
      include: { category: { select: { id: true, name: true } } },
    });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update micro-skill' });
  }
});

// DELETE /api/micro-skills/:id — Delete a micro-skill (admin only)
router.delete('/:id', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    // Check if any questions reference this micro-skill
    const questionCount = await prisma.question.count({ where: { microSkillId: req.params.id as string} });
    if (questionCount > 0) {
      return res.status(409).json({ error: `Cannot delete: ${questionCount} question(s) reference this micro-skill` });
    }

    await prisma.microSkill.delete({ where: { id: req.params.id as string} });
    res.json({ message: 'Micro-skill deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete micro-skill' });
  }
});

export { router as microSkillsRouter };