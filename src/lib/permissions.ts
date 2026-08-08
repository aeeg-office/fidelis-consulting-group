import { prisma } from "./prisma";

export type PermissionCode = string;

const PERMISSION_MAP: Record<string, string[]> = {
  admin: ["admin:*"],
  school_admin: ["admin:users", "admin:subscriptions", "admin:reports", "admin:ai-usage"],
  hod: ["admin:reports", "admin:ai-usage", "workshops:view", "workshops:enroll"],
  teacher: ["workshops:view", "workshops:enroll"],
  independent_teacher: ["workshops:view"],
  workshop_participant: ["workshops:view", "workshops:enroll"],
};

// AI tool permissions granted to all teacher+ roles
const AI_TOOL_PERMS = [
  "ai:lesson-planner", "ai:unit-planner", "ai:worksheet-builder",
  "ai:reading-passage", "ai:writing-prompts", "ai:quiz-builder",
  "ai:assessment-generator", "ai:rubric-builder", "ai:learning-objectives",
  "ai:success-criteria", "ai:homework-generator", "ai:differentiation",
  "ai:exit-tickets", "ai:parent-letter", "ai:professional-email",
  "ai:writing-feedback", "ai:grammar-analysis", "ai:student-feedback",
];

export async function hasPermission(
  userId: string,
  permissionCode: PermissionCode
): Promise<boolean> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        if (rp.permission.code === permissionCode || rp.permission.code === "admin:*") {
          return true;
        }
      }
    }
    return false;
  } catch {
    // Fallback for when DB is not available
    return false;
  }
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    const perms = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        perms.add(rp.permission.code);
      }
    }
    return Array.from(perms);
  } catch {
    return [];
  }
}

/**
 * Check if a user has access to a specific AI tool.
 * Teachers get all AI tools; workshop participants get none.
 */
export function canAccessAiTool(roleName: string): boolean {
  return ["admin", "school_admin", "hod", "teacher", "independent_teacher"].includes(roleName);
}