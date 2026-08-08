import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// =============================================
// STUDENT ANALYTICS
// =============================================

router.get('/student', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const [sessions, mastery, bookmarks, diagnostics, mockAttempts] = await Promise.all([
      prisma.practiceSession.findMany({ where: { userId }, orderBy: { startedAt: 'desc' }, take: 5 }),
      prisma.mastery.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 20 }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.diagnosticResult.findMany({ where: { userId }, orderBy: { completedAt: 'desc' }, take: 3 }),
      prisma.mockExamAttempt.findMany({
        where: { userId, completed: true },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: { mockExam: { select: { name: true, isOfficial: true } } },
      }),
    ]);

    const totalAttempts = await prisma.studentAttempt.count({ where: { userId } });
    const firstCorrect = await prisma.studentAttempt.count({ where: { userId, isCorrect: true, attemptNumber: 1 } });
    const secondCorrect = await prisma.studentAttempt.count({ where: { userId, isCorrect: true, attemptNumber: 2 } });
    const secondTotal = await prisma.studentAttempt.count({ where: { userId, attemptNumber: 2 } });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { targetScore: true, targetTest: true, diagnosticCohort: true },
    });

    // Speaking & writing stats
    const speakingSubmissions = await prisma.speakingSubmission.count({ where: { userId } });
    const writingSubmissions = await prisma.writingSubmission.count({ where: { userId } });

    res.json({
      sessions,
      mastery,
      bookmarks,
      totalAttempts,
      firstCorrect,
      firstAttemptAccuracy: totalAttempts > 0 ? +(firstCorrect / totalAttempts * 100).toFixed(1) : 0,
      secondCorrect,
      secondAttemptRecovery: secondTotal > 0 ? +(secondCorrect / secondTotal * 100).toFixed(1) : 0,
      diagnostics,
      mockExams: mockAttempts,
      speakingSubmissions,
      writingSubmissions,
      targetScore: user?.targetScore,
      targetTest: user?.targetTest,
      diagnosticCohort: user?.diagnosticCohort,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
});

// =============================================
// TEACHER ANALYTICS
// =============================================

