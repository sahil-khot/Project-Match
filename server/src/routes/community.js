import express from 'express';
import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { communityLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route GET /api/community/posts
router.get('/posts', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (category && category !== 'All Posts' && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const s = search.toLowerCase();
      query.$or = [
        { title: new RegExp(s, 'i') },
        { content: new RegExp(s, 'i') },
        { tags: new RegExp(s, 'i') },
        { authorName: new RegExp(s, 'i') }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await CommunityPost.countDocuments(query);
    const posts = await CommunityPost.find(query)
      .populate('author', 'name email avatar role department')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      count: posts.length,
      total,
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/community/stats
// Real MongoDB data queries
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await CommunityPost.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });

    // Aggregate posts by category to generate authentic popular topics
    const categoryStats = await CommunityPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const popularTopics = categoryStats.map(c => ({
      name: c._id || 'General',
      count: c.count
    }));

    // Count opportunities specifically
    const opportunitiesCount = await CommunityPost.countDocuments({ category: 'Opportunities' });

    res.json({
      success: true,
      stats: {
        members: totalUsers > 0 ? totalUsers.toString() : '1',
        discussions: totalPosts,
        opportunities: opportunitiesCount,
        popularTopics: popularTopics.length > 0 ? popularTopics : [
          { name: 'Project Ideas', count: 0 },
          { name: 'Team Building', count: 0 },
          { name: 'Tech Help', count: 0 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/community/posts
router.post('/posts', protect, communityLimiter, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const colors = ['bg-purple-500', 'bg-emerald-500', 'bg-blue-500', 'bg-pink-500', 'bg-amber-500', 'bg-teal-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initial = req.user.name ? req.user.name.charAt(0).toUpperCase() : 'U';

    const post = await CommunityPost.create({
      author: req.user._id,
      authorName: req.user.name,
      initialLetter: initial,
      initialColor: randomColor,
      title: title.trim(),
      content: content.trim(),
      category: category || 'Project Ideas',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['General']),
      likes: [],
      comments: []
    });

    const populated = await CommunityPost.findById(post._id)
      .populate('author', 'name email avatar role department');

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/community/posts/:id
router.put('/posts/:id', protect, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = await CommunityPost.findById(req.params.id);

    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts.' });
    }

    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (category) post.category = category;
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);

    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/community/posts/:id
router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts.' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/community/posts/:id/like
// Atomic like / unlike prevention of race conditions (Phase 42)
router.post('/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.some(id => id.toString() === req.user._id.toString());
    const updateOp = isLiked
      ? { $pull: { likes: req.user._id } }
      : { $addToSet: { likes: req.user._id } };

    const updatedPost = await CommunityPost.findByIdAndUpdate(req.params.id, updateOp, { new: true });
    res.json({ success: true, likesCount: updatedPost.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const handleAddComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      authorName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Support BOTH singular and plural route paths for comments
router.post('/posts/:id/comment', protect, handleAddComment);
router.post('/posts/:id/comments', protect, handleAddComment);

// @route DELETE /api/community/posts/:id/comments/:commentId
router.delete('/posts/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.author.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ success: true, message: 'Comment deleted.', comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
