import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/writing/start-session — Start a secure writing session
router.post('/start-session', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { promptId } = req.body;
    if (!promptId) {
      return res.status(400).json({ error: 'promptId is required' });
    }

    // Generate secure session token
    const secureSession = {
      sessionToken: `wrt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      promptId,
      startedAt: new Date().toISOString(),
      fingerprint: req.headers['user-agent'] || 'unknown',
      ipPrefix: req.ip?.substring(0, req.ip.lastIndexOf('.')) || 'unknown',
    };

    // Create a placeholder writing submission with secure session
    const submission = await prisma.writingSubmission.create({
      data: {
        userId: req.userId!,
        promptId,
        wordCount: 0,
        secureSession,
        teacherReviewed: false,
        releasedToStudent: false,
      },
    });

    res.status(201).json({
      sessionId: submission.id,
      secureSession,
      promptId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start writing session' });
  }
});

// POST /api/writing/submit — Submit writing content
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, content } = req.body;
    if (!sessionId || !content) {
      return res.status(400).json({ error: 'sessionId and content are required' });
    }

    const submission = await prisma.writingSubmission.findFirst({
      where: { id: sessionId, userId: req.userId! },
    });
    if (!submission) return res.status(404).json({ error: 'Writing session not found' });

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const updated = await prisma.writingSubmission.update({
      where: { id: sessionId },
      data: { content, wordCount },
    });

    res.json({
      id: updated.id,
      wordCount: updated.wordCount,
      submittedAt: updated.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit writing' });
  }
});

// POST /api/writing/assess — Run AI assessment on a writing submission
router.post('/assess', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    const submission = await prisma.writingSubmission.findFirst({
      where: { id: submissionId, userId: req.userId! },
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Placeholder: In production, call an AI essay scoring service
    // Generate simulated rubric scores
    const rubricScores = [
      { criterion: 'organization', score: Math.floor(Math.random() * 4) + 2, max: 6 },
      { criterion: 'evidence_and_analysis', score: Math.floor(Math.random() * 4) + 2, max: 6 },
      { criterion: 'language_and_style', score: Math.floor(Math.random() * 4) + 2, max: 6 },
      { criterion: 'grammar_and_mechanics', score: Math.floor(Math.random() * 4) + 2, max: 6 },
    ];

    const totalScore = rubricScores.reduce((sum, r) => sum + r.score, 0);
    const totalMax = rubricScores.reduce((sum, r) => sum + r.max, 0);
    const estimatedScore = +((totalScore / totalMax) * 100).toFixed(1);

    const aiFeedback = {
      strengths: [
        'Clear thesis statement presented in the introduction',
        'Good use of transitional phrases between paragraphs',
        'Strong concluding paragraph that reinforces main argument',
      ],
      weaknesses: [
        'Some supporting examples could be more specific',
        'Consider varying sentence structure for better flow',
        'A few grammatical errors in comma usage',
      ],
      suggestions: [
        'Add a counterargument paragraph to strengthen position',
        'Use more precise vocabulary in key arguments',
        'Review subject-verb agreement in complex sentences',
      ],
      wordCount: submission.wordCount,
      estimatedBandScore: ((estimatedScore / 100) * 9).toFixed(1), // IELTS-style band
    };

    const updated = await prisma.writingSubmission.update({
      where: { id: submissionId },
      data: { rubricScores, estimatedScore, aiFeedback },
    });

    res.json({
      id: updated.id,
      rubricScores: updated.rubricScores,
      estimatedScore: updated.estimatedScore,
      aiFeedback: updated.aiFeedback,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assess writing submission' });
  }
});

// GET /api/writing/results — Get user's writing submissions
router.get('/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.writingSubmission.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch writing results' });
  }
});

// GET /api/writing/results/:id — Get a specific writing submission
router.get('/results/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submission = await prisma.writingSubmission.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch writing submission' });
  }
});

// PUT /api/writing/teacher-review — Teacher reviews a writing submission
router.put('/teacher-review', authenticate, requireRole('teacher', 'seniorTeacher', 'administrator', 'superAdministrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId, teacherScore, teacherNotes, teacherApproved, releasedToStudent } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    const submission = await prisma.writingSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const data: any = {
      teacherReviewed: true,
    };
    if (teacherScore !== undefined) data.teacherScore = teacherScore;
    if (teacherNotes !== undefined) data.teacherNotes = teacherNotes;
    if (teacherApproved !== undefined) data.teacherApproved = teacherApproved;
    if (releasedToStudent !== undefined) data.releasedToStudent = releasedToStudent;

    const updated = await prisma.writingSubmission.update({
      where: { id: submissionId },
      data,
    });

    // Create or update teacher review record
    const existingReview = await prisma.teacherReview.findFirst({
      where: { submissionType: 'writing', submissionId },
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
          submissionType: 'writing',
          submissionId,
          teacherId: req.userId!,
          status: teacherApproved ? 'approved' : 'reviewed',
          score: teacherScore || updated.estimatedScore,
          notes: teacherNotes || null,
          aiFeedback: submission.aiFeedback || undefined,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher review' });
  }
});

export { router as writingRouter };