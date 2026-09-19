import React, { useState, useEffect } from 'react';
import {
  Folder,
  Users,
  Clock,
  Search,
  ArrowRight,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Plus
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';
import MentorProjectModal from '../components/MentorProjectModal';

export default function MentorAssignedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getMentorDashboard();
      if (res.success && res.assignedProjects) {
        setProjects(res.assignedProjects);
      }
    } catch (e) {
      console.error('Error fetching assigned projects:', e);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['All', ...new Set(projects.map((p) => p.department).filter(Boolean))];

  const filteredProjects = projects.filter((p) => {
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.domain?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-[#F5F5F5] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              Assigned Projects
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30 font-semibold">
              {projects.length} Total Projects
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1.5 leading-relaxed max-w-xl">
            Monitor, guide, and evaluate progress across all capstone and research projects assigned to your faculty mentorship.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#222222] border border-[#333333] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or domains..."
            className="w-full h-9 bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedDept === dept
                  ? 'bg-[#FF8A00] text-[#181818] border-[#FF8A00]'
                  : 'bg-[#1A1A1A] text-[#888888] border-[#333333] hover:text-white hover:border-[#444444]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#888888]">Loading assigned projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#888888] bg-[#222222] border border-[#333333] rounded-xl italic">
          No assigned projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const studentCount = (p.members?.length || 0) + (p.groupLeader ? 1 : 0) || 4;
            const pendingCount = p.pendingReviewsCount !== undefined ? p.pendingReviewsCount : 0;

            return (
              <div
                key={p._id}
                onClick={() => setSelectedProject(p)}
                className="bg-[#222222] border border-[#333333] hover:border-[#FF8A00]/40 rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:bg-[#252525]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#FF8A00]/10 border border-[#FF8A00]/25 text-[#FF8A00] flex items-center justify-center shrink-0">
                        <Folder className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#FF8A00] transition-colors truncate">
                        {p.title}
                      </h3>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#333333] text-[#A0A0A0] shrink-0">
                      {p.domain || 'AI & ML'}
                    </span>
                  </div>

                  <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed mb-3">
                    {p.description || `Capstone project in ${p.department || 'Engineering'}`}
                  </p>

                  {/* Progress */}
                  <div className="my-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#777777]">Capstone Progress</span>
                      <span className="font-bold text-[#FF8A00]">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#333333]/40">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF8A00] to-[#FFA834] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, p.progress || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="pt-3.5 mt-3 border-t border-[#333333] flex items-center justify-between text-[11px]">
                  <span className="text-[#888888] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#666666]" />
                    {studentCount} students
                  </span>
                  <span className="text-[#FF8A00] font-medium">
                    {pendingCount} pending reviews
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <MentorProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
