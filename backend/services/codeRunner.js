import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(os.tmpdir(), 'coding-guru-executions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────
// Output comparison
// ─────────────────────────────────────────────────

export const normalizeOutput = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).trim().replace(/\r\n/g, '\n');
};

export const areOutputsEqual = (actual, expected) => {
  const a = normalizeOutput(actual);
  const b = normalizeOutput(expected);
  return a === b;
};

// ─────────────────────────────────────────────────
// Precompile C++ / Java (unchanged from before)
// ─────────────────────────────────────────────────

export const precompileCode = async ({ code, language, sessionId }) => {
  if (language === 'cpp') {
    const cppFile = path.join(TEMP_DIR, `exec_${sessionId}.cpp`);
    const exeFile = path.join(TEMP_DIR, `exec_${sessionId}.exe`);

    // Ensure standard headers are included if bits/stdc++.h is missing
    let fullCode = code;
    if (!fullCode.includes('#include')) {
      fullCode = `#include <bits/stdc++.h>\nusing namespace std;\n` + fullCode;
    }

    fs.writeFileSync(cppFile, fullCode, 'utf-8');

    return new Promise((resolve) => {
      execFile('g++', ['-O2', '-std=c++17', cppFile, '-o', exeFile], { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          try { fs.unlinkSync(cppFile); } catch {}
          return resolve({
            success: false,
            error: 'C++ Compilation Error:\n' + (stderr || error.message)
          });
        }
        resolve({
          success: true,
          binaryPath: exeFile,
          cleanup: () => {
            try { fs.unlinkSync(cppFile); } catch {}
            try { fs.unlinkSync(exeFile); } catch {}
          }
        });
      });
    });
  } else if (language === 'java') {
    const javaDir = path.join(TEMP_DIR, `java_${sessionId}`);
    if (!fs.existsSync(javaDir)) {
      fs.mkdirSync(javaDir, { recursive: true });
    }

    let className = 'Solution';
    const classMatch = code.match(/public\s+class\s+([a-zA-Z0-9_$]+)/);
    if (classMatch) {
      className = classMatch[1];
    }

    const javaFile = path.join(javaDir, `${className}.java`);
    fs.writeFileSync(javaFile, code, 'utf-8');

    return new Promise((resolve) => {
      execFile('javac', ['-encoding', 'UTF-8', javaFile], { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          try { fs.rmSync(javaDir, { recursive: true, force: true }); } catch {}
          return resolve({
            success: false,
            error: 'Java Compilation Error:\n' + (stderr || error.message)
          });
        }
        resolve({
          success: true,
          javaDir,
          className,
          cleanup: () => {
            try { fs.rmSync(javaDir, { recursive: true, force: true }); } catch {}
          }
        });
      });
    });
  }

  return { success: true };
};

// ─────────────────────────────────────────────────
// Execute a single test case — ALL languages use
// pure stdin → stdout piping. No JSON wrappers,
// no function-name detection magic.
// ─────────────────────────────────────────────────

