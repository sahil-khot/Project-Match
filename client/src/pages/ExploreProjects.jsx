import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Compass,
  Search,
  Filter,
  Plus,
  Users,
  CheckCircle,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import projectApi from "../services/projectApi";

export default function ExploreProjects({
  setActiveTab,
  onSelectProject,
  onOpenCreateProject,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [applyCoverNote, setApplyCoverNote] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [selectedDomain, selectedStatus]);

  useEffect(() => {
    const targetProject = location.state?.project;
    const targetProjectId = location.state?.projectId || targetProject?._id;

    if (!targetProjectId) return;

    if (targetProject && targetProject.description && targetProject.members) {
      setProjectDetail(targetProject);
      return;
    }

    if (projects.length > 0) {
      const match = projects.find((p) => (p._id || p.id)?.toString() === targetProjectId.toString());
      if (match) {
        setProjectDetail(match);
        return;
      }
    }

    projectApi
      .getProjectById(targetProjectId)
      .then((res) => {
        if (res?.success && res.project) {
          setProjectDetail(res.project);
        }
      })
      .catch((err) => console.error("Failed to load project details:", err));
  }, [location.state, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjects({
        domain: selectedDomain,
        status: selectedStatus,
      });
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.domain?.toLowerCase().includes(q) ||
      p.techStack?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      setErrorMessage("");
      const data = await projectApi.applyToProject(
        selectedProject._id,
        applyCoverNote,
      );
      if (data.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setSelectedProject(null);
          setApplySuccess(false);
          setApplyCoverNote("");
        }, 1800);
      } else {
        setErrorMessage(data.message || "Application failed.");
      }
    } catch (err) {
      console.error("Error sending application:", err);
      setErrorMessage("Error sending application.");
    } finally {
      setSubmitting(false);
    }
  };

  const domains = [
    "All",
    "AI/ML",
    "Web Development",
    "IoT",
    "FinTech",
    "Sustainability",
    "Healthcare",
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
              Explore Projects
            </h1>
            <span className="text-[13.5px] px-3 py-0.5 rounded-full bg-[rgba(255,138,0,0.10)] text-[#FF8A00] border border-[rgba(255,138,0,0.35)] font-semibold">
              {filteredProjects.length} Active
            </span>
          </div>
          <p className="text-[16px] text-[#A0A0A0] mt-1.5">
            Find cutting-edge student projects, join cross-functional teams, or
            propose your own initiative.
          </p>
        </div>
        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="h-[42px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-semibold text-[16px] rounded-[8px] flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Post a New Project</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-5 space-y-4 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, domain, or technology (e.g., Python, React, IoT)..."
              className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] placeholder-[#777777] text-[16px] rounded-[8px] pl-10 pr-3.5 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#777777] shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[16px] rounded-[8px] px-3.5 focus:outline-none focus:border-[#FF8A00] transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Recruiting">Recruiting</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Idea">Idea</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-[14px]">
          <span className="text-[#777777] font-medium whitespace-nowrap">
            Domain:
          </span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3.5 py-1.5 rounded-[6px] whitespace-nowrap transition-all text-[14px] font-medium cursor-pointer ${
                selectedDomain === dom
                  ? "bg-[#FF8A00] text-[#1A1A1A] font-semibold"
                  : "bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A]"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#777777] bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF8A00] mb-2.5" />
          <span className="text-[15px] text-[#A0A0A0]">
            Loading projects from database...
          </span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[#262626] border border-[#3A3A3A] rounded-[10px]">
          <Compass className="w-10 h-10 text-[#777777] mx-auto mb-2.5" />
          <h3 className="text-[18px] font-semibold text-[#F5F5F5]">
            No projects found
          </h3>
          <p className="text-[14px] text-[#777777] mt-1">
            Try clearing your search query or selecting a different domain
            filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isCreator =
              project.creator?._id === user?._id ||
              project.creator === user?._id;
            const isMember = project.members?.some(
              (m) => m.user?._id === user?._id || m.user === user?._id,
            );

            return (
              <div
                key={project._id}
                className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/45 rounded-[10px] p-6 flex flex-col justify-between transition-all duration-200 group shadow-card"
              >
                <div className="space-y-4">
                  {/* Status & Domain Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-medium px-2.5 py-0.5 rounded-[4px] bg-[#1A1A1A] text-[#A0A0A0] border border-[#3A3A3A]">
                      {project.domain || "Engineering"}
                    </span>
                    <span
                      className={`text-[12.5px] font-semibold px-2.5 py-0.5 rounded-full ${
                        project.status === "Recruiting"
                          ? "bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.35)]"
                          : project.status === "Completed"
                            ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/35"
                            : "bg-[rgba(255,138,0,0.10)] text-[#FF8A00] border border-[rgba(255,138,0,0.35)]"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#F5F5F5] group-hover:text-[#FF8A00] transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-[14.5px] text-[#A0A0A0] mt-1.5 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Problem statement snippet */}
                  {project.problemStatement && (
                    <div className="p-3 bg-[#1A1A1A] rounded-[6px] border border-[#3A3A3A] text-[13.5px] text-[#A0A0A0]">
                      <span className="text-[#FF8A00] font-semibold">
                        Problem:{" "}
                      </span>
                      <span className="line-clamp-2 text-[#F5F5F5]">
                        {project.problemStatement}
                      </span>
                    </div>
                  )}

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack?.slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="text-[13px] font-mono px-2.5 py-0.5 rounded-[4px] bg-[#1A1A1A] text-[#F5F5F5] border border-[#3A3A3A]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack?.length > 4 && (
                      <span className="text-[12.5px] px-2 py-0.5 rounded-[4px] bg-[#1A1A1A] text-[#777777] border border-[#3A3A3A]">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-4 mt-4 border-t border-[#3A3A3A] space-y-4">
                  <div className="flex items-center justify-between text-[14px] text-[#A0A0A0]">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#FF8A00]" />
                      <span>
                        {project.members?.length || 1} / {project.teamSize || 4}{" "}
                        Members
                      </span>
                    </div>
                    {project.openPositions > 0 ? (
                      <span className="text-[#22C55E] font-semibold">
                        {project.openPositions} Spot
                        {project.openPositions > 1 ? "s" : ""} Open
                      </span>
                    ) : (
                      <span className="text-[#777777]">Team Full</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProjectDetail(project)}
                      className="flex-1 h-[40px] rounded-[8px] text-[15px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#F5F5F5] transition-colors text-center cursor-pointer"
                    >
                      Workspace
                    </button>
                    {!isCreator &&
                      !isMember &&
                      project.openPositions > 0 &&
                      project.status === "Recruiting" && (
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setErrorMessage("");
                          }}
                          className="flex-1 h-[40px] rounded-[8px] text-[15px] font-bold bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    {isMember && (
                      <span className="flex-1 h-[40px] flex items-center justify-center text-[14px] text-[#22C55E] font-medium bg-[rgba(34,197,94,0.10)] rounded-[8px] border border-[rgba(34,197,94,0.25)]">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore-only workspace details: this intentionally does not navigate to My Projects. */}
      {projectDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <section className="w-full max-w-4xl bg-[#262626] border border-[#3A3A3A] rounded-xl p-6 sm:p-7 shadow-2xl relative">
              <button onClick={() => setProjectDetail(null)} className="absolute top-5 right-5 text-[#A0A0A0] hover:text-white" aria-label="Close project details"><X className="w-5 h-5" /></button>
              <div className="pr-8"><p className="text-xs uppercase tracking-wider font-bold text-[#FF8A00]">Explore Projects · Workspace</p><h2 className="text-2xl sm:text-3xl font-bold mt-2">{projectDetail.title}</h2><p className="text-[#A0A0A0] leading-relaxed mt-3 max-w-3xl">{projectDetail.description}</p></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">{[['Status', projectDetail.status], ['Progress', `${projectDetail.progress || 0}%`], ['Domain', projectDetail.domain], ['Deadline', projectDetail.deadline ? new Date(projectDetail.deadline).toLocaleDateString() : 'To be planned']].map(([label, value]) => <div key={label} className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-3.5"><p className="text-xs text-[#777777]">{label}</p><p className="font-semibold mt-1 truncate">{value}</p></div>)}</div>
              <div className="grid lg:grid-cols-2 gap-5 mt-6"><div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-5"><h3 className="font-semibold">Team</h3><div className="space-y-3 mt-4"><div className="flex justify-between gap-3 text-sm"><span className="text-[#A0A0A0]">Team leader</span><span>{projectDetail.groupLeader?.name || projectDetail.creator?.name || 'Project lead'}</span></div>{(projectDetail.members || []).map((member, index) => <div key={member._id || index} className="flex justify-between gap-3 text-sm border-t border-[#3A3A3A] pt-3"><span>{member.user?.name || 'Team member'}</span><span className="text-[#A0A0A0]">{member.role || 'Member'}</span></div>)}<p className="text-sm text-[#A0A0A0] pt-2">{projectDetail.members?.length || 1} of {projectDetail.teamSize || 4} positions filled</p></div></div><div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-5"><h3 className="font-semibold">Project management</h3><p className="text-sm text-[#A0A0A0] mt-3">{projectDetail.problemStatement || 'The team is defining milestones and task ownership in this workspace.'}</p><div className="mt-4 h-2 bg-[#303030] rounded-full overflow-hidden"><div className="h-full bg-[#FF8A00]" style={{ width: `${projectDetail.progress || 0}%` }} /></div><p className="text-sm text-[#A0A0A0] mt-3">Task progress is managed by the project team. Open positions: {projectDetail.openPositions || 0}.</p></div></div>
              <div className="mt-5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-5"><h3 className="font-semibold">Tech stack & mentor</h3><div className="flex flex-wrap gap-2 mt-3">{(projectDetail.techStack || []).map((tech) => <span key={tech} className="pm-badge bg-[#303030] border border-[#3A3A3A] text-sm">{tech}</span>)}</div><p className="text-sm text-[#A0A0A0] mt-4">Mentor: <span className="text-[#F5F5F5]">{projectDetail.mentor?.name || 'Faculty mentor to be assigned'}</span></p></div>
              <div className="flex justify-end mt-6"><button onClick={() => setProjectDetail(null)} className="btn-secondary">Back to projects</button></div>
            </section>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-lg p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {applySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-[rgba(34,197,94,0.15)] text-[#22C55E] rounded-full flex items-center justify-center mx-auto border border-[rgba(34,197,94,0.3)]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  Application Submitted!
                </h3>
                <p className="text-[15px] text-[#A0A0A0] max-w-sm mx-auto">
                  Your application has been sent to the project team leader. You
                  will receive a notification when reviewed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <span className="text-[12px] font-bold text-[#FF8A00] uppercase tracking-wider">
                    Project Application
                  </span>
                  <h3 className="text-[20px] font-bold text-[#F5F5F5] mt-1">
                    Apply to {selectedProject.title}
                  </h3>
                  <p className="text-[14px] text-[#A0A0A0] mt-0.5">
                    Domain: {selectedProject.domain} · Open spots:{" "}
                    {selectedProject.openPositions}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-[8px] text-[14px] text-red-400">
                    {errorMessage}
                  </div>
                )}

                <div className="p-3.5 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A] text-[14px] text-[#A0A0A0] space-y-1">
                  <p className="font-semibold text-[#F5F5F5]">
                    Required Skills:
                  </p>
                  <p className="text-[#A0A0A0] font-mono text-[13px]">
                    {selectedProject.requiredSkills?.join(", ") ||
                      "Collaborative mindset, Problem solving"}
                  </p>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#A0A0A0] mb-1.5">
                    Pitch / Cover Note to Project Leader
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={applyCoverNote}
                    onChange={(e) => setApplyCoverNote(e.target.value)}
                    placeholder="Describe how your skills align with this project, previous projects, and what role you wish to contribute to..."
                    className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="h-[42px] px-5 rounded-[8px] text-[15px] text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-[42px] px-6 rounded-[8px] text-[16px] font-bold bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {submitting ? "Submitting..." : "Send Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
