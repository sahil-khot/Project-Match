import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";
import { messageLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

function formatMsgTime(date) {
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// @route GET /api/messages/conversations
router.get("/conversations", protect, async (req, res) => {
  try {
    // Update caller's lastSeen heartbeat
    await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });

    // Find projects user is a member/leader/mentor of
    const userProjects = await Project.find({
      $or: [
        { creator: req.user._id },
        { groupLeader: req.user._id },
        { mentor: req.user._id },
        { "members.user": req.user._id },
      ],
    }).select("_id");
    const projectIds = userProjects.map((p) => p._id);

    const { type = 'dm' } = req.query; // 'dm', 'team', or 'all'. Default to 'dm' to keep DMs strictly separate
    let messageFilter = [];

    if (type === 'team') {
      messageFilter = [
        { project: { $in: projectIds }, isTeamChat: true }
      ];
    } else if (type === 'all') {
      messageFilter = [
        { sender: req.user._id },
        { recipient: req.user._id },
        { project: { $in: projectIds }, isTeamChat: true },
      ];
    } else {
      // Default: 'dm' - strictly direct messages between users
      messageFilter = [
        { sender: req.user._id, isTeamChat: { $ne: true } },
        { recipient: req.user._id, isTeamChat: { $ne: true } },
      ];
    }

    const messages = await Message.find({
      $and: [
        { deletedFor: { $ne: req.user._id } },
        { $or: messageFilter },
      ],
    })
      .populate("sender", "name email avatar lastSeen")
      .populate("recipient", "name email avatar lastSeen")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    const threadMap = new Map();

    messages.forEach((msg) => {
      const convId = msg.conversationId;
      if (!threadMap.has(convId)) {
        let otherUser =
          msg.sender._id.toString() === req.user._id.toString()
            ? msg.recipient
            : msg.sender;
        let isTeam = msg.isTeamChat;
        let name = isTeam
          ? msg.project
            ? `Team – ${msg.project.title}`
            : "Team Project Chat"
          : otherUser
            ? otherUser.name
            : "Unknown";
        let avatar = isTeam ? "" : otherUser ? otherUser.avatar : "";

        // Phase 23: Dynamic online status derived from lastSeen (< 5 mins)
        const isOnline = otherUser?.lastSeen
          ? Date.now() - new Date(otherUser.lastSeen).getTime() < 5 * 60 * 1000
          : false;

        threadMap.set(convId, {
          conversationId: convId,
          name,
          avatar,
          isTeamChat: isTeam,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          timeFormatted: formatMsgTime(msg.createdAt),
          unreadCount:
            !msg.read &&
            msg.recipient &&
            msg.recipient._id.toString() === req.user._id.toString()
              ? 1
              : 0,
          isOnline,
          otherUserId: otherUser ? otherUser._id : null,
          user: otherUser
            ? {
                _id: otherUser._id,
                name: otherUser.name,
                avatar: otherUser.avatar,
                lastSeen: otherUser.lastSeen,
              }
            : null,
        });
      } else {
        const existing = threadMap.get(convId);
        if (
          !msg.read &&
          msg.recipient &&
          msg.recipient._id.toString() === req.user._id.toString()
        ) {
          existing.unreadCount += 1;
        }
      }
    });

    res.json({
      success: true,
      count: threadMap.size,
      conversations: Array.from(threadMap.values()),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/messages/thread/:conversationId
// Secured: verifies user is participant or team member, with pagination (Phase 20 & 41)
router.get("/thread/:conversationId", protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check authorization: if DM, must contain user's ID
    if (conversationId.startsWith("dm_")) {
      const parts = conversationId.replace("dm_", "").split("_");
      if (
        !parts.includes(req.user._id.toString()) &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Access denied to this conversation.",
          });
      }
    } else if (conversationId.startsWith("team_")) {
      const projectId = conversationId.replace("team_", "");
      const project = await Project.findById(projectId);
      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found." });
      }

      const isMember =
        project.creator?.toString() === req.user._id.toString() ||
        (project.groupLeader &&
          project.groupLeader.toString() === req.user._id.toString()) ||
        (project.mentor &&
          project.mentor.toString() === req.user._id.toString()) ||
        project.members.some(
          (m) => m.user.toString() === req.user._id.toString(),
        );

      if (!isMember && req.user.role !== "admin") {
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not a member of this project team chat.",
          });
      }
    } else if (req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid conversation identifier format.",
        });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      conversationId,
      deletedFor: { $ne: req.user._id },
    };

    const [total, messages] = await Promise.all([
      Message.countDocuments(query),
      Message.find(query)
        .populate("sender", "name email avatar")
        .populate("recipient", "name email avatar")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    // Mark unread messages addressed to current user as read
    await Message.updateMany(
      { conversationId, recipient: req.user._id, read: false },
      { $set: { read: true } },
    );

    res.json({
      success: true,
      count: messages.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPreviousPage: pageNum > 1,
      },
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/messages/:userId
// Compatibility endpoint with strict verification
router.get("/:userId", protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const targetUser = await User.findById(otherUserId).select(
      "name email avatar lastSeen",
    );
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "Target user not found." });
    }

    const sortedIds = [req.user._id.toString(), otherUserId.toString()].sort();
    const conversationId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    const messages = await Message.find({
      conversationId,
      deletedFor: { $ne: req.user._id },
    })
      .populate("sender", "name email avatar")
      .populate("recipient", "name email avatar")
      .sort({ createdAt: 1 })
      .limit(100);

    await Message.updateMany(
      { conversationId, recipient: req.user._id, read: false },
      { $set: { read: true } },
    );

    res.json({
      success: true,
      conversationId,
      count: messages.length,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        avatar: targetUser.avatar,
        lastSeen: targetUser.lastSeen,
      },
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/messages
// Strict conversation ID derivation and participant validation (Phase 20)
router.post("/", protect, messageLimiter, async (req, res) => {
  try {
    const { recipientId, content, isTeamChat, projectId } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required." });
    }

    let convId;
    let verifiedRecipient = null;
    let verifiedProject = null;

    if (isTeamChat || projectId) {
      if (!projectId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Project ID is required for team chat messages.",
          });
      }
      verifiedProject = await Project.findById(projectId);
      if (!verifiedProject) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found." });
      }

      const isMember =
        verifiedProject.creator?.toString() === req.user._id.toString() ||
        (verifiedProject.groupLeader &&
          verifiedProject.groupLeader.toString() === req.user._id.toString()) ||
        (verifiedProject.mentor &&
          verifiedProject.mentor.toString() === req.user._id.toString()) ||
        verifiedProject.members.some(
          (m) => m.user.toString() === req.user._id.toString(),
        );

      if (!isMember && req.user.role !== "admin") {
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not a member of this project.",
          });
      }

      convId = `team_${projectId}`;
    } else {
      if (!recipientId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Recipient ID is required for direct messages.",
          });
      }
      verifiedRecipient = await User.findById(recipientId);
      if (!verifiedRecipient) {
        return res
          .status(404)
          .json({ success: false, message: "Recipient not found." });
      }

      const sortedIds = [
        req.user._id.toString(),
        recipientId.toString(),
      ].sort();
      convId = `dm_${sortedIds[0]}_${sortedIds[1]}`;
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: verifiedRecipient ? verifiedRecipient._id : null,
      project: verifiedProject ? verifiedProject._id : null,
      conversationId: convId,
      content: content.trim(),
      isTeamChat: !!verifiedProject,
      read: false,
    });

    // Update sender lastSeen
    await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });

    const populated = await Message.findById(message._id)
      .populate("sender", "name email avatar")
      .populate("recipient", "name email avatar");

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/messages/conversation/:conversationId
// Delete/hide conversation for calling user without affecting other participants
router.delete("/conversation/:conversationId", protect, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (conversationId.startsWith("dm_")) {
      const parts = conversationId.replace("dm_", "").split("_");
      if (!parts.includes(req.user._id.toString()) && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied to this conversation.",
        });
      }
    }

    // Add req.user._id to deletedFor of all messages in this conversation
    await Message.updateMany(
      { conversationId },
      { $addToSet: { deletedFor: req.user._id } }
    );

    res.json({
      success: true,
      message: "Conversation removed from your inbox.",
      conversationId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
