import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  authorBadge: {
    type: String,
    default: null,
  },
  authorAvatar: {
    type: String,
    default: '',
  },
  body: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const discussPostSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      default: 'question',
    },
    questionId: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Prompt Strategies',
    },
    author: {
      type: String,
      required: true,
    },
    authorBadge: {
      type: String,
      default: null,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      required: true,
    },
    promptText: {
      type: String,
      default: null,
    },
    turnsUsed: {
      type: Number,
      default: null,
    },
    scoreAchieved: {
      type: Number,
      default: null,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const DiscussPost = mongoose.model('DiscussPost', discussPostSchema);
export default DiscussPost;
