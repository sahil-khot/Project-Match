import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  BookOpen
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';
import applicationApi from '../services/applicationApi';

export default function MentorMentorshipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getMentorDashboard();
      if (res.success && res.pendingRequests) {
        setRequests(res.pendingRequests);
      }
    } catch (e) {
      console.error('Failed to load mentorship requests:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAction = async (appId, action, applicantName) => {
    try {
      const status = action === 'accept' ? 'Accepted' : 'Rejected';
      const feedback = action === 'accept'
        ? 'Mentorship request accepted. Let us connect in team chat.'
        : 'Currently at full mentee capacity for this capstone cycle.';

      const res = await applicationApi.updateStatus(appId, status, feedback);
      if (res.success) {
        showToast(`Request for ${applicantName || 'student'} ${action === 'accept' ? 'accepted' : 'declined'}.`);
        fetchRequests();
      } else {
        alert(res.message || 'Failed to update request');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating request');
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
      'bg-teal-500/20 text-teal-300 border-teal-500/30'
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      r.applicant?.name?.toLowerCase().includes(q) ||
      r.project?.title?.toLowerCase().includes(q) ||
      r.applicant?.department?.toLowerCase().includes(q);
    return matchesQuery;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-[#F5F5F5] font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#222222] border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              Mentorship Requests
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
              {requests.length} Pending
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1.5 leading-relaxed max-w-xl">
            Review incoming research and capstone mentorship applications from ambitious student project teams.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#222222] border border-[#333333] rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or project name..."
            className="w-full h-9 bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#888888]">Loading mentorship requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#888888] bg-[#222222] border border-[#333333] rounded-xl italic">
          No pending mentorship requests at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((r) => {
            const studentName = r.applicant?.name || 'Student';
            const dept = r.applicant?.department || 'Engineering';
            const cgpa = r.applicant?.cgpa ? `CGPA: ${r.applicant.cgpa}` : 'CGPA: 8.8';
            const projTitle = r.project?.title || 'Capstone Project';
            const avatarColor = getAvatarColor(studentName);

            return (
              <div
                key={r._id}
                className="bg-[#222222] border border-[#333333] hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}>
                        {getInitials(studentName)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white truncate block">{studentName}</span>
                        <span className="text-[11px] text-[#888888] block truncate">
                          {dept} • {cgpa}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A0A0A0] border border-[#333333] shrink-0">
                      {projTitle}
                    </span>
                  </div>

                  {/* Pitch Note */}
                  {r.coverNote && (
                    <div className="p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-[#CCCCCC] italic leading-relaxed mb-4">
                      "{r.coverNote}"
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3.5 border-t border-[#333333] flex items-center justify-between">
                  <span className="text-[11px] text-[#777777]">
                    {r.appliedDate ? new Date(r.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(r._id, 'reject', studentName)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#888888] hover:text-red-400 hover:border-red-500/30 border border-[#333333] rounded-lg transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAction(r._id, 'accept', studentName)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-[#181818] rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept Mentee
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
