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

      // Check users and sync default questions
      this.db.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
        if (!err && row && row.count === 0) {
          await this.seedInitialData();
        } else {
          await this.syncDefaultQuestions();
        }
      });
    });
  }

  async seedInitialData() {
    console.log('Seeding SQLite database with default users and algorithmic questions (10 test cases each)...');
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const coderHash = bcrypt.hashSync('Coder@123', salt);

    const users = [
      { id: 'usr_admin_1', name: 'Site Administrator', email: 'admin@codingguru.com', password_hash: adminHash, role: 'admin' },
      { id: 'usr_coder_1', name: 'Alex Coder', email: 'coder@codingguru.com', password_hash: coderHash, role: 'user' }
    ];

    for (const u of users) {
      await this.run(
        `INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email.toLowerCase(), u.password_hash, u.role, new Date().toISOString()]
      );
    }

    await this.syncDefaultQuestions();
  }

  getDefaultQuestions() {
    return [
      {
        id: 'q_two_sum',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        description: `Given an array of integers \`nums\` and an integer \`target\`, return the 0-based indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
You can return the answer in any order.

### Input Format
- First line: space-separated integers (the array \`nums\`)
- Second line: a single integer (the \`target\`)

### Output Format
- Print two space-separated indices

### Example 1:
\`\`\`text
Input:
2 7 11 15
9

Output:
0 1
\`\`\`

### Example 2:
\`\`\`text
Input:
3 2 4
6

Output:
1 2
\`\`\`

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- Only one valid answer exists.`,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);
    int target;
    if (cin >> target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.count(comp)) {
                cout << seen[comp] << " " << i << "\\n";
                break;
            }
            seen[nums[i]] = i;
        }
    }
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        if (sc.hasNextInt()) {
            int target = sc.nextInt();
            Map<Integer, Integer> map = new HashMap<>();
            for (int i = 0; i < nums.length; i++) {
                int comp = target - nums[i];
                if (map.containsKey(comp)) {
                    System.out.println(map.get(comp) + " " + i);
                    break;
                }
                map.put(nums[i], i);
            }
        }
    }
}`,
          python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            print(f"{seen[comp]} {i}")
            break
        seen[num] = i

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, explanation: 'nums[0]+nums[1]=2+7=9' },
          { id: 2, input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false, explanation: 'nums[1]+nums[2]=2+4=6' },
          { id: 3, input: '3 3\n6', expectedOutput: '0 1', isHidden: false, explanation: 'Duplicate values' },
          { id: 4, input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4', isHidden: false, explanation: 'Negative numbers' },
          { id: 5, input: '0 4 3 0\n0', expectedOutput: '0 3', isHidden: true, explanation: 'Zero target with zeros' },
          { id: 6, input: '-3 4 3 90\n0', expectedOutput: '0 2', isHidden: true, explanation: 'Positive+negative sum to zero' },
          { id: 7, input: '1 5 7 11 15 20\n27', expectedOutput: '2 5', isHidden: true, explanation: 'Array with 6 elements' },
          { id: 8, input: '100 200 300 400 500\n900', expectedOutput: '3 4', isHidden: true, explanation: 'Last two elements' },
          { id: 9, input: '5 75 25\n100', expectedOutput: '1 2', isHidden: true, explanation: '75+25=100' },
          { id: 10, input: '10 -5 20 -10 30\n15', expectedOutput: '1 2', isHidden: true, explanation: '-5+20=15' }
        ]
      },
      {
        id: 'q_max_subarray',
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming'],
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.

### Input Format
- A single line of space-separated integers representing \`nums\`

### Output Format
- A single integer representing the maximum subarray sum

### Example 1:
\`\`\`text
Input:
-2 1 -3 4 -1 2 1 -5 4

Output:
6
\`\`\`
Explanation: The subarray \`[4, -1, 2, 1]\` has the largest sum 6.

### Example 2:
\`\`\`text
Input:
5 4 -1 7 8

Output:
23
\`\`\`

### Constraints:
- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\``,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    int x;
    vector<int> nums;
    while (cin >> x) nums.push_back(x);
    if (nums.empty()) return 0;

    int max_sum = nums[0], cur = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        cur = max(nums[i], cur + nums[i]);
        max_sum = max(max_sum, cur);
    }
    cout << max_sum << "\\n";
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        if (list.isEmpty()) return;

        int maxSum = list.get(0), cur = list.get(0);
        for (int i = 1; i < list.size(); i++) {
            cur = Math.max(list.get(i), cur + list.get(i));
            maxSum = Math.max(maxSum, cur);
        }
        System.out.println(maxSum);
    }
}`,
          python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    nums = list(map(int, tokens))
    max_sum = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        max_sum = max(max_sum, cur)
    print(max_sum)

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false, explanation: 'Subarray [4, -1, 2, 1] sum is 6' },
          { id: 2, input: '1', expectedOutput: '1', isHidden: false, explanation: 'Single element' },
          { id: 3, input: '5 4 -1 7 8', expectedOutput: '23', isHidden: false, explanation: 'Subarray [5, 4, -1, 7, 8] sum is 23' },
          { id: 4, input: '-1', expectedOutput: '-1', isHidden: false, explanation: 'Single negative' },
          { id: 5, input: '-2 -1', expectedOutput: '-1', isHidden: true, explanation: 'Max negative element' },
          { id: 6, input: '-5 -4 -3 -2 -1', expectedOutput: '-1', isHidden: true, explanation: 'All negative array' },
          { id: 7, input: '10 20 30 40', expectedOutput: '100', isHidden: true, explanation: 'All positive numbers' },
          { id: 8, input: '-1 0 -2', expectedOutput: '0', isHidden: true, explanation: 'Zero is the maximum' },
          { id: 9, input: '2 -1 3 -2 4', expectedOutput: '6', isHidden: true, explanation: 'Alternating signs' },
          { id: 10, input: '1 -2 3 10 -4 7 2 -5', expectedOutput: '18', isHidden: true, explanation: 'Subarray [3, 10, -4, 7, 2]' }
        ]
      },
      {
        id: 'q_reverse_string',
        title: 'Reverse String',
        slug: 'reverse-string',
        difficulty: 'Easy',
        tags: ['String', 'Two Pointers'],
        description: `Write a program that reverses a given string.

