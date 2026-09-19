import express from "express";
import { GoogleGenAI } from "@google/genai";
import StudentProfile from "../models/StudentProfile.js";
import Project from "../models/Project.js";
import MentorProfile from "../models/MentorProfile.js";
import { protect } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { modelMetadata, scoreTeammate } from "../services/teammateModel.js";

const router = express.Router();

const COLLEGE =
  "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";

// ─── SCORING UTILITIES ────────────────────────────────────────────────────────

// Jaccard similarity between two string arrays
function jaccardSimilarity(arr1, arr2) {
  if (!arr1?.length || !arr2?.length) return 0;
  const set1 = new Set(arr1.map((s) => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map((s) => s.toLowerCase().trim()));
  const intersection = [...set1].filter((s) => set2.has(s)).length;
  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? intersection / union : 0;
}

// Overlap count
function skillOverlap(userSkills, candidateSkills) {
  if (!userSkills?.length || !candidateSkills?.length) return 0;
  const userSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  return candidateSkills.filter((s) => userSet.has(s.toLowerCase().trim()))
    .length;
}

// Domain match score (0–1)
function domainMatchScore(studentDomains, candidateDomains) {
  return jaccardSimilarity(studentDomains, candidateDomains);
}

// Availability compatibility
function availabilityScore(studentAvail, candidateAvail) {
  const available = [
    "Available",
    "Available for Projects",
    "Available for Team",
  ];
  const sAvail = available.includes(studentAvail);
  const cAvail = available.includes(candidateAvail);
  if (sAvail && cAvail) return 1;
  if (sAvail || cAvail) return 0.5;
  return 0;
}

// Weekly hours compatibility (closer = higher score)
function hoursCompatScore(hours1, hours2) {
  if (!hours1 || !hours2) return 0.5;
  const diff = Math.abs(hours1 - hours2);
  return Math.max(0, 1 - diff / 20);
}

// Experience level compatibility
function experienceCompatScore(level1, level2) {
  const levels = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const l1 = levels[level1] || 2;
  const l2 = levels[level2] || 2;
  const diff = Math.abs(l1 - l2);
  return diff === 0 ? 1 : diff === 1 ? 0.7 : 0.3;
}

// Year diversity (cross-year teams are valuable)
function yearDiversityScore(year1, year2) {
  if (!year1 || !year2) return 0.5;
  const diff = Math.abs(year1 - year2);
  return diff >= 1 ? 0.8 : 0.6; // slight preference for cross-year
}

// Role complementarity: different preferred roles = better complement
function roleComplementScore(roles1, roles2) {
  if (!roles1?.length || !roles2?.length) return 0.5;
  const overlap = jaccardSimilarity(roles1, roles2);
  return 1 - overlap * 0.5; // less role overlap = more complementary
}

// Department diversity bonus
function deptDiversityScore(dept1, dept2) {
  return dept1 !== dept2 ? 0.75 : 0.5;
}

// Build explanation reasons
function buildExplanation(
  candidate,
  requiredSkills,
  projectDomain,
  projectRoles,
  currentUserProfile,
) {
  const reasons = [];
  const allSkills = [
    ...(candidate.skills || []),
    ...(candidate.technicalSkills || []),
  ];
  const matched = requiredSkills.filter((s) =>
    allSkills.map((sk) => sk.toLowerCase()).includes(s.toLowerCase()),
  );
  const missing = requiredSkills.filter(
    (s) => !allSkills.map((sk) => sk.toLowerCase()).includes(s.toLowerCase()),
  );

  if (matched.length > 0)
    reasons.push(
      `${matched.length}/${requiredSkills.length} required skills match`,
    );
  if (candidate.hackathonExperience)
    reasons.push(
      `${candidate.hackathonCount || 1}+ hackathon${candidate.hackathonCount > 1 ? "s" : ""} experience`,
    );
  if (candidate.researchExperience) reasons.push("Research experience");
  if (candidate.internshipExperience) reasons.push("Internship experience");
  const domainMatch = (
    candidate.preferredDomains ||
    candidate.interests ||
    []
  ).some((d) => d.toLowerCase().includes((projectDomain || "").toLowerCase()));
  if (domainMatch && projectDomain)
    reasons.push(`Strong ${projectDomain} domain interest`);

  const roleMatch = (candidate.preferredRoles || []).some((r) =>
    (projectRoles || []).some((pr) =>
      r.toLowerCase().includes(pr.toLowerCase()),
    ),
  );
  if (roleMatch) reasons.push("Role preferences align");

  const availOk = [
    "Available",
    "Available for Projects",
    "Available for Team",
  ].includes(candidate.availability);
  if (availOk)
    reasons.push(`Available (${candidate.weeklyHours || 10} hrs/week)`);

  return { reasons, matchedSkills: matched, missingSkills: missing };
}

// ─── MAIN JS RECOMMENDATION ENGINE ───────────────────────────────────────────

async function computeTeammateRecommendations(
  requiredSkills,
  domain,
  roles,
  teamSize,
  experienceLevel,
  weeklyHours,
  availability,
  currentUserId,
  currentProfile,
) {
  const allProfiles = await StudentProfile.find({
    user: { $ne: currentUserId },
  })
    .populate(
      "user",
      "name email avatar department verificationStatus isActive lastSeen",
    )
    .lean();

  const active = allProfiles.filter((p) => p.user && p.user.isActive !== false);

  const scored = active.map((candidate) => {
    const allCandidateSkills = [
      ...(candidate.skills || []),
      ...(candidate.technicalSkills || []),
    ];
    const currentSkills = [
      ...(currentProfile?.skills || []),
      ...(currentProfile?.technicalSkills || []),
    ];

    // Feature weights (total = 100%)
    const w = {
      skillReq: 0.3, // skill match against project requirements
      skillComp: 0.08, // complementary to current user's skills
      domain: 0.15, // domain interest match
      role: 0.12, // role complementarity
      availability: 0.1, // availability match
      hours: 0.07, // weekly hours compat
      experience: 0.08, // experience level compat
      hackathon: 0.05, // hackathon experience bonus
      research: 0.03, // research experience bonus
      cgpa: 0.02, // CGPA (deliberately minimal weight)
    };

    // 1. Skill match against project requirements
    let skillReqScore = 0;
    if (requiredSkills.length > 0) {
      const matched = requiredSkills.filter((s) =>
        allCandidateSkills.some(
          (cs) =>
            cs.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(cs.toLowerCase()),
        ),
      );
      skillReqScore = matched.length / requiredSkills.length;
    } else {
      // No required skills → score based on candidate skill richness
      skillReqScore = Math.min(1, allCandidateSkills.length / 10);
    }

    // 2. Complementary skills (candidate has what current user doesn't)
    const userSkillSet = new Set(currentSkills.map((s) => s.toLowerCase()));
    const complementary = allCandidateSkills.filter(
      (s) => !userSkillSet.has(s.toLowerCase()),
    );
    const skillCompScore = Math.min(1, complementary.length / 5);

    // 3. Domain match
    const candidateDomains = [
      ...(candidate.preferredDomains || []),
      ...(candidate.interests || []),
    ];
    const domainScore = domain
      ? candidateDomains.some(
          (d) =>
            d.toLowerCase().includes(domain.toLowerCase()) ||
            domain.toLowerCase().includes(d.toLowerCase()),
        )
        ? 1
        : 0.2
      : 0.5;

    // 4. Role complementarity
    const roleScore = roleComplementScore(
      roles || [],
      candidate.preferredRoles || [],
    );

    // 5. Availability
    const availScore = availabilityScore(
      availability || "Available",
      candidate.availability,
    );

    // 6. Weekly hours compatibility
    const hoursScore = hoursCompatScore(
      weeklyHours || 15,
      candidate.weeklyHours || 10,
    );

    // 7. Experience compatibility
    const expScore = experienceCompatScore(
      experienceLevel || "Intermediate",
      candidate.experienceLevel || "Intermediate",
    );

    // 8. Hackathon bonus
    const hackScore = candidate.hackathonExperience ? 1 : 0;

    // 9. Research bonus
    const researchScore = candidate.researchExperience ? 1 : 0;

    // 10. CGPA (very low weight — does not dominate)
    const cgpaScore = candidate.cgpa
      ? Math.min(1, (candidate.cgpa - 5) / 5)
      : 0.5;

    // Weighted total
    const rawScore =
      w.skillReq * skillReqScore +
      w.skillComp * skillCompScore +
      w.domain * domainScore +
      w.role * roleScore +
      w.availability * availScore +
      w.hours * hoursScore +
      w.experience * expScore +
      w.hackathon * hackScore +
      w.research * researchScore +
      w.cgpa * cgpaScore;

    // Scale to 50–98% range (avoid false 100% or unrealistic 99s)
    const matchScore = Math.min(98, Math.round(50 + rawScore * 48));

    // Feature breakdown for UI
    const featureBreakdown = {
      skillMatch: Math.round(skillReqScore * 100),
      domainMatch: Math.round(domainScore * 100),
      roleMatch: Math.round(roleScore * 100),
      availability: Math.round(availScore * 100),
      experienceMatch: Math.round(expScore * 100),
      cgpaWeight: Math.round(cgpaScore * 100),
    };

    const { reasons, matchedSkills, missingSkills } = buildExplanation(
      candidate,
      requiredSkills,
      domain,
      roles,
      currentProfile,
    );

    return {
      studentId: candidate.user._id,
      profileId: candidate._id,
      name: candidate.user.name,
      avatar: candidate.user.avatar,
      department: candidate.department || candidate.user.department,
      year: candidate.currentYear,
      cgpa: candidate.cgpa,
      skills: candidate.skills || [],
      technicalSkills: candidate.technicalSkills || [],
      interests: candidate.interests || [],
      preferredRoles: candidate.preferredRoles || [],
      availability: candidate.availability,
      weeklyHours: candidate.weeklyHours,
      experienceLevel: candidate.experienceLevel,
      hackathonExperience: candidate.hackathonExperience,
      researchExperience: candidate.researchExperience,
      internshipExperience: candidate.internshipExperience,
      matchScore,
      featureBreakdown,
      reasons,
      matchedSkills,
      missingSkills,
    };
  });

  // Sort by matchScore descending
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored;
}

async function computeModelRecommendations(
  context,
  currentUserId,
  currentProfile,
) {
  const allProfiles = await StudentProfile.find({
    user: { $ne: currentUserId },
  })
    .populate(
      "user",
      "name email avatar department verificationStatus isActive lastSeen",
    )
    .lean();

  return allProfiles
    .filter((candidate) => candidate.user && candidate.user.isActive !== false)
    .map((candidate) => {
      const modelResult = scoreTeammate(candidate, context, currentProfile);
      const allSkills = [
        ...(candidate.skills || []),
        ...(candidate.technicalSkills || []),
      ];
      const requiredSkills = context.requiredSkills || [];
      const matchedSkills = requiredSkills.filter((required) =>
        allSkills.some(
          (skill) =>
            skill.toLowerCase().includes(required.toLowerCase()) ||
            required.toLowerCase().includes(skill.toLowerCase()),
        ),
      );
      return {
        studentId: candidate.user._id,
        profileId: candidate._id,
        name: candidate.user.name,
        avatar: candidate.user.avatar,
        department: candidate.department || candidate.user.department,
        year: candidate.currentYear,
        cgpa: candidate.cgpa,
        skills: candidate.skills || [],
        technicalSkills: candidate.technicalSkills || [],
        interests: candidate.interests || [],
        preferredRoles: candidate.preferredRoles || [],
        availability: candidate.availability,
        weeklyHours: candidate.weeklyHours,
        experienceLevel: candidate.experienceLevel,
        hackathonExperience: candidate.hackathonExperience,
        researchExperience: candidate.researchExperience,
        internshipExperience: candidate.internshipExperience,
        matchScore: modelResult.matchScore,
        featureBreakdown: modelResult.featureBreakdown,
        reasons: modelResult.reasons,
        matchedSkills,
        missingSkills: requiredSkills.filter(
          (required) => !matchedSkills.includes(required),
        ),
      };
    })
    .sort((left, right) => right.matchScore - left.matchScore);
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// @route POST /api/ai/recommend-teammates
// AI-powered teammate recommendations using multi-feature JS scorer
router.post("/recommend-teammates", protect, async (req, res) => {
  try {
    const {
      requiredSkills = [],
      domain = "",
      roles = [],
      teamSize = 4,
      experienceLevel = "",
      weeklyHours = 15,
      availability = "Available",
      projectTitle = "",
      projectDescription = "",
    } = req.body;

    const currentProfile = await StudentProfile.findOne({
      user: req.user._id,
    }).lean();

    const recommendations = await computeModelRecommendations(
      {
        requiredSkills,
        domain,
        roles,
        teamSize,
        experienceLevel,
        weeklyHours,
        availability,
      },
      req.user._id,
      currentProfile,
    );

    const topN = Math.min(10, recommendations.length);

    res.json({
      success: true,
      count: topN,
      projectContext: {
        title: projectTitle,
        domain,
        requiredSkills,
        roles,
        teamSize,
      },
      recommendations: recommendations.slice(0, topN),
      scoringModel: modelMetadata,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/ai/recommend-projects
// Recommends projects based on student profile
router.post("/recommend-projects", protect, async (req, res) => {
  try {
    const currentProfile = await StudentProfile.findOne({
      user: req.user._id,
    }).lean();
    const userSkills = [
      ...(currentProfile?.skills || []),
      ...(currentProfile?.technicalSkills || []),
    ];
    const userDomains = [
      ...(currentProfile?.preferredDomains || []),
      ...(currentProfile?.interests || []),
    ];
    const userRoles = currentProfile?.preferredRoles || [];

    const projects = await Project.find({
      status: { $in: ["Recruiting", "Active"] },
      "members.user": { $ne: req.user._id },
      openPositions: { $gt: 0 },
    })
      .populate("creator", "name avatar department")
      .populate("members.user", "name avatar")
      .populate("mentor", "name avatar")
      .lean();

    const scored = projects.map((proj) => {
      const projSkills = [
        ...(proj.requiredSkills || []),
        ...(proj.techStack || []),
      ];
      const skillMatch = (requiredSkills) => {
        if (!projSkills.length) return 0.5;
        const matched = projSkills.filter((s) =>
          userSkills.some(
            (us) =>
              us.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(us.toLowerCase()),
          ),
        );
        return matched.length / projSkills.length;
      };

      const matchedSkills = projSkills.filter((s) =>
        userSkills.some(
          (us) =>
            us.toLowerCase() === s.toLowerCase() ||
            us.toLowerCase().includes(s.toLowerCase()),
        ),
      );
      const missingSkills = projSkills.filter(
        (s) =>
          !userSkills.some(
            (us) =>
              us.toLowerCase() === s.toLowerCase() ||
              us.toLowerCase().includes(s.toLowerCase()),
          ),
      );

      const skillScore =
        projSkills.length > 0 ? matchedSkills.length / projSkills.length : 0.5;
      const domainScore = userDomains.some(
        (d) =>
          d.toLowerCase().includes((proj.domain || "").toLowerCase()) ||
          (proj.domain || "").toLowerCase().includes(d.toLowerCase()),
      )
        ? 1
        : 0.3;

      const availabilityScore = proj.openPositions > 0 ? 1 : 0;
      const projectFitScore = proj.teamSize
        ? Math.min(1, (proj.openPositions || 0) / proj.teamSize)
        : 0.5;
      const matchScore = Math.min(
        97,
        Math.round(
          40 +
            skillScore * 32 +
            domainScore * 20 +
            availabilityScore * 3 +
            projectFitScore * 2,
        ),
      );

      return {
        ...proj,
        matchScore,
        matchedSkills: matchedSkills.slice(0, 5),
        missingSkills: missingSkills.slice(0, 5),
        reasons: [
          matchedSkills.length > 0
            ? `${matchedSkills.length}/${projSkills.length} required skills match`
            : null,
          domainScore > 0.5
            ? `Aligns with your ${proj.domain} interests`
            : null,
          proj.openPositions > 0
            ? `${proj.openPositions} open position${proj.openPositions > 1 ? "s" : ""}`
            : null,
        ].filter(Boolean),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: scored.length,
      recommendations: scored.slice(0, 6),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/ai/recommend-mentors
// Recommends mentors based on student profile + project domain
router.post("/recommend-mentors", protect, async (req, res) => {
  try {
    const {
      projectDomain = "",
      projectSkills = [],
      projectTitle = "",
    } = req.body;

    const currentProfile = await StudentProfile.findOne({
      user: req.user._id,
    }).lean();
    const userDomains = [
      ...(currentProfile?.preferredDomains || []),
      ...(currentProfile?.interests || []),
    ];
    const userSkills = [
      ...(currentProfile?.skills || []),
      ...(currentProfile?.technicalSkills || []),
    ];

    const mentors = await MentorProfile.find({
      availabilityStatus: "Available",
    })
      .populate("user", "name email avatar department isActive")
      .lean();

    const active = mentors.filter((m) => m.user && m.user.isActive !== false);

    const scored = active.map((mentor) => {
      const mentorExpertise = [
        ...(mentor.expertise || []),
        ...(mentor.subjects || []),
        ...(mentor.researchAreas || []),
      ];
      const mentorDomains = mentor.preferredProjectDomains || [];

      // Skill/expertise match
      const expertiseMatch = userSkills.filter((s) =>
        mentorExpertise.some(
          (e) =>
            e.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(e.toLowerCase()),
        ),
      );

      // Domain match
      const domainMatch = projectDomain
        ? mentorDomains.some(
            (d) =>
              d.toLowerCase().includes(projectDomain.toLowerCase()) ||
              projectDomain.toLowerCase().includes(d.toLowerCase()),
          ) ||
          mentorExpertise.some((e) =>
            e.toLowerCase().includes(projectDomain.toLowerCase()),
          )
        : false;

      // Project skills match
      const projSkillMatch = projectSkills.filter((s) =>
        mentorExpertise.some(
          (e) =>
            e.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(e.toLowerCase()),
        ),
      );

      const expertiseScore = Math.min(1, expertiseMatch.length / 4);
      const domainScore = domainMatch ? 1 : 0.3;
      const projScore =
        projectSkills.length > 0
          ? projSkillMatch.length / projectSkills.length
          : 0.5;
      const ratingScore = (mentor.rating || 4.5) / 5;
      const mentorScore =
        mentor.studentsMentoredCount > 10
          ? 1
          : (mentor.studentsMentoredCount || 0) / 10;

      const rawScore =
        expertiseScore * 0.3 +
        domainScore * 0.3 +
        projScore * 0.2 +
        ratingScore * 0.12 +
        mentorScore * 0.08;
      const matchScore = Math.min(97, Math.round(50 + rawScore * 47));

      const reasons = [];
      if (projSkillMatch.length > 0)
        reasons.push(`Expertise in ${projSkillMatch.slice(0, 2).join(", ")}`);
      if (domainMatch)
        reasons.push(
          `Mentors ${projectDomain || userDomains[0] || ""} projects`,
        );
      if (expertiseMatch.length > 0)
        reasons.push(
          `Aligns with your ${expertiseMatch.slice(0, 2).join(", ")} skills`,
        );
      if (mentor.researchExperience) reasons.push(`Active researcher`);
      reasons.push(
        `⭐ ${mentor.rating?.toFixed(1)} rating, ${mentor.studentsMentoredCount} mentored`,
      );

      return {
        mentorId: mentor.user._id,
        profileId: mentor._id,
        name: mentor.user.name,
        avatar: mentor.user.avatar,
        department: mentor.department,
        designation: mentor.designation,
        expertise: mentor.expertise || [],
        researchAreas: mentor.researchAreas || [],
        officeHours: mentor.officeHours,
        rating: mentor.rating,
        reviewCount: mentor.reviewCount,
        studentsMentoredCount: mentor.studentsMentoredCount,
        availabilityStatus: mentor.availabilityStatus,
        bio: mentor.bio,
        matchScore,
        reasons,
        matchedExpertise: expertiseMatch.slice(0, 4),
        projectSkillMatch: projSkillMatch.slice(0, 3),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: Math.min(5, scored.length),
      projectContext: {
        domain: projectDomain,
        skills: projectSkills,
        title: projectTitle,
      },
      recommendations: scored.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/ai/skill-gap
// Compare student skills to project required skills
router.post("/skill-gap", protect, async (req, res) => {
  try {
    const { projectId, requiredSkills = [] } = req.body;

    const currentProfile = await StudentProfile.findOne({
      user: req.user._id,
    }).lean();
    const userSkills = [
      ...new Set([
        ...(currentProfile?.skills || []),
        ...(currentProfile?.technicalSkills || []),
      ]),
    ].map((s) => s.toLowerCase());

    let projSkills = requiredSkills;

    if (projectId && requiredSkills.length === 0) {
      const project = await Project.findById(projectId).select(
        "requiredSkills techStack title domain",
      );
      if (project) {
        projSkills = [
          ...new Set([
            ...(project.requiredSkills || []),
            ...(project.techStack || []),
          ]),
        ];
      }
    }

    const matched = projSkills.filter((s) =>
      userSkills.some(
        (us) =>
          us === s.toLowerCase() ||
          us.includes(s.toLowerCase()) ||
          s.toLowerCase().includes(us),
      ),
    );
    const missing = projSkills.filter(
      (s) =>
        !userSkills.some(
          (us) =>
            us === s.toLowerCase() ||
            us.includes(s.toLowerCase()) ||
            s.toLowerCase().includes(us),
        ),
    );

    const matchPercent =
      projSkills.length > 0
        ? Math.round((matched.length / projSkills.length) * 100)
        : 100;

    // Resource suggestions for missing skills
    const resourceSuggestions = missing.slice(0, 5).map((skill) => {
      const resources = {
        react: [
          "React Official Docs",
          "Full Stack Open",
          "Scrimba React Course",
        ],
        python: [
          "Python.org Tutorial",
          "CS50P Harvard",
          "Automate the Boring Stuff",
        ],
        "machine learning": [
          "Andrew Ng ML Course (Coursera)",
          "fast.ai",
          "Kaggle Learn",
        ],
        "node.js": ["Node.js Official Docs", "The Odin Project", "NodeJS Dev"],
        docker: [
          "Docker Official Tutorial",
          "TechWorld Docker Course",
          "KodeKloud",
        ],
        sql: ["SQLBolt", "W3Schools SQL", "Mode Analytics SQL Tutorial"],
        tensorflow: [
          "TF Official Tutorials",
          "DeepLearning.AI",
          "fast.ai Deep Learning",
        ],
        mongodb: ["MongoDB University M001", "MongoDB Docs", "Mongoose Docs"],
        java: [
          "MOOC.fi Java Programming",
          "JetBrains Academy",
          "Codecademy Java",
        ],
        default: [
          "Coursera",
          "Udemy",
          "YouTube Tutorials",
          "Official Documentation",
        ],
      };
      const key = skill.toLowerCase();
      const res = resources[key] || resources["default"];
      return { skill, resources: res.slice(0, 2) };
    });

    res.json({
      success: true,
      projectId,
      requiredSkills: projSkills,
      matched,
      missing,
      matchPercent,
      resourceSuggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/ai/chat
// Rate limited AI chatbot with Gemini + grounded context engine fallback
router.post("/chat", protect, aiLimiter, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message prompt is required." });
    }
    if (message.length > 2000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message exceeds maximum allowed length of 2000 characters.",
        });
    }

    const currentStudentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });
    const userSkills = currentStudentProfile?.skills || [];
    const userInterests = currentStudentProfile?.interests || [];
    const userDept =
      currentStudentProfile?.department ||
      req.user.department ||
      "Computer Engineering";

    const [dbTeammates, dbProjects, dbMentors] = await Promise.all([
      StudentProfile.find({ user: { $ne: req.user._id } })
        .populate("user", "name email department isActive")
        .limit(15),
      Project.find({ status: { $in: ["Recruiting", "Active"] } })
        .select(
          "title description domain techStack requiredSkills openPositions",
        )
        .limit(10),
      MentorProfile.find()
        .populate("user", "name department")
        .select("expertise subjects availabilityStatus rating researchAreas")
        .limit(10),
    ]);

    const activeTeammates = dbTeammates.filter(
      (t) => t.user && t.user.isActive !== false,
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { timeout: 8000 }
        });
        const systemInstruction = `You are the intelligent Project Match AI Advisor for engineering students at ${COLLEGE} (VKBIET Baramati).
Your goal is to guide students on team formation, project brainstorming, technical architecture, coding solutions, faculty mentorship, and task planning.
You are conversational, dynamic, insightful, and genuinely helpful.

REAL PLATFORM DATABASE CONTEXT:
CURRENT STUDENT: ${req.user.name} (${userDept})
- Skills: ${userSkills.join(", ") || "Not specified"}
- Interests: ${userInterests.join(", ") || "Not specified"}

REAL AVAILABLE TEAMMATES IN DATABASE:
${
  activeTeammates.length > 0
    ? activeTeammates
        .map(
          (t) =>
            `  • ${t.user.name} (${t.department}, CGPA ${t.cgpa || "N/A"}): Skills: ${t.skills.join(", ")} | Availability: ${t.availability}`,
        )
        .join("\n")
    : "  (No other students registered yet)"
}

REAL PROJECTS RECRUITING IN DATABASE:
${
  dbProjects.length > 0
    ? dbProjects
        .map(
          (p) =>
            `  • "${p.title}" (${p.domain}, ${p.openPositions} open positions): Tech Stack: ${p.techStack.join(", ")} | Needs: ${p.requiredSkills.join(", ")}`,
        )
        .join("\n")
    : "  (No active projects found)"
}

REAL FACULTY MENTORS IN DATABASE:
${
  dbMentors.length > 0
    ? dbMentors
        .map(
          (m) =>
            `  • ${m.user?.name || "Faculty"} (${m.department}): Expertise: ${m.expertise?.join(", ")} | Rating: ${m.rating} | Status: ${m.availabilityStatus}`,
        )
        .join("\n")
    : "  (No mentors registered yet)"
}

GUIDELINES:
1. DYNAMIC & COMPREHENSIVE RESPONSES: Provide detailed, dynamic, high-quality answers to ANY question (technical architecture, coding help, debugging, project planning, idea validation, interview prep, skill development).
2. DATABASE GROUNDING: When the user asks for teammates, projects, or mentors, ground your recommendations strictly on the real campus data above. Explain why they are a good match for the student.
3. ADAPTABILITY: If no exact match exists in the database for an inquiry, honestly state that and suggest alternative approaches or creative blueprints.
4. FORMATTING: Use structured, clean markdown (bolding, headers, bullet points, code blocks) to make your explanations easy to read.
5. College: VKBIET Baramati (never mention PCCOE or Pune).`;

        // Format conversational prompt including recent turns if provided
        let formattedInput = message;
        if (Array.isArray(history) && history.length > 0) {
          const recentTurns = history.slice(-4).map((h) => `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`).join("\n");
          formattedInput = `${recentTurns}\nUser: ${message}`;
        }

        let replyText = null;
        let usedModel = "gemini-3.5-flash-lite";
        // Prioritize ultra-fast, high-quota models first to avoid 30s rate-limit timeouts
        const modelsToTry = [
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
          "gemini-3.8-flash",
          "gemini-3.6-flash"
        ];

        // 1. Try modern Interactions API
        for (const model of modelsToTry) {
          try {
            const interaction = await ai.interactions.create({
              model,
              input: formattedInput,
              system_instruction: systemInstruction,
            });
            replyText = interaction?.output_text || null;
            if (replyText) {
              usedModel = model;
              break;
            }
          } catch (modelErr) {
            console.warn(`[Gemini Interaction] ${model} attempt error:`, modelErr.message);
          }
        }

        // 2. Fallback to generateContent API if needed
        if (!replyText) {
          for (const model of modelsToTry) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: formattedInput,
                config: { systemInstruction },
              });
              replyText =
                response?.text ||
                response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                null;
              if (replyText) {
                usedModel = model;
                break;
              }
            } catch (genErr) {
              console.warn(`[Gemini generateContent] ${model} attempt error:`, genErr.message);
            }
          }
        }

        if (replyText) {
          return res.json({
            success: true,
            reply: replyText,
            source: usedModel,
            userContext: {
              name: req.user.name,
              branch: userDept,
              keySkills: userSkills,
              interests: userInterests,
            },
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API overall error (falling back to context engine):", geminiError.message);
      }
    }

    // Fallback context engine
    const promptLower = message.toLowerCase();
    let reply = "";

    if (
      promptLower.includes("teammate") ||
      promptLower.includes("team") ||
      promptLower.includes("collaborator")
    ) {
      const candidates = activeTeammates.map((t) => ({
        profile: t,
        overlap: skillOverlap(userSkills, t.skills),
      }));
      candidates.sort((a, b) => b.overlap - a.overlap);
      const topMatches = candidates.slice(0, 3).map((c) => c.profile);

      if (topMatches.length > 0) {
        const details = topMatches
          .map(
            (t) =>
              `• **${t.user.name}** (${t.department})\n  *Skills:* ${t.skills.slice(0, 5).join(", ")}\n  *Status:* ${t.availability}`,
          )
          .join("\n\n");
        reply = `Here are the top teammate candidates from the **Project Match** database:\n\n${details}\n\nVisit **Find Teammates** in the sidebar to see their full profile and send an invite!`;
      } else {
        reply = `No matching teammates found yet. Invite classmates to register on **Project Match** to discover each other!`;
      }
    } else if (
      promptLower.includes("project") ||
      promptLower.includes("idea") ||
      promptLower.includes("hackathon")
    ) {
      if (dbProjects.length > 0) {
        const list = dbProjects
          .slice(0, 3)
          .map(
            (p) =>
              `• **${p.title}** (${p.domain})\n  ${p.description.slice(0, 100)}...\n  *Needs:* ${p.requiredSkills.join(", ")}\n  *Open:* ${p.openPositions} positions`,
          )
          .join("\n\n");
        reply = `Active projects currently recruiting at VKBIET:\n\n${list}\n\nGo to **Explore Projects** to apply directly!`;
      } else {
        reply = `Here are project ideas based on your skills (${userSkills.slice(0, 4).join(", ")}):\n\n1. **Campus Resource Tracker** — IoT + ML-based smart monitoring\n2. **AI Study Planner** — NLP-powered personalized learning paths\n3. **Digital Notice Board** — Real-time college announcements app`;
      }
    } else if (
      promptLower.includes("mentor") ||
      promptLower.includes("faculty") ||
      promptLower.includes("professor")
    ) {
      if (dbMentors.length > 0) {
        const list = dbMentors
          .slice(0, 3)
          .map(
            (m) =>
              `• **${m.user?.name || "Faculty"}** (${m.department})\n  *Expertise:* ${m.expertise?.join(", ")}\n  *Availability:* ${m.availabilityStatus} · ⭐ ${m.rating}`,
          )
          .join("\n\n");
        reply = `Available faculty mentors at VKBIET:\n\n${list}\n\nSend a mentorship request from the **Find Mentor** tab!`;
      } else {
        reply = `No mentors currently listed. Check back soon as faculty mentors are being onboarded.`;
      }
    } else if (
      promptLower.includes("skill") ||
      promptLower.includes("learn") ||
      promptLower.includes("improve")
    ) {
      reply = `To strengthen your profile as a ${userDept} student, consider learning:\n\n${userInterests
        .slice(0, 2)
        .map(
          (i) =>
            `• **${i}**: Start with hands-on projects and Kaggle/GitHub contributions`,
        )
        .join(
          "\n",
        )}\n\nUse the **Skill Gap Analysis** in Project details to see exactly what skills each project needs!`;
    } else {
      reply = `Hello ${req.user.name.split(" ")[0]}! I'm your **Project Match AI Advisor** at VKBIET Baramati.\n\nI have access to active projects, registered teammates, and faculty mentors. Try asking:\n• *"Find compatible teammates with Python and React skills"*\n• *"Recommend active projects I can apply for"*\n• *"Which mentors specialize in AI/ML?"*\n• *"What skills should I learn for web development?"*`;
    }

    res.json({
      success: true,
      reply,
      source: "project-match-context-engine",
      userContext: {
        name: req.user.name,
        branch: userDept,
        keySkills: userSkills,
        interests: userInterests,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
