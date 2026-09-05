import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';

// Get all questions with solved status for current user if available
export const getAllQuestions = (req, res) => {
  try {
    const questions = db.getQuestions();
    const userId = req.user?.id;
    const submissions = db.getAllSubmissions();

    const result = questions.map((q) => {
      const qSubmissions = submissions.filter((s) => s.questionId === q.id);
      const userSolved = userId ? qSubmissions.some((s) => s.userId === userId && s.status === 'Accepted') : false;

      return {
        id: q.id,
        title: q.title,
        slug: q.slug,
        difficulty: q.difficulty,
        tags: q.tags || [],
        testCasesCount: q.testCases?.length || 0,
        submissionCount: qSubmissions.length,
        acceptedCount: qSubmissions.filter((s) => s.status === 'Accepted').length,
        isSolved: userSolved,
        createdAt: q.createdAt
      };
    });

    return res.json({ success: true, count: result.length, questions: result });
  } catch (error) {
    console.error('Get questions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve questions.' });
  }
};

// Get single question by ID or slug
export const getQuestionById = (req, res) => {
  try {
    const { id } = req.params;
    const question = db.getQuestionById(id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Return question with sample test cases
    return res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get question error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve question details.' });
  }
};

// Create Question (Admin Only) - Requires exactly/at least 10 test cases
export const createQuestion = (req, res) => {
  try {
    const { title, difficulty, tags, description, starterCode, testCases } = req.body;

    if (!title || !difficulty || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, difficulty, and description are required fields.'
      });
    }

    if (!Array.isArray(testCases) || testCases.length < 10) {
      return res.status(400).json({
        success: false,
        message: `A question must include 10 test cases to verify code accuracy. Provided: ${testCases ? testCases.length : 0}`
      });
    }

    // Format and validate test cases
    const formattedTestCases = testCases.slice(0, 10).map((tc, index) => ({
      id: index + 1,
      input: String(tc.input || '').trim(),
      expectedOutput: String(tc.expectedOutput || '').trim(),
      isHidden: tc.isHidden !== undefined ? Boolean(tc.isHidden) : index >= 4,
      explanation: tc.explanation || `Test case ${index + 1}`
    }));

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newQuestion = {
      id: `q_${uuidv4().slice(0, 8)}`,
      title: title.trim(),
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Easy',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : ['Algorithm']),
      description,
      starterCode: starterCode || {
        javascript: 'function solve(input) {\n  // Write your code here\n}',
        python: 'def solve(input):\n    # Write your code here\n    pass'
      },
      testCases: formattedTestCases,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    db.createQuestion(newQuestion);

    return res.status(201).json({
      success: true,
      message: 'Question with 10 test cases created successfully!',
      question: newQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create question.' });
  }
};

// Update Question (Admin Only)
export const updateQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getQuestionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const { title, difficulty, tags, description, starterCode, testCases } = req.body;

    const updates = {};
    if (title) updates.title = title.trim();
    if (difficulty) updates.difficulty = difficulty;
    if (tags) updates.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    if (description) updates.description = description;
    if (starterCode) updates.starterCode = starterCode;
    if (Array.isArray(testCases)) {
      if (testCases.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Questions require at least 10 test cases.'
        });
      }
      updates.testCases = testCases.slice(0, 10).map((tc, idx) => ({
        id: idx + 1,
        input: String(tc.input || '').trim(),
        expectedOutput: String(tc.expectedOutput || '').trim(),
        isHidden: Boolean(tc.isHidden),
        explanation: tc.explanation || `Test case ${idx + 1}`
      }));
    }

    const updated = db.updateQuestion(existing.id, updates);
    return res.json({
      success: true,
      message: 'Question updated successfully.',
      question: updated
    });
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update question.' });
  }
};

// Delete Question (Admin Only)
export const deleteQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteQuestion(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    return res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
};

// Admin Platform Analytics
export const getAdminStats = (req, res) => {
  try {
    const questions = db.getQuestions();
    const submissions = db.getAllSubmissions();
    const users = db.data.users;

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted').length;
    const acceptanceRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : '0.0';

    return res.json({
      success: true,
      stats: {
        totalQuestions: questions.length,
        totalUsers: users.filter((u) => u.role === 'user').length,
        totalAdmins: users.filter((u) => u.role === 'admin').length,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: `${acceptanceRate}%`
      },
      recentSubmissions: submissions.slice(0, 10)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
};
