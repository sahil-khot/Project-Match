import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  Filter,
  ArrowUpRight,
  Loader2,
  Trash2,
  X,
  User,
  Award,
  FolderGit2,
  Send,
  Inbox,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import applicationApi from "../services/applicationApi";

export default function MyApplications({ setActiveTab }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabType, setActiveTabType] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest First");
  const [selectedApp, setSelectedApp] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);
  const [isDeletingApp, setIsDeletingApp] = useState(false);

  const handleConfirmDeleteApp = async () => {
    if (!appToDelete) return;
    try {
      setIsDeletingApp(true);
      const res = await applicationApi.deleteApplication(appToDelete._id);
      if (res?.success) {
        setApplications((prev) => prev.filter((a) => a._id !== appToDelete._id));
        setAppToDelete(null);
      } else {
        alert(res?.message || "Failed to delete application.");
      }
    } catch (err) {
      console.error("Error deleting application:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete application.");
    } finally {
      setIsDeletingApp(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTabType, selectedSort]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getMyApplications({
        category: activeTabType,
        sort: selectedSort,
      });
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTabType === "All") return true;
    if (activeTabType === "Projects") return app.type === "Project Application";
    if (activeTabType === "Mentorship")
      return app.type === "Mentorship Request";
    if (activeTabType === "Invitations") return app.type === "Team Invitation";
    return true;
  });

  const totalCount = applications.length;
  const inReviewCount = applications.filter(
    (a) => a.status === "In Review" || a.status === "Pending",
  ).length;
  const acceptedCount = applications.filter(
    (a) => a.status === "Accepted",
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "Rejected",
  ).length;

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
            My Applications
          </h1>
          <span className="text-[13.5px] px-3 py-0.5 rounded-full bg-[rgba(255,138,0,0.10)] text-[#FF8A00] border border-[rgba(255,138,0,0.35)] font-semibold">
            {totalCount} Total
          </span>
        </div>
        <p className="text-[16px] text-[#A0A0A0] mt-1.5">
          Track the status of your project membership applications, mentorship
          requests, and hackathon team invitations.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#262626] border border-[#3A3A3A] p-4.5 rounded-[10px] flex items-center justify-between shadow-card">
          <div>
            <span className="text-[14px] text-[#A0A0A0] font-medium block">
              Total Applied
            </span>
            <span className="text-[28px] font-bold text-[#F5F5F5] mt-0.5 block leading-tight">
              {totalCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-[8px] bg-[#1A1A1A] border border-[#3A3A3A] flex items-center justify-center text-[#A0A0A0]">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#262626] border border-[#3A3A3A] p-4.5 rounded-[10px] flex items-center justify-between shadow-card">
          <div>
            <span className="text-[14px] text-[#A0A0A0] font-medium block">
              In Review
            </span>
            <span className="text-[28px] font-bold text-[#3B82F6] mt-0.5 block leading-tight">
              {inReviewCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-[8px] bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#262626] border border-[#3A3A3A] p-4.5 rounded-[10px] flex items-center justify-between shadow-card">
          <div>
            <span className="text-[14px] text-[#A0A0A0] font-medium block">
              Accepted
            </span>
            <span className="text-[28px] font-bold text-[#22C55E] mt-0.5 block leading-tight">
              {acceptedCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-[8px] bg-[rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.30)] flex items-center justify-center text-[#22C55E]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#262626] border border-[#3A3A3A] p-4.5 rounded-[10px] flex items-center justify-between shadow-card">
          <div>
            <span className="text-[14px] text-[#A0A0A0] font-medium block">
              Rejected
            </span>
            <span className="text-[28px] font-bold text-[#EF4444] mt-0.5 block leading-tight">
              {rejectedCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-[8px] bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#EF4444]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter / Tabs Row */}
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-card">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-[14px]">
          {["All", "Projects", "Mentorship", "Invitations"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTabType(tab)}
              className={`px-4 py-1.5 rounded-[8px] font-medium transition-colors cursor-pointer ${
                activeTabType === tab
                  ? "bg-[#FF8A00] text-[#1A1A1A] font-semibold"
                  : "text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#2D2D2D]"
              }`}
            >
              {tab === "All" ? "All Applications" : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-[14px]">
          <Filter className="w-4 h-4 text-[#777777]" />
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="h-[38px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[14px] rounded-[8px] px-3 focus:outline-none focus:border-[#FF8A00] transition-colors"
          >
            <option value="Newest First">Newest First</option>
            <option value="Oldest First">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-[#777777] bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF8A00] mb-2.5" />
          <span className="text-[15px] text-[#A0A0A0]">
            Loading applications...
          </span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-[#262626] border border-[#3A3A3A] rounded-[10px]">
          <FileEdit className="w-10 h-10 text-[#777777] mx-auto mb-2.5" />
          <h3 className="text-[18px] font-semibold text-[#F5F5F5]">
            No applications found
          </h3>
          <p className="text-[14px] text-[#777777] mt-1">
            You haven't submitted any applications in this category yet. Explore
            projects or search for faculty mentors!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isSentInvitation =
              app.type === "Team Invitation" &&
              ((app.sender?._id || app.sender)?.toString() === currentUserId?.toString());
            const isReceivedInvitation =
              app.type === "Team Invitation" && !isSentInvitation;
            const isMentorship = app.type === "Mentorship Request";
            const isProjectApp = app.type === "Project Application";

            // Target recipient or mentor or leader name
            const personDetails = isSentInvitation
              ? {
                  label: "Sent to:",
                  name: app.recipient?.name || app.targetName || "Invited Student",
                  extra: app.recipient?.department ? `${app.recipient.department}` : null
                }
              : isMentorship
              ? {
                  label: "Faculty Mentor:",
                  name: app.mentor?.name || app.targetName || "Professor",
                  extra: app.mentor?.department ? `${app.mentor.department}` : null
                }
              : isReceivedInvitation
              ? {
                  label: "Invited by:",
                  name: app.sender?.name || "Project Leader",
                  extra: app.sender?.department ? `${app.sender.department}` : null
                }
              : null;

            return (
              <div
                key={app._id}
                className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/50 rounded-[12px] p-6 lg:p-7 transition-all duration-200 shadow-card flex flex-col gap-4"
              >
                {/* Card Top Row: Badges and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#3A3A3A]/70">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-[12px] font-bold px-2.5 py-1 rounded-[6px] border flex items-center gap-1.5 ${
                        isSentInvitation
                          ? "bg-[#FF8A00]/15 text-[#FF8A00] border-[#FF8A00]/35"
                          : isReceivedInvitation
                          ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/35"
                          : isMentorship
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/35"
                          : "bg-emerald-500/15 text-[#22C55E] border-[#22C55E]/35"
                      }`}
                    >
                      {isSentInvitation && <Send className="w-3.5 h-3.5" />}
                      {isReceivedInvitation && <Inbox className="w-3.5 h-3.5" />}
                      {isMentorship && <Award className="w-3.5 h-3.5" />}
                      {isProjectApp && <FolderGit2 className="w-3.5 h-3.5" />}
                      <span>
                        {isSentInvitation
                          ? "Outgoing Team Invite"
                          : isReceivedInvitation
                          ? "Incoming Team Invite"
                          : app.type}
                      </span>
                    </span>

                    <span
                      className={`text-[12px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        app.status === "Accepted"
                          ? "bg-[rgba(34,197,94,0.12)] text-[#22C55E] border-[rgba(34,197,94,0.35)]"
                          : app.status === "Rejected"
                          ? "bg-red-500/15 text-[#EF4444] border-red-500/35"
                          : "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/35"
                      }`}
                    >
                      {app.status === "Accepted" && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {app.status === "Rejected" && (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {(app.status === "In Review" || app.status === "Pending") && (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{app.status}</span>
                    </span>

                    <span className="text-[12px] text-[#777777] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#777777]" />
                      <span>
                        {new Date(
                          app.appliedDate || app.createdAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {app.project && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTab && setActiveTab("explore-projects")
                        }
                        className="h-[38px] px-3.5 rounded-[8px] text-[13.5px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#F5F5F5] transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="View project requirements"
                      >
                        <span>Project Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#A0A0A0]" />
                      </button>
                    )}
                    {app.status === "Accepted" && app.project && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTab && setActiveTab("my-projects")
                        }
                        className="h-[38px] px-4 rounded-[8px] text-[13.5px] font-bold bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] transition-all cursor-pointer shadow-sm"
                      >
                        Open Workspace
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAppToDelete(app)}
                      className="h-[38px] px-3 rounded-[8px] text-[13px] font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-[#EF4444] transition-colors flex items-center gap-1.5 cursor-pointer"
                      title={isSentInvitation ? "Cancel invitation" : "Delete request"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isSentInvitation ? "Cancel Invite" : "Delete"}</span>
                    </button>
                  </div>
                </div>

                {/* Card Body: Title and Details */}
                <div className="space-y-2">
                  <h3 className="text-[19px] font-bold text-[#F5F5F5] tracking-tight">
                    {app.title}
                  </h3>

                  {/* Context Metadata Pill Row */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[13.5px] text-[#A0A0A0]">
                    {personDetails && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#FF8A00]" />
                        <span className="text-[#A0A0A0]">{personDetails.label}</span>
                        <span className="font-semibold text-[#F5F5F5]">
                          {personDetails.name}
                        </span>
                        {personDetails.extra && (
                          <span className="text-[12px] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#3A3A3A] text-[#A0A0A0]">
                            {personDetails.extra}
                          </span>
                        )}
                      </div>
                    )}

                    {app.project && (
                      <div className="flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4 text-[#777777]" />
                        <span className="text-[#A0A0A0]">Project:</span>
                        <span className="font-medium text-[#D4D4D4]">
                          {app.project.title || app.title}
                        </span>
                        {app.project.domain && (
                          <span className="text-[11.5px] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#3A3A3A] text-[#FF8A00]">
                            {app.project.domain}
                          </span>
                        )}
                      </div>
                    )}

                    {app.category && !app.project && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#777777]" />
                        <span className="text-[#A0A0A0]">Domain:</span>
                        <span className="font-medium text-[#D4D4D4]">
                          {app.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags if any */}
                {app.tags && app.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {app.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11.5px] px-2.5 py-0.5 rounded-[4px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cover Note & Feedback */}
                {(app.coverNote || app.feedback) && (
                  <div className="pt-3 border-t border-[#3A3A3A]/60 space-y-2 text-[13.5px]">
                    {app.coverNote && (
                      <div className="bg-[#1A1A1A] p-3.5 rounded-[8px] border border-[#3A3A3A]">
                        <p className="text-[#777777] font-semibold mb-1">
                          {isSentInvitation ? "Invitation Note Sent:" : "Cover Note / Proposal:"}
                        </p>
                        <p className="text-[#D4D4D4] leading-relaxed whitespace-pre-wrap">
                          {app.coverNote}
                        </p>
                      </div>
                    )}
                    {app.feedback && (
                      <div className="p-3.5 rounded-[8px] bg-purple-500/10 border border-purple-500/30 text-[#F5F5F5]">
                        <span className="font-bold text-purple-300">
                          Feedback & Decision Note:{" "}
                        </span>
                        <p className="text-[#E0E0E0] mt-1 leading-relaxed whitespace-pre-wrap">
                          {app.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Application Confirmation Modal */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-md p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setAppToDelete(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-[10px] bg-red-500/15 border border-red-500/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-[#F5F5F5]">Delete Application</h3>
                <p className="text-[13px] text-[#A0A0A0]">Withdraw and remove application</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 bg-[#1A1A1A] p-4 rounded-[8px] border border-[#3A3A3A]">
              <p className="text-[15px] font-semibold text-[#F5F5F5]">
                Are you sure you want to delete this application?
              </p>
              <p className="text-[14px] text-[#FF8A00] font-medium">
                "{appToDelete.title}"
              </p>
              <p className="text-[13px] text-[#777777]">
                Type: {appToDelete.type} • Status: {appToDelete.status}. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAppToDelete(null)}
                className="h-[40px] px-4.5 text-[14px] font-semibold text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteApp}
                disabled={isDeletingApp}
                className="h-[40px] px-5 font-bold text-[14px] text-white bg-[#DC2626] hover:bg-[#EF4444] rounded-[8px] cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingApp ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