export const executeSingleTestCase = ({ code, language, inputStr, timeoutMs = 5000, compiledInfo }) => {
  return new Promise((resolve) => {
    const id = uuidv4();
    const startTime = Date.now();

    const handleResult = (error, stdout, stderr) => {
      const executionTimeMs = Date.now() - startTime;
      if (error) {
        if (error.killed || error.signal === 'SIGTERM') {
          return resolve({ success: false, output: '', error: `Time Limit Exceeded (${timeoutMs}ms)`, executionTimeMs });
        }
        return resolve({ success: false, output: stdout?.trim() || '', error: stderr?.trim() || error.message, executionTimeMs });
      }
      return resolve({ success: true, output: stdout.trim(), error: null, executionTimeMs });
    };

    if (language === 'python') {
      const filePath = path.join(TEMP_DIR, `run_${id}.py`);
      fs.writeFileSync(filePath, code, 'utf-8');

      const primaryPy = process.platform === 'win32' ? 'python' : 'python3';
      const fallbackPy = process.platform === 'win32' ? 'py' : 'python';

      const runWithPython = (cmd, onFail) => {
        const child = execFile(cmd, [filePath], { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
          const isStoreAlias = stderr && stderr.includes('Python was not found');
          if ((error && error.code === 'ENOENT') || isStoreAlias) {
            if (onFail) return onFail();
          }
          try { fs.unlinkSync(filePath); } catch {}
          handleResult(error, stdout, stderr);
        });

        child.stdin.write(inputStr + '\n');
        child.stdin.end();
      };

      runWithPython(primaryPy, () => {
        runWithPython(fallbackPy, () => {
          try { fs.unlinkSync(filePath); } catch {}
          resolve({ success: false, output: '', error: 'Python runtime not found.', executionTimeMs: 0 });
        });
      });

    } else if (language === 'javascript') {
      return resolve({ success: false, output: '', error: 'JavaScript execution is currently disabled. Please use C++, Python, or Java.', executionTimeMs: 0 });

    } else if (language === 'cpp') {
      if (!compiledInfo?.binaryPath) {
        return resolve({ success: false, output: '', error: 'C++ binary not found.', executionTimeMs: 0 });
      }

      const child = execFile(compiledInfo.binaryPath, { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        handleResult(error, stdout, stderr);
      });

      child.stdin.write(inputStr + '\n');
      child.stdin.end();

    } else if (language === 'java') {
      if (!compiledInfo?.javaDir || !compiledInfo?.className) {
        return resolve({ success: false, output: '', error: 'Java classes not found.', executionTimeMs: 0 });
      }

      const child = execFile('java', ['-cp', compiledInfo.javaDir, compiledInfo.className], { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        handleResult(error, stdout, stderr);
      });

      child.stdin.write(inputStr + '\n');
      child.stdin.end();

    } else {
      return resolve({ success: false, output: '', error: `Language "${language}" is not supported.`, executionTimeMs: 0 });
    }
  });
};

// ─────────────────────────────────────────────────
// Evaluate code against all test cases
// ─────────────────────────────────────────────────

export const evaluateAllTestCases = async ({ code, language, testCases }) => {
  const normLang = language.toLowerCase();
  const sessionId = uuidv4().slice(0, 8);

  // Step 1: Precompile if needed (C++ or Java)
  let compiledInfo = null;
  if (normLang === 'cpp' || normLang === 'java') {
    compiledInfo = await precompileCode({ code, language: normLang, sessionId });
    if (!compiledInfo.success) {
      return {
        status: 'Compilation Error',
        passedCount: 0,
        totalCount: testCases.length,
        totalExecutionTimeMs: 0,
        testResults: testCases.map((tc) => ({
          id: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: compiledInfo.error,
          executionTimeMs: 0,
          explanation: tc.explanation || '',
          isHidden: !!tc.isHidden
        }))
      };
    }
  }

  const results = [];
  let passedCount = 0;
  let totalTime = 0;

  try {
    for (const tc of testCases) {
      const res = await executeSingleTestCase({
        code,
        language: normLang,
        inputStr: tc.input,
        timeoutMs: 5000,
        compiledInfo
      });

      totalTime += res.executionTimeMs;
      const passed = res.success && areOutputsEqual(res.output, tc.expectedOutput);
      if (passed) passedCount++;

      results.push({
        id: tc.id,
        passed,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: res.output,
        error: res.error,
        executionTimeMs: res.executionTimeMs,
        explanation: tc.explanation || '',
        isHidden: !!tc.isHidden
      });
    }
  } finally {
    if (compiledInfo?.cleanup) {
      compiledInfo.cleanup();
    }
  }

  let status = 'Accepted';
  if (passedCount < testCases.length) {
    const hasTLE = results.some((r) => r.error && r.error.includes('Time Limit Exceeded'));
    const hasRuntimeError = results.some((r) => r.error && !r.error.includes('Time Limit Exceeded'));
    if (hasTLE) status = 'Time Limit Exceeded';
    else if (hasRuntimeError) status = 'Runtime Error';
    else status = 'Wrong Answer';
  }

  return {
    status,
    passedCount,
    totalCount: testCases.length,
    totalExecutionTimeMs: totalTime,
    testResults: results
  };
};
