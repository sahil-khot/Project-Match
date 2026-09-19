import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Award,
  Github,
  Linkedin,
  Globe,
  FileText,
  CheckCircle2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  FolderGit2,
  Loader2,
  Clock,
  Camera,
  X,
  Code2,
  Compass,
  Plus,
  Sparkles,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import authApi from "../services/authApi";
import studentApi from "../services/studentApi";
import projectApi from "../services/projectApi";
import applicationApi from "../services/applicationApi";
import OnboardingModal from "../components/OnboardingModal";

export default function Profile({ onOpenOnboarding, setActiveTab }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const isOwnProfile = !userId || userId === user?._id || userId === user?.id;
  const [profile, setProfile] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleOpenEdit = () => {
    if (onOpenOnboarding) {
      onOpenOnboarding();
    } else {
      setShowEditModal(true);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId, isOwnProfile]);

  useEffect(() => {
    if (location.state?.openEdit && isOwnProfile) {
      handleOpenEdit();
    }
  }, [location.state, isOwnProfile]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileData();
      setShowSuccessToast(true);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profRes, projRes, appRes] = await Promise.all([
        studentApi.getProfile(userId),
        isOwnProfile
          ? projectApi.getMyProjects().catch(() => ({ projects: [] }))
          : Promise.resolve({ projects: [] }),
        applicationApi
          .getMyApplications()
          .catch(() => ({ data: { applications: [] } })),
      ]);

      if (profRes?.success && profRes.profile) {
        setProfile(profRes.profile);
      }
      if (projRes?.success) {
        setMyProjects(projRes.projects || []);
      }
      if (appRes?.success) {
        setMyApplications(appRes.applications || []);
      }
    } catch (e) {
      console.error("Failed to fetch profile data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarUploading(true);
    try {
      const result = await authApi.uploadAvatar(formData);
      if (result?.success) {
        setUser((current) => ({ ...current, avatar: result.avatar }));
        setProfile((current) =>
          current
            ? { ...current, user: { ...current.user, avatar: result.avatar } }
            : current,
        );
      }
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const name = user?.name || profile?.user?.name || "Student";
  const email = user?.email || profile?.user?.email || "";
  const college =
    profile?.college ||
    user?.college ||
    "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";
  const dept =
    profile?.department || user?.department || "Computer Engineering";
  const year = profile?.currentYear || profile?.academicYear || "3rd Year";
  const cgpa = profile?.cgpa ? profile.cgpa.toFixed(2) : "—";
  const bio = profile?.bio || "";
  const skills = profile?.skills || profile?.technicalSkills || [];
  const interests = profile?.interests || profile?.preferredDomains || [];
  const studentId = profile?.studentId || "";
  const availability = profile?.availability || "Available for Projects";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PM";

  const acceptedAppsCount = myApplications.filter(
    (a) => a.status === "Accepted",
  ).length;

  const profilePct = profile?.profileCompletion ?? (skills.length > 0 ? 85 : 40);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-[3px] border-[#353535] border-t-[#FF8A00] rounded-full animate-spin" />
        <p className="text-[#777777] text-[14px]">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1380px] mx-auto text-[#F5F5F5]">
      {/* ── 1. Top Profile Header Card ── */}
      <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 md:p-7 shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with Camera Overlay */}
            <div className="relative w-[110px] h-[110px] rounded-full bg-[#181818] border-2 border-[#353535] text-[#FF8A00] font-bold text-3xl flex items-center justify-center shrink-0 overflow-hidden shadow-md">
              {user?.avatar || profile?.user?.avatar ? (
                <img
                  src={user?.avatar || profile?.user?.avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
              {isOwnProfile && (
                <label
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#FF8A00] hover:bg-[#FFAE42] text-[#181818] flex items-center justify-center cursor-pointer border-2 border-[#242424] transition-colors shadow-sm"
                  title="Upload profile picture"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[26px] md:text-[28px] font-bold text-[#FFFFFF] tracking-tight">
                  {name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-[12px] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user?.verificationStatus || "Verified Student"}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 text-[12px] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                  <span>{availability}</span>
                </span>
              </div>

              <p className="text-[15px] text-[#FF8A00] font-semibold">
                {dept} · {year}
              </p>

              <p className="text-[14px] text-[#A0A0A0] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#777777] shrink-0" />
                <span className="line-clamp-1">{college}</span>
              </p>

              {bio ? (
                <p className="text-[14px] text-[#D4D4D4] max-w-2xl line-clamp-2 pt-0.5 leading-relaxed">
                  {bio}
                </p>
              ) : (
                <p className="text-[13.5px] text-[#777777] italic pt-0.5">
                  No bio added yet. Click &quot;Edit Profile&quot; to introduce yourself to peers and mentors.
                </p>
              )}

              {/* Social Links Pills */}
              <div className="flex items-center gap-3 pt-1 text-[13px] text-[#A0A0A0] flex-wrap">
                {profile?.socialLinks?.github && (
                  <a
                    href={`https://${profile.socialLinks.github.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#181818] hover:bg-[#282828] border border-[#353535] text-[#D4D4D4] hover:text-[#FFFFFF] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {profile?.socialLinks?.linkedin && (
                  <a
                    href={`https://${profile.socialLinks.linkedin.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#181818] hover:bg-[#282828] border border-[#353535] text-[#D4D4D4] hover:text-[#FFFFFF] transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {profile?.socialLinks?.portfolio && (
                  <a
                    href={`https://${profile.socialLinks.portfolio.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#181818] hover:bg-[#282828] border border-[#353535] text-[#D4D4D4] hover:text-[#FFFFFF] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {isOwnProfile ? (
            <button
              onClick={handleOpenEdit}
              className="h-[42px] px-5 bg-[#FF8A00] hover:bg-[#FFAE42] text-[#181818] font-bold rounded-[8px] text-[15px] flex items-center gap-2 self-start md:self-auto transition-all shadow cursor-pointer shrink-0"
            >
              <Pencil className="w-4 h-4 stroke-[2.5]" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() =>
                navigate("../messages", { state: { recipientId: userId } })
              }
              className="h-[42px] px-5 bg-[#FF8A00] hover:bg-[#FFAE42] text-[#181818] font-bold rounded-[8px] text-[15px] flex items-center gap-2 self-start md:self-auto transition-all shadow cursor-pointer shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Message</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Top 4 Overview Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div
          onClick={() => setActiveTab && setActiveTab("my-projects")}
          className="bg-[#242424] border border-[#353535] hover:border-[#FF8A00]/50 rounded-[10px] p-5 cursor-pointer transition-colors shadow-card flex flex-col justify-between"
        >
          <p className="text-[13px] text-[#A0A0A0] font-medium">Active Projects</p>
          <p className="text-[26px] font-extrabold text-[#FFFFFF] mt-1">
            {myProjects.length}
          </p>
          <p className="text-[12.5px] text-[#FF8A00] mt-1 truncate">
            {myProjects[0]?.title ? myProjects[0].title : "No active projects"}
          </p>
        </div>

        {/* Cumulative CGPA */}
        <div className="bg-[#242424] border border-[#353535] rounded-[10px] p-5 shadow-card flex flex-col justify-between">
          <p className="text-[13px] text-[#A0A0A0] font-medium">Cumulative CGPA</p>
          <p className="text-[26px] font-extrabold text-[#22C55E] mt-1">
            {cgpa}
          </p>
          <p className="text-[12.5px] text-[#777777] mt-1">
            Verified Academic Record
          </p>
        </div>

        {/* Profile Completion */}
        <div
          onClick={handleOpenEdit}
          className="bg-[#242424] border border-[#353535] hover:border-[#FF8A00]/50 rounded-[10px] p-5 cursor-pointer transition-colors shadow-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[#A0A0A0] font-medium">Profile Completion</p>
            <span className="text-[11px] text-[#FF8A00] font-bold">Edit →</span>
          </div>
          <p className="text-[26px] font-extrabold text-[#FFFFFF] mt-1">
            {profilePct}%
          </p>
          <p className="text-[12.5px] text-[#22C55E] mt-1">
            {profilePct === 100 ? "Fully Completed" : "Complete remaining fields"}
          </p>
        </div>

        {/* Applications Sent */}
        <div
          onClick={() => setActiveTab && setActiveTab("my-applications")}
          className="bg-[#242424] border border-[#353535] hover:border-[#FF8A00]/50 rounded-[10px] p-5 cursor-pointer transition-colors shadow-card flex flex-col justify-between"
        >
          <p className="text-[13px] text-[#A0A0A0] font-medium">Applications Sent</p>
          <p className="text-[26px] font-extrabold text-[#FFFFFF] mt-1">
            {myApplications.length}
          </p>
          <p className="text-[12.5px] text-[#22C55E] mt-1">
            {acceptedAppsCount} Accepted
          </p>
        </div>
      </div>

      {/* ── 3. Balanced 2-Column Grid Layout (50% / 50%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ─── LEFT COLUMN ─── */}
        <div className="space-y-6">
          {/* Card L1: About & Academic Profile */}
          <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#FF8A00]/15 flex items-center justify-center text-[#FF8A00]">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-[17px] font-bold text-[#FFFFFF]">About & Academic Info</h3>
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleOpenEdit}
                  className="text-[12.5px] font-semibold text-[#FF8A00] hover:text-[#FFAE42] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Bio */}
            <div>
              <p className="text-[12px] uppercase tracking-wider font-semibold text-[#777777] mb-1.5">
                Bio
              </p>
              <p className="text-[14px] text-[#D4D4D4] leading-relaxed">
                {bio || "No personal bio added yet. Provide a summary of your technical background, career aspirations, and project goals."}
              </p>
            </div>

            {/* Academic Information Grid */}
            <div className="pt-2">
              <p className="text-[12px] uppercase tracking-wider font-semibold text-[#777777] mb-3">
                Academic Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[13.5px]">
                <div className="p-3 bg-[#181818] rounded-[8px] border border-[#353535]">
                  <span className="block text-[11.5px] text-[#777777] uppercase">Department</span>
                  <span className="font-semibold text-[#FFFFFF] mt-0.5 block truncate">{dept}</span>
                </div>

                <div className="p-3 bg-[#181818] rounded-[8px] border border-[#353535]">
                  <span className="block text-[11.5px] text-[#777777] uppercase">Academic Year</span>
                  <span className="font-semibold text-[#FFFFFF] mt-0.5 block">{year}</span>
                </div>

                <div className="p-3 bg-[#181818] rounded-[8px] border border-[#353535]">
                  <span className="block text-[11.5px] text-[#777777] uppercase">Student ID / Roll</span>
                  <span className="font-semibold text-[#FFFFFF] mt-0.5 block">{studentId || "Not assigned"}</span>
                </div>

                <div className="p-3 bg-[#181818] rounded-[8px] border border-[#353535]">
                  <span className="block text-[11.5px] text-[#777777] uppercase">Institutional Email</span>
                  <span className="font-semibold text-[#FFFFFF] mt-0.5 block truncate font-mono text-[12.5px]">{email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card L2: Technical Skills */}
          <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#3B82F6]/15 flex items-center justify-center text-[#3B82F6]">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-[17px] font-bold text-[#FFFFFF]">Technical Skills</h3>
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleOpenEdit}
                  className="text-[12.5px] font-semibold text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </button>
              )}
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[13px] font-medium px-3 py-1.5 rounded-[6px] bg-[#181818] text-[#F5F5F5] border border-[#353535] hover:border-[#3B82F6]/50 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#181818] border border-[#353535] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[13.5px] text-[#777777]">
                  No skills listed yet. Add programming languages, frameworks, or tools.
                </p>
                {isOwnProfile && (
                  <button
                    onClick={handleOpenEdit}
                    className="h-8 px-3 bg-[#3B82F6] hover:bg-[#2563EB] text-[#FFFFFF] font-bold text-[12px] rounded-[6px] transition-colors shrink-0 cursor-pointer"
                  >
                    + Add Skills
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card L3: Domains of Interest */}
          <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-[17px] font-bold text-[#FFFFFF]">Domains of Interest</h3>
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleOpenEdit}
                  className="text-[12.5px] font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </button>
              )}
            </div>

            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-[13px] font-medium px-3 py-1.5 rounded-[6px] bg-[#181818] text-[#D4D4D4] border border-[#353535] hover:border-[#8B5CF6]/50 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#181818] border border-[#353535] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[13.5px] text-[#777777]">
                  No domains chosen yet. Select your preferred fields of innovation.
                </p>
                {isOwnProfile && (
                  <button
                    onClick={handleOpenEdit}
                    className="h-8 px-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FFFFFF] font-bold text-[12px] rounded-[6px] transition-colors shrink-0 cursor-pointer"
                  >
                    + Add Domains
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="space-y-6">
          {/* Card R1: Projects & Contributions */}
          <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#FF8A00]/15 flex items-center justify-center text-[#FF8A00]">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <h3 className="text-[17px] font-bold text-[#FFFFFF]">Projects & Contributions</h3>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab("explore-projects")}
                className="text-[12.5px] text-[#FF8A00] hover:text-[#FFAE42] font-semibold transition-colors cursor-pointer"
              >
                Browse all →
              </button>
            </div>

            {myProjects.length > 0 ? (
              <div className="space-y-3 pt-1">
                {myProjects.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    className="p-4 bg-[#181818] rounded-[8px] border border-[#353535] hover:border-[#FF8A00]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-[15px] font-bold text-[#FFFFFF]">
                          {p.title}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#242424] text-[#A0A0A0] border border-[#353535]">
                          {p.domain}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#A0A0A0] line-clamp-1">
                        {p.description}
                      </p>
                    </div>
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 shrink-0 self-start sm:self-auto">
                      {p.status || "Active"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-[#181818] rounded-[10px] border border-[#353535] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 flex items-center justify-center text-[#FF8A00] mx-auto">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#FFFFFF]">No projects joined yet</h4>
                  <p className="text-[13px] text-[#A0A0A0] max-w-sm mx-auto mt-1 leading-relaxed">
                    Explore active university projects across departments, or create your own idea to build your portfolio.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab("explore-projects")}
                    className="h-8 px-4 bg-[#FF8A00] hover:bg-[#FFAE42] text-[#181818] font-bold text-[12.5px] rounded-[6px] transition-colors cursor-pointer shadow-sm"
                  >
                    Explore Projects
                  </button>
                  <button
                    onClick={() => setActiveTab && setActiveTab("my-projects")}
                    className="h-8 px-4 bg-[#242424] hover:bg-[#282828] border border-[#353535] text-[#FFFFFF] font-semibold text-[12.5px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    My Projects
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card R2: Verified Academic Assets */}
          <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#FFFFFF]">Verified Academic Assets</h3>
                </div>
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleOpenEdit}
                  className="text-[12.5px] font-semibold text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Upload / Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-3 pt-1">
              {/* Student Resume */}
              <div className="p-4 bg-[#181818] rounded-[8px] border border-[#353535] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    profile?.resume ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#777777]/15 text-[#777777]'
                  }`}>
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#FFFFFF] text-[14.5px] truncate">
                      Student Resume
                    </p>
                    <p className={`text-[12px] ${profile?.resume ? 'text-[#22C55E]' : 'text-[#777777]'}`}>
                      {profile?.resume ? "Uploaded & Verified" : "Pending Upload"}
                    </p>
                  </div>
                </div>

                {profile?.resume ? (
                  <a
                    href={`/api/students/documents/${profile.resume.split("/").pop()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 rounded-[6px] bg-[#242424] hover:bg-[#282828] border border-[#353535] text-[#22C55E] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : isOwnProfile ? (
                  <button
                    onClick={handleOpenEdit}
                    className="h-8 px-3 rounded-[6px] bg-[#242424] hover:bg-[#282828] border border-[#353535] text-[#FF8A00] text-[12px] font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    Upload
                  </button>
                ) : (
                  <Clock className="w-4 h-4 text-[#777777] shrink-0" />
                )}
              </div>

              {/* Semester Marksheet */}
              <div className="p-4 bg-[#181818] rounded-[8px] border border-[#353535] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    profile?.marksheet ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#777777]/15 text-[#777777]'
                  }`}>
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#FFFFFF] text-[14.5px] truncate">
                      Semester Marksheet
                    </p>
                    <p className={`text-[12px] ${profile?.marksheet ? 'text-[#22C55E]' : 'text-[#777777]'}`}>
                      {profile?.marksheet ? `CGPA ${cgpa} Verified` : "Pending Upload"}
                    </p>
                  </div>
                </div>

                {profile?.marksheet ? (
                  <a
                    href={`/api/students/documents/${profile.marksheet.split("/").pop()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 rounded-[6px] bg-[#242424] hover:bg-[#282828] border border-[#353535] text-[#22C55E] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : isOwnProfile ? (
                  <button
                    onClick={handleOpenEdit}
                    className="h-8 px-3 rounded-[6px] bg-[#242424] hover:bg-[#282828] border border-[#353535] text-[#FF8A00] text-[12px] font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    Upload
                  </button>
                ) : (
                  <Clock className="w-4 h-4 text-[#777777] shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Card R3: Connected Profiles */}
          <div className="bg-[#242424] border border-[#353535] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#3B82F6]/15 flex items-center justify-center text-[#3B82F6]">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-[17px] font-bold text-[#FFFFFF]">Connected Profiles</h3>
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleOpenEdit}
                  className="text-[12.5px] font-semibold text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Connect</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              {profile?.socialLinks?.github ? (
                <a
                  href={`https://${profile.socialLinks.github.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#181818] hover:bg-[#202020] border border-[#353535] rounded-[8px] flex items-center justify-between text-[13.5px] text-[#D4D4D4] hover:text-[#FFFFFF] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Github className="w-4 h-4 text-[#FFFFFF]" />
                    <span className="font-medium">GitHub</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777]" />
                </a>
              ) : (
                <div className="p-3 bg-[#181818] border border-[#353535] rounded-[8px] flex items-center justify-between text-[13px] text-[#777777]">
                  <span className="flex items-center gap-2.5">
                    <Github className="w-4 h-4 text-[#555555]" />
                    <span>GitHub: Not connected</span>
                  </span>
                  {isOwnProfile && (
                    <button onClick={handleOpenEdit} className="text-[#FF8A00] font-semibold hover:underline">Link</button>
                  )}
                </div>
              )}

              {profile?.socialLinks?.linkedin ? (
                <a
                  href={`https://${profile.socialLinks.linkedin.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#181818] hover:bg-[#202020] border border-[#353535] rounded-[8px] flex items-center justify-between text-[13.5px] text-[#D4D4D4] hover:text-[#FFFFFF] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Linkedin className="w-4 h-4 text-[#3B82F6]" />
                    <span className="font-medium">LinkedIn</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777]" />
                </a>
              ) : (
                <div className="p-3 bg-[#181818] border border-[#353535] rounded-[8px] flex items-center justify-between text-[13px] text-[#777777]">
                  <span className="flex items-center gap-2.5">
                    <Linkedin className="w-4 h-4 text-[#555555]" />
                    <span>LinkedIn: Not connected</span>
                  </span>
                  {isOwnProfile && (
                    <button onClick={handleOpenEdit} className="text-[#FF8A00] font-semibold hover:underline">Link</button>
                  )}
                </div>
              )}

              {profile?.socialLinks?.portfolio && (
                <a
                  href={`https://${profile.socialLinks.portfolio.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#181818] hover:bg-[#202020] border border-[#353535] rounded-[8px] flex items-center justify-between text-[13.5px] text-[#D4D4D4] hover:text-[#FFFFFF] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-[#22C55E]" />
                    <span className="font-medium">Portfolio Website</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 px-5 py-3.5 bg-[#172B1E] border border-[#22C55E]/60 text-[#F5F5F5] rounded-[10px] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="w-9 h-9 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[14.5px] font-bold text-[#F5F5F5] leading-tight">
              Profile updated successfully
            </p>
            <p className="text-[12.5px] text-[#A0A0A0] mt-0.5">
              Your profile changes have been verified and saved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            className="text-[#A0A0A0] hover:text-[#F5F5F5] p-1 ml-2 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Local Onboarding Modal (Fallback) */}
      {!onOpenOnboarding && (
        <OnboardingModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onComplete={() => {
            setShowSuccessToast(true);
            fetchProfileData();
          }}
        />
      )}
    </div>
  );
}
