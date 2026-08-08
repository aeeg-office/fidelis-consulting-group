import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/learning-objects — List all learning objects (with optional skill filter)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { microSkillId, categoryId } = req.query;
    const where: any = {};
    if (microSkillId) where.microSkillId = microSkillId as string;
    if (categoryId) {
      where.microSkill = { categoryId: categoryId as string };
    }

    const objects = await prisma.learningObject.findMany({
      where,
      include: {
        microSkill: {
          select: { id: true, name: true, code: true, category: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning objects' });
  }
});

// GET /api/learning-objects/by-skill/:microSkillId — Get learning objects by skill
router.get('/by-skill/:microSkillId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const objects = await prisma.learningObject.findMany({
      where: { microSkillId: req.params.microSkillId as string},
      orderBy: { title: 'asc' },
    });
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning objects by skill' });
  }
});

// GET /api/learning-objects/:id — Get a single learning object
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const obj = await prisma.learningObject.findUnique({
      where: { id: req.params.id as string},
      include: {
        microSkill: {
          select: { id: true, name: true, code: true, category: { select: { id: true, name: true, code: true } } },
        },
      },
    });
    if (!obj) return res.status(404).json({ error: 'Learning object not found' });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning object' });
  }
});

// POST /api/learning-objects — Create a learning object (admin/editor)
router.post('/', authenticate, requireRole('curriculumEditor', 'contentReviewer', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      microSkillId, title, objective, lesson, examples, guidedExamples,
      commonMisconceptions, teachingStrategies, teacherNotes, parentNotes,
      remediation, extensionActivities,
    } = req.body;

    if (!microSkillId || !title || !objective || !lesson) {
      return res.status(400).json({ error: 'microSkillId, title, objective, and lesson are required' });
    }

    const obj = await prisma.learningObject.create({
      data: {
        microSkillId, title, objective, lesson,
        examples: examples || undefined,
        guidedExamples: guidedExamples || undefined,
        commonMisconceptions: commonMisconceptions || undefined,
        teachingStrategies: teachingStrategies || undefined,
        teacherNotes: teacherNotes || undefined,
        parentNotes: parentNotes || undefined,
        remediation: remediation || undefined,
        extensionActivities: extensionActivities || undefined,
      },
      include: { microSkill: { select: { id: true, name: true } } },
    });
    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create learning object' });
  }
});

// PUT /api/learning-objects/:id — Update a learning object (admin/editor)
router.put('/:id', authenticate, requireRole('curriculumEditor', 'contentReviewer', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, objective, lesson, examples, guidedExamples,
      commonMisconceptions, teachingStrategies, teacherNotes, parentNotes,
      remediation, extensionActivities,
    } = req.body;

    const data: any = {};
    if (title) data.title = title;
    if (objective) data.objective = objective;
    if (lesson) data.lesson = lesson;
    if (examples !== undefined) data.examples = examples;
    if (guidedExamples !== undefined) data.guidedExamples = guidedExamples;
    if (commonMisconceptions !== undefined) data.commonMisconceptions = commonMisconceptions;
    if (teachingStrategies !== undefined) data.teachingStrategies = teachingStrategies;
    if (teacherNotes !== undefined) data.teacherNotes = teacherNotes;
    if (parentNotes !== undefined) data.parentNotes = parentNotes;
    if (remediation !== undefined) data.remediation = remediation;
    if (extensionActivities !== undefined) data.extensionActivities = extensionActivities;

    const obj = await prisma.learningObject.update({
      where: { id: req.params.id as string},
      data,
      include: { microSkill: { select: { id: true, name: true } } },
    });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update learning object' });
  }
});

// DELETE /api/learning-objects/:id — Delete a learning object (admin only)
router.delete('/:id', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.learningObject.delete({ where: { id: req.params.id as string} });
    res.json({ message: 'Learning object deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete learning object' });
  }
});

export { router as learningObjectsRouter };