### Input Format
- A single line containing the string to reverse

### Output Format
- Print the reversed string

### Example 1:
\`\`\`text
Input:
hello

Output:
olleh
\`\`\`

### Example 2:
\`\`\`text
Input:
Hannah

Output:
hannaH
\`\`\`

### Constraints:
- \`1 <= s.length <= 10^5\`
- \`s\` consists of printable ASCII characters`,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (getline(cin, s)) {
        reverse(s.begin(), s.end());
        cout << s << "\\n";
    }
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            System.out.println(new StringBuilder(s).reverse().toString());
        }
    }
}`,
          python: `import sys

def main():
    s = sys.stdin.read().rstrip('\\r\\n')
    print(s[::-1])

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: 'hello', expectedOutput: 'olleh', isHidden: false, explanation: 'Standard lowercase' },
          { id: 2, input: 'Hannah', expectedOutput: 'hannaH', isHidden: false, explanation: 'Mixed casing' },
          { id: 3, input: 'a', expectedOutput: 'a', isHidden: false, explanation: 'Single character' },
          { id: 4, input: 'ab', expectedOutput: 'ba', isHidden: false, explanation: 'Two characters' },
          { id: 5, input: '12345', expectedOutput: '54321', isHidden: true, explanation: 'Numeric characters' },
          { id: 6, input: 'coding', expectedOutput: 'gnidoc', isHidden: true, explanation: 'Word coding' },
          { id: 7, input: 'racecar', expectedOutput: 'racecar', isHidden: true, explanation: 'Palindrome stays the same' },
          { id: 8, input: 'ABCDEF', expectedOutput: 'FEDCBA', isHidden: true, explanation: 'All uppercase' },
          { id: 9, input: 'OpenAI', expectedOutput: 'IAnepO', isHidden: true, explanation: 'Mixed case word' },
          { id: 10, input: 'abcdefghij', expectedOutput: 'jihgfedcba', isHidden: true, explanation: '10-char string' }
        ]
      },
      {
        id: 'q_valid_anagram',
        title: 'Valid Anagram',
        slug: 'valid-anagram',
        difficulty: 'Easy',
        tags: ['String', 'Hash Table'],
        description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Input Format
- First line: string \`s\`
- Second line: string \`t\`

### Output Format
- Print \`true\` or \`false\`

### Example 1:
\`\`\`text
Input:
anagram
nagaram

Output:
true
\`\`\`

### Example 2:
\`\`\`text
Input:
rat
car

Output:
false
\`\`\`

### Constraints:
- \`1 <= s.length, t.length <= 5 * 10^4\`
- \`s\` and \`t\` consist of lowercase English letters`,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    string s, t;
    if (cin >> s >> t) {
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        cout << (s == t ? "true" : "false") << "\\n";
    }
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            char[] s = sc.next().toCharArray();
            char[] t = sc.next().toCharArray();
            Arrays.sort(s);
            Arrays.sort(t);
            System.out.println(Arrays.equals(s, t) ? "true" : "false");
        }
    }
}`,
          python: `import sys

