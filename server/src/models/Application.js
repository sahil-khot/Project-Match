import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    enum: ['Project Application', 'Mentorship Request', 'Team Invitation'],
    default: 'Project Application'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Review', 'Accepted', 'Rejected', 'Withdrawn'],
    default: 'In Review',
    index: true
  },
  title: { type: String, required: true },
  targetName: { type: String, default: '' },
  category: { type: String, default: 'Web Development' },
  tags: [{ type: String }],
  coverNote: { type: String, default: '', maxlength: 2000 },
  feedback: { type: String, default: '', maxlength: 1000 },
  appliedDate: { type: Date, default: Date.now },
  decisionDate: { type: Date }
}, { timestamps: true });

applicationSchema.index({ applicant: 1, project: 1, status: 1 });
applicationSchema.index({ mentor: 1, status: 1 });

// Prevent duplicate active applications at database level (Phase 15)
applicationSchema.index(
  { applicant: 1, project: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Pending', 'In Review'] },
      project: { $exists: true, $ne: null }
    }
  }
);

export default mongoose.model('Application', applicationSchema);
