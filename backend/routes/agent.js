import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `You are an expert frontend developer AI agent. When the user asks you to build something, you MUST respond with working HTML, CSS, and JavaScript code.

CRITICAL: Your response MUST be in this EXACT format — a valid JSON object with no extra text before or after it:

\`\`\`json
{
  "explanation": "Brief explanation of what you built and how it works",
  "files": {
    "index.html": "<!DOCTYPE html>\\n<html>... full HTML code here ...",
    "styles.css": "/* full CSS code here */",
    "script.js": "// full JavaScript code here (if needed)"
  }
}
\`\`\`

RULES:
1. Always include at least index.html and styles.css
2. The index.html must link to styles.css via <link rel="stylesheet" href="styles.css">
3. If JavaScript is needed, include script.js and link it via <script src="script.js"></script>
4. Make the code COMPLETE and WORKING — no placeholders, no TODOs
5. Use modern CSS (flexbox, grid, custom properties, smooth animations)
6. Make designs visually stunning with gradients, shadows, transitions, and micro-animations
7. Use Google Fonts when appropriate (import via CSS @import or HTML link)
8. Ensure responsive design with media queries
9. Use semantic HTML5 elements
10. The JSON must be valid — escape all special characters properly in strings
11. Do NOT include markdown code fences in your response — just the raw JSON object
12. Do NOT add any text before or after the JSON object
13. If the user's context specifies exact required text in quotes (e.g. Headline, Subtext, CTA button text), you MUST reproduce that text exactly and verbatim — same wording, same capitalization, same punctuation. Do NOT paraphrase, rewrite, shorten, or invent alternative copy for any text that is explicitly required. Only change required text if the user's latest prompt explicitly asks you to change that specific piece of text.`;

const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite',
  systemInstruction: SYSTEM_PROMPT,
});

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 16384,
  responseMimeType: 'text/plain',
};

router.post('/generate', async (req, res) => {
  const { prompt, context } = req.body;

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

    // Build the full prompt with context
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = `Previous context:\n${context}\n\nNew request: ${prompt}`;
    }

    // Phase 2: Planning (after a brief delay to show the phase)
    await new Promise(resolve => setTimeout(resolve, 800));
    sendEvent('phase', { phase: 'planning', message: 'Planning component structure...' });

    // Phase 3: Start generating
    await new Promise(resolve => setTimeout(resolve, 600));
    sendEvent('phase', { phase: 'generating', message: 'Generating code...' });

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
    sendEvent('phase', { phase: 'creating_files', message: 'Creating files...' });

    // Try to parse files from the response
    let files = null;
    let explanation = '';
    let previewHtml = '';

    try {
      // Try to extract JSON from the response
      let jsonStr = fullResponse.trim();

      // Remove markdown code fences if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      if (parsed.files) {
        files = parsed.files;
        explanation = parsed.explanation || '';

        // Build preview HTML by combining all files
        const htmlContent = files['index.html'] || '';
        const cssContent = files['styles.css'] || '';
        const jsContent = files['script.js'] || '';

        // Create a self-contained HTML for preview
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
      }
    } catch (parseErr) {
      // If JSON parsing fails, treat the whole response as explanation
      explanation = fullResponse;
      files = {
        'response.md': fullResponse,
      };
    }

    // Phase 5: Complete
    await new Promise(resolve => setTimeout(resolve, 400));
    sendEvent('complete', {
      phase: 'complete',
      message: 'Done!',
      files,
      explanation,
      previewHtml,
      rawResponse: fullResponse,
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
