import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Discussion from '../models/Discussion.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const templates = [
  "I found the requirements for this task a bit tricky, especially around the core logic. But overall a great exercise!",
  "For anyone struggling with the '%TITLE%' problem, make sure you double-check your edge cases.",
  "The %DIFFICULTY% difficulty rating on this is accurate. Took me a few tries to get the optimal solution.",
  "Can someone explain the best approach for the main algorithm here? My current solution is O(n^2).",
  "I implemented this using a hash map to keep track of the state. Much faster than the nested loop approach.",
  "The description for '%TITLE%' could be slightly clearer about the expected input format.",
  "Really enjoyed solving this one! Reminds me of a similar problem I faced in an interview last year.",
  "Make sure to handle the case where the input is empty or null. That tripped me up initially.",
  "Is there a more elegant way to solve this? I feel like my code is too verbose.",
  "Great problem to practice %DIFFICULTY% level optimization techniques.",
  "I was stuck on this for an hour before realizing I misread the constraints. Pay attention to the details!",
  "A classic problem. The provided examples were very helpful for debugging."
];

const titles = [
  "Implementation question",
  "Need help with edge cases",
  "Alternative approach?",
  "Great practice problem",
  "Optimization needed"
];

const types = ['Question', 'Solution', 'Issue', 'Tip', 'Prompt'];

async function fixReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      process.exit(1);
    }

    const questions = await Question.find().sort({ id: 1 });
    console.log(`TOTAL QUESTIONS: ${questions.length}\n`);

    let totalCreated = 0;

    for (const q of questions) {
      const qId = q.id;
      const existingReviews = await Discussion.find({ problemId: qId });
      
      const missing = 5 - existingReviews.length;
      
      if (missing > 0) {
        console.log(`Question ${qId} -> ${existingReviews.length} reviews ✗ (Creating ${missing}...)`);
        
        const newReviews = [];
        for (let i = 0; i < missing; i++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
          const content = randomTemplate
            .replace('%TITLE%', q.title)
            .replace('%DIFFICULTY%', q.difficulty);
          
          const randomTitle = titles[Math.floor(Math.random() * titles.length)];
          const randomType = types[Math.floor(Math.random() * types.length)];

          newReviews.push({
            problemId: qId,
            author: randomUser._id,
            title: randomTitle,
            content: content,
            type: randomType,
            tags: [],
            upvotes: [],
            views: Math.floor(Math.random() * 50),
            repliesCount: 0,
            hasAcceptedAnswer: false,
          });
        }
        
        await Discussion.insertMany(newReviews);
        totalCreated += missing;
      } else if (missing === 0) {
        console.log(`Question ${qId} -> 5 reviews ✓`);
      } else {
        console.log(`Question ${qId} -> ${existingReviews.length} reviews (Has more than 5, doing nothing)`);
      }
    }

    console.log(`\nFinished! Created ${totalCreated} new reviews.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing reviews:', error);
    process.exit(1);
  }
}

fixReviews();
