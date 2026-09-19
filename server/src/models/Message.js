import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: 5000
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  isTeamChat: {
    type: Boolean,
    default: false
  },
  attachments: [{ type: String }],
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, read: 1 });

export default mongoose.model('Message', messageSchema);
