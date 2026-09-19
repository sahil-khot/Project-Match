import express from "express";
import jwt from "jsonwebtoken";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import CommunityPost from "../models/CommunityPost.js";
import LeaderboardSnapshot from "../models/LeaderboardSnapshot.js";

const router = express.Router();

// Optional user extractor helper
const getAuthenticatedUserId = (req) => {
  try {
    const token =
      req.cookies?.pm_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);
    if (!token) return null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "projectmatch_jwt_super_secret_key_2025",
    );
    return decoded.id;
  } catch {
    return null;
  }
};

const NORMALIZE_DEPT_MAP = {
  "ai & ds": "Artificial Intelligence & Data Science",
  "aids": "Artificial Intelligence & Data Science",
  "ai/ds": "Artificial Intelligence & Data Science",
  "ai and ds": "Artificial Intelligence & Data Science",
  "artificial intelligence & data science": "Artificial Intelligence & Data Science",
  "artificial intelligence and data science": "Artificial Intelligence & Data Science",
  "entc": "Electronics & Telecommunication Engineering",
  "electronics & telecommunication": "Electronics & Telecommunication Engineering",
  "electronics and telecommunication": "Electronics & Telecommunication Engineering",
  "electronics & telecommunication engineering": "Electronics & Telecommunication Engineering",
  "electronics and telecommunication engineering": "Electronics & Telecommunication Engineering",
  "computer engineering": "Computer Engineering",
  "ce": "Computer Engineering",
  "information technology": "Information Technology",
  "it": "Information Technology",
  "mechanical engineering": "Mechanical Engineering",
  "me": "Mechanical Engineering",
  "civil engineering": "Civil Engineering",
  "civil": "Civil Engineering",
  "electrical engineering": "Electrical Engineering",
  "ee": "Electrical Engineering",
};

const normalizeDepartment = (dept) => {
  if (!dept || dept === "All" || dept === "All Departments") return null;
  const key = dept.trim().toLowerCase();
  return NORMALIZE_DEPT_MAP[key] || dept.trim();
};

