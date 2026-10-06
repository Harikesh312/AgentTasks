import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Question from '../models/Question.js';
import DiscussPost from '../models/DiscussPost.js';
import { ensureDiscussPostsSeeded } from '../utils/seedDiscussPosts.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Apply protect and admin middlewares to all routes in this file
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();

    // Calculate total completions across all users
    const users = await User.find({}, 'completedQuestions');
    const totalCompletions = users.reduce((acc, user) => acc + (user.completedQuestions ? user.completedQuestions.length : 0), 0);

    res.json({
      totalUsers,
      totalQuestions,
      totalCompletions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   POST /api/admin/users
// @desc    Add a new user
// @access  Private/Admin
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // Optional: if password update is needed from admin
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   POST /api/admin/questions
// @desc    Add a new question
// @access  Private/Admin
router.post('/questions', async (req, res) => {
  try {
    const {
      title,
      difficulty,
      category,
      isOptimizationTrap,
      avgAttempts,
      description,
      referenceImage,
      requirements,
      constraints,
      requiredContent,
      maxPromptTurns
    } = req.body;

    // Auto-increment ID based on highest existing ID
    const lastQuestion = await Question.findOne().sort({ id: -1 });
    const newId = lastQuestion ? lastQuestion.id + 1 : 1;

    const question = await Question.create({
      id: newId,
      title,
      difficulty,
      category,
      isOptimizationTrap: isOptimizationTrap || false,
      avgAttempts: avgAttempts || 0,
      description,
      referenceImage: referenceImage || '/images/references/placeholder.svg',
      requirements: requirements || [],
      constraints: constraints || [],
      requiredContent: requiredContent || {},
      maxPromptTurns: maxPromptTurns || 5
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating question' });
  }
});

// @route   PUT /api/admin/questions/:id
// @desc    Update a question by custom id
// @access  Private/Admin
router.put('/questions/:id', async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    const question = await Question.findOne({ id: questionId });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const {
      title, difficulty, category, description, referenceImage,
      requirements, constraints, requiredContent, maxPromptTurns, isOptimizationTrap
    } = req.body;

    if (title !== undefined) question.title = title;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (category !== undefined) question.category = category;
    if (description !== undefined) question.description = description;
    if (referenceImage !== undefined) question.referenceImage = referenceImage;
    if (requirements !== undefined) question.requirements = requirements;
    if (constraints !== undefined) question.constraints = constraints;
    if (requiredContent !== undefined) question.requiredContent = requiredContent;
    if (maxPromptTurns !== undefined) question.maxPromptTurns = maxPromptTurns;
    if (isOptimizationTrap !== undefined) question.isOptimizationTrap = isOptimizationTrap;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating question' });
  }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete a question by custom id
// @access  Private/Admin
router.delete('/questions/:id', async (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    const question = await Question.findOne({ id: questionId });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.findOneAndDelete({ id: questionId });
    res.json({ message: 'Question removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting question' });
  }
});

import Discussion from '../models/Discussion.js';

// ══════════════════════════════════════════════════════════════════════════════
// Reviews Management (Admin)
// ══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/reviews/questions
// @desc    Get all questions for the dropdown
// @access  Private/Admin
router.get('/reviews/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ id: 1 });
    
    // For review count, we count Discussions grouped by problemId
    const discussions = await Discussion.find({}, 'problemId');
    
    const formatted = questions.map(q => {
      const qReviews = discussions.filter(d => d.problemId === q.id);
      return {
        id: q.id,
        _id: q._id,
        title: q.title,
        difficulty: q.difficulty,
        description: q.description,
        referenceImage: q.referenceImage,
        reviewCount: qReviews.length
      };
    });
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching review questions:', error);
    res.status(500).json({ message: 'Server error fetching review questions' });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get reviews (Discussions) for a selected question
// @access  Private/Admin
router.get('/reviews', async (req, res) => {
  try {
    const { questionId } = req.query;
    if (!questionId) {
      return res.json({ question: null, reviews: [] });
    }

    const qIdNum = Number(questionId);
    const question = await Question.findOne({
      $or: [
        { id: isNaN(qIdNum) ? null : qIdNum },
        { _id: questionId.match(/^[0-9a-fA-F]{24}$/) ? questionId : null }
      ]
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Fetch the actual reviews (Discussions)
    const reviews = await Discussion.find({ problemId: question.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      question: {
        id: question.id,
        _id: question._id,
        title: question.title,
        difficulty: question.difficulty,
        description: question.description,
        referenceImage: question.referenceImage
      },
      reviews: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// Helper for updating a review (Discussion)
const handleUpdateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Review content is required' });
    }

    const review = await Discussion.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.content = body.trim();
    await review.save();
    
    // Re-populate to send back the complete data
    await review.populate('author', 'name email');

    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error updating review' });
  }
};

// Helper for deleting a review (Discussion)
const handleDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Discussion.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Discussion.deleteOne({ _id: review._id });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};

// @route   PUT /api/admin/reviews/:questionId/:reviewId
// @route   PUT /api/admin/reviews/:reviewId
// @desc    Edit a review
// @access  Private/Admin
router.put('/reviews/:questionId/:reviewId', handleUpdateReview);
router.put('/reviews/:reviewId', handleUpdateReview);

// @route   DELETE /api/admin/reviews/:questionId/:reviewId
// @route   DELETE /api/admin/reviews/:reviewId
// @desc    Delete a review
// @access  Private/Admin
router.delete('/reviews/:questionId/:reviewId', handleDeleteReview);
router.delete('/reviews/:reviewId', handleDeleteReview);

export default router;

