import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema(
  {
    problemId: {
      type: Number,
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Question', 'Solution', 'Issue', 'Tip', 'Prompt'],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    hasAcceptedAnswer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual for upvote count
discussionSchema.virtual('upvoteCount').get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

// Ensure virtuals are included when converting to JSON
discussionSchema.set('toJSON', { virtuals: true });
discussionSchema.set('toObject', { virtuals: true });

const Discussion = mongoose.model('Discussion', discussionSchema);
export default Discussion;
