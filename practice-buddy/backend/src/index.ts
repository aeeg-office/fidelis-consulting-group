import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth';
import { questionsRouter } from './routes/questions';
import { practiceRouter } from './routes/practice';
import { assignmentsRouter } from './routes/assignments';
import { adminRouter } from './routes/admin';
import { teacherRouter } from './routes/teacher';
import { analyticsRouter } from './routes/analytics';
import { accessCodesRouter } from './routes/accessCodes';
import { subscriptionsRouter } from './routes/subscriptions';
import { masteryRouter } from './routes/mastery';
// Enterprise route imports
import { microSkillsRouter } from './routes/microSkills';
import { learningObjectsRouter } from './routes/learningObjects';
import { diagnosticsRouter } from './routes/diagnostics';
import { mockExamsRouter } from './routes/mockExams';
import { speakingRouter } from './routes/speaking';
import { writingRouter } from './routes/writing';
import { teacherWorkflowRouter } from './routes/teacherWorkflow';
import { subscriptionLicensesRouter } from './routes/subscriptionLicenses';
import { adaptiveLearningRouter } from './routes/adaptiveLearning';
import { errorHandler } from './middleware/errorHandler';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT || '100'),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth routes get stricter rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT || '20'),
  message: { error: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/access-codes', accessCodesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/mastery', masteryRouter);

// Enterprise API Routes
app.use('/api/micro-skills', microSkillsRouter);
app.use('/api/learning-objects', learningObjectsRouter);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/mock-exams', mockExamsRouter);
app.use('/api/speaking', speakingRouter);
app.use('/api/writing', writingRouter);
app.use('/api/teacher-workflow', teacherWorkflowRouter);
app.use('/api/subscription-licenses', subscriptionLicensesRouter);
app.use('/api/adaptive', adaptiveLearningRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Practice Buddy API running on port ${PORT}`);
});

export default app;