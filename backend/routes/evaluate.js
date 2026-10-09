import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Question from '../models/Question.js';

dotenv.config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * AI-simulated evaluation (Option A from the plan).
 * Sends the student's work + question rubric to Gemini and asks for structured scoring.
 */
async function aiEvaluate(questionType, question, studentData) {
  const evalPrompts = {
    'debugging': `You are evaluating a student's debugging work. The student was asked to find and fix bugs in code.

ORIGINAL BUGGY CODE:
${JSON.stringify(question.buggyCode, null, 2)}

KNOWN BUGS (answer key — the student does NOT see this):
${(question.bugDescriptions || []).map((b, i) => `${i + 1}. ${b}`).join('\n')}

STUDENT'S FIXED CODE:
${JSON.stringify(studentData.studentCode, null, 2)}

STUDENT'S BUG ANALYSIS:
${JSON.stringify(studentData.bugsFound || [], null, 2)}

Evaluate the student's work and respond with ONLY a valid JSON object:
{
  "score": <0-100>,
  "metrics": {
    "bugsFound": <0-100>,
    "testCasesPassed": <0-100>,
    "fixQuality": <0-100>,
    "promptEfficiency": <0-100>,
    "explanationQuality": <0-100>
  },
  "testResults": [
    { "name": "test name", "passed": true/false, "details": "..." }
  ],
  "feedback": "Overall feedback string",
  "improvements": ["suggestion 1", "suggestion 2"]
}`,

    'testing': `You are evaluating a student's test writing skills. The student was asked to write comprehensive tests.

FUNCTION BEING TESTED:
${question.functionCode || ''}

FUNCTION SPECIFICATION:
${question.functionSpec || ''}

CORRECT IMPLEMENTATION:
${question.correctImplementation || ''}

MUTANT IMPLEMENTATIONS (intentionally broken — good tests should catch these):
${(question.mutantImplementations || []).map((m, i) => `Mutant ${i + 1}:\n${m}`).join('\n\n')}

STUDENT'S TEST CODE:
${studentData.studentTests || ''}

Evaluate: Do the tests pass on the correct implementation? Do they FAIL on the mutants?
Respond with ONLY a valid JSON object:
{
  "score": <0-100>,
  "metrics": {
    "mutantKillRate": <0-100>,
    "testCoverage": <0-100>,
    "falsePositiveRate": <0-100>,
    "testQuality": <0-100>,
    "promptEfficiency": <0-100>
  },
  "testResults": [
    { "name": "test name", "passed": true/false, "details": "..." }
  ],
  "mutantResults": [
    { "mutantId": 1, "caught": true/false, "details": "..." }
  ],
  "feedback": "Overall feedback string",
  "improvements": ["suggestion 1", "suggestion 2"]
}`,

    'optimization': `You are evaluating a student's code optimization work.

ORIGINAL SLOW CODE:
${JSON.stringify(question.slowCode, null, 2)}

ORIGINAL COMPLEXITY: ${question.originalComplexity || 'Unknown'}
TARGET: ${question.performanceTarget || 'Significant improvement'}

STUDENT'S OPTIMIZED CODE:
${JSON.stringify(studentData.studentCode, null, 2)}

STUDENT'S ANALYSIS:
${JSON.stringify(studentData.analysis || {}, null, 2)}

Evaluate: Is the code correct? Is it actually faster? What's the new complexity?
Respond with ONLY a valid JSON object:
{
  "score": <0-100>,
  "metrics": {
    "correctness": <0-100>,
    "performanceImprovement": <0-100>,
    "complexityAnalysis": <0-100>,
    "codeQuality": <0-100>,
    "promptStrategy": <0-100>
  },
  "benchmarkResults": {
    "originalTime": "estimated time",
    "optimizedTime": "estimated time",
    "speedup": "Nx faster"
  },
  "feedback": "Overall feedback string",
  "improvements": ["suggestion 1", "suggestion 2"]
}`,

    'code-review': `You are evaluating a student's code review work.

CODE BEING REVIEWED:
${JSON.stringify(question.reviewCode, null, 2)}

KNOWN ISSUES (answer key — the student does NOT see this):
${JSON.stringify(question.knownIssues || [], null, 2)}

STUDENT'S REVIEW FINDINGS:
${JSON.stringify(studentData.studentReview || {}, null, 2)}

Evaluate: How many real issues did the student find? Did they correctly categorize severity?
Respond with ONLY a valid JSON object:
{
  "score": <0-100>,
  "metrics": {
    "issuesFound": <0-100>,
    "severityClassification": <0-100>,
    "fixSuggestions": <0-100>,
    "falsePositives": <0-100>,
    "comprehensiveness": <0-100>
  },
  "issueResults": [
    { "knownIssue": "description", "found": true/false, "studentMatch": "what student said" }
  ],
  "feedback": "Overall feedback string",
  "improvements": ["suggestion 1", "suggestion 2"]
}`,

    'system-scaling': `You are evaluating a student's system scaling work.

ORIGINAL PROTOTYPE CODE:
${JSON.stringify(question.prototypeCode, null, 2)}

SCALING SCENARIO: ${question.scalingScenario || ''}
EXPECTED PATTERNS: ${(question.expectedPatterns || []).join(', ')}

STUDENT'S SCALED CODE:
${JSON.stringify(studentData.studentCode, null, 2)}

STUDENT'S ANALYSIS:
${JSON.stringify(studentData.patternsApplied || [], null, 2)}

Evaluate: Are the right scaling patterns applied? Is the code still functional?
Respond with ONLY a valid JSON object:
{
  "score": <0-100>,
  "metrics": {
    "scalabilityPatterns": <0-100>,
    "correctness": <0-100>,
    "architectureQuality": <0-100>,
    "tradeoffAwareness": <0-100>,
    "promptStrategy": <0-100>
  },
  "patternResults": [
    { "pattern": "name", "applied": true/false, "quality": "good/fair/poor" }
  ],
  "feedback": "Overall feedback string",
  "improvements": ["suggestion 1", "suggestion 2"]
}`
  };

  const evalPrompt = evalPrompts[questionType];
  if (!evalPrompt) {
    throw new Error(`No evaluation prompt for type: ${questionType}`);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite',
    systemInstruction: 'You are an expert code evaluator. Respond with ONLY valid JSON — no markdown, no code fences, no extra text.',
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    }
  });

  let responseText = result.response.text().trim();
  
  // Remove code fences if present
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    responseText = jsonMatch[1].trim();
  }

  return JSON.parse(responseText);
}

