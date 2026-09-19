import React, { useState, useEffect, useCallback } from "react";
import {
  FolderGit2,
  Send,
  Mail,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlusCircle,
  ChevronDown,
  Pencil,
  UserSearch,
  Compass,
  Lightbulb,
  Bot,
  Eye,
  Activity,
  TrendingUp,
  Quote,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import studentApi from "../services/studentApi";

// Friendly time-ago formatter
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return "1 day ago";
  return `${Math.floor(diff / 86400)} days ago`;
}

// Deadline color by days left
function deadlineColor(days) {
  if (days <= 7) return "text-[#EF4444]";
  if (days <= 20) return "text-[#FF8A00]";
  return "text-[#22C55E]";
}
function deadlineLabel(days) {
  if (days <= 0) return "Overdue!";
  if (days === 1) return "1 day left";
  if (days < 30) return `${days} days left`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month left" : `${months} months left`;
}

// Avatar initials
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Domain badge colors
const DOMAIN_COLORS = {
  "AI/ML": "bg-violet-500/10 text-violet-400",
  Web: "bg-blue-500/10 text-blue-400",
  IoT: "bg-emerald-500/10 text-emerald-400",
  Healthcare: "bg-rose-500/10 text-rose-400",
  Sustainability: "bg-green-500/10 text-green-400",
  FinTech: "bg-amber-500/10 text-amber-400",
  Education: "bg-indigo-500/10 text-indigo-400",
  Agriculture: "bg-lime-500/10 text-lime-400",
  default: "bg-[#3A3A3A] text-[#A0A0A0]",
};
function domainColor(domain) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS["default"];
}

