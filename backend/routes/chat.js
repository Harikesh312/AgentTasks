import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure authentication on all chat routes
router.use(protect);

// GET /api/chat/conversations/:questionId
// Get all conversations for the current user and question
router.get('/conversations/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const conversations = await Conversation.find({
      userId: req.user.id,
      questionId: Number(questionId)
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// GET /api/chat/conversations/:id/messages
// Get a specific conversation and all its messages
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    
    res.json({ conversation, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// POST /api/chat/conversations
// Create a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { questionId, title } = req.body;
    
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const existingCount = await Conversation.countDocuments({
      userId: req.user.id,
      questionId: Number(questionId)
    });

    let autoTitle;
    if (existingCount < 26) {
      autoTitle = `Chat ${String.fromCharCode(65 + existingCount)}`;
    } else {
      autoTitle = `Chat ${existingCount + 1}`;
    }

    const conversation = new Conversation({
      userId: req.user.id,
      questionId: Number(questionId),
      title: autoTitle
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
});

// POST /api/chat/conversations/:id/messages
// Add a message to a conversation
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { role, content, files, previewHtml, isError } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({ message: 'Role and content are required' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = new Message({
      conversationId: conversation._id,
      role,
      content,
      files: files || null,
      previewHtml: previewHtml || null,
      isError: isError || false
    });

    await message.save();

    // Removed the prompt-based title generation logic here so that 
    // Chat A/B etc. remains persistent.

    // Always update updatedAt for the conversation
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(201).json({ message, conversation });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Server error adding message' });
  }
});

// PATCH /api/chat/conversations/:id
// Rename a conversation
router.patch('/conversations/:id', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, updatedAt: Date.now() },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error renaming conversation:', error);
    res.status(500).json({ message: 'Server error renaming conversation' });
  }
});

// DELETE /api/chat/conversations/:id
// Delete a conversation and its messages
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Cascade delete messages
    await Message.deleteMany({ conversationId: conversation._id });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error deleting conversation' });
  }
});

export default router;
