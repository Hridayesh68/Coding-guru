import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminStats,
  getDailyHeatmap
} from '../controller/questionController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional token extraction middleware for list of questions (so we know if user solved it)
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

// Public / User question routes
router.get('/', optionalVerifyToken, getAllQuestions);
router.get('/analytics/heatmap', optionalVerifyToken, getDailyHeatmap);
router.get('/analytics/admin', verifyToken, requireAdmin, getAdminStats);
router.get('/:id', optionalVerifyToken, getQuestionById);

// Admin-only management routes
router.post('/', verifyToken, requireAdmin, createQuestion);
router.put('/:id', verifyToken, requireAdmin, updateQuestion);
router.delete('/:id', verifyToken, requireAdmin, deleteQuestion);

export default router;
