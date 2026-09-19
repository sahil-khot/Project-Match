import express from 'express';
import MentorProfile from '../models/MentorProfile.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/mentors
// Optimized MongoDB query with true pagination (Phase 32)
router.get('/', async (req, res) => {
  try {
    const { department, subject, availability, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (department && department !== 'All' && department !== 'All Departments') {
      query.department = new RegExp(department.trim(), 'i');
    }

    if (subject && subject !== 'All' && subject !== 'All Subjects') {
      query.$or = [
        { subjects: new RegExp(subject.trim(), 'i') },
        { expertise: new RegExp(subject.trim(), 'i') }
      ];
    }

    if (availability && availability !== 'All' && availability !== 'Availability') {
      query.availabilityStatus = availability;
    }

    if (search && search.trim()) {
      const s = search.trim();
      // Also match user names
      const matchingUsers = await User.find({
        role: 'mentor',
        name: new RegExp(s, 'i')
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      const searchConditions = [
        { department: new RegExp(s, 'i') },
        { expertise: new RegExp(s, 'i') },
        { subjects: new RegExp(s, 'i') }
      ];
      if (userIds.length > 0) {
        searchConditions.push({ user: { $in: userIds } });
      }

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, mentors, allForStats] = await Promise.all([
      MentorProfile.countDocuments(query),
      MentorProfile.find(query)
        .populate('user', 'name email avatar verificationStatus isActive department college')
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MentorProfile.find().select('availabilityStatus rating subjects').lean()
    ]);

    // Compute genuine statistics from active DB records
    const uniqueSubjects = new Set();
    let totalRatings = 0;
    let ratedCount = 0;

    allForStats.forEach(m => {
      if (Array.isArray(m.subjects)) m.subjects.forEach(s => uniqueSubjects.add(s));
      if (typeof m.rating === 'number') {
        totalRatings += m.rating;
        ratedCount++;
      }
    });

    const avgRating = ratedCount > 0 ? Number((totalRatings / ratedCount).toFixed(1)) : 5.0;

    const stats = {
      totalFaculty: allForStats.length,
      subjectsCovered: uniqueSubjects.size,
      availableNow: allForStats.filter(m => m.availabilityStatus === 'Available').length,
      averageRating: avgRating
    };

    res.json({
      success: true,
      stats,
      count: mentors.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPreviousPage: pageNum > 1
      },
      mentors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/mentors/request
router.post('/request', protect, async (req, res) => {
  try {
    const { mentorId, subject, message, coverNote } = req.body;
    const noteText = coverNote || message || (subject ? `Requesting mentorship in ${subject}` : 'Requesting mentorship for project guidance.');

    const mentorProfile = await MentorProfile.findOne({
      $or: [{ user: mentorId }, { _id: mentorId }]
    }).populate('user', 'name email department college');

    if (!mentorProfile || !mentorProfile.user) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found.' });
    }

    const actualMentorUserId = mentorProfile.user._id;

    // Check duplicate
    const existing = await Application.findOne({
      applicant: req.user._id,
      mentor: actualMentorUserId,
      type: 'Mentorship Request',
      status: { $in: ['Pending', 'In Review'] }
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have an active mentorship request with this mentor.' });
    }

    const application = await Application.create({
      applicant: req.user._id,
      sender: req.user._id,
      recipient: actualMentorUserId,
      mentor: actualMentorUserId,
      type: 'Mentorship Request',
      title: `Mentorship: ${subject || mentorProfile.department}`,
      targetName: mentorProfile.user.name,
      category: mentorProfile.department,
      tags: mentorProfile.expertise?.slice(0, 3) || ['Research', 'Engineering'],
      coverNote: noteText,
      status: 'In Review'
    });

    await Notification.create({
      recipient: actualMentorUserId,
      type: 'mentorship',
      title: 'New Mentorship Request',
      message: `${req.user.name} submitted a mentorship request: "${noteText.slice(0, 100)}"`,
      link: '/mentor/requests'
    });

    res.status(201).json({ success: true, message: 'Mentorship request sent successfully.', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
