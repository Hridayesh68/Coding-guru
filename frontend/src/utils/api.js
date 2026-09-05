import { getToken, clearAuth } from './auth';

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle unauthorized globally
    if (response.status === 401) {
      clearAuth();
      window.dispatchEvent(new CustomEvent('auth-changed'));
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  loginUser: (email, password) =>
    request('/auth/user-login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginAdmin: (email, password) =>
    request('/auth/admin-login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  registerUser: (name, email, password) =>
    request('/auth/register-user', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  registerAdmin: (name, email, password, adminKey) =>
    request('/auth/register-admin', { method: 'POST', body: JSON.stringify({ name, email, password, adminKey }) }),
  getMe: () => request('/auth/me'),

  // Questions
  getQuestions: () => request('/questions'),
  getQuestionById: (id) => request(`/questions/${id}`),
  createQuestion: (questionData) =>
    request('/questions', { method: 'POST', body: JSON.stringify(questionData) }),
  updateQuestion: (id, updates) =>
    request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteQuestion: (id) =>
    request(`/questions/${id}`, { method: 'DELETE' }),
  getAdminStats: () => request('/questions/analytics/admin'),

  // Execution & Submissions
  runCode: ({ code, language, questionId, customTestCases }) =>
    request('/execute/run', {
      method: 'POST',
      body: JSON.stringify({ code, language, questionId, customTestCases })
    }),
  submitCode: ({ code, language, questionId }) =>
    request('/execute/submit', {
      method: 'POST',
      body: JSON.stringify({ code, language, questionId })
    }),
  getSubmissions: (questionId) =>
    request(`/execute/submissions${questionId ? `?questionId=${questionId}` : ''}`)
};