def main():
    lines = sys.stdin.read().split()
    if len(lines) < 2:
        return
    s, t = lines[0], lines[1]
    print("true" if sorted(s) == sorted(t) else "false")

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: 'anagram\nnagaram', expectedOutput: 'true', isHidden: false, explanation: 'Both contain identical character counts' },
          { id: 2, input: 'rat\ncar', expectedOutput: 'false', isHidden: false, explanation: 'Characters do not match' },
          { id: 3, input: 'a\na', expectedOutput: 'true', isHidden: false, explanation: 'Single identical character' },
          { id: 4, input: 'ab\na', expectedOutput: 'false', isHidden: false, explanation: 'Different lengths' },
          { id: 5, input: 'listen\nsilent', expectedOutput: 'true', isHidden: true, explanation: 'Classic anagram' },
          { id: 6, input: 'triangle\nintegral', expectedOutput: 'true', isHidden: true, explanation: 'Valid multi-character anagram' },
          { id: 7, input: 'apple\npale', expectedOutput: 'false', isHidden: true, explanation: 'Different letter counts' },
          { id: 8, input: 'cat\nact', expectedOutput: 'true', isHidden: true, explanation: 'Simple 3-letter permutation' },
          { id: 9, input: 'hello\nworld', expectedOutput: 'false', isHidden: true, explanation: 'Completely different characters' },
          { id: 10, input: 'dormitory\ndirtyroom', expectedOutput: 'true', isHidden: true, explanation: 'Valid 9-letter anagram' }
        ]
      },
      {
        id: 'q_tree_max_depth',
        title: 'Maximum Depth of Binary Tree',
        slug: 'maximum-depth-of-binary-tree',
        difficulty: 'Easy',
        tags: ['Tree', 'Binary Tree'],
        description: `Given the root of a binary tree represented as space-separated node values in level-order (where \`null\` represents a missing child), return its maximum depth.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node. An empty tree has depth 0.

### Input Format
- A single line of space-separated tokens representing level-order traversal (e.g. \`3 9 20 null null 15 7\` or \`null\` for empty)

### Output Format
- Print a single integer representing the maximum depth

### Example 1:
\`\`\`text
Input:
3 9 20 null null 15 7

Output:
3
\`\`\`

### Example 2:
\`\`\`text
Input:
1 null 2

Output:
2
\`\`\`

### Constraints:
- The number of nodes in the tree is in the range \`[0, 10^4]\`
- \`-100 <= Node.val <= 100\``,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    string val;
    TreeNode *left = nullptr, *right = nullptr;
    TreeNode(string v) : val(v) {}
};

