import { generateQuestionFromIdea } from "../services/aiService.js";

/**
 * Generate a complete question with 10 test cases using AI
 * POST /api/ai/generate-question
 */
export async function generateQuestionHandler(req, res) {
  try {
    const { idea, difficulty = "Medium" } = req.body;

    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a problem idea or description for the AI."
      });
    }

    console.log(`[AI Controller] Generating question from idea: "${idea.slice(0, 80)}..."`);
    const aiResult = await generateQuestionFromIdea(idea, difficulty);

    return res.status(200).json({
      success: true,
      provider: aiResult.provider,
      question: aiResult.data,
      message: `Successfully generated question with 10 test cases via ${aiResult.provider}`
    });
  } catch (error) {
    console.error("[AI Controller] Generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate question with AI."
    });
  }
}

/**
 * Get AI provider pool status
 * GET /api/ai/status
 */
export async function getAiStatusHandler(req, res) {
  const geminiCount = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10,
  ].filter(Boolean).length;

  const groqCount = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
  ].filter(Boolean).length;

  res.json({
    success: true,
    geminiPoolSize: geminiCount,
    groqBackupSize: groqCount,
    totalKeys: geminiCount + groqCount,
    models: {
      primary: "gemini-2.5-flash",
      secondary: "openai/gpt-oss-120b"
    }
  });
}
