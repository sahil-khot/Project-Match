import React from 'react';
import { X, Users, CheckCircle2, Clock, Calendar, ArrowUpRight, FolderGit2 } from 'lucide-react';

export default function MentorProjectModal({ project, isOpen, onClose, onReviewTask }) {
  if (!isOpen || !project) return null;

  const members = project.members || [];
  const leader = project.groupLeader || project.creator;

  const getInitials = (name) => {
    if (!name) return 'ST';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}` : p[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#222222] border border-[#333333] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-[#F5F5F5] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#333333] flex items-start justify-between bg-[#1C1C1C]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-8 h-8 rounded-lg bg-[#FF8A00]/10 border border-[#FF8A00]/25 flex items-center justify-center text-[#FF8A00]">
                <FolderGit2 className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">{project.title}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30 font-semibold">
                {project.progress || 0}% Complete
              </span>
            </div>
            <p className="text-xs text-[#888888]">
              {project.department || 'Engineering'} • {project.domain || 'Applied AI'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] mb-2 font-medium">
              <span>Overall Capstone Milestones</span>
              <span className="text-[#FF8A00] font-bold">{project.progress || 0}%</span>
            </div>
            <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden border border-[#333333]/50">
              <div
                className="h-full bg-gradient-to-r from-[#FF8A00] to-[#FFA834] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, project.progress || 0))}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
              <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Project Scope</h4>
              <p className="text-xs text-[#D4D4D4] leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Team Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#FF8A00]" /> Team Members ({members.length + (leader ? 1 : 0)})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {leader && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1A1A1A] border border-[#333333]">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(leader.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{leader.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        Lead
                      </span>
                    </div>
                    <span className="text-[11px] text-[#888888] block truncate">{leader.email}</span>
                  </div>
                </div>
              )}

              {members.map((m, idx) => {
                const u = m.user || m;
                if (leader && (u._id === leader._id || u.email === leader.email)) return null;
                return (
                  <div key={u._id || idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1A1A1A] border border-[#333333]">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-white truncate block">{u.name}</span>
                      <span className="text-[11px] text-[#888888] block truncate">{u.department || 'Student Member'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-center">
              <span className="text-[11px] text-[#888888] block">Pending Reviews</span>
              <span className="text-lg font-bold text-[#FF8A00] block mt-0.5">
                {project.pendingReviewsCount || 0}
              </span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-center">
              <span className="text-[11px] text-[#888888] block">Project Status</span>
              <span className="text-xs font-bold text-emerald-400 block mt-1">
                {project.status || 'Active'}
              </span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-center">
              <span className="text-[11px] text-[#888888] block">Target Deadline</span>
              <span className="text-xs font-medium text-[#D4D4D4] block mt-1">
                {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 30, 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#333333] flex justify-end gap-2.5 bg-[#1C1C1C]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#888888] hover:text-white bg-[#2A2A2A] hover:bg-[#333333] border border-[#3A3A3A] transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
