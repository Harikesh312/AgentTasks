import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agent.js';
import discussRoutes from './routes/discuss.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import questionsRoutes from './routes/questions.js';
import { seedAdminAndQuestions } from './utils/seedAdmin.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://agenttasks-ux03.onrender.com'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Simple Cookie Parser Middleware
app.use((req, res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(c => {
      const [key, ...rest] = c.split('=');
      req.cookies[key.trim()] = rest.join('=').trim();
    });
  }
  next();
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/discuss', discussRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionsRoutes);
// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedAdminAndQuestions();
  })
  .catch((err) => console.log('MongoDB Connection Error: ', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Trigger restart
