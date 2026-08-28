import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'agent'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    files: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    previewHtml: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Index for fast user+question lookups
chatSchema.index({ user: 1, questionId: 1 });

export default mongoose.model('Chat', chatSchema);
