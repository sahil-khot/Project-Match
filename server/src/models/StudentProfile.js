import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Info
  phone: { type: String, default: '' },
  dob: { type: String, default: '' },
  location: { type: String, default: '' },
  college: { type: String, default: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati" },
  department: { type: String, default: 'Computer Engineering' },
  studentId: { type: String, default: '' },
  semester: { type: String, default: '' },
  year: { type: Number, default: 1, min: 1, max: 4 }, // numeric year 1-4
  academicYear: { type: String, default: '1st Year' },
  currentYear: { type: String, default: '1st Year' },
  graduationYear: { type: String, default: '2028' },
  cgpa: { type: Number, default: null, min: 0, max: 10 },
  bio: { type: String, default: '' },
  quote: { type: String, default: '' },

  // Skills
  skills: [{ type: String }],
  technicalSkills: [{ type: String }],
  softSkills: [{ type: String }],
  interests: [{ type: String }],
  preferredDomains: [{ type: String }],

  // Experience
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  hackathonExperience: { type: Boolean, default: false },
  hackathonCount: { type: Number, default: 0 },
  researchExperience: { type: Boolean, default: false },
  internshipExperience: { type: Boolean, default: false },
  projectsCompleted: { type: Number, default: 0 },
  projectsInProgress: { type: Number, default: 0 },

  // Collaboration preferences
  preferredRoles: [{ type: String }],
  lookingFor: [{ type: String }],
  availability: {
    type: String,
    enum: ['Available', 'Available for Projects', 'Available for Team', 'Busy', 'Not Available'],
    default: 'Available'
  },
  weeklyHours: { type: Number, default: 10, min: 0, max: 60 },
  preferredTeamSize: { type: Number, default: 4, min: 2, max: 8 },
  preferredProjectTypes: [{ type: String }],

  // Social Links
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    email: { type: String, default: '' }
  },

  // Documents
  resumeUrl: { type: String, default: '' },
  marksheetUrl: { type: String, default: '' },
  resume: { type: String, default: '' },
  marksheet: { type: String, default: '' },

  // Achievements & Certifications
  achievements: [
    {
      title: { type: String },
      category: { type: String },
      year: { type: String },
      icon: { type: String }
    }
  ],
  certifications: [
    {
      title: { type: String },
      issuer: { type: String },
      year: { type: String }
    }
  ],
  pinnedProjects: [
    {
      title: { type: String },
      description: { type: String },
      status: { type: String, enum: ['Completed', 'In Progress', 'Idea'], default: 'Completed' },
      date: { type: String },
      tags: [{ type: String }],
      image: { type: String }
    }
  ],

  // Rankings & Metrics
  profileCompletion: { type: Number, default: 20 },
  rankIndividual: { type: Number, default: null },
  rankDepartment: { type: Number, default: null },
  rankOverall: { type: Number, default: null },
  submissionsCount: { type: Number, default: 0 },
  activeDays: { type: Number, default: 1 },
  maxStreak: { type: Number, default: 1 },
  isOnline: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for performance
studentProfileSchema.index({ skills: 1 });
studentProfileSchema.index({ technicalSkills: 1 });
studentProfileSchema.index({ department: 1 });
studentProfileSchema.index({ cgpa: -1 });
studentProfileSchema.index({ availability: 1 });
studentProfileSchema.index({ preferredRoles: 1 });
studentProfileSchema.index({ preferredDomains: 1 });
studentProfileSchema.index({ year: 1 });
studentProfileSchema.index({ experienceLevel: 1 });

export default mongoose.model('StudentProfile', studentProfileSchema);
