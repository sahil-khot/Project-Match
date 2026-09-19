import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Public Auth & Error Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized403 from "./pages/Unauthorized403";
import NotFound404 from "./pages/NotFound404";

// Application Shell Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OnboardingModal from "./components/OnboardingModal";
import CreateProjectModal from "./components/CreateProjectModal";

// Views
import Dashboard from "./pages/Dashboard";
import ExploreProjects from "./pages/ExploreProjects";
import FindTeammates from "./pages/FindTeammates";
import FindMentor from "./pages/FindMentor";
import MyProjects from "./pages/MyProjects";
import MyApplications from "./pages/MyApplications";
import Messages from "./pages/Messages";
import Leaderboards from "./pages/Leaderboards";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Role Consoles
import MentorDashboard from "./pages/MentorDashboard";
import MentorAssignedProjects from "./pages/MentorAssignedProjects";
import MentorStudentsTeams from "./pages/MentorStudentsTeams";
import MentorTaskReviews from "./pages/MentorTaskReviews";
import MentorMentorshipRequests from "./pages/MentorMentorshipRequests";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import PrincipalInstitutionalViews from "./pages/PrincipalInstitutionalViews";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSubViews from "./pages/AdminSubViews";

// Root Redirect component: Always redirects root '/' directly to login page
function RootRedirect() {
  return <Navigate to="/login" replace />;
}

