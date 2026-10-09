import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true }, // Keeping custom ID for backward compatibility
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    category: { type: String, required: true },

    // Question type determines entire UX flow
    type: {
      type: String,
      enum: ['ui-generation', 'debugging', 'testing',
             'optimization', 'code-review', 'system-scaling'],
      default: 'ui-generation',
      required: true
    },

    // Existing fields (kept)
    isOptimizationTrap: { type: Boolean, default: false },
    avgAttempts: { type: Number, default: 0 },
    description: { type: String, required: true },
    referenceImage: { type: String },   // Optional now — only for ui-generation
    requirements: [{ type: String }],
    constraints: [{ type: String }],
    requiredContent: { type: mongoose.Schema.Types.Mixed },
    maxPromptTurns: { type: Number, default: 5 },

    // debugging type fields
    buggyCode: { type: mongoose.Schema.Types.Mixed },      // { filename: codeString }
    bugCount: { type: Number },
    bugDescriptions: [{ type: String }],                   // hidden from student, used for scoring
    expectedBehavior: { type: String },

    // testing type fields
    functionCode: { type: String },
    functionSpec: { type: String },
    mutantImplementations: [{ type: String }],
    correctImplementation: { type: String },

    // optimization type fields
    slowCode: { type: mongoose.Schema.Types.Mixed },
    performanceTarget: { type: String },
    originalComplexity: { type: String },
    benchmarkInputSize: { type: Number },

    // code-review type fields
    reviewCode: { type: mongoose.Schema.Types.Mixed },     // { filename: code }
    knownIssues: [{
      category: String,     // security | performance | accessibility | quality
      severity: String,     // critical | major | minor
      description: String,
      location: String,
    }],

    // system-scaling type fields
    prototypeCode: { type: mongoose.Schema.Types.Mixed },
    scalingScenario: { type: String },
    scalingRequirements: [{ type: String }],
    expectedPatterns: [{ type: String }],

    // Cross-type: automated test cases
    testCases: [{
      input: mongoose.Schema.Types.Mixed,
      expectedOutput: mongoose.Schema.Types.Mixed,
      description: String,
      isHidden: { type: Boolean, default: false },
    }],
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