router.get('/teacher', authenticate, requireRole('teacher', 'seniorTeacher', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get teacher's classes
    const classes = await prisma.class.findMany({
      where: { teachers: { some: { teacherId: userId } } },
      include: {
        _count: { select: { students: true, assignments: true } },
      },
    });

    // Get managed students
    const managedStudents = await prisma.managedStudent.findMany({
      where: { managerId: userId },
      include: {
        student: {
          select: { id: true, username: true, displayName: true, gradeLevel: true, targetTest: true, lastLoginAt: true },
        },
      },
    });
    const studentIds = managedStudents.map(s => s.student.id);

    // Aggregate student activity
    const activeStudents = studentIds.length > 0
      ? await prisma.practiceSession.count({
          where: { userId: { in: studentIds }, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        })
      : 0;

    // Pending reviews
    const pendingSpeaking = await prisma.speakingSubmission.count({ where: { teacherReviewed: false } });
    const pendingWriting = await prisma.writingSubmission.count({ where: { teacherReviewed: false } });

    res.json({
      classes,
      managedStudents: managedStudents.map(s => s.student),
      totalStudents: managedStudents.length,
      activeStudentsLast7Days: activeStudents,
      pendingReviews: { speaking: pendingSpeaking, writing: pendingWriting, total: pendingSpeaking + pendingWriting },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher analytics' });
  }
});

// GET /api/analytics/teacher/class/:classId — Detailed class analytics
router.get('/teacher/class/:classId', authenticate, requireRole('teacher', 'seniorTeacher', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.classStudent.findMany({
      where: { classId: req.params.classId as string},
      include: { student: { select: { id: true, username: true, displayName: true } } },
    });
    const studentIds = students.map(s => s.student.id);

    const [mastery, sessions, diagnostics, mockAttempts] = await Promise.all([
      prisma.mastery.findMany({
        where: { userId: { in: studentIds } },
      }),
      prisma.practiceSession.findMany({
        where: { userId: { in: studentIds } },
        orderBy: { startedAt: 'desc' },
        take: 100,
      }),
      prisma.diagnosticResult.findMany({
        where: { userId: { in: studentIds } },
        orderBy: { completedAt: 'desc' },
        include: { exam: { select: { name: true } } },
      }),
      prisma.mockExamAttempt.findMany({
        where: { userId: { in: studentIds }, completed: true },
        include: { mockExam: { select: { name: true, isOfficial: true } } },
      }),
    ]);

    res.json({ students, mastery, sessions, diagnostics, mockAttempts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class analytics' });
  }
});

// =============================================
// PARENT ANALYTICS
// =============================================

router.get('/parent', authenticate, requireRole('parent', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get students managed by this parent
    const managedStudents = await prisma.managedStudent.findMany({
      where: { managerId: userId, relationship: 'parent' },
      include: {
        student: {
          select: { id: true, username: true, displayName: true, gradeLevel: true, targetTest: true, targetScore: true, lastLoginAt: true },
        },
      },
    });

    // Get activity summaries for each student
    const studentSummaries = await Promise.all(
      managedStudents.map(async (ms) => {
        const studentId = ms.student.id;
        const [recentSessions, masteryCount, lastDiagnostic, mockAttempts] = await Promise.all([
          prisma.practiceSession.count({ where: { userId: studentId, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
          prisma.mastery.count({ where: { userId: studentId } }),
          prisma.diagnosticResult.findFirst({
            where: { userId: studentId },
            orderBy: { completedAt: 'desc' },
            select: { score: true, readiness: true, estimatedScore: true, completedAt: true },
          }),
          prisma.mockExamAttempt.count({ where: { userId: studentId, completed: true } }),
        ]);

        return {
          student: ms.student,
          sessionsThisWeek: recentSessions,
          skillsAssessed: masteryCount,
          lastDiagnostic,
          mockExamsCompleted: mockAttempts,
        };
      })
    );

    res.json({ children: studentSummaries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parent analytics' });
  }
});

// =============================================
// ADMIN ANALYTICS
// =============================================

router.get('/admin', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers, totalQuestions, totalSessions, totalAttempts, activeToday,
      totalTeachers, totalStudents, totalParents, totalClasses, totalSubscriptions,
      totalDiagnostics, totalMockAttempts, totalSpeaking, totalWriting,
      byRole,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count({ where: { publicationStatus: 'active' } }),
      prisma.practiceSession.count(),
      prisma.studentAttempt.count(),
      prisma.practiceSession.count({ where: { startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.user.count({ where: { role: { in: ['teacher', 'seniorTeacher'] } } }),
      prisma.user.count({ where: { role: { in: ['student', 'centerStudent', 'paidStudent', 'freeStudent'] } } }),
      prisma.user.count({ where: { role: 'parent' } }),
      prisma.class.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.diagnosticResult.count(),
      prisma.mockExamAttempt.count({ where: { completed: true } }),
      prisma.speakingSubmission.count(),
      prisma.writingSubmission.count(),
      prisma.user.groupBy({ by: ['role'], _count: true }),
    ]);

    res.json({
      totalUsers,
      totalQuestions,
      totalSessions,
      totalAttempts,
      activeToday,
      totalTeachers,
      totalStudents,
      totalParents,
      totalClasses,
      totalSubscriptions,
      totalDiagnostics,
      totalMockAttempts,
      totalSpeakingSubmissions: totalSpeaking,
      totalWritingSubmissions: totalWriting,
      usersByRole: byRole,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

// GET /api/analytics/admin/revenue — Admin: Revenue overview
router.get('/admin/revenue', authenticate, requireRole('administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const [activeLicenses, totalLicenses, licensesByType] = await Promise.all([
      prisma.subscriptionLicense.count({ where: { status: 'active' } }),
      prisma.subscriptionLicense.count(),
      prisma.subscriptionLicense.groupBy({ by: ['type'], _count: true }),
    ]);

    res.json({
      activeLicenses,
      totalLicenses,
      licensesByType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// =============================================
// SCHOOL ANALYTICS
// =============================================

router.get('/school', authenticate, requireRole('schoolCoordinator', 'administrator', 'superAdministrator', 'teacher', 'seniorTeacher'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { school: true },
    });
    const schoolName = user?.school;
    if (!schoolName) {
      return res.status(400).json({ error: 'User not associated with a school' });
    }

    // Find all users from this school
    const schoolUsers = await prisma.user.findMany({
      where: { school: schoolName },
      select: { id: true, role: true, displayName: true },
    });
    const schoolUserIds = schoolUsers.map(u => u.id);

    const [totalStudents, totalTeachers, totalSessions, totalDiagnostics, totalMockAttempts, classes] = await Promise.all([
      Promise.resolve(schoolUsers.filter(u => ['student', 'centerStudent', 'paidStudent', 'freeStudent'].includes(u.role)).length),
      Promise.resolve(schoolUsers.filter(u => ['teacher', 'seniorTeacher'].includes(u.role)).length),
      prisma.practiceSession.count({ where: { userId: { in: schoolUserIds } } }),
      prisma.diagnosticResult.count({ where: { userId: { in: schoolUserIds } } }),
      prisma.mockExamAttempt.count({ where: { userId: { in: schoolUserIds }, completed: true } }),
      prisma.class.count({ where: { teachers: { some: { teacher: { school: schoolName } } } } }),
    ]);

    res.json({
      school: schoolName,
      totalStudents,
      totalTeachers,
      totalClasses: classes,
      totalPracticeSessions: totalSessions,
      totalDiagnostics: totalDiagnostics,
      totalMockExams: totalMockAttempts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch school analytics' });
  }
});

// =============================================
// ANALYTICS SNAPSHOT MANAGEMENT
// =============================================

// POST /api/analytics/snapshot — Save an analytics snapshot
router.post('/snapshot', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, data, period } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: 'type and data are required' });
    }

    const snapshot = await prisma.analyticsSnapshot.create({
      data: {
        userId: req.userId!,
        type,
        data,
        period: period || 'custom',
      },
    });
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save analytics snapshot' });
  }
});

// GET /api/analytics/snapshots — Get analytics snapshots
router.get('/snapshots', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, period } = req.query;
    const where: any = { userId: req.userId! };
    if (type) where.type = type as string;
    if (period) where.period = period as string;

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 10,
    });
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
});

export { router as analyticsRouter };