// @route GET /api/leaderboards
router.get("/", async (req, res) => {
  try {
    const {
      category = "Students",
      department,
      year,
      skill,
      domain,
    } = req.query;
    const currentUserId = getAuthenticatedUserId(req);

    let profileQuery = {};
    if (
      department &&
      department !== "All" &&
      department !== "All Departments"
    ) {
      const normalizedDept = normalizeDepartment(department);
      if (normalizedDept) {
        profileQuery.department = normalizedDept;
      }
    }

    if (year && year !== "All Enrolled Years") {
      profileQuery.currentYear = year;
    }
    if (skill) {
      const skillRegex = new RegExp(skill.trim(), "i");
      profileQuery.$or = [
        { skills: skillRegex },
        { technicalSkills: skillRegex },
      ];
    }
    if (domain) {
      const domainRegex = new RegExp(domain.trim(), "i");
      profileQuery.$and = [
        {
          $or: [{ interests: domainRegex }, { preferredDomains: domainRegex }],
        },
      ];
    }
    const profiles = await StudentProfile.find(profileQuery)
      .populate(
        "user",
        "name email avatar department college verificationStatus isActive role",
      )
      .lean();

    const activeProfiles = profiles.filter(
      (p) => p.user && p.user.isActive !== false && p.user.role === "student",
    );

    // Fetch metric counts for all students in parallel
    const scoredStudents = await Promise.all(
      activeProfiles.map(async (p) => {
        const userId = p.user._id;

        const [approvedTasksCount, completedProjectsCount, postsCount] =
          await Promise.all([
            Task.countDocuments({
              assignedTo: userId,
              status: { $in: ["Approved", "Completed"] },
            }),
            Project.countDocuments({
              $or: [
                { creator: userId },
                { groupLeader: userId },
                { "members.user": userId },
              ],
              status: "Completed",
            }),
            CommunityPost.countDocuments({ author: userId }),
          ]);

        const validCgpa =
          typeof p.cgpa === "number" && !isNaN(p.cgpa) && p.cgpa > 0
            ? p.cgpa
            : null;
        const measurableSignals = {
          academic: validCgpa ? validCgpa / 10 : 0,
          technicalSkills: Math.min(
            1,
            (p.technicalSkills?.length || p.skills?.length || 0) / 18,
          ),
          projects: Math.min(
            1,
            ((p.projectsCompleted || 0) + (p.projectsInProgress || 0)) / 8,
          ),
          completedTasks: Math.min(1, approvedTasksCount / 12),
          hackathons: Math.min(1, (p.hackathonCount || 0) / 5),
          internship: p.internshipExperience ? 1 : 0,
          research: p.researchExperience ? 1 : 0,
          certifications: Math.min(1, (p.certifications?.length || 0) / 4),
          achievements: Math.min(1, (p.achievements?.length || 0) / 5),
          teamContribution: Math.min(
            1,
            (completedProjectsCount * 2 + postsCount) / 10,
          ),
          profile: Math.min(1, (p.profileCompletion || 0) / 100),
        };
        const rawScore =
          measurableSignals.academic * 0.18 +
          measurableSignals.technicalSkills * 0.14 +
          measurableSignals.projects * 0.14 +
          measurableSignals.completedTasks * 0.14 +
          measurableSignals.hackathons * 0.06 +
          measurableSignals.internship * 0.07 +
          measurableSignals.research * 0.07 +
          measurableSignals.certifications * 0.06 +
          measurableSignals.achievements * 0.05 +
          measurableSignals.teamContribution * 0.05 +
          measurableSignals.profile * 0.04;

        return {
          id: p._id,
          userId: userId,
          name: p.user.name,
          department:
            p.department || p.user.department || "Computer Engineering",
          year: p.currentYear || "3rd Year",
          cgpa: validCgpa,
          skills: p.skills || [],
          avatar: p.user.avatar || "",
          approvedTasks: approvedTasksCount,
          completedProjects: completedProjectsCount,
          communityContributions: postsCount,
          rawScore,
          approvedTasks: approvedTasksCount,
          completedProjects: completedProjectsCount,
          communityContributions: postsCount,
          scoringBreakdown: measurableSignals,
        };
      }),
    );

    const rawScores = scoredStudents.map((student) => student.rawScore);
    const minimumScore = Math.min(...rawScores, 0);
    const maximumScore = Math.max(...rawScores, 1);
    scoredStudents.forEach((student) => {
      student.score =
        maximumScore === minimumScore
          ? 500
          : Math.round(
              ((student.rawScore - minimumScore) /
                (maximumScore - minimumScore)) *
                1000,
            );
      delete student.rawScore;
    });

    // Sort by total score descending, break ties with CGPA
    scoredStudents.sort(
      (a, b) => b.score - a.score || (b.cgpa || 0) - (a.cgpa || 0),
    );

    // Phase 29: Dynamic rankings with authentic rank delta from LeaderboardSnapshot
    const rankedList = await Promise.all(
      scoredStudents.map(async (s, index) => {
        const currentRank = index + 1;

        // Query historical snapshot
        const latestSnapshot = await LeaderboardSnapshot.findOne({
          user: s.userId,
          category,
        }).sort({ snapshotDate: -1 });

        let change = 0;
        if (latestSnapshot) {
          change = latestSnapshot.rank - currentRank; // Positive = moved up, Negative = moved down
        }

        // Store snapshot if no snapshot exists today
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (!latestSnapshot || latestSnapshot.snapshotDate < oneDayAgo) {
          LeaderboardSnapshot.create({
            user: s.userId,
            rank: currentRank,
            score: s.score,
            category,
            department: s.department,
          }).catch(() => {}); // Non-blocking
        }

        return {
          ...s,
          rank: currentRank,
          change,
        };
      }),
    );

    // Top 3 Podium
    const topThree = [];
    if (rankedList.length >= 1) {
      topThree.push({
        ...rankedList[0],
        rank: 1,
        medal: "gold",
      });
    }
    if (rankedList.length >= 2) {
      topThree.unshift({
        ...rankedList[1],
        rank: 2,
        medal: "silver",
      });
    }
    if (rankedList.length >= 3) {
      topThree.push({
        ...rankedList[2],
        rank: 3,
        medal: "bronze",
      });
    }

    // Phase 30: Genuine "My Ranking" calculation (never default to #1)
    let myRanking = {
      individual: {
        rank: null,
        total: rankedList.length,
        departmentRank: null,
        departmentTotal: 0,
        collegeRank: null,
        collegeTotal: rankedList.length,
      },
      team: {
        rank: null,
        total: Math.max(1, Math.ceil(rankedList.length / 4)),
        departmentRank: null,
        departmentTotal: 0,
        collegeRank: null,
        collegeTotal: Math.max(1, Math.ceil(rankedList.length / 4)),
      },
    };

    if (currentUserId) {
      const myIdx = rankedList.findIndex(
        (s) => s.userId.toString() === currentUserId.toString(),
      );
      if (myIdx !== -1) {
        const myStudent = rankedList[myIdx];
        const deptStudents = rankedList.filter(
          (s) => s.department === myStudent.department,
        );
        const deptIdx = deptStudents.findIndex(
          (s) => s.userId.toString() === currentUserId.toString(),
        );

        myRanking.individual = {
          rank: myIdx + 1,
          total: rankedList.length,
          departmentRank: deptIdx !== -1 ? deptIdx + 1 : null,
          departmentTotal: deptStudents.length,
          collegeRank: myIdx + 1,
          collegeTotal: rankedList.length,
        };
      }
    }
    const departmentRankings = Object.values(
      rankedList.reduce((groups, student) => {
        const key = student.department || "Unspecified Department";
        if (!groups[key]) groups[key] = { department: key, activityScore: 0, projects: 0, studentsActive: 0 };
        groups[key].activityScore += student.score || 0;
        groups[key].projects += student.completedProjects || 0;
        groups[key].studentsActive += 1;
        return groups;
      }, {}),
    )
      .map((item) => ({ ...item, activityScore: Math.round(item.activityScore / Math.max(item.studentsActive, 1)) }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 7)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    res.json({
      success: true,
      category,
      formula:
        "Normalized 0-1000 ranking from CGPA, skills, projects, completed tasks, hackathons, internship, research, certifications, achievements, team contribution, and profile completeness",
      totalStudents: rankedList.length,
      topThree,
      topStudents: rankedList,
      departmentRankings,
      myRanking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
