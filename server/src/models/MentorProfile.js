import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  designation: { type: String, default: 'Assistant Professor' },
  department: { type: String, default: 'Computer Engineering' },
  college: { type: String, default: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati" },
  expertise: [{ type: String }],
  subjects: [{ type: String }],
  researchAreas: [{ type: String }],
  researchInterests: [{ type: String }],
  preferredProjectDomains: [{ type: String }],
  experienceYears: { type: Number, default: 5 },
  officeHours: { type: String, default: 'Mon-Fri, 10:00 AM – 12:00 PM' },
  availabilityStatus: {
    type: String,
    enum: ['Available', 'Busy'],
    default: 'Available'
  },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  studentsMentoredCount: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  profileVerified: { type: Boolean, default: true }
}, { timestamps: true });

mentorProfileSchema.index({ department: 1 });
mentorProfileSchema.index({ expertise: 1 });
mentorProfileSchema.index({ researchAreas: 1 });
mentorProfileSchema.index({ availabilityStatus: 1 });
mentorProfileSchema.index({ preferredProjectDomains: 1 });

export default mongoose.model('MentorProfile', mentorProfileSchema);
