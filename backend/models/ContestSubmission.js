import mongoose from 'mongoose';

const contestSubmissionSchema = new mongoose.Schema(
  {
    contestId: { type: Number, required: true, index: true },
    problemId: { type: Number, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, default: 'Anonymous' },
    language: { type: String, required: true },
    code: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
      required: true,
    },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('ContestSubmission', contestSubmissionSchema);
