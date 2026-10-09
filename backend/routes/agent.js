import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import SYSTEM_PROMPTS, { buildQuestionContext } from '../prompts/systemPrompts.js';

dotenv.config();

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 16384,
  responseMimeType: 'text/plain',
};

/**
 * Parse the AI response based on question type.
 * Returns { files, explanation, previewHtml, typeData } where typeData
 * contains type-specific parsed fields.
 */
function parseAIResponse(fullResponse, questionType) {
  let jsonStr = fullResponse.trim();

  // Remove markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    switch (questionType) {
      case 'ui-generation': {
        const files = parsed.files || {};
        const explanation = parsed.explanation || '';
        let previewHtml = '';

        const htmlContent = files['index.html'] || '';
        const cssContent = files['styles.css'] || '';
        const jsContent = files['script.js'] || '';

        if (htmlContent) {
          previewHtml = htmlContent
            .replace(
              '<link rel="stylesheet" href="styles.css">',
              `<style>${cssContent}</style>`
            )
            .replace(
              /<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>/gi,
              `<style>${cssContent}</style>`
            )
            .replace(
              '<script src="script.js"></script>',
              `<script>${jsContent}</script>`
            )
            .replace(
              /<script\s+src=["']script\.js["']\s*><\/script>/gi,
              `<script>${jsContent}</script>`
            );
        }

        return { files, explanation, previewHtml, typeData: {} };
      }

      case 'debugging': {
        return {
          files: parsed.fixedCode || {},
          explanation: parsed.explanation || '',
          previewHtml: '',
          typeData: {
            bugsFound: parsed.bugsFound || [],
            testResults: parsed.testResults || '',
          }
        };
      }

      case 'testing': {
        return {
          files: { 'tests.js': parsed.testCode || '' },
          explanation: parsed.explanation || '',
          previewHtml: '',
          typeData: {
            testCount: parsed.testCount || 0,
            coverageAreas: parsed.coverageAreas || [],
          }
        };
      }

      case 'optimization': {
        return {
          files: parsed.optimizedCode || {},
          explanation: parsed.explanation || '',
          previewHtml: '',
          typeData: {
            analysis: parsed.analysis || {},
            benchmarkNotes: parsed.benchmarkNotes || '',
          }
        };
      }

      case 'code-review': {
        return {
          files: {},
          explanation: parsed.explanation || '',
          previewHtml: '',
          typeData: {
            issues: parsed.issues || [],
            summary: parsed.summary || {},
          }
        };
      }

      case 'system-scaling': {
        return {
          files: parsed.scaledCode || {},
          explanation: parsed.explanation || '',
          previewHtml: '',
          typeData: {
            patternsApplied: parsed.patternsApplied || [],
            architectureNotes: parsed.architectureNotes || '',
          }
        };
      }

      default:
        return {
          files: parsed.files || {},
          explanation: parsed.explanation || fullResponse,
          previewHtml: '',
          typeData: {}
        };
    }
  } catch (parseErr) {
    // If JSON parsing fails, treat the whole response as explanation
    return {
      files: { 'response.md': fullResponse },
      explanation: fullResponse,
      previewHtml: '',
      typeData: {}
    };
  }
}

// POST /api/agent/generate
router.post('/generate', async (req, res) => {
  const { prompt, context, questionType } = req.body;
  const type = questionType || 'ui-generation';

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Phase 1: Analyzing
    sendEvent('phase', { phase: 'analyzing', message: 'Analyzing your request...' });

    // Validate the input
    const validationModel = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: 'You are an input validator for a coding agent. Your ONLY job is to determine if the user\'s prompt is a valid request related to coding, debugging, testing, optimization, code review, or system scaling. Respond with exactly "VALID" if it makes sense as a request (even a short one like "Fix the bug" or "Write tests" or "Optimize the loop"). Respond with "INVALID" if it is gibberish, conversational chatter (like "hehehe", "hi", "how are you"), or completely unrelated to coding.',
    });

    const validationResult = await validationModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
    });
    
    const validationText = validationResult.response.text().trim();
    if (validationText.includes('INVALID')) {
      sendEvent('error', {
        phase: 'error',
        code: 'INVALID_INPUT',
        message: 'Invalid input. Please describe what you want the agent to do.',
      });
      res.end();
      return;
    }

    // Select system prompt based on question type
    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS['ui-generation'];

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: systemPrompt,
    });

    // Build the full prompt with context
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = `Previous context:\n${context}\n\nNew request: ${prompt}`;
    }

    // Phase 2: Planning
    await new Promise(resolve => setTimeout(resolve, 800));
    const planMessages = {
      'ui-generation': 'Planning component structure...',
      'debugging': 'Analyzing code for bugs...',
      'testing': 'Planning test strategy...',
      'optimization': 'Profiling performance bottlenecks...',
      'code-review': 'Scanning codebase for issues...',
      'system-scaling': 'Analyzing scaling requirements...',
    };
    sendEvent('phase', { phase: 'planning', message: planMessages[type] || 'Planning...' });

    // Phase 3: Start generating
    await new Promise(resolve => setTimeout(resolve, 600));
    const genMessages = {
      'ui-generation': 'Generating code...',
      'debugging': 'Generating fixes...',
      'testing': 'Generating test cases...',
      'optimization': 'Generating optimized code...',
      'code-review': 'Generating review report...',
      'system-scaling': 'Generating scaled architecture...',
    };
    sendEvent('phase', { phase: 'generating', message: genMessages[type] || 'Generating...' });

    // Call Gemini with streaming
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig,
    });

    let fullResponse = '';

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullResponse += text;
        sendEvent('token', { token: text });
      }
    }

    // Phase 4: Creating files — parse the response
    const fileMessages = {
      'ui-generation': 'Creating files...',
      'debugging': 'Applying fixes...',
      'testing': 'Compiling test suite...',
      'optimization': 'Benchmarking improvements...',
      'code-review': 'Compiling review report...',
      'system-scaling': 'Assembling scaled system...',
    };
    sendEvent('phase', { phase: 'creating_files', message: fileMessages[type] || 'Processing...' });

    const { files, explanation, previewHtml, typeData } = parseAIResponse(fullResponse, type);

    // Phase 5: Complete
    await new Promise(resolve => setTimeout(resolve, 400));
    sendEvent('complete', {
      phase: 'complete',
      message: 'Done!',
      files,
      explanation,
      previewHtml,
      rawResponse: fullResponse,
      questionType: type,
      typeData,
    });

    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) {
    console.error('Agent generation error:', error);
    sendEvent('error', {
      phase: 'error',
      message: error.message || 'An error occurred while generating the response',
    });
    res.end();
  }
});

export default router;
