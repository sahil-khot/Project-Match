import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import MentorProfile from "../models/MentorProfile.js";
import AuditLog from "../models/AuditLog.js";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const VALID_STATUS_TRANSITIONS = {
  Idea: ["Recruiting", "Archived"],
  Recruiting: ["Active", "Idea", "Archived"],
  Active: ["In Progress", "Recruiting", "Completed", "Archived"],
  "In Progress": ["Completed", "Active", "Archived"],
  Completed: ["Archived", "In Progress"],
  Archived: ["Idea", "Active"],
};

// @route GET /api/projects/my
// Must be registered before /:id to avoid collision
router.get("/my", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { creator: req.user._id },
        { groupLeader: req.user._id },
        { "members.user": req.user._id },
        { mentor: req.user._id },
      ],
    })
      .populate("creator", "name email avatar")
      .populate("groupLeader", "name email avatar")
      .populate("mentor", "name email avatar department college")
      .populate("members.user", "name email avatar department")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/projects/explore and GET /api/projects
const getProjectsHandler = async (req, res) => {
  try {
    const { domain, status, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (domain && domain !== "All") {
      query.domain = new RegExp(domain, "i");
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      const s = new RegExp(search, "i");
      query.$or = [
        { title: s },
        { description: s },
        { domain: s },
        { requiredSkills: s },
        { techStack: s },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate("creator", "name email avatar")
      .populate("groupLeader", "name email avatar")
      .populate("mentor", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      count: projects.length,
      total,
      projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.get("/explore", getProjectsHandler);
router.get("/", getProjectsHandler);

// @route GET /api/projects/:id
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("creator", "name email avatar")
      .populate("groupLeader", "name email avatar")
      .populate("mentor", "name email avatar department college")
      .populate("members.user", "name email avatar department");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate("reviewer", "name email avatar")
      .sort({ deadline: 1 });

    res.json({ success: true, project, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/projects
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      problemStatement,
      goals,
      domain,
      techStack,
      requiredSkills,
      teamSize,
      openPositions,
      deadline,
      image,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title and description are required.",
        });
    }

    const maxTeamSize = Math.max(1, Math.min(10, parseInt(teamSize, 10) || 4));
    const openSpots =
      openPositions !== undefined
        ? Math.max(0, Math.min(maxTeamSize - 1, parseInt(openPositions, 10)))
        : maxTeamSize - 1;

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      problemStatement: problemStatement ? problemStatement.trim() : "",
      goals: goals ? goals.trim() : "",
      domain: domain || "AI/ML",
      department: req.user.department || "Computer Engineering",
      college:
        req.user.college ||
        "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati",
      techStack: Array.isArray(techStack)
        ? techStack
        : techStack
          ? techStack
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills
          ? requiredSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      teamSize: maxTeamSize,
      openPositions: openSpots,
      deadline: deadline
        ? new Date(deadline)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      image: image || "",
      creator: req.user._id,
      groupLeader: req.user._id,
      members: [{ user: req.user._id, role: "Leader" }],
      status: openSpots > 0 ? "Recruiting" : "Active",
      progress: 0,
    });

    const populated = await Project.findById(project._id)
      .populate("creator", "name email avatar")
      .populate("groupLeader", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(201).json({ success: true, project: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/projects/:id
// Edit project info (Resource RBAC: Creator, Group Leader, or Admin)
router.put("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const isAuthorized =
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader &&
        project.groupLeader.toString() === req.user._id.toString()) ||
      req.user.role === "admin";

    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Only the project creator or group leader can edit this project.",
        });
    }

    const updatableFields = [
      "title",
      "description",
      "problemStatement",
      "goals",
      "domain",
      "techStack",
      "requiredSkills",
      "teamSize",
      "openPositions",
      "deadline",
      "image",
      "githubRepo",
      "demoUrl",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("creator", "name email avatar")
      .populate("groupLeader", "name email avatar")
      .populate("mentor", "name email avatar department")
      .populate("members.user", "name email avatar");

    res.json({ success: true, project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/projects/:id/status
// Controlled lifecycle state transitions
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const isAuthorized =
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader &&
        project.groupLeader.toString() === req.user._id.toString()) ||
      (project.mentor &&
        project.mentor.toString() === req.user._id.toString()) ||
      req.user.role === "admin";

    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to change project status.",
        });
    }

    const allowedNext = VALID_STATUS_TRANSITIONS[project.status] || [];
    if (!allowedNext.includes(status) && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${project.status}' to '${status}'. Allowed: ${allowedNext.join(", ")}`,
      });
    }

    project.status = status;
    await project.save();

    res.json({
      success: true,
      message: `Project status updated to ${status}`,
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/projects/:id/members
// Add member (Resource RBAC: Creator, Group Leader, or Admin)
router.post("/:id/members", protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Project not found",
          code: "PROJECT_NOT_FOUND",
        });
    }

    const isAuthorized =
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader &&
        project.groupLeader.toString() === req.user._id.toString()) ||
      req.user.role === "admin";

    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add members to this project.",
          code: "FORBIDDEN",
        });
    }

    if (project.status === "Completed" || project.status === "Archived") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot add members to a completed or archived project.",
          code: "PROJECT_INACTIVE",
        });
    }

    if (project.members.length >= project.teamSize) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Project has reached its maximum team size capacity.",
          code: "TEAM_FULL",
        });
    }

    // Phase 10 Validation: Verify target user exists, is active, is a student
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.isActive === false) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Target user account is invalid or deactivated.",
          code: "INVALID_USER",
        });
    }

    if (targetUser.role !== "student") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only student accounts can be added as team members.",
          code: "INVALID_MEMBER_ROLE",
        });
    }

    const isMember = project.members.some((m) => m.user.toString() === userId);
    if (isMember) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already a team member.",
          code: "ALREADY_MEMBER",
        });
    }

    // Always add as Member; prevent client role injection
    project.members.push({ user: userId, role: "Member" });
    if (project.openPositions > 0) {
      project.openPositions -= 1;
    }
    if (project.openPositions === 0 && project.status === "Recruiting") {
      project.status = "Active";
    }

    await project.save();

    await Notification.create({
      recipient: userId,
      type: "team",
      title: "Added to Project Team",
      message: `You have been added to the project "${project.title}"`,
    });

    const updated = await Project.findById(project._id).populate(
      "members.user",
      "name email avatar department",
    );

    res.json({ success: true, project: updated });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