int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    vector<string> tokens;
    string token;
    while (cin >> token) tokens.push_back(token);

    if (tokens.empty() || tokens[0] == "null") {
        cout << 0 << "\\n";
        return 0;
    }

    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t idx = 1;

    while (!q.empty() && idx < tokens.size()) {
        TreeNode* curr = q.front();
        q.pop();

        if (idx < tokens.size()) {
            if (tokens[idx] != "null") {
                curr->left = new TreeNode(tokens[idx]);
                q.push(curr->left);
            }
            idx++;
        }
        if (idx < tokens.size()) {
            if (tokens[idx] != "null") {
                curr->right = new TreeNode(tokens[idx]);
                q.push(curr->right);
            }
            idx++;
        }
    }

    cout << maxDepth(root) << "\\n";
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    static class TreeNode {
        String val;
        TreeNode left, right;
        TreeNode(String val) { this.val = val; }
    }

    static int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> tokens = new ArrayList<>();
        while (sc.hasNext()) tokens.add(sc.next());

        if (tokens.isEmpty() || tokens.get(0).equals("null")) {
            System.out.println(0);
            return;
        }

        TreeNode root = new TreeNode(tokens.get(0));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int idx = 1;

        while (!queue.isEmpty() && idx < tokens.size()) {
            TreeNode curr = queue.poll();
            if (idx < tokens.size()) {
                if (!tokens.get(idx).equals("null")) {
                    curr.left = new TreeNode(tokens.get(idx));
                    queue.offer(curr.left);
                }
                idx++;
            }
            if (idx < tokens.size()) {
                if (!tokens.get(idx).equals("null")) {
                    curr.right = new TreeNode(tokens.get(idx));
                    queue.offer(curr.right);
                }
                idx++;
            }
        }

        System.out.println(maxDepth(root));
    }
}`,
          python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

def main():
    tokens = sys.stdin.read().split()
    if not tokens or tokens[0] == "null":
        print(0)
        return

    root = TreeNode(tokens[0])
    queue = deque([root])
    idx = 1

    while queue and idx < len(tokens):
        curr = queue.popleft()
        if idx < len(tokens):
            if tokens[idx] != "null":
                curr.left = TreeNode(tokens[idx])
                queue.append(curr.left)
            idx += 1
        if idx < len(tokens):
            if tokens[idx] != "null":
                curr.right = TreeNode(tokens[idx])
                queue.append(curr.right)
            idx += 1

    print(max_depth(root))

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: '3 9 20 null null 15 7', expectedOutput: '3', isHidden: false, explanation: 'Root 3 with depth 3' },
          { id: 2, input: '1 null 2', expectedOutput: '2', isHidden: false, explanation: 'Right-skewed tree of depth 2' },
          { id: 3, input: '1', expectedOutput: '1', isHidden: false, explanation: 'Single node tree' },
          { id: 4, input: 'null', expectedOutput: '0', isHidden: false, explanation: 'Empty tree has depth 0' },
          { id: 5, input: '1 2 3 4 5 null null', expectedOutput: '3', isHidden: true, explanation: 'Complete binary tree of depth 3' },
          { id: 6, input: '1 2 null 3 null 4', expectedOutput: '4', isHidden: true, explanation: 'Left-skewed tree of depth 4' },
          { id: 7, input: '10 20 30 40 50 60 70', expectedOutput: '3', isHidden: true, explanation: 'Full 3-level tree' },
          { id: 8, input: '1 2 3 4 null null 5 null 6', expectedOutput: '4', isHidden: true, explanation: 'Deep branch of depth 4' },
          { id: 9, input: '5 4 8 11 null 13 4 7 2 null null null 1', expectedOutput: '4', isHidden: true, explanation: '4-level irregular tree' },
          { id: 10, input: '1 2 null 3 null null null', expectedOutput: '3', isHidden: true, explanation: 'Left chain of depth 3' }
        ]
      },
      {
        id: 'q_palindrome_number',
        title: 'Palindrome Number',
        slug: 'palindrome-number',
        difficulty: 'Easy',
        tags: ['Math'],
        description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward.

### Input Format
- A single integer \`x\`

### Output Format
- Print \`true\` or \`false\`

### Example 1:
\`\`\`text
Input:
121

Output:
true
\`\`\`

### Example 2:
\`\`\`text
Input:
-121

Output:
false
\`\`\`

### Constraints:
- \`-2^31 <= x <= 2^31 - 1\``,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (cin >> s) {
        if (s[0] == '-') {
            cout << "false\\n";
            return 0;
        }
        string rev = s;
        reverse(rev.begin(), rev.end());
        cout << (s == rev ? "true" : "false") << "\\n";
    }
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            if (s.startsWith("-")) {
                System.out.println("false");
                return;
            }
            String rev = new StringBuilder(s).reverse().toString();
            System.out.println(s.equals(rev) ? "true" : "false");
        }
    }
}`,
          python: `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    if s.startswith('-'):
        print("false")
    else:
        print("true" if s == s[::-1] else "false")

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: '121', expectedOutput: 'true', isHidden: false, explanation: '121 reads the same forward and backward' },
          { id: 2, input: '-121', expectedOutput: 'false', isHidden: false, explanation: 'Negative numbers are not palindromes' },
          { id: 3, input: '10', expectedOutput: 'false', isHidden: false, explanation: '10 reversed is 01 which is 1' },
          { id: 4, input: '0', expectedOutput: 'true', isHidden: false, explanation: 'Zero is a palindrome' },
          { id: 5, input: '7', expectedOutput: 'true', isHidden: true, explanation: 'Single digit' },
          { id: 6, input: '1221', expectedOutput: 'true', isHidden: true, explanation: 'Even length palindrome' },
          { id: 7, input: '123454321', expectedOutput: 'true', isHidden: true, explanation: 'Large palindrome' },
          { id: 8, input: '1000021', expectedOutput: 'false', isHidden: true, explanation: 'Not a palindrome' },
          { id: 9, input: '123321', expectedOutput: 'true', isHidden: true, explanation: '6-digit palindrome' },
          { id: 10, input: '999999', expectedOutput: 'true', isHidden: true, explanation: 'All same digits' }
        ]
      },
      {
        id: 'q_fizzbuzz',
        title: 'Fizz Buzz',
        slug: 'fizz-buzz',
        difficulty: 'Easy',
        tags: ['Math', 'String'],
        description: `Given an integer \`n\`, print numbers from 1 to n, but:
- For multiples of 3, print \`Fizz\` instead of the number
- For multiples of 5, print \`Buzz\` instead of the number
- For multiples of both 3 and 5, print \`FizzBuzz\`

### Input Format
- A single integer \`n\`

### Output Format
- Print each result on a new line

### Example:
\`\`\`text
Input:
5

Output:
1
2
Fizz
4
Buzz
\`\`\`

### Constraints:
- \`1 <= n <= 10^4\``,
        starterCode: {
          cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (cin >> n) {
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) cout << "FizzBuzz\\n";
            else if (i % 3 == 0) cout << "Fizz\\n";
            else if (i % 5 == 0) cout << "Buzz\\n";
            else cout << i << "\\n";
        }
    }
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            for (int i = 1; i <= n; i++) {
                if (i % 15 == 0) System.out.println("FizzBuzz");
                else if (i % 3 == 0) System.out.println("Fizz");
                else if (i % 5 == 0) System.out.println("Buzz");
                else System.out.println(i);
            }
        }
    }
}`,
          python: `import sys

