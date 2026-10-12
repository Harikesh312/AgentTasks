import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  explanation: { type: String, default: '' },
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  isHidden: { type: Boolean, default: false },
}, { _id: false });

const contestProblemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
  points: { type: Number, default: 100 },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  starterCode: {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
  },
}, { _id: false });

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registeredAt: { type: Date, default: Date.now },
}, { _id: false });

const contestSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, default: 'Weekly' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: String, default: '90 Minutes' },
    durationMs: { type: Number, default: 90 * 60 * 1000 },
    difficulty: { type: String, default: 'Medium' },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed'],
      default: 'upcoming',
    },
    description: { type: String, default: '' },
    rules: [{ type: String }],
    scoring: { type: String, default: '' },
    initialParticipantsCount: { type: Number, default: 0 },
    participants: [participantSchema],
    problems: [contestProblemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Contest', contestSchema);
