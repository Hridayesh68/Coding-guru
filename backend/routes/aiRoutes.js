import express from "express";
import { generateQuestionHandler, getAiStatusHandler } from "../controller/aiController.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// AI Pool status (public for dashboard status)
router.get("/status", getAiStatusHandler);

// Generate question from idea (Admin only)
router.post("/generate-question", verifyToken, requireAdmin, generateQuestionHandler);

export default router;
