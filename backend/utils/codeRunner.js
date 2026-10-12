import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Execute code in an isolated subprocess with strict timeouts and memory limits.
 * Environment variables containing secrets (MONGO_URI, JWT_SECRET, GEMINI_API_KEY)
 * are NEVER passed to the executed process.
 */
export async function executeCode({ language, code, input = '', timeoutMs = 4000 }) {
  const startTime = Date.now();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agenttasks-runner-'));

  let fileName = 'solution';
  let command = '';
  let args = [];

  const lang = (language || '').toLowerCase();

  if (lang === 'javascript' || lang === 'js' || lang === 'node') {
    fileName = 'solution.js';
    command = process.execPath; // node binary
    args = ['--max-old-space-size=128', path.join(tempDir, fileName)];
  } else if (lang === 'python' || lang === 'py' || lang === 'python3') {
    fileName = 'solution.py';
    command = 'python';
    args = ['-I', path.join(tempDir, fileName)]; // -I: isolated mode
  } else {
    // Clean up
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    return {
      status: 'error',
      verdict: 'Compilation Error',
      stdout: '',
      stderr: `Unsupported programming language: ${language}`,
      executionTimeMs: 0
    };
  }

  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, code, 'utf8');

  // Minimal safe environment — PATH only
  const safeEnv = {
    PATH: process.env.PATH || '',
    TEMP: tempDir,
    TMP: tempDir,
    NODE_ENV: 'test'
  };

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    let child;
    try {
      child = spawn(command, args, {
        cwd: tempDir,
        env: safeEnv,
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (err) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      return resolve({
        status: 'error',
        verdict: 'Runtime Error',
        stdout: '',
        stderr: err.message,
        executionTimeMs: Date.now() - startTime
      });
    }

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        child.kill('SIGKILL');
      } catch {}
    }, timeoutMs);

    if (input) {
      try {
        child.stdin.write(input);
        child.stdin.end();
      } catch (err) {
        // Stdin closed or error
      }
    } else {
      try { child.stdin.end(); } catch {}
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 500000) { // 500KB output limit
        child.kill('SIGKILL');
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 50000) {
        child.kill('SIGKILL');
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      resolve({
        status: 'error',
        verdict: 'Runtime Error',
        stdout,
        stderr: stderr || err.message,
        executionTimeMs: Date.now() - startTime
      });
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (isTimedOut) {
        return resolve({
          status: 'timeout',
          verdict: 'Time Limit Exceeded',
          stdout,
          stderr: 'Execution timed out (exceeded limit of 4000ms)',
          executionTimeMs: timeoutMs
        });
      }

      if (exitCode !== 0) {
        return resolve({
          status: 'error',
          verdict: 'Runtime Error',
          stdout,
          stderr: stderr || `Process exited with code ${exitCode}`,
          executionTimeMs
        });
      }

      resolve({
        status: 'success',
        verdict: 'Success',
        stdout,
        stderr,
        executionTimeMs
      });
    });
  });
}

/**
 * Compare actual stdout with expected output.
 * Normalizes trailing whitespace, Windows/Unix linebreaks, and JSON formatting.
 */
export function compareOutputs(actual, expected) {
  const normActual = String(actual || '').trim().replace(/\r\n/g, '\n');
  const normExpected = String(expected || '').trim().replace(/\r\n/g, '\n');

  if (normActual === normExpected) return true;

  // Try parsing as JSON if both are objects/arrays
  try {
    const actJson = JSON.parse(normActual);
    const expJson = JSON.parse(normExpected);
    if (JSON.stringify(actJson) === JSON.stringify(expJson)) return true;
  } catch {}

  // Case-insensitive fallback if same words
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  return false;
}
