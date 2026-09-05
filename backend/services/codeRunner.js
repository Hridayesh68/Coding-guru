import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(os.tmpdir(), 'coding-guru-executions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Normalize output for robust comparison
export const normalizeOutput = (val) => {
  if (val === null || val === undefined) return '';
  const trimmed = String(val).trim();
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed);
  } catch {
    return trimmed;
  }
};

export const areOutputsEqual = (actual, expected) => {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (normActual === normExpected) return true;

  // Try parsing both as JSON and comparing
  try {
    const actObj = JSON.parse(normActual);
    const expObj = JSON.parse(normExpected);

    // If both are arrays of primitives and lengths match, check if same elements (for Two Sum [0,1] or [1,0])
    if (Array.isArray(actObj) && Array.isArray(expObj) && actObj.length === expObj.length) {
      if (JSON.stringify(actObj.slice().sort()) === JSON.stringify(expObj.slice().sort())) {
        return true;
      }
    }
  } catch {}

  return false;
};

// Detect the entry point function from JavaScript code
function findJsFunctionName(code) {
  const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
  if (fnMatch) return fnMatch[1];
  const constMatch = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>)/);
  if (constMatch) return constMatch[1];
  return null;
}

// Detect the entry point function from Python code
function findPyFunctionName(code) {
  const match = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  if (match) return match[1];
  return null;
}

// Execute single test case
export const executeSingleTestCase = ({ code, language, inputStr, timeoutMs = 4000 }) => {
  return new Promise((resolve) => {
    const id = uuidv4();
    const startTime = Date.now();

    if (language === 'javascript') {
      const fnName = findJsFunctionName(code);
      if (!fnName) {
        return resolve({
          success: false,
          output: '',
          error: 'No valid function declaration found in JavaScript code.',
          executionTimeMs: 0
        });
      }

      const script = `
${code}

try {
  const rawInput = ${JSON.stringify(inputStr)};
  let parsedInput;
  try {
    parsedInput = JSON.parse(rawInput);
  } catch (e) {
    parsedInput = rawInput;
  }

  let result;
  if (typeof parsedInput === 'object' && parsedInput !== null && !Array.isArray(parsedInput)) {
    result = ${fnName}(...Object.values(parsedInput));
  } else if (Array.isArray(parsedInput)) {
    result = ${fnName}(parsedInput);
  } else {
    result = ${fnName}(parsedInput);
  }

  if (result === undefined) {
    process.stdout.write("undefined");
  } else {
    process.stdout.write(JSON.stringify(result));
  }
} catch (err) {
  process.stderr.write(err.stack || String(err));
  process.exit(1);
}
`;

      const filePath = path.join(TEMP_DIR, `run_${id}.js`);
      fs.writeFileSync(filePath, script, 'utf-8');

      execFile('node', [filePath], { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const executionTimeMs = Date.now() - startTime;
        try { fs.unlinkSync(filePath); } catch {}

        if (error) {
          if (error.killed || error.signal === 'SIGTERM') {
            return resolve({
              success: false,
              output: '',
              error: `Time Limit Exceeded (${timeoutMs}ms)`,
              executionTimeMs
            });
          }
          return resolve({
            success: false,
            output: stdout.trim(),
            error: stderr.trim() || error.message,
            executionTimeMs
          });
        }

        return resolve({
          success: true,
          output: stdout.trim(),
          error: null,
          executionTimeMs
        });
      });
    } else if (language === 'python') {
      const fnName = findPyFunctionName(code);
      if (!fnName) {
        return resolve({
          success: false,
          output: '',
          error: 'No valid "def function_name(...):" declaration found in Python code.',
          executionTimeMs: 0
        });
      }

      const script = `
import sys
import json

${code}

try:
    raw_input_str = ${JSON.stringify(inputStr)}
    try:
        parsed_input = json.loads(raw_input_str)
    except Exception:
        parsed_input = raw_input_str

    if isinstance(parsed_input, dict):
        result = ${fnName}(*list(parsed_input.values()))
    else:
        result = ${fnName}(parsed_input)

    sys.stdout.write(json.dumps(result))
except Exception as e:
    import traceback
    sys.stderr.write(traceback.format_exc())
    sys.exit(1)
`;

      const filePath = path.join(TEMP_DIR, `run_${id}.py`);
      fs.writeFileSync(filePath, script, 'utf-8');

      execFile('python', [filePath], { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const executionTimeMs = Date.now() - startTime;
        try { fs.unlinkSync(filePath); } catch {}

        if (error) {
          if (error.killed || error.signal === 'SIGTERM') {
            return resolve({
              success: false,
              output: '',
              error: `Time Limit Exceeded (${timeoutMs}ms)`,
              executionTimeMs
            });
          }
          return resolve({
            success: false,
            output: stdout.trim(),
            error: stderr.trim() || error.message,
            executionTimeMs
          });
        }

        return resolve({
          success: true,
          output: stdout.trim(),
          error: null,
          executionTimeMs
        });
      });
    } else {
      return resolve({
        success: false,
        output: '',
        error: `Language "${language}" is not supported. Choose "javascript" or "python".`,
        executionTimeMs: 0
      });
    }
  });
};

// Evaluate code against an array of test cases (e.g. all 10 test cases)
export const evaluateAllTestCases = async ({ code, language, testCases }) => {
  const results = [];
  let passedCount = 0;
  let totalTime = 0;

  for (const tc of testCases) {
    const res = await executeSingleTestCase({
      code,
      language,
      inputStr: tc.input,
      timeoutMs: 4000
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
