import mongoose from 'mongoose';
import Question from './models/Question.js';
import Discussion from './models/Discussion.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const questionId = '4';
  const qIdNum = Number(questionId);
  const question = await Question.findOne({
    $or: [
      { id: isNaN(qIdNum) ? null : qIdNum },
      { _id: questionId.match(/^[0-9a-fA-F]{24}$/) ? questionId : null }
    ]
  });

  const reviews = await Discussion.find({ problemId: question.id })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  console.log('Question:', question.id, question.title);
  console.log('Reviews length:', reviews.length);
  mongoose.disconnect();
}
check();
