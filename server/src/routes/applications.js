import express from 'express';
import Application from '../models/Application.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/applications/my
router.get('/my', protect, async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {
      $or: [
        { applicant: req.user._id },
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    };

    if (category && category !== 'All Applications' && category !== 'All') {
      if (category === 'Project Applications' || category === 'Projects') query.type = 'Project Application';
      else if (category === 'Mentorship Requests' || category === 'Mentorship') query.type = 'Mentorship Request';
      else if (category === 'Team Invitations' || category === 'Invitations') query.type = 'Team Invitation';
    }

    const sortOption = sort === 'Oldest First' ? { appliedDate: 1 } : { appliedDate: -1 };

    const applications = await Application.find(query)
      .populate('project', 'title domain status openPositions teamSize creator groupLeader')
      .populate('mentor', 'name email avatar department college')
      .populate('sender', 'name email avatar department college')
      .populate('recipient', 'name email avatar department college')
      .populate('applicant', 'name email avatar department college')
      .sort(sortOption);

    const allApps = await Application.find({
      $or: [
        { applicant: req.user._id },
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    });
    const stats = {
      total: allApps.length,
      inReview: allApps.filter(a => a.status === 'In Review' || a.status === 'Pending').length,
      accepted: allApps.filter(a => a.status === 'Accepted').length,
      rejected: allApps.filter(a => a.status === 'Rejected').length
    };

    res.json({ success: true, stats, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/applications
// General endpoint for Project Leaders and Mentors
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, type, status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (projectId) {
      // Phase 13: Strict project authorization check
      const project = await Project.findById(projectId).select('creator groupLeader mentor');
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const isLeader = project.creator?.toString() === req.user._id.toString() ||
        project.groupLeader?.toString() === req.user._id.toString();
      const isProjectMentor = project.mentor?.toString() === req.user._id.toString();
      const isAdmin = ['admin', 'principal'].includes(req.user.role);

      if (!isLeader && !isProjectMentor && !isAdmin) {
        // Normal student querying project applications -> Forbidden!
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view applications for projects you lead or mentor.'
        });
      }
      query.project = projectId;
    } else if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    } else if (req.user.role === 'student') {
      // Students can only see their own applications when no authorized projectId is specified
      query.applicant = req.user._id;
    }

    if (type) query.type = type;
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, applications] = await Promise.all([
      Application.countDocuments(query),
      Application.find(query)
        .populate('applicant', 'name email avatar department year')
        .populate('project', 'title domain status openPositions')
        .populate('mentor', 'name email avatar department')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.json({
      success: true,
      count: applications.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPreviousPage: pageNum > 1
      },
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/applications
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, mentorId, type, title, targetName, category, tags, coverNote, targetUserId, applicantId } = req.body;

    // Handle Team Invitation from Project Leader
    if (type === 'Team Invitation') {
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Project ID is required for team invitations.' });
      }
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const isLeader = project.creator.toString() === req.user._id.toString() ||
        (project.groupLeader && project.groupLeader.toString() === req.user._id.toString()) ||
        req.user.role === 'admin';

      if (!isLeader) {
        return res.status(403).json({ success: false, message: 'Only the project leader can send team invitations.' });
      }

      const invitedUserId = targetUserId || applicantId;
      if (!invitedUserId) {
        return res.status(400).json({ success: false, message: 'Target student is required for team invitation.' });
      }

      if (invitedUserId.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot invite yourself to your project.' });
      }

      const isMember = project.members.some(m => m.user.toString() === invitedUserId.toString());
      if (isMember) {
        return res.status(400).json({ success: false, message: 'Student is already a member of this project.' });
      }

      if (project.openPositions <= 0 || ['Completed', 'Archived'].includes(project.status)) {
        return res.status(400).json({ success: false, message: 'This project is currently not accepting new members.' });
      }

      const existing = await Application.findOne({
        project: projectId,
        type: 'Team Invitation',
        status: { $in: ['Pending', 'In Review'] },
        $or: [
          { applicant: invitedUserId },
          { recipient: invitedUserId }
        ]
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An active invitation has already been sent to this student for this project.' });
      }

      const invitedStudent = await User.findById(invitedUserId).select('name email avatar');
      const application = await Application.create({
        applicant: invitedUserId,
        sender: req.user._id,
        recipient: invitedUserId,
        project: projectId,
        type: 'Team Invitation',
        title: project.title,
        targetName: invitedStudent?.name || project.title,
        category: project.domain || 'Engineering',
        tags: project.requiredSkills?.slice(0, 3) || ['Teammate'],
        coverNote: coverNote || `Invitation from ${req.user.name} to join project "${project.title}".`,
        status: 'In Review'
      });

      await Notification.create({
        recipient: invitedUserId,
        type: 'team',
        title: 'New Team Invitation',
        message: `${req.user.name} invited you to join "${project.title}"`,
        link: '/student/my-applications'
      });

      return res.status(201).json({ success: true, application });
    }

    // 1. If project application, run validations
    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      if (project.creator.toString() === req.user._id.toString() ||
          (project.groupLeader && project.groupLeader.toString() === req.user._id.toString())) {
        return res.status(400).json({ success: false, message: 'You cannot apply to your own project.' });
      }

      const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
      if (isMember) {
        return res.status(400).json({ success: false, message: 'You are already a member of this project.' });
      }

      if (project.openPositions <= 0 || ['Completed', 'Archived'].includes(project.status)) {
        return res.status(400).json({ success: false, message: 'This project is currently not accepting applications.' });
      }

      const existing = await Application.findOne({
        applicant: req.user._id,
        project: projectId,
        status: { $in: ['Pending', 'In Review'] }
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'You already have an active application for this project.' });
      }
    }

    // 2. If mentorship request, validate duplicate
    if (mentorId) {
      const existingMentorship = await Application.findOne({
        applicant: req.user._id,
        mentor: mentorId,
        type: 'Mentorship Request',
        status: { $in: ['Pending', 'In Review'] }
      });
      if (existingMentorship) {
        return res.status(409).json({ success: false, message: 'You already have a pending mentorship request with this faculty member.' });
      }
    }

    const recipientUser = project ? (project.groupLeader || project.creator) : (mentorId || null);
    const application = await Application.create({
      applicant: req.user._id,
      sender: req.user._id,
      recipient: recipientUser,
      project: projectId || null,
      mentor: mentorId || null,
      type: type || (mentorId ? 'Mentorship Request' : 'Project Application'),
      title: title || (project ? project.title : 'Application'),
      targetName: targetName || (project ? project.title : ''),
      category: category || (project ? project.domain : 'Engineering'),
      tags: Array.isArray(tags) ? tags : ['General'],
      coverNote: coverNote || '',
      status: 'In Review'
    });

    // Deep-linked notification to project leader or mentor (Phase 24)
    if (project) {
      const recipientId = project.groupLeader || project.creator;
      if (recipientId) {
        await Notification.create({
          recipient: recipientId,
          type: 'application',
          title: 'New Project Application',
          message: `${req.user.name} applied for "${project.title}"`,
          link: `/student/projects/${project._id}`
        });
      }
    } else if (mentorId) {
      await Notification.create({
        recipient: mentorId,
        type: 'mentorship',
        title: 'New Mentorship Request',
        message: `${req.user.name} requested mentorship in ${category || 'Research'}`,
        link: `/mentor/requests`
      });
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An active application already exists for this project.'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/applications/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only allow state transition if application is currently active (Pending or In Review)
    if (!['Pending', 'In Review'].includes(application.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot update application with terminal status '${application.status}'.`
      });
    }

    // Authorization check: Only project leader/creator or target mentor can review
    let isAuthorized = false;
    let project = null;

    if (application.project) {
      project = await Project.findById(application.project);
      if (project) {
        isAuthorized = project.creator?.toString() === req.user._id.toString() ||
          (project.groupLeader && project.groupLeader.toString() === req.user._id.toString());
      }
    }

    if (application.mentor) {
      if (application.mentor.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
    }

    if (['admin', 'principal'].includes(req.user.role)) isAuthorized = true;

    // Student can only withdraw their own application
    if (status === 'Withdrawn' && application.applicant.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }

    // For Team Invitation, the invited student can accept or reject
    if (application.type === 'Team Invitation' && application.applicant.toString() === req.user._id.toString()) {
      if (['Accepted', 'Rejected', 'Withdrawn'].includes(status)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this application.' });
    }

    // Acceptance handling
    if (status === 'Accepted' && project) {
      if (application.type === 'Mentorship Request') {
        // Assign mentor to the project
        project.mentor = req.user._id;
        await project.save();
      } else {
        // Atomic race-condition safe member addition on Acceptance (Phase 14 & 47)
        const updatedProject = await Project.findOneAndUpdate(
          {
            _id: project._id,
            openPositions: { $gt: 0 },
            'members.user': { $ne: application.applicant }
          },
          {
            $push: { members: { user: application.applicant, role: 'Member', joinedAt: new Date() } },
            $inc: { openPositions: -1 }
          },
          { new: true }
        );

        if (!updatedProject) {
          return res.status(409).json({
            success: false,
            message: 'Cannot accept application: Project has no open positions or applicant is already a member.'
          });
        }

        if (updatedProject.openPositions === 0 && updatedProject.status === 'Recruiting') {
          updatedProject.status = 'Active';
          await updatedProject.save();
        }
      }
    }

    application.status = status;
    if (feedback) application.feedback = feedback;
    application.decisionDate = new Date();

    await application.save();

    // Deep-linked notification to applicant (Phase 24)
    if (status !== 'Withdrawn') {
      await Notification.create({
        recipient: application.applicant,
        type: application.type === 'Mentorship Request' ? 'mentorship' : 'application',
        title: `Application ${status}`,
        message: `Your application "${application.title}" has been ${status.toLowerCase()}.${feedback ? ` Note: "${feedback}"` : ''}`,
        link: '/student/my-applications'
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/applications/:id
// Remove/delete application (applicant, project leader, mentor, or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    let isAuthorized = application.applicant?.toString() === req.user._id.toString() ||
      application.sender?.toString() === req.user._id.toString() ||
      application.recipient?.toString() === req.user._id.toString() ||
      ['admin', 'principal'].includes(req.user.role);

    if (!isAuthorized && application.project) {
      const project = await Project.findById(application.project);
      if (project) {
        isAuthorized = project.creator?.toString() === req.user._id.toString() ||
          (project.groupLeader && project.groupLeader.toString() === req.user._id.toString());
      }
    }

    if (!isAuthorized && application.mentor) {
      isAuthorized = application.mentor.toString() === req.user._id.toString();
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this application.' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Application deleted successfully.',
      applicationId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
