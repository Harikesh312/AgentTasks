import express from 'express';
import Question from '../models/Question.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions
// @access  Private (though some apps might make it public)
router.get('/', protect, async (req, res) => {
  try {
    const questions = await Question.find().sort({ id: 1 });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching questions' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by custom id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    const question = await Question.findOne({ id: questionId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching question' });
  }
});

export default router;