// Role App Shell Wrapping Persistent Navigation and Nested View
function RoleAppShell() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState(null);

  // Backward-compatible navigation helper for existing components that take setActiveTab
  const handleTabChange = (tabId, state) => {
    const rolePrefix = `/${role || "student"}`;
    const opts = state ? { state } : undefined;
    switch (tabId) {
      case "dashboard":
      case "student-dashboard":
      case "mentor-dashboard":
      case "principal-dashboard":
      case "admin-dashboard":
        navigate(`${rolePrefix}/dashboard`, opts);
        break;
      case "assigned-projects":
        navigate(`${rolePrefix}/assigned-projects`, opts);
        break;
      case "students-teams":
        navigate(`${rolePrefix}/students-teams`, opts);
        break;
      case "task-reviews":
        navigate(`${rolePrefix}/task-reviews`, opts);
        break;
      case "mentorship-requests":
        navigate(`${rolePrefix}/mentorship-requests`, opts);
        break;
      case "explore-projects":
        navigate(`${rolePrefix}/explore-projects`, opts);
        break;
      case "find-teammates":
        navigate(`${rolePrefix}/find-teammates`, opts);
        break;
      case "mentors":
        navigate(`${rolePrefix}/find-mentor`, opts);
        break;
      case "my-projects":
        navigate(`${rolePrefix}/my-projects`, opts);
        break;
      case "my-applications":
        navigate(`${rolePrefix}/my-applications`, opts);
        break;
      case "messages":
        navigate(`${rolePrefix}/messages`, opts);
        break;
      case "leaderboards":
        navigate(`${rolePrefix}/leaderboards`, opts);
        break;
      case "community":
        navigate(`${rolePrefix}/community`, opts);
        break;
      case "resources":
        navigate(`${rolePrefix}/resources`, opts);
        break;
      case "ai-assistant":
        navigate(`${rolePrefix}/ai-assistant`, opts);
        break;
      case "profile":
        navigate(`${rolePrefix}/profile`, opts);
        break;
      case "principal-students":
      case "students":
        navigate(`${rolePrefix}/students`, opts);
        break;
      case "principal-faculty":
      case "faculty":
        navigate(`${rolePrefix}/faculty`, opts);
        break;
      case "principal-projects":
        navigate(`${rolePrefix}/projects`, opts);
        break;
      case "principal-departments":
      case "departments":
        navigate(`${rolePrefix}/departments`, opts);
        break;
      case "principal-department-analytics":
      case "department-analytics":
        navigate(`${rolePrefix}/department-analytics`, opts);
        break;
      case "principal-applications":
        navigate(`${rolePrefix}/applications`, opts);
        break;
      case "principal-reports":
      case "reports":
        navigate(`${rolePrefix}/reports`, opts);
        break;
      case "principal-notifications":
      case "notifications":
        navigate(`${rolePrefix}/notifications`, opts);
        break;
      case "admin-users":
      case "users":
        navigate(`${rolePrefix}/users`, opts);
        break;
      case "admin-projects":
        navigate(`${rolePrefix}/projects`, opts);
        break;
      case "admin-applications":
        navigate(`${rolePrefix}/applications`, opts);
        break;
      case "admin-reports":
        navigate(`${rolePrefix}/reports`, opts);
        break;
      case "admin-logs":
      case "logs":
        navigate(`${rolePrefix}/logs`, opts);
        break;
      case "admin-settings":
      case "settings":
        navigate(`${rolePrefix}/settings`, opts);
        break;
      default:
        navigate(`${rolePrefix}/dashboard`, opts);
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1A1A] overflow-hidden text-[#F5F5F5] font-sans antialiased">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          setActiveTab={handleTabChange}
          onOpenOnboarding={() => setShowOnboarding(true)}
        />

        {/* Dynamic Nested Content View */}
        <main className="flex-1 overflow-y-auto bg-[#1A1A1A]">
          <Routes>
            {/* Student Nested Routes */}
            <Route
              path="dashboard"
              element={
                role === "mentor" ? (
                  <MentorDashboard setActiveTab={handleTabChange} />
                ) : role === "principal" ? (
                  <PrincipalDashboard />
                ) : role === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Dashboard
                    setActiveTab={handleTabChange}
                    onOpenOnboarding={() => setShowOnboarding(true)}
                    onOpenCreateProject={() => setShowCreateProject(true)}
                  />
                )
              }
            />
            {/* Mentor Specific Routes */}
            <Route
              path="assigned-projects"
              element={<MentorAssignedProjects setActiveTab={handleTabChange} />}
            />
            <Route
              path="students-teams"
              element={<MentorStudentsTeams setActiveTab={handleTabChange} />}
            />
            <Route
              path="task-reviews"
              element={<MentorTaskReviews setActiveTab={handleTabChange} />}
            />
            <Route
              path="mentorship-requests"
              element={<MentorMentorshipRequests setActiveTab={handleTabChange} />}
            />
            <Route
              path="explore-projects"
              element={
                <ExploreProjects
                  setActiveTab={handleTabChange}
                  onSelectProject={(proj) => setSelectedProjectForView(proj)}
                  onOpenCreateProject={() => setShowCreateProject(true)}
                />
              }
            />
            <Route
              path="find-teammates"
              element={
                <FindTeammates
                  setActiveTab={handleTabChange}
                  onOpenInviteModal={() => handleTabChange("messages")}
                />
              }
            />
            <Route
              path="find-mentor"
              element={<FindMentor setActiveTab={handleTabChange} />}
            />
            <Route
              path="mentors"
              element={<Navigate to="../find-mentor" replace />}
            />
            <Route
              path="my-projects"
              element={
                <MyProjects
                  initialSelectedProject={selectedProjectForView}
                  setActiveTab={handleTabChange}
                  onOpenCreateProject={() => setShowCreateProject(true)}
                />
              }
            />
            <Route
              path="projects"
              element={
                role === "principal" ? (
                  <PrincipalInstitutionalViews viewType="projects" />
                ) : role === "admin" ? (
                  <AdminSubViews viewType="projects" />
                ) : (
                  <Navigate to="../my-projects" replace />
                )
              }
            />
            <Route
              path="my-applications"
              element={<MyApplications setActiveTab={handleTabChange} />}
            />
            <Route
              path="applications"
              element={
                role === "principal" ? (
                  <PrincipalInstitutionalViews viewType="applications" />
                ) : role === "admin" ? (
                  <AdminSubViews viewType="applications" />
                ) : (
                  <Navigate to="../my-applications" replace />
                )
              }
            />
            {/* Dedicated Principal Institutional Views */}
            <Route
              path="students"
              element={<PrincipalInstitutionalViews viewType="students" />}
            />
            <Route
              path="faculty"
              element={<PrincipalInstitutionalViews viewType="faculty" />}
            />
            <Route
              path="departments"
              element={<Navigate to="../department-analytics" replace />}
            />
            <Route
              path="department-analytics"
              element={<PrincipalInstitutionalViews viewType="department-analytics" />}
            />
            <Route
              path="reports"
              element={
                role === "principal" ? (
                  <PrincipalInstitutionalViews viewType="reports" />
                ) : role === "admin" ? (
                  <AdminSubViews viewType="reports" />
                ) : (
                  <Navigate to="../dashboard" replace />
                )
              }
            />
            {/* Dedicated Admin Sub-Views */}
            <Route
              path="users"
              element={<AdminSubViews viewType="users" />}
            />
            <Route
              path="logs"
              element={<AdminSubViews viewType="logs" />}
            />
            <Route
              path="notifications"
              element={<PrincipalInstitutionalViews viewType="notifications" />}
            />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:conversationId" element={<Messages />} />
            <Route path="leaderboards" element={<Leaderboards />} />
            <Route path="community" element={<Community />} />
            <Route path="resources" element={<Resources />} />
            <Route
              path="ai-assistant"
              element={
                <AIAssistant
                  setActiveTab={handleTabChange}
                  onOpenOnboarding={() => setShowOnboarding(true)}
                />
              }
            />
            <Route
              path="profile/:userId"
              element={
                <Profile
                  setActiveTab={handleTabChange}
                  onOpenOnboarding={() => setShowOnboarding(true)}
                />
              }
            />
            <Route
              path="profile"
              element={
                <Profile
                  setActiveTab={handleTabChange}
                  onOpenOnboarding={() => setShowOnboarding(true)}
                />
              }
            />
            <Route path="settings" element={role === 'admin' ? <AdminSubViews viewType="settings" /> : <Settings />} />

            {/* Default redirect to role dashboard */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={() => handleTabChange("explore-projects")}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized403 />} />

      {/* Root Path Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Protected Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <RoleAppShell />
          </ProtectedRoute>
        }
      />

      {/* Protected Mentor Routes */}
      <Route
        path="/mentor/*"
        element={
          <ProtectedRoute allowedRoles={["mentor"]}>
            <RoleAppShell />
          </ProtectedRoute>
        }
      />


      {/* Protected Principal Routes */}
      <Route
        path="/principal/*"
        element={
          <ProtectedRoute allowedRoles={["principal"]}>
            <RoleAppShell />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RoleAppShell />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All Invalid Route */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}