// @route DELETE /api/projects/:id/members/:memberId
router.delete("/:id/members/:memberId", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({
          success: false,
          message: "Project not found",
          code: "PROJECT_NOT_FOUND",
        });

    const memberId = req.params.memberId;
    const isSelf = req.user._id.toString() === memberId;
    const isLeader =
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader &&
        project.groupLeader.toString() === req.user._id.toString()) ||
      req.user.role === "admin";

    if (!isSelf && !isLeader) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to remove this member.",
          code: "FORBIDDEN",
        });
    }

    // Phase 11 Member Removal Integrity: Prevent project from becoming leaderless
    const isTargetLeader =
      (project.groupLeader && project.groupLeader.toString() === memberId) ||
      project.creator.toString() === memberId;

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberId,
    );

    if (isTargetLeader) {
      if (project.members.length > 0) {
        // Automatically transfer leadership to the next remaining member
        project.groupLeader = project.members[0].user;
        project.members[0].role = "Leader";

        await Notification.create({
          recipient: project.groupLeader,
          type: "team",
          title: "Promoted to Group Leader",
          message: `You are now the team leader for project "${project.title}".`,
        });
      } else {
        project.status = "Archived";
      }
    }

    if (
      project.openPositions < project.teamSize &&
      project.status !== "Archived"
    ) {
      project.openPositions += 1;
    }

    await project.save();

    // Clean up active task assignments: unassign tasks without destroying history
    await Task.updateMany(
      {
        project: project._id,
        assignedTo: memberId,
        status: { $nin: ["Approved", "Completed"] },
      },
      { $set: { assignedTo: null, status: "To Do" } },
    );

    // Notify removed member
    if (!isSelf) {
      await Notification.create({
        recipient: memberId,
        type: "team",
        title: "Removed from Project Team",
        message: `You have been removed from "${project.title}".`,
      });
    }

    res.json({
      success: true,
      message: "Member removed successfully",
      project,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

// @route POST /api/projects/:id/assign-mentor
router.post("/:id/assign-mentor", protect, async (req, res) => {
  try {
    const { mentorId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Project not found",
          code: "PROJECT_NOT_FOUND",
        });
    }

    const isAuthorized =
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader &&
        project.groupLeader.toString() === req.user._id.toString()) ||
      req.user._id.toString() === mentorId ||
      req.user.role === "admin";

    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to assign mentor to this project.",
          code: "FORBIDDEN",
        });
    }

    // Phase 12 Security: Verify mentorId belongs to an actual active user with role: 'mentor'
    const targetMentor = await User.findById(mentorId);
    if (
      !targetMentor ||
      targetMentor.isActive === false ||
      targetMentor.role !== "mentor"
    ) {
      return res.status(400).json({
        success: false,
        message: "Specified user is not a verified faculty mentor.",
        code: "INVALID_MENTOR",
      });
    }

    project.mentor = mentorId;
    await project.save();

    // Create Audit Log
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: "MENTOR_ASSIGNED",
      targetUser: mentorId,
      targetResource: project._id.toString(),
      details: { projectTitle: project.title, mentorName: targetMentor.name },
      ipAddress: req.ip || "",
    }).catch((err) => console.error("AuditLog error:", err));

    await Notification.create({
      recipient: mentorId,
      type: "mentorship",
      title: "Assigned as Project Mentor",
      message: `You have been assigned as mentor for project "${project.title}"`,
    });

    res.json({
      success: true,
      message: "Mentor assigned successfully",
      project,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

// @route POST /api/projects/:id/apply
// Direct apply helper to satisfy ExploreProjects.jsx
router.post("/:id/apply", protect, async (req, res) => {
  try {
    const { coverNote } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (project.creator.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot apply to your own project.",
        });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (isMember) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You are already a member of this project.",
        });
    }

    if (
      project.openPositions <= 0 ||
      project.status === "Completed" ||
      project.status === "Archived"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This project is currently not accepting applications.",
        });
    }

    const existingApp = await Application.findOne({
      applicant: req.user._id,
      project: project._id,
      status: { $in: ["Pending", "In Review"] },
    });

    if (existingApp) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "You have already submitted an active application for this project.",
        });
    }

    const application = await Application.create({
      applicant: req.user._id,
      project: project._id,
      type: "Project Application",
      title: project.title,
      targetName: project.title,
      category: project.domain || "Engineering",
      tags: project.requiredSkills?.slice(0, 3) || ["React", "Node.js"],
      coverNote: coverNote || "",
      status: "In Review",
    });

    // Notify project leader
    const targetRecipient = project.groupLeader || project.creator;
    if (targetRecipient) {
      await Notification.create({
        recipient: targetRecipient,
        type: "application",
        title: "New Project Application Received",
        message: `${req.user.name} applied to join "${project.title}"`,
      });
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Application submitted successfully",
        application,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/projects/:id
// Delete project (Resource RBAC: Creator, Group Leader, or Admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
        code: "PROJECT_NOT_FOUND",
      });
    }

    const isAuthorized =
      project.creator.toString() === req.user._id.toString() ||
      (project.groupLeader &&
        project.groupLeader.toString() === req.user._id.toString()) ||
      req.user.role === "admin";

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Only the project creator or group leader can delete this project.",
        code: "FORBIDDEN",
      });
    }

    // Cascade delete tasks and applications associated with this project
    await Task.deleteMany({ project: project._id });
    await Application.deleteMany({ project: project._id });

    // Clean up team messages
    await Message.deleteMany({ project: project._id });

    // Notify project members (excluding the actor)
    const memberIds = (project.members || [])
      .map((m) => m.user?.toString())
      .filter((id) => id && id !== req.user._id.toString());

    if (memberIds.length > 0) {
      await Notification.insertMany(
        memberIds.map((memberId) => ({
          recipient: memberId,
          type: "team",
          title: "Project Deleted",
          message: `The project "${project.title}" has been deleted by the project owner.`,
        }))
      ).catch(() => {});
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully",
      projectId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "SERVER_ERROR",
    });
  }
});

export default router;
