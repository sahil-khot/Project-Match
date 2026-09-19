import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  problemStatement: { type: String, default: '', maxlength: 1000 },
  goals: { type: String, default: '', maxlength: 1000 },
  domain: { type: String, default: 'AI/ML' },
  department: { type: String, default: 'Computer Engineering' },
  college: { type: String, default: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati" },
  techStack: [{ type: String }],
  requiredSkills: [{ type: String }],
  teamSize: { type: Number, default: 4, min: 1, max: 10 },
  openPositions: { type: Number, default: 3, min: 0, max: 10 },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  groupLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['Leader', 'Member'], default: 'Member' },
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['Idea', 'Recruiting', 'Active', 'In Progress', 'Completed', 'On Hold', 'Archived'],
    default: 'Recruiting',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  deadline: { type: Date },
  image: { type: String, default: '' },
  githubRepo: { type: String, default: '' },
  demoUrl: { type: String, default: '' }
}, { timestamps: true });

projectSchema.index({ department: 1, status: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ domain: 1 });

export default mongoose.model('Project', projectSchema);