// POST /api/agent/evaluate
router.post('/evaluate', async (req, res) => {
  const { questionId, questionType, studentCode, studentTests, studentReview, bugsFound, analysis, patternsApplied, turnsUsed } = req.body;

  if (!questionId || !questionType) {
    return res.status(400).json({ error: 'questionId and questionType are required' });
  }

  // UI generation uses client-side evaluation (existing flow)
  if (questionType === 'ui-generation') {
    return res.status(400).json({ error: 'UI generation questions use client-side evaluation' });
  }

  try {
    const question = await Question.findOne({ id: questionId });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const studentData = {
      studentCode,
      studentTests,
      studentReview,
      bugsFound,
      analysis,
      patternsApplied,
      turnsUsed: turnsUsed || 1,
    };

    const evalResult = await aiEvaluate(questionType, question, studentData);

    res.json({
      score: evalResult.score || 0,
      metrics: evalResult.metrics || {},
      testResults: evalResult.testResults || evalResult.mutantResults || evalResult.issueResults || evalResult.patternResults || [],
      feedback: evalResult.feedback || '',
      improvements: evalResult.improvements || [],
      benchmarkResults: evalResult.benchmarkResults || null,
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({
      error: 'Evaluation failed',
      message: error.message,
    });
  }
});

export default router;
