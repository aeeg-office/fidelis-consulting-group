import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(requireRole('teacher', 'seniorTeacher', 'administrator', 'superAdministrator'));

// GET /api/teacher/pending-reviews — Get all pending submissions needing review
router.get('/pending-reviews', async (req: AuthRequest, res: Response) => {
  try {
    const [speakingPending, writingPending] = await Promise.all([
      prisma.speakingSubmission.findMany({
        where: { teacherReviewed: false },
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.writingSubmission.findMany({
        where: { teacherReviewed: false },
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    res.json({
      total: speakingPending.length + writingPending.length,
      speaking: speakingPending,
      writing: writingPending,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

// GET /api/teacher/submissions — Get all submissions (with filters)
router.get('/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, userId, limit } = req.query;
    const take = parseInt(limit as string) || 20;

    let speaking: any[] = [];
    let writing: any[] = [];

    if (!type || type === 'speaking') {
      const whereSpeaking: any = {};
      if (userId) whereSpeaking.userId = userId as string;
      if (status === 'reviewed') whereSpeaking.teacherReviewed = true;
      else if (status === 'pending') whereSpeaking.teacherReviewed = false;

      speaking = await prisma.speakingSubmission.findMany({
        where: whereSpeaking,
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
      });
    }

    if (!type || type === 'writing') {
      const whereWriting: any = {};
      if (userId) whereWriting.userId = userId as string;
      if (status === 'reviewed') whereWriting.teacherReviewed = true;
      else if (status === 'pending') whereWriting.teacherReviewed = false;

      writing = await prisma.writingSubmission.findMany({
        where: whereWriting,
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
      });
    }

    res.json({ speaking, writing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// PUT /api/teacher/review — Review a submission (score + notes)
router.put('/review', async (req: AuthRequest, res: Response) => {
  try {
    const { submissionType, submissionId, score, notes } = req.body;
    if (!submissionType || !submissionId) {
      return res.status(400).json({ error: 'submissionType and submissionId are required' });
    }

    if (submissionType === 'speaking') {
      const sub = await prisma.speakingSubmission.findUnique({ where: { id: submissionId } });
      if (!sub) return res.status(404).json({ error: 'Speaking submission not found' });

      await prisma.speakingSubmission.update({
        where: { id: submissionId },
        data: { teacherReviewed: true, teacherScore: score, teacherNotes: notes },
      });
    } else if (submissionType === 'writing') {
      const sub = await prisma.writingSubmission.findUnique({ where: { id: submissionId } });
      if (!sub) return res.status(404).json({ error: 'Writing submission not found' });

      await prisma.writingSubmission.update({
        where: { id: submissionId },
        data: { teacherReviewed: true, teacherScore: score, teacherNotes: notes },
      });
    } else {
      return res.status(400).json({ error: 'Invalid submissionType. Must be "speaking" or "writing"' });
    }

    // Upsert teacher review record
    const existingReview = await prisma.teacherReview.findFirst({
      where: { submissionType: submissionType as any, submissionId },
    });

    if (existingReview) {
      await prisma.teacherReview.update({
        where: { id: existingReview.id },
        data: { status: 'reviewed', score, notes, teacherId: req.userId! },
      });
    } else {
      await prisma.teacherReview.create({
        data: {
          submissionType: submissionType as any,
          submissionId,
          teacherId: req.userId!,
          status: 'reviewed',
          score,
          notes,
        },
      });
    }

    res.json({ message: 'Review submitted', submissionType, submissionId, score, notes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// PUT /api/teacher/approve — Approve a submission (release to student)
router.put('/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { submissionType, submissionId } = req.body;
    if (!submissionType || !submissionId) {
      return res.status(400).json({ error: 'submissionType and submissionId are required' });
    }

    if (submissionType === 'speaking') {
      const sub = await prisma.speakingSubmission.findUnique({ where: { id: submissionId } });
      if (!sub) return res.status(404).json({ error: 'Speaking submission not found' });

      await prisma.speakingSubmission.update({
        where: { id: submissionId },
        data: { teacherApproved: true, releasedToStudent: true, teacherReviewed: true },
      });
    } else if (submissionType === 'writing') {
      const sub = await prisma.writingSubmission.findUnique({ where: { id: submissionId } });
      if (!sub) return res.status(404).json({ error: 'Writing submission not found' });

      await prisma.writingSubmission.update({
        where: { id: submissionId },
        data: { teacherApproved: true, releasedToStudent: true, teacherReviewed: true },
      });
    } else {
      return res.status(400).json({ error: 'Invalid submissionType' });
    }

    // Update review record
    const existingReview = await prisma.teacherReview.findFirst({
      where: { submissionType: submissionType as any, submissionId },
    });
    if (existingReview) {
      await prisma.teacherReview.update({
        where: { id: existingReview.id },
        data: { status: 'approved' },
      });
    }

    res.json({ message: 'Submission approved and released to student' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

// PUT /api/teacher/return — Return a submission to student for revision
router.put('/return', async (req: AuthRequest, res: Response) => {
  try {
    const { submissionType, submissionId, notes } = req.body;
    if (!submissionType || !submissionId) {
      return res.status(400).json({ error: 'submissionType and submissionId are required' });
    }

    if (submissionType === 'speaking') {
      const sub = await prisma.speakingSubmission.findUnique({ where: { id: submissionId } });
      if (!sub) return res.status(404).json({ error: 'Speaking submission not found' });

      await prisma.speakingSubmission.update({
        where: { id: submissionId },
        data: { teacherNotes: notes, teacherReviewed: true },
      });
    } else if (submissionType === 'writing') {
      const sub = await prisma.writingSubmission.findUnique({ where: { id: submissionId } });
      if (!sub) return res.status(404).json({ error: 'Writing submission not found' });

      await prisma.writingSubmission.update({
        where: { id: submissionId },
        data: { teacherNotes: notes, teacherReviewed: true },
      });
    } else {
      return res.status(400).json({ error: 'Invalid submissionType' });
    }

    // Update review record
    const existingReview = await prisma.teacherReview.findFirst({
      where: { submissionType: submissionType as any, submissionId },
    });
    if (existingReview) {
      await prisma.teacherReview.update({
        where: { id: existingReview.id },
        data: { status: 'returned', notes: notes || existingReview.notes },
      });
    } else {
      await prisma.teacherReview.create({
        data: {
          submissionType: submissionType as any,
          submissionId,
          teacherId: req.userId!,
          status: 'returned',
          notes,
        },
      });
    }

    res.json({ message: 'Submission returned to student for revision' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to return submission' });
  }
});

// GET /api/teacher/review-stats — Get review statistics
router.get('/review-stats', async (req: AuthRequest, res: Response) => {
  try {
    const [speakingCount, writingCount, pendingSpeaking, pendingWriting] = await Promise.all([
      prisma.speakingSubmission.count(),
      prisma.writingSubmission.count(),
      prisma.speakingSubmission.count({ where: { teacherReviewed: false } }),
      prisma.writingSubmission.count({ where: { teacherReviewed: false } }),
    ]);

    res.json({
      totalSubmissions: speakingCount + writingCount,
      pendingReviews: pendingSpeaking + pendingWriting,
      speaking: { total: speakingCount, pending: pendingSpeaking },
      writing: { total: writingCount, pending: pendingWriting },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review stats' });
  }
});

export { router as teacherWorkflowRouter };