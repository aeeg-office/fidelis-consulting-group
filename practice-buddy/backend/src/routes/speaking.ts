import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/speaking/upload — Upload a speaking submission (audio recording)
router.post('/upload', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { promptId, audioUrl, transcription } = req.body;
    if (!promptId || !audioUrl) {
      return res.status(400).json({ error: 'promptId and audioUrl are required' });
    }

    const submission = await prisma.speakingSubmission.create({
      data: {
        userId: req.userId!,
        promptId,
        audioUrl,
        transcription: transcription || null,
      },
    });

    res.status(201).json({
      id: submission.id,
      promptId: submission.promptId,
      audioUrl: submission.audioUrl,
      createdAt: submission.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload speaking submission' });
  }
});

// POST /api/speaking/assess — Run AI assessment on a speaking submission
router.post('/assess', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    const submission = await prisma.speakingSubmission.findFirst({
      where: { id: submissionId, userId: req.userId! },
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Placeholder: In production, call an AI assessment service
    // For now, generate simulated scores
    const fluency = +(Math.random() * 4 + 1).toFixed(1);   // 1.0 - 5.0
    const grammar = +(Math.random() * 4 + 1).toFixed(1);
    const vocabulary = +(Math.random() * 4 + 1).toFixed(1);
    const pronunciation = +(Math.random() * 4 + 1).toFixed(1);
    const coherence = +(Math.random() * 4 + 1).toFixed(1);
    const estimatedScore = +((fluency + grammar + vocabulary + pronunciation + coherence) / 5 * 20).toFixed(1);

    const updated = await prisma.speakingSubmission.update({
      where: { id: submissionId },
      data: { fluency, grammar, vocabulary, pronunciation, coherence, estimatedScore },
    });

    res.json({
      id: updated.id,
      fluency: updated.fluency,
      grammar: updated.grammar,
      vocabulary: updated.vocabulary,
      pronunciation: updated.pronunciation,
      coherence: updated.coherence,
      estimatedScore: updated.estimatedScore,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assess speaking submission' });
  }
});

// GET /api/speaking/results — Get user's speaking submissions
router.get('/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.speakingSubmission.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch speaking results' });
  }
});

// GET /api/speaking/results/:id — Get a specific speaking submission
router.get('/results/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submission = await prisma.speakingSubmission.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch speaking submission' });
  }
});

// PUT /api/speaking/teacher-review — Teacher reviews a speaking submission
router.put('/teacher-review', authenticate, requireRole('teacher', 'seniorTeacher', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId, teacherScore, teacherNotes, teacherApproved, releasedToStudent } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    const submission = await prisma.speakingSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const data: any = {
      teacherReviewed: true,
      teacherId: req.userId,
    };
    if (teacherScore !== undefined) data.teacherScore = teacherScore;
    if (teacherNotes !== undefined) data.teacherNotes = teacherNotes;
    if (teacherApproved !== undefined) data.teacherApproved = teacherApproved;
    if (releasedToStudent !== undefined) data.releasedToStudent = releasedToStudent;

    const updated = await prisma.speakingSubmission.update({
      where: { id: submissionId },
      data,
    });

    // Create or update teacher review record
    const existingReview = await prisma.teacherReview.findFirst({
      where: { submissionType: 'speaking', submissionId },
    });

    if (existingReview) {
      await prisma.teacherReview.update({
        where: { id: existingReview.id },
        data: {
          teacherId: req.userId!,
          status: teacherApproved ? 'approved' : 'reviewed',
          score: teacherScore || updated.estimatedScore,
          notes: teacherNotes || null,
        },
      });
    } else {
      await prisma.teacherReview.create({
        data: {
          submissionType: 'speaking',
          submissionId,
          teacherId: req.userId!,
          status: teacherApproved ? 'approved' : 'reviewed',
          score: teacherScore || updated.estimatedScore,
          notes: teacherNotes || null,
          aiFeedback: { fluency: submission.fluency, grammar: submission.grammar, vocabulary: submission.vocabulary, pronunciation: submission.pronunciation, coherence: submission.coherence, estimatedScore: submission.estimatedScore },
        },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher review' });
  }
});

export { router as speakingRouter };