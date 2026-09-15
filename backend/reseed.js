
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedAdminAndQuestions } from './utils/seedAdmin.js';
import Question from './models/Question.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    await Question.deleteMany({});
    console.log('Deleted all questions');
    await seedAdminAndQuestions();
    console.log('Reseeded questions');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

