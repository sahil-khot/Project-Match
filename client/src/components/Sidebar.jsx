import React, { useEffect, useState } from "react";
import {
  Home,
  LayoutDashboard,
  Compass,
  Users,
  GraduationCap,
  FolderGit2,
  Folder,
  FileEdit,
  FileCheck,
  Mail,
  Trophy,
  MessageSquare,
  BookOpen,
  Sparkles,
  Settings,
  LogOut,
  ShieldAlert,
  Building2,
  Award,
  User,
  BarChart3,
  FileText,
  TrendingUp,
  Bell,
  ScrollText,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ unreadMessagesCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || "student";
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(
      window.localStorage.getItem("project-match-sidebar-width"),
    );
    return stored >= 200 && stored <= 360 ? stored : 240;
  });
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      "project-match-sidebar-width",
      String(sidebarWidth),
    );
  }, [sidebarWidth]);

  useEffect(() => {
    if (!resizing) return undefined;
    const handlePointerMove = (event) =>
      setSidebarWidth(Math.min(360, Math.max(200, event.clientX)));
    const handlePointerUp = () => setResizing(false);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isStudent = role === "student";
  const isMentor = role === "mentor";
  const isPrincipal = role === "principal";
  const isAdmin = role === "admin";

  // Map route path to active item
  const getActiveTab = () => {
    const path = location.pathname;
    if (isPrincipal) {
      if (path.includes("/students")) return "principal-students";
      if (path.includes("/faculty")) return "principal-faculty";
      if (path.includes("/projects")) return "principal-projects";
      if (path.includes("/department-analytics") || path.includes("/departments")) return "principal-department-analytics";
      if (path.includes("/applications")) return "principal-applications";
      if (path.includes("/reports")) return "principal-reports";
      if (path.includes("/leaderboards")) return "principal-leaderboards";
      if (path.includes("/community")) return "principal-community";
      if (path.includes("/resources")) return "principal-resources";
      if (path.includes("/notifications")) return "principal-notifications";
      if (path.includes("/messages")) return "principal-messages";
      if (path.includes("/ai-assistant")) return "ai-assistant";
      if (path.includes("/profile")) return "profile";
      if (path.includes("/settings")) return "settings";
      if (path.includes("/dashboard")) return "principal-dashboard";
      return "principal-dashboard";
    }
    if (isAdmin) {
      if (path.includes("/users")) return "admin-users";
      if (path.includes("/projects")) return "admin-projects";
      if (path.includes("/applications")) return "admin-applications";
      if (path.includes("/reports")) return "admin-reports";
      if (path.includes("/logs") || path.includes("/system-logs")) return "admin-logs";
      if (path.includes("/settings")) return "admin-settings";
      if (path.includes("/profile")) return "profile";
      if (path.includes("/dashboard")) return "admin-dashboard";
      return "admin-dashboard";
    }
    if (path.includes("/assigned-projects")) return "assigned-projects";
    if (path.includes("/students-teams")) return "students-teams";
    if (path.includes("/task-reviews")) return "task-reviews";
    if (path.includes("/mentorship-requests")) return "mentorship-requests";
    if (path.includes("/dashboard"))
      return isStudent ? "dashboard" : `${role}-dashboard`;
    if (path.includes("/explore-projects")) return "explore-projects";
    if (path.includes("/find-teammates")) return "find-teammates";
    if ((path.includes("/mentor") || path.includes("find-mentor")) && isStudent)
      return "mentors";
    if (path.includes("/projects") || path.includes("/my-projects"))
      return "my-projects";
    if (path.includes("/applications") || path.includes("/my-applications"))
      return "my-applications";
    if (path.includes("/messages")) return "messages";
    if (path.includes("/leaderboards")) return "leaderboards";
    if (path.includes("/community")) return "community";
    if (path.includes("/resources")) return "resources";
    if (path.includes("/ai-assistant")) return "ai-assistant";
    if (path.includes("/profile")) return "profile";
    if (path.includes("/settings")) return "settings";
    return isStudent ? "dashboard" : `${role}-dashboard`;
  };

  const currentTab = getActiveTab();

  const handleNavigate = (id, targetPath) => {
    const prefix = `/${role}`;
    const destination = targetPath || `${prefix}/${id}`;
    navigate(destination);
  };

  const navItem = (id, label, Icon, customPath = null, badge = null) => {
    const isActive = currentTab === id;
    return (
      <button
        key={id}
        onClick={() => handleNavigate(id, customPath)}
        className={`w-full flex items-center justify-between px-3.5 h-[44px] rounded-[8px] text-[16px] font-medium transition-all duration-200 group cursor-pointer relative ${
          isActive
            ? "bg-[#FF8A00]/10 text-[#FF8A00] font-semibold border-l-[3px] border-[#FF8A00]"
            : "text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#262626]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-[#FF8A00]" : "text-[#A0A0A0] group-hover:text-[#F5F5F5]"}`}
          />
          <span className="truncate">{label}</span>
        </div>
        {badge !== null && badge > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 shrink-0 flex items-center justify-center text-[12px] font-bold bg-[#FF8A00] text-[#1A1A1A] rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const sectionLabel = (text) => {
    return (
      <p className="px-3 text-[12px] font-bold tracking-[0.08em] text-[#777777] uppercase mb-1.5">
        {text}
      </p>
    );
  };

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="relative bg-[#1A1A1A] border-r border-[#3A3A3A] flex flex-col justify-between h-screen select-none shrink-0 sticky top-0 z-40"
    >
      {/* Brand Header */}
      <div className="h-[72px] flex items-center border-b border-[#3A3A3A]/40 shrink-0 px-4 gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer min-w-0"
          onClick={() =>
            navigate(isStudent ? "/student/dashboard" : `/${role}/dashboard`)
          }
        >
          <img
            src="/logo.png"
            alt="Project Match Logo"
            className="w-8 h-8 object-contain shrink-0 rounded-[6px]"
          />
          {
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold tracking-tight text-[#F5F5F5] leading-tight">
                Project Match
              </h1>
              <p className="text-[12px] text-[#777777] font-medium tracking-wide truncate">
                Where Ideas Find the Right Team
              </p>
            </div>
          }
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {isMentor ? (
          <>
            {/* MENTOR CONSOLE */}
            <div>
              {sectionLabel("MENTOR CONSOLE")}
              <div className="space-y-1">
                {navItem("mentor-dashboard", "Dashboard", Home, "/mentor/dashboard")}
                {navItem("assigned-projects", "Assigned Projects", Folder, "/mentor/assigned-projects")}
                {navItem("students-teams", "Students & Teams", Users, "/mentor/students-teams")}
                {navItem("task-reviews", "Task Reviews", FileCheck, "/mentor/task-reviews")}
                {navItem("mentorship-requests", "Mentorship Requests", GraduationCap, "/mentor/mentorship-requests")}
              </div>
            </div>

            {/* DISCOVER */}
            <div>
              {sectionLabel("DISCOVER")}
              <div className="space-y-1">
                {navItem("explore-projects", "Explore Projects", Compass, "/mentor/explore-projects")}
                {navItem("leaderboards", "Leaderboards", Trophy, "/mentor/leaderboards")}
                {navItem("community", "Community", MessageSquare, "/mentor/community")}
                {navItem("resources", "Resources", BookOpen, "/mentor/resources")}
              </div>
            </div>

            {/* COMMUNICATION */}
            <div>
              {sectionLabel("COMMUNICATION")}
              <div className="space-y-1">
                {navItem("messages", "Messages", Mail, "/mentor/messages", unreadMessagesCount)}
              </div>
            </div>
          </>
        ) : isPrincipal ? (
          <>
            {/* PRINCIPAL CONSOLE */}
            <div>
              {sectionLabel("PRINCIPAL CONSOLE")}
              <div className="space-y-1">
                {navItem("principal-dashboard", "Dashboard", Home, "/principal/dashboard")}
              </div>
            </div>

            {/* INSTITUTION */}
            <div>
              {sectionLabel("INSTITUTION")}
              <div className="space-y-1">
                {navItem("principal-students", "Students", Users, "/principal/students")}
                {navItem("principal-faculty", "Faculty & Mentors", GraduationCap, "/principal/faculty")}
                {navItem("principal-projects", "Projects", FolderGit2, "/principal/projects")}
                {navItem("principal-department-analytics", "Department Analytics", BarChart3, "/principal/department-analytics")}
                {navItem("principal-applications", "Applications", FileText, "/principal/applications")}
              </div>
            </div>

            {/* REPORTS & INSIGHTS */}
            <div>
              {sectionLabel("REPORTS & INSIGHTS")}
              <div className="space-y-1">
                {navItem("principal-reports", "Reports & Analytics", TrendingUp, "/principal/reports")}
                {navItem("principal-leaderboards", "Leaderboards", Trophy, "/principal/leaderboards")}
                {navItem("principal-community", "Community", MessageSquare, "/principal/community")}
                {navItem("principal-resources", "Resources", BookOpen, "/principal/resources")}
              </div>
            </div>

            {/* COMMUNICATION */}
            <div>
              {sectionLabel("COMMUNICATION")}
              <div className="space-y-1">
                {navItem("principal-notifications", "Notifications", Bell, "/principal/notifications")}
                {navItem("principal-messages", "Messages", Mail, "/principal/messages", unreadMessagesCount)}
              </div>
            </div>
          </>
        ) : isAdmin ? (
          <>
            {/* ADMIN CONSOLE */}
            <div>
              {sectionLabel("ADMIN CONSOLE")}
              <div className="space-y-1">
                {navItem("admin-dashboard", "Dashboard", Home, "/admin/dashboard")}
                {navItem("admin-users", "Users", Users, "/admin/users")}
                {navItem("admin-projects", "Projects", FolderGit2, "/admin/projects")}
                {navItem("admin-applications", "Applications", FileText, "/admin/applications")}
                {navItem("admin-reports", "Reports", BarChart3, "/admin/reports")}
                {navItem("admin-logs", "System Logs", ScrollText, "/admin/logs")}
                {navItem("admin-settings", "Settings", Settings, "/admin/settings")}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Discover */}
            <div>
              {sectionLabel("DISCOVER")}
              <div className="space-y-1">
                {navItem(
                  "dashboard",
                  "Dashboard",
                  LayoutDashboard,
                  `/${role}/dashboard`,
                )}
                {navItem(
                  "explore-projects",
                  "Explore Projects",
                  Compass,
                  `/${role}/explore-projects`,
                )}
                {navItem(
                  "find-teammates",
                  "Find Teammates",
                  Users,
                  `/${role}/find-teammates`,
                )}
                {navItem(
                  "mentors",
                  "Mentors",
                  GraduationCap,
                  `/${role}/find-mentor`,
                )}
              </div>
            </div>

            {/* Manage */}
            <div>
              {sectionLabel("MANAGE")}
              <div className="space-y-1">
                {navItem(
                  "my-projects",
                  "My Projects",
                  FolderGit2,
                  `/${role}/my-projects`,
                )}
                {navItem(
                  "my-applications",
                  "My Applications",
                  FileEdit,
                  `/${role}/my-applications`,
                )}
                {navItem(
                  "messages",
                  "Messages",
                  Mail,
                  `/${role}/messages`,
                  unreadMessagesCount,
                )}
              </div>
            </div>

            {/* Explore & Learn */}
            <div>
              {sectionLabel("EXPLORE & LEARN")}
              <div className="space-y-1">
                {navItem(
                  "leaderboards",
                  "Leaderboards",
                  Trophy,
                  `/${role}/leaderboards`,
                )}
                {navItem(
                  "community",
                  "Community",
                  MessageSquare,
                  `/${role}/community`,
                )}
                {navItem("resources", "Resources", BookOpen, `/${role}/resources`)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Utilities */}
      <div className="px-2 pb-2 border-t border-[#3A3A3A] space-y-1 bg-[#1A1A1A] shrink-0 pt-2">
        {isAdmin ? (
          <>
            {navItem("profile", "My Profile", User, "/admin/profile")}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 h-[44px] rounded-[8px] text-[16px] font-medium text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            {navItem(
              "ai-assistant",
              "AI Assistant",
              Sparkles,
              `/${role}/ai-assistant`,
            )}
            {navItem("profile", "My Profile", User, `/${role}/profile`)}
            {navItem("settings", "Settings", Settings, `/${role}/settings`)}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 h-[44px] rounded-[8px] text-[16px] font-medium text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onPointerDown={() => setResizing(true)}
        className="absolute top-0 right-[-4px] z-50 h-full w-2 cursor-ew-resize hover:bg-[#FF8A00]/40"
      />
    </aside>
  );
}
