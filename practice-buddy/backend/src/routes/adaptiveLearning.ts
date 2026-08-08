import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/adaptive/next-skill — Determine the next micro-skill to practice
router.post('/next-skill', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, domainId } = req.body;
    const userId = req.userId!;

    // Define filter for which skills to consider
    const skillFilter: any = {};
    if (subjectId) {
      skillFilter.category = { domain: { subjectId } };
    }
    if (domainId) {
      skillFilter.category = { domainId };
    }

    // Get all micro-skills in scope
    const allSkills = await prisma.microSkill.findMany({
      where: skillFilter,
      select: { id: true, name: true, code: true, categoryId: true, category: { select: { name: true } } },
    });

    if (allSkills.length === 0) {
      return res.status(404).json({ error: 'No micro-skills found in scope' });
    }

    // Get user's mastery data for these skills
    const skillIds = allSkills.map(s => s.id);
    const masteryRecords = await prisma.mastery.findMany({
      where: { userId, microSkillId: { in: skillIds } },
      select: {
        microSkillId: true,
        level: true,
        confidence: true,
        firstAttemptCorrect: true,
        totalAttempts: true,
        needsReview: true,
        lastPracticedAt: true,
      },
    });

    const masteryMap = new Map(masteryRecords.map(m => [m.microSkillId, m]));

    // Score each skill: lower priority = needs more practice
    interface ScoredSkill {
      skillId: string;
      skillName: string;
      skillCode: string;
      categoryName: string;
      score: number;
      currentLevel: string;
      reason: string;
    }

    const scoredSkills: ScoredSkill[] = allSkills.map(skill => {
      const mastery = masteryMap.get(skill.id);
      let score = 50; // neutral baseline
      let reason = '';

      if (!mastery) {
        // Not yet assessed — high priority
        score = 10;
        reason = 'Not yet assessed — should be evaluated';
      } else if (mastery.needsReview) {
        score = 5;
        reason = 'Needs review — flagged for low confidence';
      } else if (mastery.level === 'beginning' || mastery.level === 'developing') {
        score = 15;
        reason = `Currently at "${mastery.level}" level — needs improvement`;
      } else if (mastery.level === 'approaching') {
        score = 30;
        reason = 'Approaching mastery — close to target';
      } else if (mastery.level === 'mastered') {
        score = 90;
        reason = 'Already mastered — move to next skill';
      }

      // Boost score (lower priority) if recently practiced
      if (mastery?.lastPracticedAt) {
        const daysSincePractice = (Date.now() - mastery.lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePractice < 1) score += 20;
        else if (daysSincePractice < 3) score += 10;
      }

      // Boost score if high confidence
      if (mastery?.confidence && mastery.confidence > 0.8) {
        score += 15;
      }

      return {
        skillId: skill.id,
        skillName: skill.name,
        skillCode: skill.code,
        categoryName: skill.category?.name || '',
        score,
        currentLevel: mastery?.level || 'notAssessed',
        reason,
      };
    });

    // Sort by score ascending (lowest = highest priority) and get top 3
    scoredSkills.sort((a, b) => a.score - b.score);
    const nextSkills = scoredSkills.slice(0, 3);

    // Get learning objects for recommended skills
    const learningObjects = await prisma.learningObject.findMany({
      where: { microSkillId: { in: nextSkills.map(s => s.skillId) } },
      select: { id: true, title: true, objective: true, microSkillId: true },
    });

    const loMap = new Map<string, any[]>();
    for (const lo of learningObjects) {
      if (!loMap.has(lo.microSkillId)) loMap.set(lo.microSkillId, []);
      loMap.get(lo.microSkillId)!.push({ id: lo.id, title: lo.title, objective: lo.objective });
    }

    res.json({
      nextSkills: nextSkills.map(s => ({
        ...s,
        learningObjects: loMap.get(s.skillId) || [],
      })),
      totalAssessed: masteryRecords.length,
      totalAvailable: allSkills.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to determine next skill' });
  }
});

