import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Bot,
  X,
  Plus,
  Users,
  CheckCircle2,
  Star,
  Clock,
  Briefcase,
  FlaskConical,
  Trophy,
  Zap,
  MessageSquare,
  UserPlus,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import studentApi from "../services/studentApi";
import recommendApi from "../services/recommendApi";
import projectApi from "../services/projectApi";
import applicationApi from "../services/applicationApi";

const DEPT_COLOR = {
  "Computer Engineering": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Information Technology": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "Artificial Intelligence & Data Science":
    "bg-violet-500/10 text-violet-400 border-violet-500/30",
  "Electronics & Telecommunication Engineering":
    "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "Mechanical Engineering":
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Civil Engineering": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "Electrical Engineering": "bg-pink-500/10 text-pink-400 border-pink-500/30",
  default: "bg-[#3A3A3A] text-[#A0A0A0] border-[#4A4A4A]",
};

function deptBadgeClass(dept) {
  return DEPT_COLOR[dept] || DEPT_COLOR["default"];
}

function availBadgeClass(avail) {
  if (
    ["Available", "Available for Projects", "Available for Team"].includes(
      avail,
    )
  )
    return "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30";
  if (avail === "Busy")
    return "text-[#FF8A00] bg-[#FF8A00]/10 border-[#FF8A00]/30";
  return "text-[#A0A0A0] bg-[#3A3A3A] border-[#4A4A4A]";
}

function MatchBadge({ score }) {
  const color = score >= 85 ? "#22C55E" : score >= 70 ? "#FF8A00" : "#8B5CF6";
  return (
    <span
      className="text-[13px] font-extrabold px-2.5 py-0.5 rounded-full border"
      style={{
        color,
        backgroundColor: color + "15",
        borderColor: color + "40",
      }}
    >
      {score}% match
    </span>
  );
}

