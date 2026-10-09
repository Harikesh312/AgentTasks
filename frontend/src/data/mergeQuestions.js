import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import questions from './questions.js';
import newQuestions from './newQuestions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Add type: 'ui-generation' to all existing questions (if not already there)
const updatedExisting = questions.map(q => {
  if (!q.type) {
    return { ...q, type: 'ui-generation' };
  }
  return q;
});

// 2. Combine with new questions
const allQuestions = [...updatedExisting, ...newQuestions];

// 3. Write back to questions.js
const fileContent = `const questions = ${JSON.stringify(allQuestions, null, 2)};\n\nexport default questions;\n`;

const outputPath = path.join(__dirname, 'questions.js');
fs.writeFileSync(outputPath, fileContent, 'utf8');

console.log(`Successfully merged questions. Total questions: ${allQuestions.length}`);
