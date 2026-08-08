import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create feature flags
  const futureModules = [
    { code: "module:student-portal", name: "Student Portal", category: "module", defaultValue: false },
    { code: "module:parent-portal", name: "Parent Portal", category: "module", defaultValue: false },
    { code: "module:timetables", name: "Timetables", category: "module", defaultValue: false },
    { code: "module:attendance", name: "Attendance", category: "module", defaultValue: false },
    { code: "module:ocr-handwriting", name: "OCR & Handwriting", category: "module", defaultValue: false },
    { code: "module:bulk-grading", name: "Bulk Grading", category: "module", defaultValue: false },
    { code: "module:school-analytics", name: "School Analytics", category: "module", defaultValue: false },
    { code: "module:accreditation", name: "Accreditation", category: "module", defaultValue: false },
    { code: "module:hr", name: "HR Module", category: "module", defaultValue: false },
    { code: "module:recruitment", name: "Recruitment", category: "module", defaultValue: false },
    { code: "module:lms", name: "LMS", category: "module", defaultValue: false },
    { code: "module:finance", name: "Finance", category: "module", defaultValue: false },
  ];

  const aiToolFlags = [
    { code: "ai:lesson-planner", name: "Lesson Planner", category: "ai_tool", defaultValue: true },
    { code: "ai:unit-planner", name: "Unit Planner", category: "ai_tool", defaultValue: true },
    { code: "ai:worksheet-builder", name: "Worksheet Builder", category: "ai_tool", defaultValue: true },
    { code: "ai:reading-passage", name: "Reading Passage Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:writing-prompts", name: "Writing Prompt Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:quiz-builder", name: "Quiz Builder", category: "ai_tool", defaultValue: true },
    { code: "ai:assessment-generator", name: "Assessment Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:rubric-builder", name: "Rubric Builder", category: "ai_tool", defaultValue: true },
    { code: "ai:learning-objectives", name: "Learning Objective Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:success-criteria", name: "Success Criteria Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:homework-generator", name: "Homework Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:differentiation", name: "Differentiation Assistant", category: "ai_tool", defaultValue: true },
    { code: "ai:exit-tickets", name: "Exit Ticket Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:parent-letter", name: "Parent Letter Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:professional-email", name: "Professional Email Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:meeting-agenda", name: "Meeting Agenda Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:dept-report", name: "Department Report Generator", category: "ai_tool", defaultValue: true },
    { code: "ai:dept-improvement", name: "Department Improvement Planner", category: "ai_tool", defaultValue: true },
    { code: "ai:writing-feedback", name: "Writing Feedback Assistant", category: "ai_tool", defaultValue: true },
    { code: "ai:grammar-analysis", name: "Grammar Analysis", category: "ai_tool", defaultValue: true },
    { code: "ai:student-feedback", name: "Student Feedback Generator", category: "ai_tool", defaultValue: true },
  ];

  for (const flag of [...futureModules, ...aiToolFlags]) {
    await prisma.featureFlag.upsert({
      where: { code: flag.code },
      update: {},
      create: flag,
    });
  }
  console.log(`✅ ${futureModules.length + aiToolFlags.length} feature flags created`);

  // 2. Create roles
  const roles = [
    { name: "admin", displayName: "Administrator", isSystem: true },
    { name: "school_admin", displayName: "School Administrator", isSystem: true },
    { name: "hod", displayName: "Head of Department", isSystem: true },
    { name: "teacher", displayName: "Teacher", isSystem: true },
    { name: "independent_teacher", displayName: "Independent Teacher", isSystem: true },
    { name: "workshop_participant", displayName: "Workshop Participant", isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log(`✅ ${roles.length} roles created`);

  // 3. Create permissions
  const permCategories = {
    admin: ["admin:users", "admin:schools", "admin:subscriptions", "admin:content", "admin:features", "admin:audit", "admin:reports", "admin:ai-usage", "admin:*"],
    school_admin: ["admin:users", "admin:subscriptions", "admin:reports", "admin:ai-usage"],
    workshops: ["workshops:view", "workshops:enroll", "workshops:create", "workshops:edit", "workshops:delete"],
    ai_tools: aiToolFlags.map(f => f.code),
  };

  const allPerms = [...permCategories.admin, ...permCategories.school_admin, ...permCategories.workshops, ...permCategories.ai_tools];
  
  for (const code of allPerms) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, category: code.startsWith("admin") ? "admin" : code.startsWith("ai:") ? "ai_tool" : "workshops" },
    });
  }
  console.log(`✅ ${allPerms.length} permissions created`);

  // 4. Assign permissions to roles
  const rolePermMap: Record<string, string[]> = {
    admin: permCategories.admin,
    school_admin: [...permCategories.school_admin, ...permCategories.workshops, ...permCategories.ai_tools],
    hod: ["admin:reports", "admin:ai-usage", ...permCategories.workshops, ...permCategories.ai_tools],
    teacher: [...permCategories.workshops, ...permCategories.ai_tools],
    independent_teacher: [...permCategories.workshops, ...permCategories.ai_tools],
    workshop_participant: ["workshops:view", "workshops:enroll"],
  };

  for (const [roleName, permCodes] of Object.entries(rolePermMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const permCode of permCodes) {
      const perm = await prisma.permission.findUnique({ where: { code: permCode } });
      if (!perm) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log(`✅ Role-permission mappings created`);

  // 5. Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@fidelisconsultingroup.com" },
    update: {},
    create: {
      email: "admin@fidelisconsultingroup.com",
      passwordHash: hashedPassword,
      fullName: "Fidelis Administrator",
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: admin@fidelisconsultingroup.com / admin123`);

  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }

  // 6. Create subscription plans
  const plans = [
    { name: "Teacher Basic", code: "teacher_basic", type: "teacher", priceMonthly: 9, maxTeachers: 1, sortOrder: 1 },
    { name: "Teacher Professional", code: "teacher_pro", type: "teacher", priceMonthly: 19, maxTeachers: 1, sortOrder: 2 },
    { name: "Teacher Unlimited", code: "teacher_unlimited", type: "teacher", priceMonthly: 39, maxTeachers: null, sortOrder: 3 },
    { name: "School Starter", code: "school_starter", type: "school", priceMonthly: 5, maxTeachers: 5, sortOrder: 4 },
    { name: "School Professional", code: "school_pro", type: "school", priceMonthly: 12, maxTeachers: 10, sortOrder: 5 },
    { name: "School Enterprise", code: "school_enterprise", type: "school", priceMonthly: null, maxTeachers: null, sortOrder: 6 },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {},
      create: plan,
    });
  }
  console.log(`✅ ${plans.length} subscription plans created`);

  // 7. Create sample AI tools
  const toolCategories = [
    { code: "lesson-planner", name: "Lesson Planner", category: "planning", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/lesson-planner", icon: "BookOpen" },
    { code: "unit-planner", name: "Unit Planner", category: "planning", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/unit-planner", icon: "Calendar" },
    { code: "worksheet-builder", name: "Worksheet Builder", category: "resource", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/worksheet-builder", icon: "FileText" },
    { code: "reading-passage", name: "Reading Passage Generator", category: "resource", defaultModel: "openai/o4-mini", route: "/app/tools/reading-passage", icon: "Book" },
    { code: "writing-prompts", name: "Writing Prompt Generator", category: "resource", defaultModel: "openai/o4-mini", route: "/app/tools/writing-prompts", icon: "Pen" },
    { code: "quiz-builder", name: "Quiz Builder", category: "assessment", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/quiz-builder", icon: "ClipboardList" },
    { code: "assessment-generator", name: "Assessment Generator", category: "assessment", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/assessment-generator", icon: "BarChart" },
    { code: "rubric-builder", name: "Rubric Builder", category: "assessment", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/rubric-builder", icon: "List" },
    { code: "writing-feedback", name: "Writing Feedback Assistant", category: "feedback", defaultModel: "openai/o4-mini", route: "/app/tools/writing-feedback", icon: "MessageSquare" },
    { code: "grammar-analysis", name: "Grammar Analysis", category: "feedback", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/grammar-analysis", icon: "Search" },
    { code: "student-feedback", name: "Student Feedback Generator", category: "feedback", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/student-feedback", icon: "Users" },
    { code: "parent-letter", name: "Parent Letter Generator", category: "communication", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/parent-letter", icon: "Mail" },
    { code: "professional-email", name: "Professional Email Generator", category: "communication", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/professional-email", icon: "Send" },
    { code: "meeting-agenda", name: "Meeting Agenda Generator", category: "pd", defaultModel: "deepseek/deepseek-v4-flash", route: "/app/tools/meeting-agenda", icon: "Clock" },
    { code: "dept-report", name: "Department Report Generator", category: "leadership", defaultModel: "openai/o4-mini", route: "/app/tools/dept-report", icon: "File" },
  ];

  for (const tool of toolCategories) {
    await prisma.aiTool.upsert({
      where: { code: tool.code },
      update: {},
      create: tool,
    });
  }
  console.log(`✅ ${toolCategories.length} AI tools created`);
  
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });