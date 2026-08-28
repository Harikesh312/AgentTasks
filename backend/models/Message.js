import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  role: { type: String, enum: ['user', 'agent'], required: true },
  content: { type: String, required: true }, // For agent, this is the explanation or raw text
  files: { type: mongoose.Schema.Types.Mixed }, // JSON object of files if present
  previewHtml: { type: String }, // Generated preview HTML if present
  isError: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