def main():
    val = sys.stdin.read().strip()
    if not val:
        return
    n = int(val)
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)

if __name__ == "__main__":
    main()`
        },
        testCases: [
          { id: 1, input: '3', expectedOutput: '1\n2\nFizz', isHidden: false, explanation: 'Up to 3' },
          { id: 2, input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', isHidden: false, explanation: 'Up to 5' },
          { id: 3, input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false, explanation: 'Up to 15 — includes FizzBuzz' },
          { id: 4, input: '1', expectedOutput: '1', isHidden: false, explanation: 'Single element' },
          { id: 5, input: '2', expectedOutput: '1\n2', isHidden: true, explanation: 'Up to 2' },
          { id: 6, input: '6', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz', isHidden: true, explanation: 'Up to 6' },
          { id: 7, input: '10', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz', isHidden: true, explanation: 'Up to 10' },
          { id: 8, input: '16', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16', isHidden: true, explanation: 'Just past FizzBuzz' },
          { id: 9, input: '9', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz', isHidden: true, explanation: 'Multiple of 3' },
          { id: 10, input: '4', expectedOutput: '1\n2\nFizz\n4', isHidden: true, explanation: 'Small boundary' }
        ]
      }
    ];
  }

  async syncDefaultQuestions() {
    try {
      const defaults = this.getDefaultQuestions();
      for (const q of defaults) {
        const existing = await this.get(`SELECT id FROM questions WHERE id = ?`, [q.id]);
        if (existing) {
          await this.run(
            `UPDATE questions SET title = ?, slug = ?, difficulty = ?, tags = ?, description = ?, starter_code = ?, test_cases = ?, updated_at = ? WHERE id = ?`,
            [
              q.title,
              q.slug,
              q.difficulty,
              JSON.stringify(q.tags),
              q.description,
              JSON.stringify(q.starterCode),
              JSON.stringify(q.testCases),
              new Date().toISOString(),
              q.id
            ]
          );
        } else {
          await this.run(
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

      // Remove javascript from any other custom questions in DB if present
      const allRows = await this.all(`SELECT id, starter_code FROM questions`);
      for (const r of allRows) {
        try {
          const sc = JSON.parse(r.starter_code || '{}');
          if (sc.javascript) {
            delete sc.javascript;
            await this.run(`UPDATE questions SET starter_code = ? WHERE id = ?`, [JSON.stringify(sc), r.id]);
          }
        } catch {}
      }

      console.log('Synchronized questions with clean integer/string inputs, C++/Java/Python CP templates.');
    } catch (err) {
      console.error('Failed to sync default questions:', err);
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
