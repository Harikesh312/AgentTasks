import express from 'express';
import { protect } from '../middleware/auth.js';
import Discussion from '../models/Discussion.js';
import Reply from '../models/Reply.js';

const router = express.Router();

// --------------------------------------------------------
// Discussions
// --------------------------------------------------------

// Get discussions for a specific problem (with filtering, sorting, pagination)
router.get('/problem/:problemId', protect, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { type, sort, search, page = 1, limit = 20 } = req.query;

    const query = { problemId: Number(problemId) };

    if (type && type !== 'All') {
      // Map frontend filter name to enum if necessary, assuming frontend passes exact enum string or maps it
      // Let's assume frontend passes exact enum values: 'Question', 'Solution', etc.
      // E.g., 'Prompt Shares' -> 'Prompt', 'Trap Breakdowns' -> 'Issue', 'Questions' -> 'Question'
      // To be safe, we will just use the passed type string
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'Popular' || sort === 'Best') {
      // mongoose doesn't easily sort by virtual length, so we either need aggregation 
      // or we can sort by views or a precomputed field. Since we just have an array of upvotes,
      // the best approach in MongoDB without aggregation is to maintain an upvoteCount field,
      // but since we only have the array, we can use an aggregation pipeline, or we can just 
      // sort by views or createdAt for now, or fetch and sort in memory if count is low.
      // Let's use an aggregation pipeline for robust sorting, OR just update the schema to have an upvoteCount.
      // For simplicity, we'll sort by views or createdAt if we don't have upvoteCount as a real field.
      // To be robust, let's sort by `views` for 'Popular', or we can sort by `repliesCount`.
      sortObj = { views: -1, repliesCount: -1 };
    } else if (sort === 'Unanswered') {
      query.hasAcceptedAnswer = false;
      query.repliesCount = 0;
    } else if (sort === 'Most Helpful' || sort === 'Highest Score') {
      sortObj = { hasAcceptedAnswer: -1, views: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // If sorting requires aggregation (like array length), we should ideally use aggregate.
    // For MVP, we will just use `find` and sort by standard fields.

    let discussions;
    
    if (sort === 'Popular' || sort === 'Best') {
      // Aggregate to sort by upvotes array length
      discussions = await Discussion.aggregate([
        { $match: query },
        {
          $addFields: {
            upvoteCountReal: { $size: { $ifNull: ["$upvotes", []] } }
          }
        },
        { $sort: { upvoteCountReal: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
      ]);
      
      // Populate author
      await Discussion.populate(discussions, { path: 'author', select: 'name email' });
    } else {
      discussions = await Discussion.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name email');
    }

    const total = await Discussion.countDocuments(query);

    res.json({
      discussions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new discussion
router.post('/problem/:problemId', protect, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, content, type, tags } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ message: 'Title, content, and type are required' });
    }

    const discussion = new Discussion({
      problemId: Number(problemId),
      author: req.user.id,
      title,
      content,
      type,
      tags: tags || [],
    });

    const saved = await discussion.save();
    await saved.populate('author', 'name email');

    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single discussion + replies
router.get('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    const replies = await Reply.find({ discussionId: discussion._id })
      .sort({ isAccepted: -1, createdAt: 1 })
      .populate('author', 'name email');

    res.json({ discussion, replies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Edit discussion
router.put('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this discussion' });
    }

    const { title, content, type, tags } = req.body;
    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (type) discussion.type = type;
    if (tags) discussion.tags = tags;

    const updated = await discussion.save();
    await updated.populate('author', 'name email');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete discussion
router.delete('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }

    await discussion.deleteOne();
    // Also delete associated replies
    await Reply.deleteMany({ discussionId: discussion._id });

    res.json({ message: 'Discussion removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Toggle Upvote Discussion
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const userId = req.user.id;
    const isUpvoted = discussion.upvotes.includes(userId);

    if (isUpvoted) {
      // Remove upvote
      discussion.upvotes = discussion.upvotes.filter((id) => id.toString() !== userId);
    } else {
      // Add upvote
      discussion.upvotes.push(userId);
    }

    await discussion.save();
    res.json({ upvotes: discussion.upvotes, upvoteCount: discussion.upvotes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --------------------------------------------------------
// Replies
// --------------------------------------------------------

// Create a reply
router.post('/:id/replies', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = new Reply({
      discussionId: discussion._id,
      author: req.user.id,
      content,
    });

    const saved = await reply.save();
    
    // Update discussion replies count
    discussion.repliesCount += 1;
    await discussion.save();

    await saved.populate('author', 'name email');

    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Edit reply
router.put('/replies/:replyId', protect, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (reply.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this reply' });
    }

    if (req.body.content) {
      reply.content = req.body.content;
    }

    const updated = await reply.save();
    await updated.populate('author', 'name email');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete reply
router.delete('/replies/:replyId', protect, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (reply.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    const discussionId = reply.discussionId;
    await reply.deleteOne();

    // Decrement repliesCount
    await Discussion.findByIdAndUpdate(discussionId, { $inc: { repliesCount: -1 } });

    res.json({ message: 'Reply removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Toggle Upvote Reply
router.post('/replies/:replyId/upvote', protect, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const userId = req.user.id;
    const isUpvoted = reply.upvotes.includes(userId);

    if (isUpvoted) {
      reply.upvotes = reply.upvotes.filter((id) => id.toString() !== userId);
    } else {
      reply.upvotes.push(userId);
    }

    await reply.save();
    res.json({ upvotes: reply.upvotes, upvoteCount: reply.upvotes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Accept answer
router.put('/replies/:replyId/accept', protect, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const discussion = await Discussion.findById(reply.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Only discussion author can accept an answer
    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept answer for this discussion' });
    }

    // Toggle logic (un-accept if already accepted)
    if (reply.isAccepted) {
      reply.isAccepted = false;
      discussion.hasAcceptedAnswer = false;
    } else {
      // First, un-accept any previously accepted reply for this discussion
      await Reply.updateMany(
        { discussionId: discussion._id, isAccepted: true },
        { $set: { isAccepted: false } }
      );
      
      reply.isAccepted = true;
      discussion.hasAcceptedAnswer = true;
    }

    await reply.save();
    await discussion.save();

    res.json({ message: 'Answer status updated', isAccepted: reply.isAccepted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
