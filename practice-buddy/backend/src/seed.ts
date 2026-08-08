// Practice Buddy - Database Seed
// Populates the content hierarchy for SAT

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@fidelisconsultingroup.com',
      passwordHash: adminHash,
      displayName: 'System Administrator',
      role: 'superAdministrator',
      emailVerified: true,
    }
  });
  console.log('Admin user created:', admin.username);

  // Create teacher user
  const teacherHash = await bcrypt.hash('teacher123', 12);
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      email: 'teacher@fidelisconsultingroup.com',
      passwordHash: teacherHash,
      displayName: 'Demo Teacher',
      role: 'teacher',
      emailVerified: true,
    }
  });
  console.log('Teacher user created:', teacher.username);

  // Create student user
  const studentHash = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      email: 'student@fidelisconsultingroup.com',
      passwordHash: studentHash,
      displayName: 'Demo Student',
      role: 'student',
      gradeLevel: '11',
      targetTest: 'SAT',
      targetScore: 1400,
      emailVerified: true,
    }
  });
  console.log('Student user created:', student.username);

  // Create SAT exam
  const sat = await prisma.exam.upsert({
    where: { code: 'SAT' },
    update: {},
    create: { name: 'SAT', code: 'SAT', description: 'Digital SAT', sortOrder: 1 }
  });

  // Create Reading & Writing subject
  const rw = await prisma.subject.upsert({
    where: { examId_code: { examId: sat.id, code: 'RW' } },
    update: {},
    create: { examId: sat.id, name: 'Reading and Writing', code: 'RW', sortOrder: 1 }
  });

  // Create Math subject
  const math = await prisma.subject.upsert({
    where: { examId_code: { examId: sat.id, code: 'MATH' } },
    update: {},
    create: { examId: sat.id, name: 'Math', code: 'MATH', sortOrder: 2 }
  });

  // ============ READING & WRITING DOMAINS ============
  const rwDomains: any[] = [];

  // Information and Ideas
  const infoIdeas = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: rw.id, code: 'INFO_IDEAS' } },
    update: {},
    create: { subjectId: rw.id, name: 'Information and Ideas', code: 'INFO_IDEAS', sortOrder: 1 }
  });
  rwDomains.push(infoIdeas);

  const centralIdeas = await prisma.category.upsert({
    where: { domainId_code: { domainId: infoIdeas.id, code: 'CENTRAL_IDEAS' } },
    update: {},
    create: { domainId: infoIdeas.id, name: 'Central Ideas and Details', code: 'CENTRAL_IDEAS', sortOrder: 1 }
  });

  const inferences = await prisma.category.upsert({
    where: { domainId_code: { domainId: infoIdeas.id, code: 'INFERENCES' } },
    update: {},
    create: { domainId: infoIdeas.id, name: 'Inferences', code: 'INFERENCES', sortOrder: 2 }
  });

  const commandEvidence = await prisma.category.upsert({
    where: { domainId_code: { domainId: infoIdeas.id, code: 'CMD_EVIDENCE' } },
    update: {},
    create: { domainId: infoIdeas.id, name: 'Command of Evidence', code: 'CMD_EVIDENCE', sortOrder: 3 }
  });

  // Textual evidence subcategory
  await prisma.subcategory.upsert({
    where: { categoryId_code: { categoryId: commandEvidence.id, code: 'TEXTUAL' } },
    update: {},
    create: { categoryId: commandEvidence.id, name: 'Textual Evidence', code: 'TEXTUAL', sortOrder: 1 }
  });
  await prisma.subcategory.upsert({
    where: { categoryId_code: { categoryId: commandEvidence.id, code: 'QUANTITATIVE' } },
    update: {},
    create: { categoryId: commandEvidence.id, name: 'Quantitative Evidence', code: 'QUANTITATIVE', sortOrder: 2 }
  });

  // Craft and Structure
  const craftStructure = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: rw.id, code: 'CRAFT_STRUCTURE' } },
    update: {},
    create: { subjectId: rw.id, name: 'Craft and Structure', code: 'CRAFT_STRUCTURE', sortOrder: 2 }
  });
  rwDomains.push(craftStructure);

  await prisma.category.upsert({
    where: { domainId_code: { domainId: craftStructure.id, code: 'WORDS_CONTEXT' } },
    update: {},
    create: { domainId: craftStructure.id, name: 'Words in Context', code: 'WORDS_CONTEXT', sortOrder: 1 }
  });
  await prisma.category.upsert({
    where: { domainId_code: { domainId: craftStructure.id, code: 'TEXT_STRUCTURE' } },
    update: {},
    create: { domainId: craftStructure.id, name: 'Text Structure and Purpose', code: 'TEXT_STRUCTURE', sortOrder: 2 }
  });
  await prisma.category.upsert({
    where: { domainId_code: { domainId: craftStructure.id, code: 'CROSS_TEXT' } },
    update: {},
    create: { domainId: craftStructure.id, name: 'Cross-Text Connections', code: 'CROSS_TEXT', sortOrder: 3 }
  });

  // Expression of Ideas
  const exprIdeas = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: rw.id, code: 'EXPR_IDEAS' } },
    update: {},
    create: { subjectId: rw.id, name: 'Expression of Ideas', code: 'EXPR_IDEAS', sortOrder: 3 }
  });
  rwDomains.push(exprIdeas);

  await prisma.category.upsert({
    where: { domainId_code: { domainId: exprIdeas.id, code: 'TRANSITIONS' } },
    update: {},
    create: { domainId: exprIdeas.id, name: 'Transitions', code: 'TRANSITIONS', sortOrder: 1 }
  });
  await prisma.category.upsert({
    where: { domainId_code: { domainId: exprIdeas.id, code: 'RHETORICAL_SYNTH' } },
    update: {},
    create: { domainId: exprIdeas.id, name: 'Rhetorical Synthesis', code: 'RHETORICAL_SYNTH', sortOrder: 2 }
  });

  // Standard English Conventions
  const conventions = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: rw.id, code: 'CONVENTIONS' } },
    update: {},
    create: { subjectId: rw.id, name: 'Standard English Conventions', code: 'CONVENTIONS', sortOrder: 4 }
  });
  rwDomains.push(conventions);

  await prisma.category.upsert({
    where: { domainId_code: { domainId: conventions.id, code: 'BOUNDARIES' } },
    update: {},
    create: { domainId: conventions.id, name: 'Boundaries', code: 'BOUNDARIES', sortOrder: 1 }
  });
  await prisma.category.upsert({
    where: { domainId_code: { domainId: conventions.id, code: 'FORM_SENSE' } },
    update: {},
    create: { domainId: conventions.id, name: 'Form, Structure, and Sense', code: 'FORM_SENSE', sortOrder: 2 }
  });

  // ============ MATH DOMAINS ============
  // Algebra
  const algebra = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: math.id, code: 'ALGEBRA' } },
    update: {},
    create: { subjectId: math.id, name: 'Algebra', code: 'ALGEBRA', sortOrder: 1 }
  });
  await prisma.category.upsert({ where: { domainId_code: { domainId: algebra.id, code: 'LIN_EQ_1VAR' } }, update: {}, create: { domainId: algebra.id, name: 'Linear Equations in One Variable', code: 'LIN_EQ_1VAR', sortOrder: 1 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: algebra.id, code: 'LIN_EQ_2VAR' } }, update: {}, create: { domainId: algebra.id, name: 'Linear Equations in Two Variables', code: 'LIN_EQ_2VAR', sortOrder: 2 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: algebra.id, code: 'LIN_FUNCTIONS' } }, update: {}, create: { domainId: algebra.id, name: 'Linear Functions', code: 'LIN_FUNCTIONS', sortOrder: 3 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: algebra.id, code: 'LIN_INEQ' } }, update: {}, create: { domainId: algebra.id, name: 'Linear Inequalities', code: 'LIN_INEQ', sortOrder: 4 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: algebra.id, code: 'SYS_LIN_EQ' } }, update: {}, create: { domainId: algebra.id, name: 'Systems of Linear Equations', code: 'SYS_LIN_EQ', sortOrder: 5 } });

  // Advanced Math
  const advMath = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: math.id, code: 'ADV_MATH' } },
    update: {},
    create: { subjectId: math.id, name: 'Advanced Math', code: 'ADV_MATH', sortOrder: 2 }
  });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'EQV_EXPR' } }, update: {}, create: { domainId: advMath.id, name: 'Equivalent Expressions', code: 'EQV_EXPR', sortOrder: 1 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'NONLIN_EQ' } }, update: {}, create: { domainId: advMath.id, name: 'Nonlinear Equations', code: 'NONLIN_EQ', sortOrder: 2 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'QUAD_FUNC' } }, update: {}, create: { domainId: advMath.id, name: 'Quadratic Functions', code: 'QUAD_FUNC', sortOrder: 3 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'EXP_FUNC' } }, update: {}, create: { domainId: advMath.id, name: 'Exponential Functions', code: 'EXP_FUNC', sortOrder: 4 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'POLY_EXPR' } }, update: {}, create: { domainId: advMath.id, name: 'Polynomial Expressions and Functions', code: 'POLY_EXPR', sortOrder: 5 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'RATIONAL_EXPR' } }, update: {}, create: { domainId: advMath.id, name: 'Rational Expressions', code: 'RATIONAL_EXPR', sortOrder: 6 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: advMath.id, code: 'RADICAL_EXPR' } }, update: {}, create: { domainId: advMath.id, name: 'Radical Expressions', code: 'RADICAL_EXPR', sortOrder: 7 } });

  // Problem-Solving and Data Analysis
  const psda = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: math.id, code: 'PSDA' } },
    update: {},
    create: { subjectId: math.id, name: 'Problem-Solving and Data Analysis', code: 'PSDA', sortOrder: 3 }
  });
  await prisma.category.upsert({ where: { domainId_code: { domainId: psda.id, code: 'RATIOS' } }, update: {}, create: { domainId: psda.id, name: 'Ratios, Rates, Proportions, and Units', code: 'RATIOS', sortOrder: 1 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: psda.id, code: 'PERCENTAGES' } }, update: {}, create: { domainId: psda.id, name: 'Percentages', code: 'PERCENTAGES', sortOrder: 2 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: psda.id, code: '1VAR_DATA' } }, update: {}, create: { domainId: psda.id, name: 'One-Variable Data', code: '1VAR_DATA', sortOrder: 3 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: psda.id, code: '2VAR_DATA' } }, update: {}, create: { domainId: psda.id, name: 'Two-Variable Data', code: '2VAR_DATA', sortOrder: 4 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: psda.id, code: 'PROBABILITY' } }, update: {}, create: { domainId: psda.id, name: 'Probability', code: 'PROBABILITY', sortOrder: 5 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: psda.id, code: 'STAT_CLAIMS' } }, update: {}, create: { domainId: psda.id, name: 'Evaluating Statistical Claims', code: 'STAT_CLAIMS', sortOrder: 6 } });

  // Geometry and Trigonometry
  const geometry = await prisma.domain.upsert({
    where: { subjectId_code: { subjectId: math.id, code: 'GEOMETRY' } },
    update: {},
    create: { subjectId: math.id, name: 'Geometry and Trigonometry', code: 'GEOMETRY', sortOrder: 4 }
  });
  await prisma.category.upsert({ where: { domainId_code: { domainId: geometry.id, code: 'AREA_VOL' } }, update: {}, create: { domainId: geometry.id, name: 'Area and Volume', code: 'AREA_VOL', sortOrder: 1 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: geometry.id, code: 'LINES_ANGLES' } }, update: {}, create: { domainId: geometry.id, name: 'Lines, Angles, and Triangles', code: 'LINES_ANGLES', sortOrder: 2 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: geometry.id, code: 'RIGHT_TRI' } }, update: {}, create: { domainId: geometry.id, name: 'Right Triangles and Trigonometry', code: 'RIGHT_TRI', sortOrder: 3 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: geometry.id, code: 'CIRCLES' } }, update: {}, create: { domainId: geometry.id, name: 'Circles', code: 'CIRCLES', sortOrder: 4 } });
  await prisma.category.upsert({ where: { domainId_code: { domainId: geometry.id, code: 'COORD_GEOM' } }, update: {}, create: { domainId: geometry.id, name: 'Coordinate Geometry', code: 'COORD_GEOM', sortOrder: 5 } });

  // Create subscription plans
  const plans = [
    { name: 'Student Basic', code: 'STUDENT_BASIC', planType: 'student' as const, price: 0, billingCycle: null, features: { questionsPerDay: 20, fullExplanations: true, strategies: true, basicAnalytics: true, maxStudents: 1 }, sortOrder: 1 },
    { name: 'Student Premium', code: 'STUDENT_PREMIUM', planType: 'student' as const, price: 14.99, billingCycle: 'monthly' as const, features: { unlimitedQuestions: true, fullExplanations: true, strategies: true, advancedAnalytics: true, fullTests: true, adaptivePractice: true, aiTutoring: false, maxStudents: 1 }, sortOrder: 2 },
    { name: 'AEEG Center Student', code: 'CENTER_STUDENT', planType: 'student' as const, price: 0, billingCycle: null, features: { unlimitedQuestions: true, fullExplanations: true, strategies: true, fullTests: true, centerMode: true, maxStudents: 1 }, sortOrder: 3 },
    { name: 'Teacher Starter', code: 'TEACHER_STARTER', planType: 'teacher' as const, price: 29.99, billingCycle: 'monthly' as const, features: { maxStudents: 10, fullAnalytics: true, assignments: true, classManagement: true, reports: true }, sortOrder: 4 },
    { name: 'Teacher Standard', code: 'TEACHER_STANDARD', planType: 'teacher' as const, price: 49.99, billingCycle: 'monthly' as const, features: { maxStudents: 25, fullAnalytics: true, assignments: true, classManagement: true, reports: true, aiTutoring: true }, sortOrder: 5 },
    { name: 'Teacher Pro', code: 'TEACHER_PRO', planType: 'teacher' as const, price: 99.99, billingCycle: 'monthly' as const, features: { maxStudents: 50, fullAnalytics: true, assignments: true, classManagement: true, reports: true, aiTutoring: true, customPools: true }, sortOrder: 6 },
    { name: 'Parent Plan', code: 'PARENT_BASIC', planType: 'parent' as const, price: 9.99, billingCycle: 'monthly' as const, features: { maxStudents: 1, progressTracking: true, weeklyReports: true, practiceGoals: true }, sortOrder: 7 },
    { name: 'Parent Family', code: 'PARENT_FAMILY', planType: 'parent' as const, price: 19.99, billingCycle: 'monthly' as const, features: { maxStudents: 3, progressTracking: true, weeklyReports: true, practiceGoals: true, fullTests: true }, sortOrder: 8 },
    { name: 'School License', code: 'SCHOOL_LICENSE', planType: 'school' as const, price: 999.00, billingCycle: 'annual' as const, features: { maxStudents: 200, fullAnalytics: true, adminDashboard: true, customBranding: true, allFeatures: true }, sortOrder: 9 },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {},
      create: plan,
    });
  }

  console.log('Subscription plans created');

  // Create a demo access code
  await prisma.accessCode.upsert({
    where: { code: 'AEEG-DEMO-2024' },
    update: {},
    create: {
      code: 'AEEG-DEMO-2024',
      codeType: 'premium',
      description: 'Demo access code for testing',
      maxUses: 100,
      maxUsers: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      allowedFeatures: ['full_tests', 'strategies', 'explanations', 'analytics'],
      createdBy: admin.id,
    }
  });
  console.log('Demo access code created');

  // Create a sample class
  const demoClass = await prisma.class.upsert({
    where: { code: 'DEMO101' },
    update: {},
    create: {
      name: 'SAT Prep Demo Class',
      description: 'Demo class for practice buddy testing',
      code: 'DEMO101',
      subject: 'SAT',
      teachers: { create: { teacherId: teacher.id } },
      students: { create: { studentId: student.id } },
    }
  });
  console.log('Demo class created');

  console.log('\\n=== SEED COMPLETE ===');
  console.log('Admin: admin / admin123');
  console.log('Teacher: teacher / teacher123');
  console.log('Student: student / student123');
  console.log('Access Code: AEEG-DEMO-2024');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());