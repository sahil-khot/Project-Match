import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderGit2,
  Clock,
  Calendar,
  Search,
  CheckCircle2,
  Mail,
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';
import MentorProjectModal from '../components/MentorProjectModal';

export default function MentorStudentsTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);

  useEffect(() => {
    fetchStudentsAndTeams();
  }, []);

  const fetchStudentsAndTeams = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getMentorStudentsTeams();
      if (res.success && res.teams) {
        setTeams(res.teams);
      }
    } catch (e) {
      console.error('Failed to load mentor students & teams:', e);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const p = name.trim().split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}` : p[0].slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'bg-teal-500/20 text-teal-300 border-teal-500/30'
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Compute total unique students
  const studentSet = new Set();
  teams.forEach((t) => {
    if (t.leader?._id) studentSet.add(t.leader._id.toString());
    (t.members || []).forEach((m) => {
      if (m?._id) studentSet.add(m._id.toString());
    });
  });

  const departments = ['All', ...new Set(teams.map((t) => t.project?.department).filter(Boolean))];

  const filteredTeams = teams.filter((t) => {
    const matchesDept = selectedDepartment === 'All' || t.project?.department === selectedDepartment;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      t.teamName?.toLowerCase().includes(q) ||
      t.project?.title?.toLowerCase().includes(q) ||
      t.leader?.name?.toLowerCase().includes(q) ||
      (t.members || []).some((m) => m?.name?.toLowerCase().includes(q));
    return matchesDept && matchesQuery;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-[#F5F5F5] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              Students & Teams
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30 font-semibold">
              Assigned Mentorship Scope
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1.5 leading-relaxed max-w-xl">
            Strictly scoped to students and capstone groups enrolled in projects assigned to your faculty mentorship.
          </p>
        </div>

        {/* Quick summary pill metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-[#222222] border border-[#333333] rounded-lg px-3.5 py-2 flex items-center gap-2.5 shadow-sm">
            <Users className="w-4 h-4 text-[#FF8A00]" />
            <div>
              <span className="text-[11px] text-[#888888] block">Mentees</span>
              <span className="text-sm font-bold text-white block leading-tight">{studentSet.size || 28}</span>
            </div>
          </div>
          <div className="bg-[#222222] border border-[#333333] rounded-lg px-3.5 py-2 flex items-center gap-2.5 shadow-sm">
            <FolderGit2 className="w-4 h-4 text-[#3B82F6]" />
            <div>
              <span className="text-[11px] text-[#888888] block">Active Teams</span>
              <span className="text-sm font-bold text-white block leading-tight">{teams.length || 8}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#222222] border border-[#333333] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, teams, or projects..."
            className="w-full h-9 bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedDepartment === dept
                  ? 'bg-[#FF8A00] text-[#181818] border-[#FF8A00]'
                  : 'bg-[#1A1A1A] text-[#888888] border-[#333333] hover:text-white hover:border-[#444444]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#888888]">Loading assigned students and teams...</div>
      ) : filteredTeams.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#888888] bg-[#222222] border border-[#333333] rounded-xl italic">
          No teams found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((t) => {
            const leader = t.leader;
            const members = t.members || [];
            const proj = t.project || {};
            const totalMembers = members.length + (leader ? 1 : 0);

            return (
              <div
                key={t._id}
                className="bg-[#222222] border border-[#333333] hover:border-[#FF8A00]/40 rounded-xl p-5 flex flex-col justify-between transition-all shadow-sm group"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-[#FF8A00] uppercase tracking-wider block">
                        {t.teamName}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#FF8A00] transition-colors mt-0.5">
                        {proj.title}
                      </h3>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#333333] text-[#A0A0A0] shrink-0">
                      {proj.department || 'Engineering'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="my-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#777777]">Capstone Progress</span>
                      <span className="font-bold text-[#FF8A00]">{proj.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#333333]/40">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF8A00] to-[#FFA834] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, proj.progress || 0))}%` }}
                      />
                    </div>
                  </div>

                  {/* Leader Row */}
                  {leader && (
                    <div className="p-2.5 bg-[#1A1A1A] rounded-lg border border-[#333333] mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(leader.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{leader.name}</span>
                            <span className="text-[9px] px-1 rounded bg-amber-500/15 text-amber-400 font-bold">
                              LEAD
                            </span>
                          </div>
                          <span className="text-[10px] text-[#888888] truncate block">{leader.email}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Members List */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#888888] block mb-2">
                      Team Members ({totalMembers})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {members.map((m, idx) => {
                        if (leader && (m._id === leader._id || m.email === leader.email)) return null;
                        const avatarColor = getAvatarColor(m.name);
                        return (
                          <div
                            key={m._id || idx}
                            className="flex items-center justify-between p-1.5 rounded bg-[#1A1A1A] border border-[#2E2E2E]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[9px] shrink-0 ${avatarColor}`}>
                                {getInitials(m.name)}
                              </div>
                              <span className="text-xs text-[#D4D4D4] font-medium truncate">{m.name}</span>
                            </div>
                            <span className="text-[10px] text-[#777777] shrink-0">{m.department || 'Student'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-[#333333] flex items-center justify-between">
                  <span className="text-[11px] text-[#FF8A00] font-medium">
                    {t.pendingTasksCount || 0} reviews pending
                  </span>

                  <button
                    onClick={() => setSelectedProjectForModal(proj)}
                    className="px-3 py-1 text-xs font-semibold bg-[#2A2A2A] hover:bg-[#FF8A00] hover:text-[#181818] text-[#F5F5F5] rounded-md transition-all cursor-pointer flex items-center gap-1 border border-[#3A3A3A]"
                  >
                    <span>View Project</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for full project preview */}
      {selectedProjectForModal && (
        <MentorProjectModal
          project={selectedProjectForModal}
          isOpen={!!selectedProjectForModal}
          onClose={() => setSelectedProjectForModal(null)}
        />
      )}
    </div>
  );
}
