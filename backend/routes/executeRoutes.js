import express from 'express';
import { runCode, submitCode, getSubmissions } from '../controller/executeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Preview run against sample test cases
router.post('/run', runCode);

// Official code submission evaluated against all 10 test cases (requires user login)
router.post('/submit', verifyToken, submitCode);

// Retrieve submission history for user/question
router.get('/submissions', verifyToken, getSubmissions);

export default router;
