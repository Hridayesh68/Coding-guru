# Coding Guru 🚀

A modern full-stack coding platform featuring dual-role JWT authentication (Coder vs Admin), LeetCode-style problem solving environment in JavaScript & Python, and an evaluation judge that validates code against **10 comprehensive test cases** per problem.

---

## Key Features

- **Dual-Role JWT Authentication**: Separate user and administrator authentication flows with role-based access control.
- **10 Test Cases Evaluation**: Every problem features 10 test cases (including boundary cases, negative values, and large inputs) evaluated in isolated sandboxes with timeout protection.
- **Multi-Language Support**: Interactive code editor with syntax indentation and support for **JavaScript (Node.js)** and **Python 3**.
- **Admin Management Portal**: Administrators can create, edit, and delete questions with full 10-test-case suites, and inspect platform submissions and metrics.
- **Problem Solving Environment**: Split-screen IDE with description, constraints, sample cases, line numbers, live test runner, and submission history.
- **Modern Dark UI**: Designed with glassmorphism, responsive panels, glowing badges, and custom scrollbars.

---

## Pre-Seeded Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@codingguru.com` | `Admin@123` |
| **Coder** | `coder@codingguru.com` | `Coder@123` |

*Both can be logged into instantly with the 1-click quick login buttons in the Sign In modal.*

---

## Project Structure

```
Coding guru/
├── backend/
│   ├── controller/
│   │   ├── authController.js       # User & Admin JWT endpoints
│   │   ├── questionController.js   # Question CRUD & analytics
│   │   └── executeController.js    # Run & submit against 10 test cases
│   ├── db/
│   │   └── database.js             # Data store seeded with 4 problems (10 cases each)
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT & Admin role verification
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── questionRoutes.js       # /api/questions
│   │   └── executeRoutes.js        # /api/execute
│   ├── services/
│   │   └── codeRunner.js           # Sandbox execution with timeout protection
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Express server on port 5000
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Role-aware navigation
│   │   │   ├── AuthModal.jsx       # Tabbed Coder / Admin authentication
│   │   │   ├── CodeEditor.jsx      # Multi-language code editor
│   │   │   ├── TestCaseRunner.jsx  # 10 Test Cases tabs with live status
│   │   │   └── AdminQuestionModal.jsx # Admin 10-test-case question editor
│   │   ├── pages/
│   │   │   ├── ProblemsPage.jsx    # Filterable problem library
│   │   │   ├── ProblemDetailPage.jsx # Split IDE problem solver
│   │   │   └── AdminDashboard.jsx  # Admin analytics & question management
│   │   ├── utils/
│   │   │   ├── api.js              # Fetch client with JWT authorization
│   │   │   └── auth.js             # LocalStorage auth state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Modern CSS design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Vite server with /api proxy to backend
│
└── .gitignore
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```
