import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  X
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';
import taskApi from '../services/taskApi';

export default function MentorTaskReviews() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingTask, setReviewingTask] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getMentorDashboard();
      if (res.success && res.pendingTaskReviews) {
        setTasks(res.pendingTaskReviews);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingTask) return;
    try {
      setIsSubmitting(true);
      const res = await taskApi.reviewTask(reviewingTask._id, {
        status: reviewStatus,
        feedback: feedback || (reviewStatus === 'Approved' ? 'Approved by faculty mentor.' : 'Please update milestone deliverables.')
      });
      if (res.success) {
        showToast(`Task "${reviewingTask.title}" updated to ${reviewStatus}!`);
        setReviewingTask(null);
        setFeedback('');
        fetchTasks();
      } else {
        alert(res.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Error reviewing task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const p = name.trim().split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}` : p[0].slice(0, 2).toUpperCase();
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      t.project?.title?.toLowerCase().includes(q) ||
      t.assignedTo?.name?.toLowerCase().includes(q);
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
              Task Reviews
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30 font-semibold">
              {tasks.length} Awaiting Review
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1.5 leading-relaxed max-w-xl">
            Evaluate code submissions, milestone reports, and project deliverables from assigned mentees.
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
            placeholder="Search tasks, students, or projects..."
            className="w-full h-9 bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
        </div>
      </div>

      {/* Task List / Table */}
      <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#333333]">
                <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Student</th>
                <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Project</th>
                <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Task Title</th>
                <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#888888]">Loading tasks...</td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#888888] italic">No pending tasks awaiting review.</td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const studentName = t.assignedTo?.name || 'Student';
                  const projectName = t.project?.title || 'Capstone Project';

                  return (
                    <tr key={t._id} className="hover:bg-[#1E1E1E] transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {getInitials(studentName)}
                          </div>
                          <span className="text-xs font-medium text-white">{studentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-[#A0A0A0]">{projectName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <span className="text-xs font-semibold text-white block">{t.title}</span>
                          {t.submissionNotes && (
                            <span className="text-[11px] text-[#888888] italic block truncate max-w-xs mt-0.5">
                              "{t.submissionNotes}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setReviewingTask(t)}
                          className="px-3.5 py-1 text-xs font-semibold rounded-md border border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00] hover:text-[#181818] transition-all cursor-pointer shadow-sm"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#222222] border border-[#333333] rounded-xl w-full max-w-lg p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setReviewingTask(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-white p-1 rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
              <h3 className="text-lg font-bold text-white tracking-tight">Evaluate Student Task</h3>
            </div>
            <p className="text-xs text-[#888888] mb-4">
              Project: <span className="text-[#FF8A00] font-medium">{reviewingTask.project?.title || 'Capstone'}</span> • Assignee: {reviewingTask.assignedTo?.name || 'Student'}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{reviewingTask.title}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                    {reviewingTask.status || 'Submitted'}
                  </span>
                </div>
                {reviewingTask.description && (
                  <p className="text-[#A0A0A0] text-xs leading-relaxed">{reviewingTask.description}</p>
                )}
                {reviewingTask.submissionNotes && (
                  <div className="mt-2 pt-2 border-t border-[#2E2E2E]">
                    <span className="text-[11px] text-[#888888] font-semibold block">Student Submission Note:</span>
                    <p className="text-xs text-[#D4D4D4] italic mt-0.5">"{reviewingTask.submissionNotes}"</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#888888] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Evaluation Decision
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Approved')}
                    className={`h-10 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      reviewStatus === 'Approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50 shadow-sm'
                        : 'bg-[#1A1A1A] text-[#888888] border-[#333333] hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Changes Requested')}
                    className={`h-10 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      reviewStatus === 'Changes Requested'
                        ? 'bg-[#FF8A00]/15 text-[#FF8A00] border-[#FF8A00]/50 shadow-sm'
                        : 'bg-[#1A1A1A] text-[#888888] border-[#333333] hover:text-white'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Request Changes
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#888888] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Faculty Feedback & Guidance
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide guidance and review feedback..."
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#888888] hover:text-white bg-[#2A2A2A] hover:bg-[#333333] border border-[#3A3A3A] rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-xs text-[#181818] bg-[#FF8A00] hover:bg-[#FFA834] rounded-lg cursor-pointer transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