// POST /api/adaptive/recommendations — Get adaptive learning recommendations
router.post('/recommendations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { subjectId, count } = req.body;
    const take = parseInt(count) || 10;

    // Gather user's weak areas from mastery data
    const weakMastery = await prisma.mastery.findMany({
      where: {
        userId,
        level: { in: ['notAssessed', 'beginning', 'developing'] },
        ...(subjectId ? { subjectId } : {}),
      },
      orderBy: [{ level: 'asc' }, { updatedAt: 'desc' }],
      take: 20,
    });

    // Build recommendations from weak areas
    const recommendations: any[] = [];

    for (const mastery of weakMastery) {
      const microSkillId = mastery.microSkillId;
      if (!microSkillId) continue;

      // Fetch skill name separately
      const skill = await prisma.microSkill.findUnique({
        where: { id: microSkillId },
        select: { id: true, name: true, code: true, category: { select: { name: true } } },
      });
      if (!skill) continue;

      const learningObjects = await prisma.learningObject.findMany({
        where: { microSkillId },
        select: { id: true, title: true, objective: true },
        take: 2,
      });

      const questionCount = await prisma.question.count({
        where: { microSkillId, publicationStatus: 'active' },
      });

      recommendations.push({
        skillId: microSkillId,
        skillName: skill.name,
        categoryName: skill.category?.name || 'General',
        currentLevel: mastery.level,
        practiceQuestionsAvailable: questionCount,
        learningObjects,
        priority: mastery.level === 'notAssessed' ? 'critical' : mastery.level === 'beginning' ? 'high' : 'medium',
      });
    }

    // If not enough from mastery, add random unassessed skills
    const assessedIds = recommendations.map(r => r.skillId);
    const unassessedSkills = await prisma.microSkill.findMany({
      where: {
        ...(subjectId ? { category: { domain: { subjectId } } } : {}),
        id: { notIn: assessedIds },
      },
      take: take - recommendations.length,
      include: { category: { select: { name: true } } },
    });

    for (const skill of unassessedSkills) {
      const questionCount = await prisma.question.count({
        where: { microSkillId: skill.id, publicationStatus: 'active' },
      });

      recommendations.push({
        skillId: skill.id,
        skillName: skill.name,
        categoryName: skill.category?.name || 'General',
        currentLevel: 'notAssessed',
        practiceQuestionsAvailable: questionCount,
        learningObjects: [],
        priority: 'exploratory',
      });

      if (recommendations.length >= take) break;
    }

    res.json({ recommendations: recommendations.slice(0, take) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// POST /api/adaptive/predict-score — Predict a student's test score based on current mastery
router.post('/predict-score', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, targetExam } = req.body;
    const userId = req.userId!;

    // Get user's mastery data across all skills
    const masteryData = await prisma.mastery.findMany({
      where: {
        userId,
        ...(subjectId ? { subjectId } : {}),
      },
      select: {
        level: true,
        confidence: true,
        firstAttemptCorrect: true,
        totalAttempts: true,
        subjectId: true,
      },
    });

    // Calculate mastery score components
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const levelScores: Record<string, number> = {
      notAssessed: 200,
      beginning: 300,
      developing: 450,
      approaching: 550,
      mastered: 700,
      needsReview: 350,
    };

    for (const m of masteryData) {
      const levelScore = levelScores[m.level] || 400;
      const confidence = m.confidence || 0.5;
      const weight = confidence * (m.totalAttempts || 1);
      totalWeightedScore += levelScore * weight;
      totalWeight += weight;
    }

    // Calculate raw predicted score
    const averageLevelScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 400;
    const attemptAccuracy = masteryData.reduce((sum, m) => sum + (m.firstAttemptCorrect || 0), 0) /
      Math.max(masteryData.reduce((sum, m) => sum + (m.totalAttempts || 0), 0), 1);

    // Blend level-based prediction with accuracy-based adjustment
    let predictedScore = Math.round(averageLevelScore * 0.7 + (200 + attemptAccuracy * 600) * 0.3);

    // Clamp to valid score range
    predictedScore = Math.max(200, Math.min(800, predictedScore));

    // Generate confidence interval
    const variability = masteryData.length > 0
      ? 100 - Math.min(masteryData.length * 5, 80)
      : 100;

    // Get recent practice trend
    const recentSessions = await prisma.practiceSession.count({
      where: { userId, status: 'completed', ...(subjectId ? { subjectId } : {}) },
    });

    // Get target score if set
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { targetScore: true, targetTest: true },
    });

    const targetScore = targetExam ? null : (user?.targetScore || null);
    const gapToTarget = targetScore ? predictedScore - targetScore : null;

    res.json({
      predictedScore,
      confidenceInterval: {
        lower: Math.max(200, predictedScore - variability),
        upper: Math.min(800, predictedScore + variability),
        variability,
      },
      components: {
        averageLevelScore: Math.round(averageLevelScore),
        attemptAccuracy: +attemptAccuracy.toFixed(3),
        skillsAssessed: masteryData.length,
        recentSessions,
      },
      targetScore,
      gapToTarget,
      targetTest: user?.targetTest || targetExam || null,
      predictionDate: new Date().toISOString(),
      recommendation: gapToTarget !== null
        ? (gapToTarget >= 0
          ? `On track to meet target score of ${targetScore}`
          : `Need to improve by ${Math.abs(gapToTarget)} points to reach target of ${targetScore}`)
        : 'No target score set — set one to track progress',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict score' });
  }
});

export { router as adaptiveLearningRouter };