export default function Dashboard({
  setActiveTab,
  onOpenOnboarding,
  onOpenCreateProject,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const goTo = useCallback(
    (tab, path, state) => {
      if (path) {
        navigate(path, { state });
        return;
      }
      if (setActiveTab) setActiveTab(tab, state);
    },
    [navigate, setActiveTab],
  );

  useEffect(() => {
    studentApi
      .getDashboard()
      .then((res) => {
        if (res?.success) setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-[#3A3A3A] border-t-[#FF8A00] rounded-full animate-spin" />
        <p className="text-[#777777] text-[16px]">Loading your dashboard…</p>
      </div>
    );
  }

  const profile = data?.profile || null;
  const myProjects = data?.myProjects || [];
  const applicationsCount = data?.applicationsCount || 0;
  const conversationsCount = data?.conversationsCount || 0;
  const rank = data?.rank || null;
  const skillsWithProgress = data?.skillsWithProgress || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recommendedProjects = data?.recommendedProjects || [];
  const recentActivity = data?.recentActivity || [];
  const defaultSteps = [
    { label: "Basic Information", done: !!user?.name },
    { label: "Add Skills", done: !!(profile?.skills?.length > 0) },
    { label: "Add Interests", done: !!(profile?.interests?.length > 0) },
    { label: "Write a Bio", done: !!(profile?.bio && profile.bio.trim().length > 5) },
    { label: "Link Social Accounts", done: !!(profile?.socialLinks?.github || profile?.socialLinks?.linkedin) },
  ];
  const profileSteps = (data?.profileSteps && data.profileSteps.length > 0) ? data.profileSteps : defaultSteps;
  const completedStepsCount = profileSteps.filter((s) => s.done).length;
  const profileCompletion = data?.profileCompletion || Math.round((completedStepsCount / profileSteps.length) * 100);

  const primaryProject = myProjects[0] || null;
  const firstName = user?.name ? user.name.split(" ")[0] : "Student";

  const displayDeadlines = upcomingDeadlines;
  const displayActivity = recentActivity;

  const activityIcon = (type) => {
    if (type === "view") return <Eye className="w-4 h-4 text-[#3B82F6]" />;
    if (type === "application")
      return <Send className="w-4 h-4 text-[#22C55E]" />;
    if (type === "project")
      return <FolderGit2 className="w-4 h-4 text-[#FF8A00]" />;
    if (type === "message") return <Mail className="w-4 h-4 text-violet-400" />;
    return <Activity className="w-4 h-4 text-[#A0A0A0]" />;
  };

  return (
    <div className="p-6 space-y-5 max-w-[1380px] mx-auto">
      {/* ── Row 1: Welcome + Quote ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
            Welcome back, {firstName}! <span>👋</span>
          </h1>
          <p className="text-[16px] text-[#A0A0A0] mt-1">
            Great to see you again. Let's build something amazing today.
          </p>
        </div>
        <div className="bg-[#262626] border border-[#3A3A3A] border-l-[3px] border-l-[#FF8A00] px-4 py-3 rounded-[10px] flex items-start gap-3 shadow-card w-full lg:w-[320px] shrink-0">
          <Quote className="w-5 h-5 text-[#FF8A00] shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] italic text-[#F5F5F5] leading-snug">
              "Ideas are powerful. Teams make them real."
            </p>
            <p className="text-[13px] text-[#FF8A00] font-semibold mt-1">
              — Project Match
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 2: 4 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-stretch">
        {/* Active Projects */}
        <div
          onClick={() => goTo("my-projects")}
          className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/50 p-5 rounded-[12px] cursor-pointer transition-colors shadow-card flex flex-col justify-between min-h-[112px] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center text-[#FF8A00]">
              <FolderGit2 className="w-[18px] h-[18px]" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#FF8A00] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[26px] font-bold text-[#F5F5F5] leading-none">
              {myProjects.length}
            </span>
            <p className="text-[14px] text-[#A0A0A0] mt-0.5">
              Active Projects →
            </p>
          </div>
        </div>

        {/* Applications Sent */}
        <div
          onClick={() => goTo("my-applications")}
          className="bg-[#262626] border border-[#3A3A3A] hover:border-[#22C55E]/50 p-5 rounded-[12px] cursor-pointer transition-colors shadow-card flex flex-col justify-between min-h-[112px] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center text-[#22C55E]">
              <Send className="w-[18px] h-[18px]" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#22C55E] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[26px] font-bold text-[#F5F5F5] leading-none">
              {applicationsCount}
            </span>
            <p className="text-[14px] text-[#A0A0A0] mt-0.5">
              Applications Sent →
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          onClick={() => goTo("messages")}
          className="bg-[#262626] border border-[#3A3A3A] hover:border-[#3B82F6]/50 p-5 rounded-[12px] cursor-pointer transition-colors shadow-card flex flex-col justify-between min-h-[112px] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center text-[#3B82F6]">
              <Mail className="w-[18px] h-[18px]" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[26px] font-bold text-[#F5F5F5] leading-none">
              {conversationsCount}
            </span>
            <p className="text-[14px] text-[#A0A0A0] mt-0.5">Messages →</p>
          </div>
        </div>

        {/* Rank */}
        <div
          onClick={() => goTo("leaderboards")}
          className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/50 p-5 rounded-[12px] cursor-pointer transition-colors shadow-card flex flex-col justify-between min-h-[112px] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center text-[#FF8A00]">
              <Trophy className="w-[18px] h-[18px]" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#FF8A00] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <span className="text-[26px] font-bold text-[#FF8A00] leading-none">
              {rank ? `#${rank}` : "—"}
            </span>
            <p className="text-[14px] text-[#A0A0A0] mt-0.5">Your Rank →</p>
          </div>
        </div>
      </div>

      {/* ── Row 4: Current Team | Upcoming Deadlines | Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Team */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Your Current Team
            </span>
            <button
              onClick={() => goTo("my-projects")}
              className="text-[13.5px] text-[#FF8A00] hover:underline font-semibold cursor-pointer"
            >
              Manage
            </button>
          </div>

          {primaryProject ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[8px] bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00] font-bold text-[14px] shrink-0">
                  {initials(primaryProject.title)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[15px] font-semibold text-[#F5F5F5] truncate">
                    {primaryProject.title}
                  </h4>
                  <p className="text-[13px] text-[#A0A0A0]">
                    {primaryProject.domain}
                  </p>
                </div>
              </div>

              {/* Member avatars */}
              {primaryProject.members && primaryProject.members.length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  {primaryProject.members.slice(0, 3).map((m, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-7 rounded-full bg-[#3A3A3A] border-2 border-[#262626] flex items-center justify-center text-[11px] font-bold text-[#F5F5F5]"
                      title={m.user?.name}
                    >
                      {m.user?.name ? initials(m.user.name) : "?"}
                    </div>
                  ))}
                  {primaryProject.members.length > 3 && (
                    <span className="text-[12px] text-[#777] ml-1">
                      +{primaryProject.members.length - 3}
                    </span>
                  )}
                </div>
              )}

              <p className="text-[13.5px] text-[#A0A0A0] line-clamp-2 flex-1">
                {primaryProject.description}
              </p>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-4 text-[#777]">
              <Users className="w-8 h-8 mb-2 text-[#555]" />
              <p className="text-[14px]">Not part of a team yet.</p>
            </div>
          )}

          <button
            onClick={() => goTo("my-projects")}
            className="mt-4 w-full h-[40px] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#F5F5F5] rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {primaryProject ? "View Team →" : "Create or Join Team →"}
          </button>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Upcoming Deadlines
            </span>
            <button
              onClick={() => goTo("my-projects")}
              className="text-[13.5px] text-[#FF8A00] hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {displayDeadlines.map((dl, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-[#3A3A3A]/50 last:border-0"
              >
                <span className="text-[14.5px] text-[#F5F5F5] truncate pr-2">
                  {dl.title}
                </span>
                <span
                  className={`text-[13.5px] font-semibold shrink-0 ${deadlineColor(dl.daysLeft)}`}
                >
                  {deadlineLabel(dl.daysLeft)}
                </span>
              </div>
            ))}
            {displayDeadlines.length === 0 && (
              <p className="text-[14px] text-[#777] text-center py-4">
                No upcoming deadlines.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card flex flex-col">
          <span className="text-[17px] font-semibold text-[#F5F5F5] mb-3">
            Quick Actions
          </span>
          <div className="space-y-2 flex-1">
            {[
              {
                icon: UserSearch,
                color: "text-[#FF8A00]",
                label: "Find Teammates",
                onClick: () => goTo("find-teammates"),
              },
              {
                icon: Compass,
                color: "text-[#3B82F6]",
                label: "Explore Projects",
                onClick: () => goTo("explore-projects"),
              },
              {
                icon: Lightbulb,
                color: "text-[#22C55E]",
                label: "Post a Project Idea",
                onClick: onOpenCreateProject,
              },
              {
                icon: Bot,
                color: "text-[#FF8A00]",
                label: "Ask AI Assistant",
                onClick: () => goTo("ai-assistant"),
              },
            ].map(({ icon: Icon, color, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="w-full h-[40px] flex items-center gap-3 px-3.5 bg-[#1A1A1A] hover:bg-[#2D2D2D] border border-[#3A3A3A] rounded-[8px] text-[14.5px] text-[#F5F5F5] transition-colors cursor-pointer"
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 5: Your Progress | Skills Overview | Explore Opportunities ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Your Progress */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Your Progress
            </span>
            <button
              onClick={() => {
                navigate("/student/profile", { state: { openEdit: true } });
                if (onOpenOnboarding) onOpenOnboarding();
              }}
              className="flex items-center gap-1.5 text-[12px] font-bold text-[#181818] bg-[#FF8A00] hover:bg-[#FFAE42] px-2.5 py-1 rounded-[6px] transition-all cursor-pointer shadow-sm shrink-0"
              title="Edit and complete your profile"
            >
              <Pencil className="w-3 h-3 stroke-[2.5]" />
              <span>Complete My Profile</span>
            </button>
          </div>

          {/* Circle progress */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-[74px] h-[74px] shrink-0 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  strokeWidth="3.5"
                  stroke="#2D2D2D"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${profileCompletion}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="#22C55E"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[14px] font-bold text-[#F5F5F5]">
                {profileCompletion}%
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#F5F5F5]">
                Profile Completion
              </p>
              <p className="text-[13px] text-[#A0A0A0]">
                {profileSteps.filter((s) => s.done).length}/
                {profileSteps.length} completed
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {profileSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${step.done ? "text-[#22C55E]" : "text-[#444]"}`}
                />
                <span
                  className={`text-[13.5px] ${step.done ? "text-[#A0A0A0]" : "text-[#555]"}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Overview */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Skills Overview
            </span>
            <button
              onClick={() => goTo("profile")}
              className="text-[13.5px] text-[#FF8A00] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <p className="text-[12px] text-[#777] mb-3 font-medium uppercase tracking-wider">
            Top Skills:
          </p>

          {skillsWithProgress.length > 0 ? (
            <div className="space-y-3">
              {skillsWithProgress.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] text-[#F5F5F5]">
                      {skill.name}
                    </span>
                    <span className="text-[13px] text-[#A0A0A0]">
                      {skill.percent}%
                    </span>
                  </div>
                  <div className="h-[6px] bg-[#2D2D2D] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.percent}%`,
                        background:
                          idx % 3 === 0
                            ? "#FF8A00"
                            : idx % 3 === 1
                              ? "#22C55E"
                              : "#3B82F6",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-[14px] text-[#777]">
              <p>No skills added yet.</p>
              <button
                onClick={() => goTo("profile")}
                className="text-[#FF8A00] hover:underline mt-1 text-[13px] cursor-pointer"
              >
                Add your skills →
              </button>
            </div>
          )}
        </div>

        {/* Explore Opportunities */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Explore Opportunities
            </span>
            <button
              onClick={() => goTo("explore-projects")}
              className="text-[13.5px] text-[#FF8A00] hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-2.5">
            {recommendedProjects.slice(0, 3).map((proj, idx) => (
              <div
                key={proj._id || idx}
                onClick={() => goTo("explore-projects", null, { projectId: proj._id, project: proj })}
                className="flex items-center justify-between p-3 bg-[#1A1A1A] hover:bg-[#252525] border border-[#3A3A3A] hover:border-[#FF8A00]/30 rounded-[8px] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center text-[#22C55E] font-bold text-[13px] shrink-0">
                    {initials(proj.title)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[#F5F5F5] truncate">
                      {proj.title}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-[3px] font-medium ${domainColor(proj.domain)}`}
                      >
                        {proj.domain}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] shrink-0" />
              </div>
            ))}
            {recommendedProjects.length === 0 && (
              <div className="text-center py-4 text-[14px] text-[#777]">
                <p>No open projects right now.</p>
                <button
                  onClick={onOpenCreateProject}
                  className="text-[#FF8A00] hover:underline text-[13px] mt-1 cursor-pointer"
                >
                  Create one →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 6: Recent Activity | Recommended for You ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Recent Activity
            </span>
            <button
              onClick={() => goTo("my-applications")}
              className="text-[13.5px] text-[#FF8A00] hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {displayActivity.map((act, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 pb-2.5 border-b border-[#3A3A3A]/50 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center shrink-0 mt-0.5">
                  {activityIcon(act.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-[#F5F5F5] leading-snug">
                    {act.text}
                  </p>
                  <p className="text-[12.5px] text-[#777] mt-0.5">
                    {timeAgo(act.time)}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#555] shrink-0 mt-1" />
              </div>
            ))}
            {displayActivity.length === 0 && (
              <p className="text-[14px] text-[#777] text-center py-4">
                No recent activity.
              </p>
            )}
          </div>
        </div>

        {/* Recommended for You (3 project cards) */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[17px] font-semibold text-[#F5F5F5]">
              Recommended for You
            </span>
            <button
              onClick={() => goTo("explore-projects")}
              className="text-[13.5px] text-[#FF8A00] hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>
          {recommendedProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {recommendedProjects.slice(0, 3).map((proj, idx) => (
                <div
                  key={proj._id || idx}
                  className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#3A3A3A] hover:border-[#FF8A00]/30 rounded-[8px] cursor-pointer transition-colors group"
                  onClick={() => goTo("explore-projects", null, { projectId: proj._id, project: proj })}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-[8px] bg-[#2D2D2D] border border-[#3A3A3A] flex items-center justify-center font-bold text-[13px] shrink-0 text-[#22C55E]">
                      {initials(proj.title)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#F5F5F5] truncate">
                        {proj.title}
                      </p>
                      <p className="text-[12px] text-[#777] truncate">
                        {proj.description?.slice(0, 50)}…
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {proj.requiredSkills?.slice(0, 3).map((s, si) => (
                          <span
                            key={si}
                            className="text-[11px] px-1.5 py-0.5 bg-[#2D2D2D] text-[#A0A0A0] rounded-[3px] border border-[#3A3A3A]"
                          >
                            {s}
                          </span>
                        ))}
                        <span className="text-[11px] px-1.5 py-0.5 text-[#777]">
                          {proj.members?.length || 0}+{proj.openPositions || 0}{" "}
                          members
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="shrink-0 ml-2 px-3 py-1.5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] text-[12px] font-bold rounded-[6px] transition-colors cursor-pointer">
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[14px] text-[#777]">
              No open projects right now.
            </div>
          )}
        </div>
      </div>

      {/* ── Row 7: Quote Banner | Keep Going ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Quote */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card flex items-start gap-4">
          <Quote className="w-8 h-8 text-[#FF8A00] shrink-0 mt-1" />
          <div>
            <p className="text-[16px] italic text-[#F5F5F5] leading-relaxed">
              "The best way to predict the future is to build it together."
            </p>
            <p className="text-[14px] text-[#777] font-medium mt-2">
              — Project Match
            </p>
          </div>
        </div>

        {/* Keep Going */}
        <div className="bg-[#262626] border border-[#3A3A3A] p-5 rounded-[10px] shadow-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-[8px] bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-[#FF8A00]" />
          </div>
          <div>
            <h4 className="text-[16px] font-semibold text-[#F5F5F5]">
              Keep Going!
            </h4>
            <p className="text-[14px] text-[#A0A0A0] mt-1">
              Keep building with your team and turn the next idea into progress.
            </p>
            <p className="text-[13px] text-[#777] mt-0.5">
              Consistency leads to great opportunities!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
