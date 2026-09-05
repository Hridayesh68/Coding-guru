# Coding Guru 🚀

A full-stack, enterprise-grade coding platform featuring dual-role JWT authentication (Coder vs Admin), LeetCode-style problem solving in **4 languages (JavaScript, Python, C++, Java)**, a **10-test-case evaluation judge**, the **VS Code Monaco Editor** with Light/Dark themes, and an ultra-lightweight, zero-DevOps **SQLite database** (`database.sqlite`).

---

## ⚡ Instant 1-Command Run (Any Operating System)

Run the entire full-stack platform (frontend SPA + backend API + C++, Java, Python, JS compilers + SQLite) in a single command on **Windows, macOS, or Linux**:

```bash
docker run -d -p 5000:5000 --name coding-guru hridayesh68/coding-guru:latest
```

Open **`http://localhost:5000`** in your browser!

Or with Docker Compose:

```bash
docker compose up -d
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@codingguru.com` | `Admin@123` |
| **Coder** | `coder@codingguru.com` | `Coder@123` |

*Both can be logged into instantly with the 1-click quick login buttons in the Sign In modal.*

---

## 🛠️ Architecture Highlights

### 1. Monaco Editor (VS Code Engine) with Light Mode
- Genuine VS Code editing engine powered by `@monaco-editor/react`.
- Features real-time IntelliSense autocompletion, bracket matching, error squiggles, and line numbers.
- **Light & Dark Mode**: One-click toggle between `☀️ Light Mode` (`vs`) and `🌙 Dark Mode` (`vs-dark`).

### 2. 4-Language Compiler Sandbox
- **JavaScript**: Node.js v20 runtime.
- **Python**: Python 3.12 sandbox with JSON serialization.
- **C++**: GCC 13.1 C++17 pre-compiled once and executed across all 10 test cases in milliseconds.
- **Java**: OpenJDK 21 compiled once and executed across all 10 test cases in milliseconds.
- **4s Timeout Protection**: Prevents infinite loops (`while(true)`) or hung processes.

### 3. SQLite Database (`database.sqlite`)
- **Zero-DevOps**: Stored in a single file (`backend/db/data/database.sqlite`).
- **Synchronous & Fast**: Backed by `sqlite3`, eliminating external database services (like PostgreSQL/MongoDB).
- **Persistent Data**: Stores users, role-based JWT accounts, coding problems with 10 test cases, and coder submissions.

### 4. Admin Portal
- Add, update, and delete coding questions.
- Configures all **10 test cases** per question with public sample vs hidden evaluation toggles.
- Real-time platform submission audits and acceptance rates.

### 5. Luxurious `#5E3122` Chestnut Palette
- Designed with warm espresso tones, terracotta accents, glassmorphic panels, and glowing badges.

---

## 🚢 Pushing to Docker Hub

To publish your container image to Docker Hub under your username:

### Windows:
```cmd
push_to_dockerhub.bat
```

### Linux / macOS:
```bash
chmod +x push_to_dockerhub.sh
./push_to_dockerhub.sh
```

---

## 💻 Local Development Setup

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5174 (proxied to backend)
```
