import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true }, // Keeping custom ID for backward compatibility
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    category: { type: String, required: true },
    isOptimizationTrap: { type: Boolean, default: false },
    avgAttempts: { type: Number, default: 0 },
    description: { type: String, required: true },
    referenceImage: { type: String, required: true },
    requirements: [{ type: String }],
    constraints: [{ type: String }],
    requiredContent: { type: mongoose.Schema.Types.Mixed },
    maxPromptTurns: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
