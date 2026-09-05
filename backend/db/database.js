import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const getInitialSeed = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);
  const userPasswordHash = bcrypt.hashSync('Coder@123', salt);

  const initialUsers = [
    {
      id: 'usr_admin_1',
      name: 'Site Administrator',
      email: 'admin@codingguru.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_coder_1',
      name: 'Alex Coder',
      email: 'coder@codingguru.com',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];

  const initialQuestions = [
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
        javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def two_sum(nums, target):
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`
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
      ],
      createdBy: 'usr_admin_1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'q_palindrome_number',
      title: 'Palindrome Number',
      slug: 'palindrome-number',
      difficulty: 'Easy',
      tags: ['Math'],
      description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a **palindrome** when it reads the same forward and backward.
For example, \`121\` is a palindrome while \`123\` is not.

### Example 1:
\`\`\`text
Input: x = 121
Output: true
\`\`\`

### Example 2:
\`\`\`text
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
\`\`\`

### Constraints:
- \`-2^31 <= x <= 2^31 - 1\``,
      starterCode: {
        javascript: `function isPalindrome(x) {
  // Write your code here
  if (x < 0) return false;
  const s = x.toString();
  return s === s.split('').reverse().join('');
}`,
        python: `def is_palindrome(x):
    # Write your code here
    if x < 0:
        return False
    s = str(x)
    return s == s[::-1]`
      },
      testCases: [
        { id: 1, input: '{"x": 121}', expectedOutput: 'true', isHidden: false, explanation: 'Standard palindrome' },
        { id: 2, input: '{"x": -121}', expectedOutput: 'false', isHidden: false, explanation: 'Negative numbers are not palindromes' },
        { id: 3, input: '{"x": 10}', expectedOutput: 'false', isHidden: false, explanation: 'Ending in zero' },
        { id: 4, input: '{"x": 0}', expectedOutput: 'true', isHidden: false, explanation: 'Single digit zero' },
        { id: 5, input: '{"x": 7}', expectedOutput: 'true', isHidden: true, explanation: 'Single positive digit' },
        { id: 6, input: '{"x": 1221}', expectedOutput: 'true', isHidden: true, explanation: 'Even length palindrome' },
        { id: 7, input: '{"x": 123454321}', expectedOutput: 'true', isHidden: true, explanation: 'Large odd length palindrome' },
        { id: 8, input: '{"x": 1000021}', expectedOutput: 'false', isHidden: true, explanation: 'Non-palindrome with zeros' },
        { id: 9, input: '{"x": 123321}', expectedOutput: 'true', isHidden: true, explanation: '6-digit palindrome' },
        { id: 10, input: '{"x": 999999}', expectedOutput: 'true', isHidden: true, explanation: 'All matching digits' }
      ],
      createdBy: 'usr_admin_1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'q_reverse_string',
      title: 'Reverse String',
      slug: 'reverse-string',
      difficulty: 'Easy',
      tags: ['Two Pointers', 'String'],
      description: `Write a function that reverses a string given as an array of characters \`s\`.
You must return the reversed array of characters.

### Example 1:
\`\`\`text
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

### Example 2:
\`\`\`text
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
\`\`\`

### Constraints:
- \`1 <= s.length <= 10^5\`
- \`s[i]\` is a printable ascii character.`,
      starterCode: {
        javascript: `function reverseString(s) {
  // Write your code here
  return s.slice().reverse();
}`,
        python: `def reverse_string(s):
    # Write your code here
    return s[::-1]`
      },
      testCases: [
        { id: 1, input: '{"s": ["h","e","l","l","o"]}', expectedOutput: '["o","l","l","e","h"]', isHidden: false, explanation: 'Standard lowercase' },
        { id: 2, input: '{"s": ["H","a","n","n","a","h"]}', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false, explanation: 'Mixed casing palindrome' },
        { id: 3, input: '{"s": ["a"]}', expectedOutput: '["a"]', isHidden: false, explanation: 'Single character' },
        { id: 4, input: '{"s": ["a","b"]}', expectedOutput: '["b","a"]', isHidden: false, explanation: 'Two characters' },
        { id: 5, input: '{"s": ["1","2","3","4","5"]}', expectedOutput: '["5","4","3","2","1"]', isHidden: true, explanation: 'Numeric characters' },
        { id: 6, input: '{"s": ["!","@","#","$"]}', expectedOutput: '["$","#","@","!"]', isHidden: true, explanation: 'Special characters' },
        { id: 7, input: '{"s": ["c","o","d","i","n","g"]}', expectedOutput: '["g","n","i","d","o","c"]', isHidden: true, explanation: 'Word coding' },
        { id: 8, input: '{"s": [" ","a","b"," "]}', expectedOutput: '[" ","b","a"," "]', isHidden: true, explanation: 'Leading and trailing spaces' },
        { id: 9, input: '{"s": ["r","a","c","e","c","a","r"]}', expectedOutput: '["r","a","c","e","c","a","r"]', isHidden: true, explanation: 'Palindrome word' },
        { id: 10, input: '{"s": ["A","B","C","D","E","F"]}', expectedOutput: '["F","E","D","C","B","A"]', isHidden: true, explanation: 'Uppercase letters' }
      ],
      createdBy: 'usr_admin_1',
      createdAt: new Date().toISOString()
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
- \`answer[i] == i\` (as a string) if none of the above conditions are true.

### Example 1:
\`\`\`text
Input: n = 3
Output: ["1","2","Fizz"]
\`\`\`

### Example 2:
\`\`\`text
Input: n = 5
Output: ["1","2","Fizz","4","Buzz"]
\`\`\`

### Constraints:
- \`1 <= n <= 10^4\``,
      starterCode: {
        javascript: `function fizzBuzz(n) {
  // Write your code here
  const res = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) res.push("FizzBuzz");
    else if (i % 3 === 0) res.push("Fizz");
    else if (i % 5 === 0) res.push("Buzz");
    else res.push(String(i));
  }
  return res;
}`,
        python: `def fizz_buzz(n):
    # Write your code here
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res`
      },
      testCases: [
        { id: 1, input: '{"n": 3}', expectedOutput: '["1","2","Fizz"]', isHidden: false, explanation: 'Up to 3' },
        { id: 2, input: '{"n": 5}', expectedOutput: '["1","2","Fizz","4","Buzz"]', isHidden: false, explanation: 'Up to 5' },
        { id: 3, input: '{"n": 15}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isHidden: false, explanation: 'Up to 15 (includes FizzBuzz)' },
        { id: 4, input: '{"n": 1}', expectedOutput: '["1"]', isHidden: false, explanation: 'Single element' },
        { id: 5, input: '{"n": 2}', expectedOutput: '["1","2"]', isHidden: true, explanation: 'No Fizz or Buzz' },
        { id: 6, input: '{"n": 6}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz"]', isHidden: true, explanation: 'Up to 6' },
        { id: 7, input: '{"n": 10}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz"]', isHidden: true, explanation: 'Up to 10' },
        { id: 8, input: '{"n": 16}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16"]', isHidden: true, explanation: 'After 15' },
        { id: 9, input: '{"n": 9}', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz"]', isHidden: true, explanation: 'Multiple 3s' },
        { id: 10, input: '{"n": 4}', expectedOutput: '["1","2","Fizz","4"]', isHidden: true, explanation: 'Small boundary' }
      ],
      createdBy: 'usr_admin_1',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users: initialUsers,
    questions: initialQuestions,
    submissions: []
  };
};

class Database {
  constructor() {
    this.data = { users: [], questions: [], submissions: [] };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.users || !this.data.questions) {
          this.data = getInitialSeed();
          this.save();
        }
      } else {
        this.data = getInitialSeed();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh store:', err);
      this.data = getInitialSeed();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // User methods
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(userData) {
    this.data.users.push(userData);
    this.save();
    return userData;
  }

  // Question methods
  getQuestions() {
    return this.data.questions;
  }

  getQuestionById(id) {
    return this.data.questions.find((q) => q.id === id || q.slug === id);
  }

  createQuestion(questionData) {
    this.data.questions.push(questionData);
    this.save();
    return questionData;
  }

  updateQuestion(id, updates) {
    const idx = this.data.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    this.data.questions[idx] = { ...this.data.questions[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.questions[idx];
  }

  deleteQuestion(id) {
    const initialLen = this.data.questions.length;
    this.data.questions = this.data.questions.filter((q) => q.id !== id);
    if (this.data.questions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Submission methods
  createSubmission(submissionData) {
    this.data.submissions.unshift(submissionData);
    // Keep last 500 submissions in store
    if (this.data.submissions.length > 500) {
      this.data.submissions = this.data.submissions.slice(0, 500);
    }
    this.save();
    return submissionData;
  }

  getUserSubmissions(userId, questionId = null) {
    return this.data.submissions.filter((s) => {
      if (questionId) {
        return s.userId === userId && s.questionId === questionId;
      }
      return s.userId === userId;
    });
  }

  getAllSubmissions() {
    return this.data.submissions;
  }
}

export const db = new Database();
