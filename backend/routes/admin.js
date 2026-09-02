import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Question from '../models/Question.js';
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

export default router;
