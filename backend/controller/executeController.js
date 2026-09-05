import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { evaluateAllTestCases, executeSingleTestCase, areOutputsEqual } from '../services/codeRunner.js';

// Run Code against sample / selected test cases without permanent submission record
export const runCode = async (req, res) => {
  try {
    const { code, language, questionId, customTestCases } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language are required.' });
    }

    let casesToRun = [];

    if (customTestCases && Array.isArray(customTestCases) && customTestCases.length > 0) {
      casesToRun = customTestCases;
    } else if (questionId) {
      const question = db.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found.' });
      }
      // Run against first 4 sample test cases for preview
      casesToRun = question.testCases.slice(0, 4);
    } else {
      return res.status(400).json({ success: false, message: 'Question ID or test cases must be provided.' });
    }

    const evaluation = await evaluateAllTestCases({
      code,
      language: language.toLowerCase(),
      testCases: casesToRun
    });

    return res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Run code error:', error);
    return res.status(500).json({ success: false, message: 'Execution error occurred while testing code.' });
  }
};

// Submit Code against all 10 test cases and record official submission
export const submitCode = async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    if (!code || !language || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and questionId are required for submission.'
      });
    }

    const question = db.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const allTestCases = question.testCases || [];
    if (allTestCases.length === 0) {
      return res.status(400).json({ success: false, message: 'Question has no test cases configured.' });
    }

    // Evaluate against all 10 test cases
    const evaluation = await evaluateAllTestCases({
      code,
      language: language.toLowerCase(),
      testCases: allTestCases
    });

    // Record official submission in database
    const submissionRecord = {
      id: `sub_${uuidv4().slice(0, 8)}`,
      userId: req.user.id,
      userName: req.user.name,
      questionId: question.id,
      questionTitle: question.title,
      code,
      language,
      status: evaluation.status,
      passedCount: evaluation.passedCount,
      totalCount: evaluation.totalCount,
      runtimeMs: evaluation.totalExecutionTimeMs,
      testResults: evaluation.testResults,
      createdAt: new Date().toISOString()
    };

    db.createSubmission(submissionRecord);

    return res.json({
      success: true,
      submission: submissionRecord
    });
  } catch (error) {
    console.error('Submit code error:', error);
    return res.status(500).json({ success: false, message: 'Server error during submission execution.' });
  }
};

// Get Submissions for Question or User
export const getSubmissions = (req, res) => {
  try {
    const { questionId } = req.query;
    const userId = req.user.id;
    const submissions = db.getUserSubmissions(userId, questionId);

    return res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve submissions.' });
  }
};
