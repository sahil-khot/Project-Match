import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorName: { type: String, required: true },
  initialLetter: { type: String, default: 'P' },
  initialColor: { type: String, default: 'bg-purple-400' },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['All Posts', 'Project Ideas', 'Team Building', 'Tech Help', 'Opportunities'],
    default: 'Project Ideas',
    index: true
  },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      authorName: { type: String },
      text: { type: String, required: true, maxlength: 1000 },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

communityPostSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model('CommunityPost', communityPostSchema);
