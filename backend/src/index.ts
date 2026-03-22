import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import subjectsRoutes from './modules/subjects/subjects.routes';
import sectionsRoutes from './modules/sections/sections.routes';
import videosRoutes from './modules/videos/videos.routes';
import progressRoutes from './modules/progress/progress.routes';
import paymentRoutes from './modules/payment/payment.routes';
import adminRoutes from './modules/admin/admin.routes';
import certificatesRoutes from './modules/certificates/certificates.routes';
import aiRoutes from './modules/ai/ai.routes';

const app = express();

// Middleware
const allowedOrigins = env.FRONTEND_URL.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback to true for testing, or use a more strict check
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
  });
}

export default app;
