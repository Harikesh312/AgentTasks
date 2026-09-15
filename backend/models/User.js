import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    completedQuestions: [{ type: Number }],
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    username: {
      type: String,
      default: '',
      trim: true,
      maxlength: 30,
    },
    gender: {
      type: String,
      enum: ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: '',
      maxlength: 100,
    },
    github: {
      type: String,
      default: '',
      maxlength: 100,
    },
    linkedin: {
      type: String,
      default: '',
      maxlength: 100,
    },
    portfolio: {
      type: String,
      default: '',
      maxlength: 200,
    },
    activityHistory: [{
      date: { type: Date, required: true },
      type: { type: String, enum: ['question_completed'], required: true },
      questionId: { type: Number, required: true },
    }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
