import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: Number, required: true, index: true }, // The ID of the question/problem this chat belongs to
  title: { type: String, default: 'New Chat' },
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