function StudentCard({
  student,
  onViewProfile,
  onMessage,
  onRequestToJoin,
  showExplanation = false,
}) {
  const name = student.user?.name || student.name || "Student";
  const dept = student.department || student.user?.department || "";
  const skills = student.skills || student.technicalSkills || [];
  const avatar = student.user?.avatar || student.avatar;
  const avail = student.availability || "Available";
  const [imgErr, setImgErr] = useState(false);
  const initial = name[0]?.toUpperCase();
  const bgColors = [
    "bg-blue-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-orange-600",
    "bg-pink-600",
  ];
  const bgColor = bgColors[name.charCodeAt(0) % bgColors.length];

  return (
    <div
      onClick={() => onViewProfile && onViewProfile(student.studentId || student.user?._id)}
      className="group bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5 flex flex-col gap-3.5 hover:border-[#FF8A00]/60 hover:shadow-[0_0_24px_rgba(255,138,0,0.12)] transition-all duration-200 cursor-pointer"
    >
      {/* Top row: avatar + name + match badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {avatar && !imgErr ? (
              <img
                src={avatar}
                alt={name}
                onError={() => setImgErr(true)}
                className="w-12 h-12 rounded-[10px] object-cover border border-[#3A3A3A]"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-[10px] ${bgColor} flex items-center justify-center text-white text-lg font-bold border border-white/10`}
              >
                {initial}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#262626] ${avail === "Available" || avail === "Available for Projects" ? "bg-[#22C55E]" : "bg-[#4A4A4A]"}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#F5F5F5] truncate">
              {name}
            </p>
            <p className="text-[13px] text-[#A0A0A0] truncate">
              {student.currentYear || student.year} · {student.experienceLevel}
            </p>
          </div>
        </div>
        {student.matchScore && <MatchBadge score={student.matchScore} />}
      </div>

      {/* Department badge */}
      <div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${deptBadgeClass(dept)}`}
        >
          {dept.length > 35
            ? dept
                .replace("Engineering", "Eng.")
                .replace("Telecommunication", "Telecom")
            : dept}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="text-[11px] bg-[#1E1E1E] text-[#D4D4D4] border border-[#3A3A3A] px-2 py-0.5 rounded-md font-medium"
          >
            {skill}
          </span>
        ))}
        {skills.length > 5 && (
          <span className="text-[11px] text-[#A0A0A0] border border-[#3A3A3A] bg-[#1E1E1E] px-2 py-0.5 rounded-md">
            +{skills.length - 5}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[12px] text-[#A0A0A0]">
        {student.cgpa && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[#FF8A00]" />
            {student.cgpa?.toFixed(1)} CGPA
          </span>
        )}
        {student.weeklyHours && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#8B5CF6]" />
            {student.weeklyHours}h/wk
          </span>
        )}
        {student.hackathonExperience && (
          <span className="flex items-center gap-1 text-[#FF8A00]">
            <Trophy className="w-3 h-3" />
            Hackathon
          </span>
        )}
        {student.researchExperience && (
          <span className="flex items-center gap-1 text-[#22C55E]">
            <FlaskConical className="w-3 h-3" />
            Research
          </span>
        )}
      </div>

      {/* AI explanation (for recommendation cards) */}
      {showExplanation && student.reasons && student.reasons.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#FF8A00]/20 rounded-[8px] p-3 space-y-1.5">
          <p className="text-[11px] font-semibold text-[#FF8A00] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Why this match
          </p>
          {student.reasons.slice(0, 3).map((r, i) => (
            <p
              key={i}
              className="text-[12px] text-[#D4D4D4] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-[#22C55E] flex-shrink-0" />{" "}
              {r}
            </p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto pt-1">
        {onMessage && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMessage(student.studentId || student.user?._id);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#A0A0A0] border border-[#3A3A3A] bg-[#1E1E1E] hover:border-[#FF8A00]/40 hover:text-[#F5F5F5] py-2 rounded-[8px] transition-all duration-150 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" /> Message
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestToJoin && onRequestToJoin(student);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#FF8A00] border border-[#FF8A00]/40 bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 py-2 rounded-[8px] transition-all duration-150 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Request to Join
        </button>
      </div>
    </div>
  );
}

// ─── AI RECOMMENDATION FORM ────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  "Python",
  "React",
  "Node.js",
  "Machine Learning",
  "Java",
  "C++",
  "TensorFlow",
  "Arduino",
  "MATLAB",
  "MongoDB",
  "SQL",
  "Docker",
  "AutoCAD",
  "ANSYS",
  "VLSI",
  "Embedded C",
  "IoT",
  "NLP",
  "SolidWorks",
  "Tableau",
  "Power BI",
  "Figma",
];

const DOMAINS = [
  "AI/ML",
  "Web Development",
  "IoT",
  "Robotics",
  "Cybersecurity",
  "Data Science",
  "Mobile App",
  "Embedded Systems",
  "Smart Cities",
  "Renewable Energy",
  "Healthcare AI",
  "FinTech",
  "AgriTech",
  "Blockchain",
  "NLP",
  "Computer Vision",
];

const ROLES = [
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "ML Engineer",
  "Data Scientist",
  "Embedded Developer",
  "Hardware Engineer",
  "UI/UX Designer",
  "DevOps Engineer",
  "IoT Developer",
  "Robotics Engineer",
  "Researcher",
  "Project Manager",
  "NLP Engineer",
  "Computer Vision Engineer",
];

function AIForm({ onResults, loading }) {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [domain, setDomain] = useState("");
  const [roles, setRoles] = useState([]);
  const [teamSize, setTeamSize] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [projectTitle, setProjectTitle] = useState("");
  const [showSkillSugg, setShowSkillSugg] = useState(false);

  const filteredSugg = SKILL_SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s),
  ).slice(0, 8);

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput("");
    setShowSkillSugg(false);
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onResults({
      requiredSkills: skills,
      domain,
      roles,
      teamSize,
      experienceLevel,
      weeklyHours: parseInt(weeklyHours),
      projectTitle,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Project Title */}
      <div>
        <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
          Project Title (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. AI Campus Navigator, Solar Grid Optimizer..."
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[14px] px-4 py-2.5 rounded-[8px] placeholder-[#555] focus:outline-none focus:border-[#FF8A00]/50 transition-colors"
        />
      </div>

      {/* Required Skills */}
      <div className="relative">
        <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
          Required Skills
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 text-[12px] bg-[#FF8A00]/15 text-[#FF8A00] border border-[#FF8A00]/30 px-2.5 py-0.5 rounded-full font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-white ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a skill and press Enter..."
            value={skillInput}
            onChange={(e) => {
              setSkillInput(e.target.value);
              setShowSkillSugg(true);
            }}
            onFocus={() => setShowSkillSugg(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput.trim());
              }
            }}
            className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[14px] px-4 py-2.5 rounded-[8px] placeholder-[#555] focus:outline-none focus:border-[#FF8A00]/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => addSkill(skillInput.trim())}
            className="px-4 py-2.5 bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00] rounded-[8px] text-[13px] font-semibold hover:bg-[#FF8A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Autocomplete suggestions */}
        {showSkillSugg && skillInput && filteredSugg.length > 0 && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[#1E1E1E] border border-[#3A3A3A] rounded-[8px] shadow-xl overflow-hidden">
            {filteredSugg.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addSkill(s)}
                className="w-full text-left px-4 py-2 text-[13px] text-[#D4D4D4] hover:bg-[#2D2D2D] hover:text-[#F5F5F5] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {/* Quick add chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s))
            .slice(0, 10)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="text-[11px] text-[#A0A0A0] border border-[#3A3A3A] bg-[#1A1A1A] px-2 py-0.5 rounded-full hover:border-[#FF8A00]/40 hover:text-[#FF8A00] transition-all"
              >
                + {s}
              </button>
            ))}
        </div>
      </div>

      {/* Domain + Team Size row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
            Project Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[14px] px-4 py-2.5 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50 transition-colors"
          >
            <option value="">Any domain</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
            Team Size: <span className="text-[#FF8A00]">{teamSize}</span>
          </label>
          <input
            type="range"
            min={2}
            max={8}
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="w-full accent-[#FF8A00] mt-2"
          />
        </div>
      </div>

      {/* Experience + Weekly Hours row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
            Experience Level
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[14px] px-4 py-2.5 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50 transition-colors"
          >
            <option value="">Any level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
            Min. Weekly Hours:{" "}
            <span className="text-[#FF8A00]">{weeklyHours}h</span>
          </label>
          <input
            type="range"
            min={5}
            max={40}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(e.target.value)}
            className="w-full accent-[#FF8A00] mt-2"
          />
        </div>
      </div>

      {/* Looking for roles */}
      <div>
        <label className="block text-[13px] font-semibold text-[#A0A0A0] mb-1.5">
          Looking for roles (optional)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${roles.includes(role) ? "bg-[#FF8A00]/15 text-[#FF8A00] border-[#FF8A00]/40" : "text-[#A0A0A0] border-[#3A3A3A] bg-[#1A1A1A] hover:border-[#FF8A00]/30 hover:text-[#D4D4D4]"}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#FF8A00] to-[#FF6B35] text-white text-[15px] font-bold py-3 rounded-[10px] hover:opacity-90 active:opacity-80 transition-all disabled:opacity-60 shadow-[0_4px_20px_rgba(255,138,0,0.25)]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Finding Best
            Teammates...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" /> Find Best Teammates with AI
          </>
        )}
      </button>
    </form>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function FindTeammates({
  setActiveTab,
  setSelectedUserId,
  onOpenInviteModal,
}) {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [activeTab, setLocalTab] = useState("browse"); // 'ai' | 'browse'
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Request to Join modal state
  const [inviteModalStudent, setInviteModalStudent] = useState(null);
  const [myLedProjects, setMyLedProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [inviteCoverNote, setInviteCoverNote] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // AI recommendations state
  const [aiResults, setAIResults] = useState([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiSearched, setAISearched] = useState(false);

  // Browse state
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedExp, setSelectedExp] = useState("All");
  const [sortBy, setSortBy] = useState("Best Match");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeammates(currentPage);
  }, [currentPage, sortBy, showActiveOnly, showVerifiedOnly]);

  const fetchTeammates = async (page = 1, overrides = {}) => {
    try {
      setLoading(true);
      const filters = {
        selectedSkill,
        selectedDomain,
        selectedYear,
        selectedAvailability,
        minCgpa,
        selectedDept,
        selectedExp,
        showActiveOnly,
        showVerifiedOnly,
        sortBy,
        ...overrides,
      };
      const params = {
        page,
        limit: 9,
        skills: filters.selectedSkill || undefined,
        domain: filters.selectedDomain || undefined,
        year: filters.selectedYear !== "All" ? filters.selectedYear : undefined,
        availability:
          filters.selectedAvailability !== "All"
            ? filters.selectedAvailability
            : undefined,
        minCgpa: filters.minCgpa || undefined,
        department:
          filters.selectedDept !== "All" ? filters.selectedDept : undefined,
        experienceLevel:
          filters.selectedExp !== "All" ? filters.selectedExp : undefined,
        activeOnly: filters.showActiveOnly ? "true" : undefined,
        verifiedOnly: filters.showVerifiedOnly ? "true" : undefined,
        sortBy: filters.sortBy,
      };
      const res = await studentApi.getTeammates(params);
      if (res?.success) {
        setTeammates(res.teammates || []);
        setPagination(
          res.pagination || { page, limit: 9, total: 0, totalPages: 1 },
        );
      }
    } catch (e) {
      console.error("Failed to load teammates:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async (formData) => {
    setAILoading(true);
    setAISearched(true);
    try {
      const data = await recommendApi.recommendTeammates(formData);
      if (data.success) {
        setAIResults(data.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAILoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    const student = [...teammates, ...aiResults].find(
      (candidate) => (candidate.studentId || candidate.user?._id) === userId,
    );
    if (student) setSelectedStudent(student);
  };

  const handleMessage = (recipientId) => {
    if (!recipientId) return;
    navigate(`/${role || "student"}/messages?recipient=${encodeURIComponent(recipientId)}`);
  };

  const handleOpenInviteModal = async (student) => {
    setInviteModalStudent(student);
    setInviteError("");
    setInviteSuccess("");
    setInviteCoverNote("");
    setMyLedProjects([]);
    setSelectedProjectId("");
    try {
      const res = await projectApi.getMyProjects();
      if (res?.success) {
        const currentUserId = user?._id || user?.id;
        const led = (res.projects || []).filter(
          (p) =>
            (!currentUserId ||
              p.creator?._id === currentUserId ||
              p.creator === currentUserId ||
              p.groupLeader?._id === currentUserId ||
              p.groupLeader === currentUserId) &&
            !["Completed", "Archived"].includes(p.status)
        );
        setMyLedProjects(led);
        if (led.length > 0) {
          setSelectedProjectId(led[0]._id);
        }
      } else {
        setInviteError(res?.message || "Could not load your projects. Please try again.");
      }
    } catch (err) {
      console.error("Failed to load user projects for invitation:", err);
      setInviteError("Could not load your projects. Please try again.");
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteModalStudent) return;
    const targetUserId = inviteModalStudent.user?._id || inviteModalStudent.studentId || inviteModalStudent._id;
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await applicationApi.createApplication({
        projectId: selectedProjectId,
        targetUserId,
        type: "Team Invitation",
        coverNote: inviteCoverNote || `Hi ${inviteModalStudent.user?.name || inviteModalStudent.name}, would you like to collaborate on our project?`,
      });
      if (res?.success) {
        setInviteSuccess(`Invitation sent successfully to ${inviteModalStudent.user?.name || inviteModalStudent.name}!`);
        setTimeout(() => {
          setInviteModalStudent(null);
          setInviteSuccess("");
        }, 1500);
      } else {
        setInviteError(res?.message || "Failed to send invitation.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to send invitation.";
      setInviteError(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleClearAll = () => {
    setSelectedSkill("");
    setSelectedDomain("");
    setSelectedYear("All");
    setSelectedAvailability("All");
    setMinCgpa("");
    setSelectedDept("All");
    setSelectedExp("All");
    setShowActiveOnly(false);
    setShowVerifiedOnly(false);
    setSortBy("Best Match");
    setCurrentPage(1);
    fetchTeammates(1, {
      selectedSkill: "",
      selectedDomain: "",
      selectedYear: "All",
      selectedAvailability: "All",
      minCgpa: "",
      selectedDept: "All",
      selectedExp: "All",
      showActiveOnly: false,
      showVerifiedOnly: false,
      sortBy: "Best Match",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight">
            Find Teammates
          </h1>
          <span className="text-[13px] px-3 py-1 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered
          </span>
        </div>
        <p className="text-[16px] text-[#A0A0A0] mt-1.5">
          Describe your project requirements and let AI find your ideal team
          from 280+ students across 7 departments.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-[#1E1E1E] p-1 rounded-[10px] border border-[#3A3A3A] w-fit">
        <button
          onClick={() => setLocalTab("ai")}
          className={`flex items-center gap-2 px-5 py-2 rounded-[8px] text-[14px] font-semibold transition-all ${activeTab === "ai" ? "bg-[#FF8A00] text-white shadow-md" : "text-[#A0A0A0] hover:text-[#F5F5F5]"}`}
        >
          <Bot className="w-4 h-4" /> AI Match
        </button>
        <button
          onClick={() => setLocalTab("browse")}
          className={`flex items-center gap-2 px-5 py-2 rounded-[8px] text-[14px] font-semibold transition-all ${activeTab === "browse" ? "bg-[#FF8A00] text-white shadow-md" : "text-[#A0A0A0] hover:text-[#F5F5F5]"}`}
        >
          <Search className="w-4 h-4" /> Browse All
        </button>
      </div>

      {/* ─── AI TAB ─── */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
          {/* Form Panel */}
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-6 space-y-4">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-[8px] bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#FF8A00]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#F5F5F5]">
                  AI Teammate Finder
                </h3>
                <p className="text-[12px] text-[#A0A0A0]">
                  Powered by hybrid multi-feature scoring
                </p>
              </div>
            </div>
            <AIForm onResults={handleAISearch} loading={aiLoading} />
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {!aiSearched && !aiLoading && (
              <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-[16px] bg-[#FF8A00]/10 border border-[#FF8A00]/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-[#FF8A00]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                    Ready to find your dream team?
                  </h3>
                  <p className="text-[14px] text-[#A0A0A0] mt-2 leading-relaxed max-w-[400px] mx-auto">
                    Fill in your project requirements. Our AI uses 10 features —
                    skills, domain, roles, availability, experience, hackathon
                    history, and more — to rank your best matches.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-[380px] mx-auto">
                  {[
                    { label: "Database", sub: "Student profiles" },
                    { label: "7", sub: "Departments" },
                    { label: "2%", sub: "CGPA Weight" },
                  ].map(({ label, sub }) => (
                    <div
                      key={sub}
                      className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-[8px] p-3 text-center"
                    >
                      <p className="text-[20px] font-extrabold text-[#FF8A00]">
                        {label}
                      </p>
                      <p className="text-[11px] text-[#A0A0A0]">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiLoading && (
              <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#FF8A00]/20 border-t-[#FF8A00] animate-spin mx-auto" />
                <div>
                  <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                    Running AI Analysis...
                  </h3>
                  <p className="text-[14px] text-[#A0A0A0] mt-1">
                    Scoring 280+ profiles across 10 compatibility features
                  </p>
                </div>
              </div>
            )}

            {aiSearched && !aiLoading && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#F5F5F5]">
                      {aiResults.length > 0
                        ? `Top ${aiResults.length} Recommended Teammates`
                        : "No matches found"}
                    </h3>
                    <p className="text-[13px] text-[#A0A0A0] mt-0.5">
                      Ranked by AI compatibility score • CGPA weight: 2%
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAISearched(false);
                      setAIResults([]);
                    }}
                    className="text-[13px] text-[#A0A0A0] hover:text-[#F5F5F5] flex items-center gap-1.5 border border-[#3A3A3A] px-3 py-1.5 rounded-[8px] hover:border-[#FF8A00]/40 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> New Search
                  </button>
                </div>
                {aiResults.length === 0 ? (
                  <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-8 text-center text-[#A0A0A0]">
                    No profiles matched your criteria. Try removing some
                    filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {aiResults.map((student, idx) => (
                      <div
                        key={student.studentId || student.profileId || idx}
                        className="relative"
                      >
                        {idx < 3 && (
                          <div className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-[#FF8A00] text-white text-[11px] font-extrabold flex items-center justify-center shadow-lg">
                            #{idx + 1}
                          </div>
                        )}
                        <StudentCard
                          student={student}
                          onViewProfile={handleViewProfile}
                          onMessage={handleMessage}
                          onRequestToJoin={handleOpenInviteModal}
                          showExplanation={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── BROWSE TAB ─── */}
      {activeTab === "browse" && (
        <>
          {/* Filters */}
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#FF8A00]" />
              <span className="text-[14px] font-bold text-[#F5F5F5]">
                Filter Students
              </span>
              <button
                onClick={handleClearAll}
                className="ml-auto text-[12px] text-[#A0A0A0] hover:text-[#F5F5F5] flex items-center gap-1 border border-[#3A3A3A] px-3 py-1 rounded-[6px] hover:border-[#FF8A00]/30 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <input
                type="text"
                placeholder="Skills (e.g. React)"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[13px] px-3 py-2 rounded-[8px] placeholder-[#555] focus:outline-none focus:border-[#FF8A00]/50 col-span-2 md:col-span-1"
              />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4] text-[13px] px-3 py-2 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50"
              >
                <option value="">All Domains</option>
                {DOMAINS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4] text-[13px] px-3 py-2 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50"
              >
                <option value="All">All Depts</option>
                <option>Computer Engineering</option>
                <option>Information Technology</option>
                <option>Artificial Intelligence & Data Science</option>
                <option>Electronics & Telecommunication Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electrical Engineering</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4] text-[13px] px-3 py-2 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50"
              >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4] text-[13px] px-3 py-2 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50"
              >
                <option value="All">All Status</option>
                <option>Available</option>
                <option>Available for Projects</option>
                <option>Busy</option>
              </select>
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4] text-[13px] px-3 py-2 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50"
              >
                <option value="All">All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="flex gap-3 mt-3">
              <input
                type="number"
                placeholder="Min CGPA"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[13px] px-3 py-2 rounded-[8px] w-32 placeholder-[#555] focus:outline-none focus:border-[#FF8A00]/50"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  id="activeOnly"
                  className="accent-[#FF8A00]"
                />
                <label
                  htmlFor="activeOnly"
                  className="text-[13px] text-[#A0A0A0]"
                >
                  Online now
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  id="verifiedOnly"
                  className="accent-[#FF8A00]"
                />
                <label
                  htmlFor="verifiedOnly"
                  className="text-[13px] text-[#A0A0A0]"
                >
                  Verified only
                </label>
              </div>
              <button
                onClick={() => fetchTeammates(1)}
                className="ml-auto px-5 py-2 bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00] text-[13px] font-semibold rounded-[8px] hover:bg-[#FF8A00]/20 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-[#A0A0A0]">
                {loading ? "Loading..." : `${pagination.total} students found`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4] text-[13px] px-3 py-1.5 rounded-[8px] focus:outline-none focus:border-[#FF8A00]/50"
              >
                <option>Best Match</option>
                <option>CGPA</option>
                <option>Rank</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(9)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] h-[240px] animate-pulse"
                    />
                  ))}
              </div>
            ) : teammates.length === 0 ? (
              <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-12 text-center text-[#A0A0A0]">
                No students matched your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teammates.map((student, idx) => (
                  <StudentCard
                    key={student._id || idx}
                    student={student}
                    onViewProfile={handleViewProfile}
                    onMessage={handleMessage}
                    onRequestToJoin={handleOpenInviteModal}
                    showExplanation={false}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#A0A0A0] border border-[#3A3A3A] rounded-[8px] hover:border-[#FF8A00]/40 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-[14px] text-[#A0A0A0]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1),
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#A0A0A0] border border-[#3A3A3A] rounded-[8px] hover:border-[#FF8A00]/40 disabled:opacity-40 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <section className="w-full max-w-3xl pm-card bg-[#262626] relative p-6 sm:p-7">
              <button onClick={() => setSelectedStudent(null)} className="absolute right-5 top-5 text-[#A0A0A0] hover:text-white" aria-label="Close student details"><X className="w-5 h-5" /></button>
              <div className="flex flex-col sm:flex-row gap-5 pr-8">
                <div className="w-16 h-16 rounded-2xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center text-2xl font-bold shrink-0">
                  {(selectedStudent.user?.name || selectedStudent.name || "S")[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]">Student profile</p>
                  <h2 className="text-2xl font-bold mt-1">{selectedStudent.user?.name || selectedStudent.name}</h2>
                  <p className="text-[#A0A0A0] mt-1">{selectedStudent.department || selectedStudent.user?.department} · {selectedStudent.currentYear || selectedStudent.year || "Undergraduate"} · {selectedStudent.experienceLevel || "Contributor"}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-6">
                {[['CGPA', selectedStudent.cgpa || '—'], ['Availability', selectedStudent.availability || 'Available'], ['Weekly hours', selectedStudent.weeklyHours ? `${selectedStudent.weeklyHours} hrs` : '—']].map(([label, value]) => <div key={label} className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-3.5"><p className="text-xs text-[#777777]">{label}</p><p className="font-semibold mt-1">{value}</p></div>)}
              </div>
              <div className="mt-6"><h3 className="font-semibold">Skills & domains</h3><div className="flex flex-wrap gap-2 mt-3">{[...(selectedStudent.skills || selectedStudent.technicalSkills || []), ...(selectedStudent.interests || selectedStudent.preferredDomains || [])].slice(0, 12).map((item) => <span key={item} className="pm-badge text-sm bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4]">{item}</span>)}</div></div>
              <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm text-[#A0A0A0]"><div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#3A3A3A]"><p className="text-[#F5F5F5] font-semibold">Experience</p><p className="mt-2">{selectedStudent.hackathonExperience ? 'Hackathon participant' : 'Open to project collaboration'}{selectedStudent.researchExperience ? ' · Research experience' : ''}</p></div><div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#3A3A3A]"><p className="text-[#F5F5F5] font-semibold">Match</p><p className="mt-2">{selectedStudent.matchScore ? `${selectedStudent.matchScore}% compatibility based on skills and availability.` : 'Review profile and start a conversation to collaborate.'}</p></div></div>
              <div className="flex justify-end gap-3 mt-7">
                <button onClick={() => setSelectedStudent(null)} className="btn-secondary">Close</button>
                <button onClick={() => handleMessage(selectedStudent.studentId || selectedStudent.user?._id)} className="btn-secondary flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Message</button>
                <button
                  onClick={() => {
                    const studentToInvite = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenInviteModal(studentToInvite);
                  }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Request to Join
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Request to Join Project Modal */}
      {inviteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-lg p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => {
                setInviteModalStudent(null);
                setInviteError("");
                setInviteSuccess("");
              }}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-[10px] bg-[#FF8A00]/15 border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#F5F5F5]">Request to Join Project</h3>
                <p className="text-[13px] text-[#A0A0A0]">
                  Invite <span className="text-[#FF8A00] font-semibold">{inviteModalStudent.user?.name || inviteModalStudent.name}</span> to collaborate on your project
                </p>
              </div>
            </div>

            {inviteSuccess ? (
              <div className="p-4 my-3 bg-[#22C55E]/15 border border-[#22C55E]/30 rounded-[8px] flex items-center gap-2.5 text-[#22C55E] text-[14.5px]">
                <Check className="w-5 h-5 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4 text-[14px]">
                {inviteError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-[8px] flex items-center gap-2.5 text-red-400 text-[13.5px]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}

                {myLedProjects.length === 0 ? (
                  <div className="p-4 bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] text-center space-y-2">
                    <p className="text-[14px] text-[#A0A0A0]">
                      You don't have any active projects where you are the leader or creator accepting applications.
                    </p>
                    <p className="text-[13px] text-[#777777]">
                      Create a project first in <span className="text-[#FF8A00] font-semibold">My Projects</span> before sending team invitations.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[13.5px] text-[#A0A0A0] font-medium mb-1.5">
                        Select Your Project
                      </label>
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        required
                        className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[14.5px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                      >
                        {myLedProjects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title} ({p.domain || 'Engineering'} • {p.openPositions || 0} spots open)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13.5px] text-[#A0A0A0] font-medium mb-1.5">
                        Invitation Note / Message
                      </label>
                      <textarea
                        rows={3}
                        value={inviteCoverNote}
                        onChange={(e) => setInviteCoverNote(e.target.value)}
                        placeholder={`Hi ${inviteModalStudent.user?.name || inviteModalStudent.name}, we saw your skills and would love to have you on our team!`}
                        className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3 text-[14px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInviteModalStudent(null);
                      setInviteError("");
                      setInviteSuccess("");
                    }}
                    className="h-[40px] px-4.5 text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  {myLedProjects.length > 0 && (
                    <button
                      type="submit"
                      disabled={inviteLoading || !selectedProjectId}
                      className="h-[40px] px-5 font-bold text-[14px] text-[#1A1A1A] bg-[#FF8A00] hover:bg-[#FF9E2C] rounded-[8px] cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {inviteLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" /> Send Request
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
