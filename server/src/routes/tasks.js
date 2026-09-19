import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const recalculateProgress = async (projectId) => {
  const allTasks = await Task.find({ project: projectId });
  if (allTasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return 0;
  }
  const approved = allTasks.filter(t => t.status === 'Approved' || t.status === 'Completed').length;
  const progress = Math.min(100, Math.round((approved / allTasks.length) * 100));
  await Project.findByIdAndUpdate(projectId, { progress });
  return progress;
};

// @route GET /api/tasks
// Supports query parameters ?projectId=... and ?status=...
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, status, assignedTo, page = 1, limit = 50 } = req.query;
    let query = {};

    if (projectId) {
      // Phase 17: IDOR Protection on Project Tasks
      const project = await Project.findById(projectId).select('members creator groupLeader mentor');
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
      const isLeader = project.creator?.toString() === req.user._id.toString() ||
        project.groupLeader?.toString() === req.user._id.toString();
      const isMentor = project.mentor?.toString() === req.user._id.toString();
      const isAdmin = ['admin', 'principal'].includes(req.user.role);

      if (!isMember && !isLeader && !isMentor && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view tasks for this project.' });
      }
      query.project = projectId;
    } else if (req.user.role === 'student') {
      // If student didn't specify a project, only return tasks assigned to them or created by them
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    if (status) {
      query.status = status;
    }
    if (assignedTo && req.user.role !== 'student') {
      query.assignedTo = assignedTo;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, tasks] = await Promise.all([
      Task.countDocuments(query),
      Task.find(query)
        .populate('assignedTo', 'name email avatar department')
        .populate('createdBy', 'name email avatar')
        .populate('reviewer', 'name email avatar')
        .populate('project', 'title progress')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    res.json({
      success: true,
      count: tasks.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPreviousPage: pageNum > 1
      },
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/tasks/project/:projectId
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).select('members creator groupLeader mentor');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    const isLeader = project.creator?.toString() === req.user._id.toString() ||
      project.groupLeader?.toString() === req.user._id.toString();
    const isMentor = project.mentor?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'principal'].includes(req.user.role);

    if (!isMember && !isLeader && !isMentor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view tasks for this project.' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email avatar')
      .populate('reviewer', 'name email avatar')
      .sort({ deadline: 1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/tasks
// Create task (Resource RBAC: Project Creator, Group Leader, or Mentor)
router.post('/', protect, async (req, res) => {
  try {
    const targetProjectId = req.body.projectId || req.body.project;
    const { title, description, assignedTo, priority, deadline } = req.body;

    if (!targetProjectId || !title || !deadline) {
      return res.status(400).json({ success: false, message: 'Project ID, title, and deadline are required.' });
    }

    const project = await Project.findById(targetProjectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isAuthorized = project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader && project.groupLeader.toString() === req.user._id.toString()) ||
      (project.mentor && project.mentor.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Only project leaders or mentors can create tasks.' });
    }

    const task = await Task.create({
      project: targetProjectId,
      title: title.trim(),
      description: description || '',
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      deadline: new Date(deadline),
      status: 'To Do'
    });

    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignedTo,
        type: 'task',
        title: 'New Task Assigned',
        message: `You were assigned "${title}" in "${project.title}" by ${req.user.name}`,
        link: `/student/projects/${project._id}`
      });
    }

    await recalculateProgress(targetProjectId);

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/tasks/:id/submit
// Student submits their assigned task
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const { submissionNotes, submissionAttachment } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isAssigned && !isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only submit tasks assigned to you.' });
    }

    // State machine: can submit from To Do, In Progress, or Changes Requested
    if (!['To Do', 'In Progress', 'Changes Requested'].includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit task from current status '${task.status}'.`
      });
    }

    task.status = 'Submitted';
    task.submissionNotes = submissionNotes || '';
    if (submissionAttachment) task.submissionAttachment = submissionAttachment;

    await task.save();

    const project = await Project.findById(task.project);
    const targetRecipient = project ? (project.mentor || project.groupLeader || project.creator) : null;
    if (targetRecipient) {
      await Notification.create({
        recipient: targetRecipient,
        type: 'task',
        title: 'Task Submitted for Review',
        message: `${req.user.name} submitted "${task.title}" for review.`,
        link: `/student/projects/${task.project}`
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, message: 'Task submitted for review', task: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/tasks/:id/review
// Mentor or Group Leader reviews task
router.put('/:id/review', protect, async (req, res) => {
  try {
    const { status, feedback, mentorFeedback } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isReviewer = (project.mentor && project.mentor.toString() === req.user._id.toString()) ||
      (project.groupLeader && project.groupLeader.toString() === req.user._id.toString()) ||
      project.creator.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isReviewer) {
      return res.status(403).json({ success: false, message: 'Only project mentors or leaders can review tasks.' });
    }

    const finalStatus = status === 'Approved' ? 'Approved' : 'Changes Requested';
    task.status = finalStatus;
    task.mentorFeedback = feedback || mentorFeedback || '';
    task.reviewer = req.user._id;
    task.reviewedAt = new Date();

    await task.save();

    const newProgress = await recalculateProgress(task.project);

    if (task.assignedTo) {
      await Notification.create({
        recipient: task.assignedTo,
        type: 'task',
        title: `Task Review: ${finalStatus}`,
        message: `Task "${task.title}" was reviewed by ${req.user.name}: "${task.mentorFeedback || 'No feedback'}"`,
        link: `/student/projects/${task.project}`
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('reviewer', 'name email avatar');

    res.json({
      success: true,
      message: `Task status set to ${finalStatus}`,
      task: populated,
      progress: newProgress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/tasks/:id/status
// Enforce formal Task State Machine (Phase 18)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isLeaderOrMentor = (
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader && project.groupLeader.toString() === req.user._id.toString()) ||
      (project.mentor && project.mentor.toString() === req.user._id.toString()) ||
      req.user.role === 'admin'
    );

    if (!isAssignee && !isLeaderOrMentor) {
      return res.status(403).json({ success: false, message: 'Not authorized to change task status.' });
    }

    // State machine transition validation (Phase 18)
    const allowedAssigneeTransitions = {
      'To Do': ['In Progress'],
      'In Progress': ['Submitted', 'To Do'],
      'Changes Requested': ['In Progress', 'Submitted']
    };

    if (isAssignee && !isLeaderOrMentor) {
      const allowed = allowedAssigneeTransitions[task.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Assignee cannot transition task from '${task.status}' directly to '${status}'.`
        });
      }
    } else if (isLeaderOrMentor) {
      // Leaders and mentors can move between workflow management states
      const validStatuses = ['To Do', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Changes Requested', 'Completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status '${status}'.` });
      }
    }

    task.status = status;
    if (status === 'Approved' || status === 'Changes Requested') {
      task.reviewer = req.user._id;
      task.reviewedAt = new Date();
    }

    await task.save();
    const progress = await recalculateProgress(task.project);

    res.json({ success: true, task, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/tasks/:id
// Task deletion with recalculateProgress (Phase 19)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const isAuthorized = project && (
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader && project.groupLeader.toString() === req.user._id.toString()) ||
      (project.mentor && project.mentor.toString() === req.user._id.toString()) ||
      (task.createdBy && task.createdBy.toString() === req.user._id.toString()) ||
      req.user.role === 'admin'
    );

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Only project leaders, mentors, task creators, or admins can delete tasks.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    const progress = await recalculateProgress(task.project);

    res.json({
      success: true,
      message: 'Task deleted successfully and project progress updated.',
      progress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
