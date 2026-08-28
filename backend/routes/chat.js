import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/chats?questionId=X — List chats for the logged-in user
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.questionId) {
      filter.questionId = Number(req.query.questionId);
    }

    const chats = await Chat.find(filter)
      .select('title questionId messages createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Return lightweight list (include message count, not full messages)
    const list = chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      questionId: chat.questionId,
      messageCount: chat.messages.length,
      lastMessage:
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].content?.slice(0, 80)
          : null,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));

    res.json(list);
  } catch (error) {
    console.error('Error listing chats:', error);
    res.status(500).json({ message: 'Failed to list chats' });
  }
});

// POST /api/chats — Create a new chat
router.post('/', async (req, res) => {
  try {
    const { questionId, title } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const chat = await Chat.create({
      user: req.user.id,
      questionId,
      title: title || 'New Chat',
      messages: [],
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
});

// GET /api/chats/:id — Get a single chat with all messages
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
});

// POST /api/chats/:id/messages — Append a message to a chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { role, content, files, previewHtml } = req.body;

    if (!role || !['user', 'agent'].includes(role)) {
      return res.status(400).json({ message: 'Valid role (user/agent) is required' });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      role,
      content: content || '',
      files: files || null,
      previewHtml: previewHtml || null,
      timestamp: new Date(),
    };

    chat.messages.push(message);

    // Auto-title from first user message
    if (chat.title === 'New Chat' && role === 'user' && content) {
      chat.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    }

    await chat.save();

    // Return the newly added message
    const addedMessage = chat.messages[chat.messages.length - 1];
    res.status(201).json(addedMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Failed to add message' });
  }
});

// DELETE /api/chats/:id — Delete a chat
router.delete('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
});

export default router;
