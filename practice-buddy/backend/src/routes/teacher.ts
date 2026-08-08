import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authenticate);
router.use(requireRole('teacher', 'seniorTeacher', 'administrator', 'superAdministrator'));

// ============ CLASSES ============

router.get('/classes', async (req: AuthRequest, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      where: { teachers: { some: { teacherId: req.userId! } } },
      include: { _count: { select: { students: true, assignments: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(classes);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch classes' }); }
});

router.post('/classes', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, subject } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const cls = await prisma.class.create({
      data: { name, description, subject, code, teachers: { create: { teacherId: req.userId! } } }
    });
    res.status(201).json(cls);
  } catch (error) { res.status(500).json({ error: 'Failed to create class' }); }
});

router.get('/classes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const cls = await prisma.class.findFirst({
      where: { id: req.params.id as string, teachers: { some: { teacherId: req.userId! } } },
      include: { students: { include: { student: { select: { id: true, username: true, displayName: true, gradeLevel: true, targetTest: true, targetScore: true } } } }, assignments: { include: { _count: { select: { questions: true } }, studentAssignments: true } } }
    });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch class' }); }
});

router.post('/classes/:id/students', async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    await prisma.classStudent.create({ data: { classId: req.params.id as string, studentId } });
    res.status(201).json({ message: 'Student added' });
  } catch (error) { res.status(500).json({ error: 'Failed to add student' }); }
});

router.delete('/classes/:classId/students/:studentId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.classStudent.deleteMany({ where: { classId: req.params.classId as string, studentId: req.params.studentId as string } });
    res.json({ message: 'Student removed' });
  } catch (error) { res.status(500).json({ error: 'Failed to remove student' }); }
});

// ============ ASSIGNMENTS ============

router.get('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { creatorId: req.userId! },
      include: { class: { select: { id: true, name: true } }, _count: { select: { questions: true, studentAssignments: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch assignments' }); }
});

router.post('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    const { classId, title, description, assignmentType, examId, subjectId, domainId, categoryId, subcategoryId, difficulty, questionCount, timeLimit, attemptLimit, dueDate, questionIds } = req.body;
    
    const assignment = await prisma.assignment.create({
      data: {
        classId, creatorId: req.userId!, title, description, assignmentType,
        examId, subjectId, domainId, categoryId, subcategoryId, difficulty,
        questionCount: questionCount ? parseInt(questionCount) : null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        attemptLimit: attemptLimit ? parseInt(attemptLimit) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    // Link specific questions if provided
    if (questionIds && questionIds.length > 0) {
      await prisma.assignmentQuestion.createMany({
        data: questionIds.map((qId: string, i: number) => ({ assignmentId: assignment.id, questionId: qId, sortOrder: i }))
      });
    }

    // Create student assignments for all class members
    if (classId) {
      const students = await prisma.classStudent.findMany({ where: { classId } });
      await prisma.studentAssignment.createMany({
        data: students.map(s => ({ assignmentId: assignment.id, studentId: s.studentId }))
      });
    }

    res.status(201).json(assignment);
  } catch (error) { res.status(500).json({ error: 'Failed to create assignment' }); }
});

router.get('/assignments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: { id: req.params.id as string, creatorId: req.userId! },
      include: { questions: { include: { question: { select: { id: true, aeeqId: true, difficulty: true, questionStem: true, category: { select: { name: true } } } } } }, studentAssignments: { include: { student: { select: { id: true, username: true, displayName: true } } } } }
    });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch assignment' }); }
});

// ============ STUDENT MANAGEMENT ============

router.get('/students', async (req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.managedStudent.findMany({
      where: { managerId: req.userId! },
      include: { student: { select: { id: true, username: true, displayName: true, gradeLevel: true, targetTest: true, targetScore: true, isActive: true, lastLoginAt: true } } }
    });
    res.json(students.map(s => ({ ...s.student, relationship: s.relationship, isActive: s.isActive, notes: s.notes })));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch students' }); }
});

router.post('/students', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, firstName, lastName, gradeLevel, targetTest, targetScore, testDate, school } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, passwordHash, firstName, lastName, displayName: [firstName, lastName].filter(Boolean).join(' ') || username, gradeLevel, targetTest, targetScore: targetScore ? parseInt(targetScore) : null, testDate: testDate ? new Date(testDate) : null, school, role: 'student', requiresPasswordChange: true }
    });

    await prisma.managedStudent.create({
      data: { managerId: req.userId!, studentId: user.id, relationship: 'teacher' }
    });

    res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName, requiresPasswordChange: true });
  } catch (error) { res.status(500).json({ error: 'Failed to create student' }); }
});

router.post('/students/invite', async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    const existing = await prisma.managedStudent.findUnique({
      where: { managerId_studentId: { managerId: req.userId!, studentId } }
    });
    if (existing) return res.status(409).json({ error: 'Student already linked' });

    await prisma.managedStudent.create({
      data: { managerId: req.userId!, studentId, relationship: 'teacher' }
    });
    res.status(201).json({ message: 'Student linked' });
  } catch (error) { res.status(500).json({ error: 'Failed to link student' }); }
});

router.post('/students/:id/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: req.params.id as string }, data: { passwordHash, requiresPasswordChange: true } });
    res.json({ message: 'Password reset. Student must change on next login.' });
  } catch (error) { res.status(500).json({ error: 'Failed to reset password' }); }
});

router.put('/students/:id/suspend', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.json({ message: 'Student access suspended' });
  } catch (error) { res.status(500).json({ error: 'Failed to suspend student' }); }
});

router.put('/students/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({ where: { id: req.params.id as string }, data: { isActive: true } });
    res.json({ message: 'Student access restored' });
  } catch (error) { res.status(500).json({ error: 'Failed to restore student' }); }
});

// ============ STUDENT PROGRESS ============

router.get('/students/:id/progress', async (req: AuthRequest, res: Response) => {
  try {
    const mastery = await prisma.mastery.findMany({
      where: { userId: req.params.id as string },
      include: { microSkillRef: { select: { id: true, name: true, code: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    const sessions = await prisma.practiceSession.findMany({
      where: { userId: req.params.id as string },
      orderBy: { startedAt: 'desc' },
      take: 10
    });
    res.json({ mastery, sessions });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch progress' }); }
});

export { router as teacherRouter };
