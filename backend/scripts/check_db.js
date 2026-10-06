import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agenttasks');
  const dCount = await mongoose.connection.db.collection('discussions').countDocuments();
  console.log('Discussions count:', dCount);
  const sample = await mongoose.connection.db.collection('discussions').find().limit(3).toArray();
  console.log('Sample:', JSON.stringify(sample.map(s => ({ id: s._id, title: s.title, problemId: s.problemId })), null, 2));
  
  const rSample = await mongoose.connection.db.collection('replies').find().limit(3).toArray();
  console.log('Reply sample:', JSON.stringify(rSample, null, 2));
  
  process.exit(0);
}
check();
