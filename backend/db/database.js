import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'database.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class SQLiteDatabase {
  constructor() {
    this.db = new sqlite3.Database(SQLITE_FILE, (err) => {
      if (err) {
        console.error('Failed to open SQLite database:', err.message);
      } else {
        console.log(`SQLite database connected: ${SQLITE_FILE}`);
        this.initTables();
      }
    });
  }

  // Run SQL with promise
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  // Get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Get all rows
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  initTables() {
    this.db.serialize(async () => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // Questions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          difficulty TEXT NOT NULL,
          tags TEXT,
          description TEXT NOT NULL,
          starter_code TEXT,
          test_cases TEXT NOT NULL,
          created_by TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `);

      // Submissions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS submissions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT,
          question_id TEXT NOT NULL,
          question_title TEXT,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          status TEXT NOT NULL,
          passed_count INTEGER NOT NULL,
          total_count INTEGER NOT NULL,
          runtime_ms INTEGER NOT NULL,
          test_results TEXT,
          created_at TEXT NOT NULL
        )
      `);

      // Check if seeding is required
      this.db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
        if (!err && row && row.count === 0) {
          this.seedInitialData();
        }
      });
    });
  }

  seedInitialData() {
    console.log('Seeding SQLite database with default users and 4 LeetCode-style questions (10 test cases each)...');
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const coderHash = bcrypt.hashSync('Coder@123', salt);

    const users = [
      { id: 'usr_admin_1', name: 'Site Administrator', email: 'admin@codingguru.com', password_hash: adminHash, role: 'admin' },
      { id: 'usr_coder_1', name: 'Alex Coder', email: 'coder@codingguru.com', password_hash: coderHash, role: 'user' }
    ];

    for (const u of users) {
      this.run(
        `INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email.toLowerCase(), u.password_hash, u.role, new Date().toISOString()]
      );
    }

    const questions = [
      {
        id: 'q_two_sum',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
You can return the answer in any order.

### Example 1:
\`\`\`text
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2:
\`\`\`text
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.`,
        starterCode: {
          javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
          python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string input;\n    if (getline(cin, input)) {\n        cout << "[0, 1]";\n    }\n    return 0;\n}`,
          java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String input = sc.nextLine();\n            System.out.print("[0, 1]");\n        }\n    }\n}`
        },
        testCases: [
          { id: 1, input: '{"nums": [2, 7, 11, 15], "target": 9}', expectedOutput: '[0, 1]', isHidden: false, explanation: 'Standard example' },
          { id: 2, input: '{"nums": [3, 2, 4], "target": 6}', expectedOutput: '[1, 2]', isHidden: false, explanation: 'Indices not at start' },
          { id: 3, input: '{"nums": [3, 3], "target": 6}', expectedOutput: '[0, 1]', isHidden: false, explanation: 'Duplicate values' },
          { id: 4, input: '{"nums": [-1, -2, -3, -4, -5], "target": -8}', expectedOutput: '[2, 4]', isHidden: false, explanation: 'Negative numbers' },
          { id: 5, input: '{"nums": [0, 4, 3, 0], "target": 0}', expectedOutput: '[0, 3]', isHidden: true, explanation: 'Zero target with zeros' },
          { id: 6, input: '{"nums": [-3, 4, 3, 90], "target": 0}', expectedOutput: '[0, 2]', isHidden: true, explanation: 'Positive and negative sum to zero' },
          { id: 7, input: '{"nums": [1, 5, 7, 11, 15, 20], "target": 27}', expectedOutput: '[2, 5]', isHidden: true, explanation: 'Array with 6 elements and unique sum' },
          { id: 8, input: '{"nums": [100, 200, 300, 400, 500], "target": 900}', expectedOutput: '[3, 4]', isHidden: true, explanation: 'Last two elements' },
          { id: 9, input: '{"nums": [5, 75, 25], "target": 100}', expectedOutput: '[1, 2]', isHidden: true, explanation: 'Sum of 75 + 25' },
          { id: 10, input: '{"nums": [10, -5, 20, -10, 30], "target": 15}', expectedOutput: '[1, 2]', isHidden: true, explanation: 'Negative plus positive' }
        ]
      },
      {
        id: 'q_palindrome_number',
        title: 'Palindrome Number',
        slug: 'palindrome-number',
        difficulty: 'Easy',
        tags: ['Math'],
        description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.`,
        starterCode: {
          javascript: `function isPalindrome(x) {\n  if (x < 0) return false;\n  const s = x.toString();\n  return s === s.split('').reverse().join('');\n}`,
          python: `def is_palindrome(x):\n    if x < 0:\n        return False\n    s = str(x)\n    return s == s[::-1]`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string input;\n    if (getline(cin, input)) cout << "true";\n    return 0;\n}`,
          java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) System.out.print("true");\n    }\n}`
        },
        testCases: [
          { id: 1, input: '{"x": 121}', expectedOutput: 'true', isHidden: false, explanation: 'Standard palindrome' },
          { id: 2, input: '{"x": -121}', expectedOutput: 'false', isHidden: false, explanation: 'Negative numbers' },
          { id: 3, input: '{"x": 10}', expectedOutput: 'false', isHidden: false, explanation: 'Ending in zero' },
          { id: 4, input: '{"x": 0}', expectedOutput: 'true', isHidden: false, explanation: 'Zero digit' },
          { id: 5, input: '{"x": 7}', expectedOutput: 'true', isHidden: true, explanation: 'Single positive digit' },
          { id: 6, input: '{"x": 1221}', expectedOutput: 'true', isHidden: true, explanation: 'Even length' },
          { id: 7, input: '{"x": 123454321}', expectedOutput: 'true', isHidden: true, explanation: 'Large palindrome' },
          { id: 8, input: '{"x": 1000021}', expectedOutput: 'false', isHidden: true, explanation: 'Non-palindrome' },
          { id: 9, input: '{"x": 123321}', expectedOutput: 'true', isHidden: true, explanation: '6-digit palindrome' },
          { id: 10, input: '{"x": 999999}', expectedOutput: 'true', isHidden: true, explanation: 'All matching digits' }
        ]
      },
      {
        id: 'q_reverse_string',
        title: 'Reverse String',
        slug: 'reverse-string',
        difficulty: 'Easy',
        tags: ['Two Pointers', 'String'],
        description: `Write a function that reverses a string given as an array of characters \`s\`.`,
        starterCode: {
          javascript: `function reverseString(s) {\n  return s.slice().reverse();\n}`,
          python: `def reverse_string(s):\n    return s[::-1]`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string input;\n    if (getline(cin, input)) cout << "[\"o\",\"l\",\"l\",\"e\",\"h\"]";\n    return 0;\n}`,
          java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) System.out.print("[\"o\",\"l\",\"l\",\"e\",\"h\"]");\n    }\n}`
        },
        testCases: [
          { id: 1, input: '{"s": ["h","e","l","l","o"]}', expectedOutput: '["o","l","l","e","h"]', isHidden: false, explanation: 'Standard lowercase' },
          { id: 2, input: '{"s": ["H","a","n","n","a","h"]}', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false, explanation: 'Mixed casing' },
          { id: 3, input: '{"s": ["a"]}', expectedOutput: '["a"]', isHidden: false, explanation: 'Single character' },
          { id: 4, input: '{"s": ["a","b"]}', expectedOutput: '["b","a"]', isHidden: false, explanation: 'Two characters' },
          { id: 5, input: '{"s": ["1","2","3","4","5"]}', expectedOutput: '["5","4","3","2","1"]', isHidden: true, explanation: 'Numeric chars' },
          { id: 6, input: '{"s": ["!","@","#","$"]}', expectedOutput: '["$","#","@","!"]', isHidden: true, explanation: 'Special chars' },
          { id: 7, input: '{"s": ["c","o","d","i","n","g"]}', expectedOutput: '["g","n","i","d","o","c"]', isHidden: true, explanation: 'Word coding' },
          { id: 8, input: '{"s": [" ","a","b"," "]}', expectedOutput: '[" ","b","a"," "]', isHidden: true, explanation: 'Spaces' },
          { id: 9, input: '{"s": ["r","a","c","e","c","a","r"]}', expectedOutput: '["r","a","c","e","c","a","r"]', isHidden: true, explanation: 'Palindrome' },
          { id: 10, input: '{"s": ["A","B","C","D","E","F"]}', expectedOutput: '["F","E","D","C","B","A"]', isHidden: true, explanation: 'Uppercase' }
        ]
      },
      {
        id: 'q_fizzbuzz',
        title: 'Fizz Buzz',
        slug: 'fizz-buzz',
        difficulty: 'Easy',
        tags: ['Math', 'String'],
        description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:
- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
- \`answer[i] == i\` (as a string) otherwise.`,
        starterCode: {
          javascript: `function fizzBuzz(n) {\n  const res = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) res.push("FizzBuzz");\n    else if (i % 3 === 0) res.push("Fizz");\n    else if (i % 5 === 0) res.push("Buzz");\n    else res.push(String(i));\n  }\n  return res;\n}`,
          python: `def fizz_buzz(n):\n    res = []\n    for i in range(1, n + 1):\n        if i % 15 == 0: res.append("FizzBuzz")\n        elif i % 3 == 0: res.append("Fizz")\n        elif i % 5 == 0: res.append("Buzz")\n        else: res.append(str(i))\n    return res`,
          cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string input;\n    if (getline(cin, input)) cout << "[\"1\",\"2\",\"Fizz\"]";\n    return 0;\n}`,
          java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) System.out.print("[\"1\",\"2\",\"Fizz\"]");\n    }\n}`
        },
        testCases: [
          { id: 1, input: '{"n": 3}', expectedOutput: '["1","2","Fizz"]', isHidden: false, explanation: 'Up to 3' },
          { id: 2, input: '{"n": 5}', expectedOutput: '["1","2","Fizz","4","Buzz"]', isHidden: false, explanation: 'Up to 5' },
          { id: 3, input: '{"n": 15}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isHidden: false, explanation: 'Up to 15' },
          { id: 4, input: '{"n": 1}', expectedOutput: '["1"]', isHidden: false, explanation: 'Single element' },
          { id: 5, input: '{"n": 2}', expectedOutput: '["1","2"]', isHidden: true, explanation: 'Up to 2' },
          { id: 6, input: '{"n": 6}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz"]', isHidden: true, explanation: 'Up to 6' },
          { id: 7, input: '{"n": 10}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz"]', isHidden: true, explanation: 'Up to 10' },
          { id: 8, input: '{"n": 16}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16"]', isHidden: true, explanation: 'After 15' },
          { id: 9, input: '{"n": 9}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz"]', isHidden: true, explanation: 'Multiple 3s' },
          { id: 10, input: '{"n": 4}', expectedOutput: '["1","2","Fizz","4"]', isHidden: true, explanation: 'Small boundary' }
        ]
      }
    ];

    for (const q of questions) {
      this.run(
        `INSERT INTO questions (id, title, slug, difficulty, tags, description, starter_code, test_cases, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          q.title,
          q.slug,
          q.difficulty,
          JSON.stringify(q.tags),
          q.description,
          JSON.stringify(q.starterCode),
          JSON.stringify(q.testCases),
          'usr_admin_1',
          new Date().toISOString()
        ]
      );
    }
  }

  // User methods
  async findUserByEmail(email) {
    const row = await this.get(`SELECT * FROM users WHERE LOWER(email) = ?`, [email.toLowerCase()]);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at
    };
  }

  async findUserById(id) {
    const row = await this.get(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at
    };
  }

  async createUser(userData) {
    await this.run(
      `INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [userData.id, userData.name, userData.email.toLowerCase(), userData.passwordHash, userData.role, userData.createdAt]
    );
    return userData;
  }

  // Question methods
  async getQuestions() {
    const rows = await this.all(`SELECT * FROM questions ORDER BY created_at ASC`);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      difficulty: r.difficulty,
      tags: JSON.parse(r.tags || '[]'),
      description: r.description,
      starterCode: JSON.parse(r.starter_code || '{}'),
      testCases: JSON.parse(r.test_cases || '[]'),
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getQuestionById(id) {
    const r = await this.get(`SELECT * FROM questions WHERE id = ? OR slug = ?`, [id, id]);
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      difficulty: r.difficulty,
      tags: JSON.parse(r.tags || '[]'),
      description: r.description,
      starterCode: JSON.parse(r.starter_code || '{}'),
      testCases: JSON.parse(r.test_cases || '[]'),
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createQuestion(questionData) {
    await this.run(
      `INSERT INTO questions (id, title, slug, difficulty, tags, description, starter_code, test_cases, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionData.id,
        questionData.title,
        questionData.slug,
        questionData.difficulty,
        JSON.stringify(questionData.tags || []),
        questionData.description,
        JSON.stringify(questionData.starterCode || {}),
        JSON.stringify(questionData.testCases || []),
        questionData.createdBy,
        questionData.createdAt
      ]
    );
    return questionData;
  }

  async updateQuestion(id, updates) {
    const existing = await this.getQuestionById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await this.run(
      `UPDATE questions SET title = ?, difficulty = ?, tags = ?, description = ?, starter_code = ?, test_cases = ?, updated_at = ?
       WHERE id = ?`,
      [
        merged.title,
        merged.difficulty,
        JSON.stringify(merged.tags || []),
        merged.description,
        JSON.stringify(merged.starterCode || {}),
        JSON.stringify(merged.testCases || []),
        merged.updatedAt,
        existing.id
      ]
    );
    return merged;
  }

  async deleteQuestion(id) {
    const res = await this.run(`DELETE FROM questions WHERE id = ?`, [id]);
    return res.changes > 0;
  }

  // Submission methods
  async createSubmission(sub) {
    await this.run(
      `INSERT INTO submissions (id, user_id, user_name, question_id, question_title, code, language, status, passed_count, total_count, runtime_ms, test_results, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sub.id,
        sub.userId,
        sub.userName,
        sub.questionId,
        sub.questionTitle,
        sub.code,
        sub.language,
        sub.status,
        sub.passedCount,
        sub.totalCount,
        sub.runtimeMs,
        JSON.stringify(sub.testResults || []),
        sub.createdAt
      ]
    );
    return sub;
  }

  async getUserSubmissions(userId, questionId = null) {
    let sql = `SELECT * FROM submissions WHERE user_id = ?`;
    const params = [userId];
    if (questionId) {
      sql += ` AND question_id = ?`;
      params.push(questionId);
    }
    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const rows = await this.all(sql, params);
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      questionId: r.question_id,
      questionTitle: r.question_title,
      code: r.code,
      language: r.language,
      status: r.status,
      passedCount: r.passed_count,
      totalCount: r.total_count,
      runtimeMs: r.runtime_ms,
      testResults: JSON.parse(r.test_results || '[]'),
      createdAt: r.created_at
    }));
  }

  async getAllSubmissions() {
    const rows = await this.all(`SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500`);
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      questionId: r.question_id,
      questionTitle: r.question_title,
      code: r.code,
      language: r.language,
      status: r.status,
      passedCount: r.passed_count,
      totalCount: r.total_count,
      runtimeMs: r.runtime_ms,
      testResults: JSON.parse(r.test_results || '[]'),
      createdAt: r.created_at
    }));
  }

  async getUserCount() {
    const users = await this.all(`SELECT role FROM users`);
    return {
      totalUsers: users.filter((u) => u.role === 'user').length,
      totalAdmins: users.filter((u) => u.role === 'admin').length
    };
  }
}

export const db = new SQLiteDatabase();
