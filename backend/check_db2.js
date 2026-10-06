import mongoose from 'mongoose';
import Question from './models/Question.js';
import DiscussPost from './models/DiscussPost.js';
import Discussion from './models/Discussion.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const questions = await Question.find();
  const posts = await DiscussPost.find();
  const discussions = await Discussion.find();
  console.log('Questions:', questions.length);
  console.log('DiscussPosts:', posts.length);
  for (const post of posts) {
    if (post.questionId) {
      console.log('Post ID:', post.id, 'Question ID:', post.questionId, 'Comments:', post.comments.length);
    }
  }
  console.log('Discussions:', discussions.length);
  for (const disc of discussions) {
    if (disc.problemId) {
      console.log('Discussion ID:', disc._id, 'Problem ID:', disc.problemId);
    }
  }
  mongoose.disconnect();
}
check();
