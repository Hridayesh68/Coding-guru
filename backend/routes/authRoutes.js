import express from 'express';
import {
  registerUser,
  registerAdmin,
  loginUser,
  loginAdmin,
  getMe
} from '../controller/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth endpoints
router.post('/register-user', registerUser);
router.post('/register-admin', registerAdmin);
router.post('/user-login', loginUser);
router.post('/admin-login', loginAdmin);

// General sign in (auto-detect or unified)
router.post('/login', loginUser);

// Protected session check
router.get('/me', verifyToken, getMe);

export default router;
