export interface FeatureFlagResult {
  enabled: boolean;
  value: any;
  source: "global" | "plan" | "school" | "user";
}

const FEATURE_FLAGS = {
  // Future modules — all disabled by default
  "module:student-portal": false,
  "module:parent-portal": false,
  "module:timetables": false,
  "module:attendance": false,
  "module:ocr-handwriting": false,
  "module:bulk-grading": false,
  "module:school-analytics": false,
  "module:accreditation": false,
  "module:hr": false,
  "module:recruitment": false,
  "module:lms": false,
  "module:finance": false,
  "module:mobile-app": false,

  // AI tools — all enabled by default
  "ai:lesson-planner": true,
  "ai:unit-planner": true,
  "ai:worksheet-builder": true,
  "ai:reading-passage": true,
  "ai:writing-prompts": true,
  "ai:quiz-builder": true,
  "ai:assessment-generator": true,
  "ai:rubric-builder": true,
  "ai:learning-objectives": true,
  "ai:success-criteria": true,
  "ai:homework-generator": true,
  "ai:differentiation": true,
  "ai:exit-tickets": true,
  "ai:parent-letter": true,
  "ai:professional-email": true,
  "ai:meeting-agenda": true,
  "ai:dept-report": true,
  "ai:dept-improvement": true,
  "ai:writing-feedback": true,
  "ai:grammar-analysis": true,
  "ai:student-feedback": true,

  // Admin features
  "feature:bulk-export": true,
  "feature:audit-log": true,
  "feature:api-access": false,
} as const;

export type FeatureFlagCode = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature flag is enabled.
 * In production, this queries the database with override resolution.
 * For development, uses defaults defined above.
 */
export async function isFeatureEnabled(
  flagCode: FeatureFlagCode,
  context?: { userId?: string; schoolId?: string; planId?: string }
): Promise<FeatureFlagResult> {
  // For now, return the default
  const defaultValue = FEATURE_FLAGS[flagCode] ?? false;

  try {
    const { prisma } = await import("@/lib/prisma");
    const flag = await prisma.featureFlag.findUnique({ where: { code: flagCode } });
    if (!flag) return { enabled: defaultValue, value: defaultValue, source: "global" };

    // Check user override
    if (context?.userId) {
      const userOverride = await prisma.featureFlagOverride.findFirst({
        where: { flagId: flag.id, entityType: "user", entityId: context.userId },
      });
      if (userOverride) return { enabled: !!userOverride.value, value: userOverride.value, source: "user" };
    }

    // Check school override
    if (context?.schoolId) {
      const schoolOverride = await prisma.featureFlagOverride.findFirst({
        where: { flagId: flag.id, entityType: "school", entityId: context.schoolId },
      });
      if (schoolOverride) return { enabled: !!schoolOverride.value, value: schoolOverride.value, source: "school" };
    }

    return { enabled: flag.defaultValue as boolean, value: flag.defaultValue, source: "global" };
  } catch {
    return { enabled: defaultValue, value: defaultValue, source: "global" };
  }
}