import mongoose from 'mongoose';

const leaderboardSnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'Students'
  },
  department: {
    type: String,
    default: ''
  },
  period: {
    type: String,
    default: 'historical'
  },
  snapshotDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

leaderboardSnapshotSchema.index({ user: 1, category: 1, snapshotDate: -1 });
leaderboardSnapshotSchema.index({ category: 1, rank: 1 });

export default mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
