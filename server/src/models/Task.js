import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: 120
  },
  description: { type: String, default: '', maxlength: 2000 },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  deadline: { type: Date, required: [true, 'Deadline is required'] },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Submitted', 'Under Review', 'Changes Requested', 'Approved', 'Completed'],
    default: 'To Do',
    index: true
  },
  submissionNotes: { type: String, default: '' },
  submissionAttachment: { type: String, default: '' },
  mentorFeedback: { type: String, default: '' },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: { type: Date }
}, { timestamps: true });

taskSchema.index({ project: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
