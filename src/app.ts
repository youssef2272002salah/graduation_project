import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { logger, morganMiddleware } from './utils/logging';

import 'reflect-metadata';
import "./config/passport"; 

// 

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
app.use(passport.initialize());

app.use(morganMiddleware);

// Routes
import { authRouter } from './modules/auth/auth.module';
app.use('/api/v1/auth', authRouter);

import { userRouter } from './modules/users/user.module';
app.use('/api/v1/users', userRouter);

import { cvRouter } from './modules/cvs/cv.module';
app.use('/api/v1/cvs', cvRouter);

import { chatRouter } from './modules/chat/chat.module';
app.use('/api/v1/chat', chatRouter);

// Global error handler
import { globalErrorHandler } from './utils/errorHandler';
app.use(globalErrorHandler);

// Ensure logs are flushed before app exits
process.on("exit", () => {
logger.info("Logs flushed!");

console.log("Logs flushed!");
});

export default app;
