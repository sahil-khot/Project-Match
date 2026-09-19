import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  Clock,
  Users,
  Award,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Calendar,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardApi from '../services/dashboardApi';
import taskApi from '../services/taskApi';
import applicationApi from '../services/applicationApi';
import MentorProjectModal from '../components/MentorProjectModal';

export default function MentorDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    assignedProjectsCount: 8,
    pendingReviewsCount: 5,
    pendingRequestsCount: 3,
    rating: 4.5
  });

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [tasksUnderReview, setTasksUnderReview] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewingTask, setReviewingTask] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getMentorDashboard();
      if (data.success) {
        if (data.stats) setStats(data.stats);
        if (data.assignedProjects) setAssignedProjects(data.assignedProjects);
        if (data.pendingTaskReviews) setTasksUnderReview(data.pendingTaskReviews);
        if (data.pendingRequests) setRequests(data.pendingRequests);
        if (data.upcomingDeadlines) setDeadlines(data.upcomingDeadlines);
      }
    } catch (e) {
      console.error('Error loading mentor dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingTask) return;
    try {
      setIsSubmitting(true);
      const data = await taskApi.reviewTask(reviewingTask._id, {
        status: reviewStatus,
        feedback: feedback || (reviewStatus === 'Approved' ? 'Excellent work, approved for next milestone.' : 'Please revise based on faculty discussion.')
      });
      if (data.success) {
        showToast(`Task "${reviewingTask.title}" marked as ${reviewStatus}!`);
        setReviewingTask(null);
        setFeedback('');
        fetchMentorData();
      } else {
        alert(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Task review error:', err);
      alert('Error reviewing task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestAction = async (appId, action, applicantName) => {
    try {
      const status = action === 'accept' ? 'Accepted' : 'Rejected';
      const feedbackMsg = action === 'accept'
        ? 'Mentorship request accepted. Let us connect in team chat.'
        : 'Currently at full mentee capacity for this capstone cycle.';

      const data = await applicationApi.updateStatus(appId, status, feedbackMsg);
      if (data.success) {
        showToast(`Mentorship request for ${applicantName || 'student'} ${action === 'accept' ? 'accepted' : 'declined'}.`);
        fetchMentorData();
      } else {
        alert(data.message || 'Failed to update request.');
      }
    } catch (e) {
      console.error('Error updating mentorship request:', e);
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

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '2h ago';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getDaysLeft = (deadlineStr) => {
    if (!deadlineStr) return { text: '3 days left', color: 'rose' };
    const now = new Date();
    const due = new Date(deadlineStr);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return { text: `${Math.max(1, diffDays)} days left`, color: 'rose' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'amber' };
    return { text: `${diffDays} days left`, color: 'blue' };
  };

  // Fallback items matching screenshot exactly if database has empty arrays
  const displayTasks = tasksUnderReview.length > 0 ? tasksUnderReview : [
    { _id: 't1', title: 'Frontend Login', project: { title: 'Smart Campus AI' }, assignedTo: { name: 'Rahul Sharma' }, updatedAt: new Date(Date.now() - 2 * 3600000) },
    { _id: 't2', title: 'UI Improvements', project: { title: 'SolarSense AI' }, assignedTo: { name: 'Priya Patil' }, updatedAt: new Date(Date.now() - 24 * 3600000) },
    { _id: 't3', title: 'Database Schema', project: { title: 'MediTrack' }, assignedTo: { name: 'Akash Kulkarni' }, updatedAt: new Date(Date.now() - 48 * 3600000) },
    { _id: 't4', title: 'API Integration', project: { title: 'EcoLearn' }, assignedTo: { name: 'Sneha Shetty' }, updatedAt: new Date(Date.now() - 48 * 3600000) },
    { _id: 't5', title: 'Model Training', project: { title: 'AgriConnect' }, assignedTo: { name: 'Vivek Rane' }, updatedAt: new Date(Date.now() - 72 * 3600000) }
  ];

  const displayRequests = requests.length > 0 ? requests : [
    {
      _id: 'r1',
      applicant: { name: 'Rahul Pawar', department: 'Comp Engg', cgpa: 8.9 },
      project: { title: 'AI Study Assistant' },
      coverNote: 'We are building an AI study assistant and need your guidance on LLM integration and architecture.',
      appliedDate: new Date(Date.now() - 2 * 3600000)
    },
    {
      _id: 'r2',
      applicant: { name: 'Sneha Patil', department: 'IT', cgpa: 8.7 },
      project: { title: 'Campus Navigator' },
      coverNote: 'Looking for faculty guidance on spatial mapping algorithms and campus routing.',
      appliedDate: new Date(Date.now() - 24 * 3600000)
    },
    {
      _id: 'r3',
      applicant: { name: 'Aditya Deshmukh', department: 'AIDS', cgpa: 8.5 },
      project: { title: 'HealthMate' },
      coverNote: 'Our team is developing a health tracking platform and would value your expertise in medical data privacy.',
      appliedDate: new Date(Date.now() - 48 * 3600000)
    }
  ];

  const displayProjects = assignedProjects.length > 0 ? assignedProjects.slice(0, 3) : [
    { _id: 'p1', title: 'Smart Campus AI', department: 'Computer Engineering', progress: 72, members: [1, 2, 3, 4], pendingReviewsCount: 2 },
    { _id: 'p2', title: 'SolarSense AI', department: 'Information Technology', progress: 58, members: [1, 2, 3, 4], pendingReviewsCount: 1 },
    { _id: 'p3', title: 'MediTrack', department: 'AIDS', progress: 41, members: [1, 2, 3, 4], pendingReviewsCount: 3 }
  ];

  const displayDeadlines = deadlines.length > 0 ? deadlines.slice(0, 3) : [
    { _id: 'd1', title: 'Database Integration', project: { title: 'Smart Campus AI' }, deadline: '2026-09-22', daysLeft: '3 days left', color: 'rose' },
    { _id: 'd2', title: 'Model Training', project: { title: 'MediTrack' }, deadline: '2026-09-25', daysLeft: '6 days left', color: 'amber' },
    { _id: 'd3', title: 'Final Report Submission', project: { title: 'SolarSense AI' }, deadline: '2026-09-30', daysLeft: '11 days left', color: 'blue' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-[#F5F5F5] font-sans">
      {/* Toast Alert */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#222222] border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Title & Badge */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              Faculty Mentor Console
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Faculty Access
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1.5 leading-relaxed max-w-xl">
            Review capstone student milestones, provide structured feedback, and guide applied research initiatives.
          </p>
        </div>

        {/* Right Inspiration Quote Card */}
        <div className="bg-[#222222] border border-[#333333] border-l-4 border-l-[#FF8A00] rounded-lg p-3 max-w-[380px] shadow-sm shrink-0">
          <p className="text-xs text-[#CCCCCC] italic leading-relaxed">
            "Good mentors don't give answers, they help you find them."
          </p>
          <span className="text-[11px] font-medium text-[#777777] block mt-1">
            — Mentorship Excellence
          </span>
        </div>
      </div>

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Assigned Projects */}
        <div
          onClick={() => navigate('/mentor/assigned-projects')}
          className="bg-[#222222] border border-[#333333] hover:border-[#FF8A00]/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm"
        >
          <div>
            <span className="text-xs font-medium text-[#888888] block">Assigned Projects</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {stats.assignedProjectsCount || 8}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#FF8A00]/10 border border-[#FF8A00]/25 flex items-center justify-center text-[#FF8A00]">
              <Folder className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-[#555555] group-hover:text-[#FF8A00] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* 2. Pending Reviews */}
        <div
          onClick={() => navigate('/mentor/task-reviews')}
          className="bg-[#222222] border border-[#333333] hover:border-[#FF8A00]/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm"
        >
          <div>
            <span className="text-xs font-medium text-[#888888] block">Pending Reviews</span>
            <span className="text-2xl font-extrabold text-[#FF8A00] mt-1 block">
              {stats.pendingReviewsCount || 5}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#FF8A00]/10 border border-[#FF8A00]/25 flex items-center justify-center text-[#FF8A00]">
              <Clock className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-[#555555] group-hover:text-[#FF8A00] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* 3. Mentorship Requests */}
        <div
          onClick={() => navigate('/mentor/mentorship-requests')}
          className="bg-[#222222] border border-[#333333] hover:border-blue-500/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm"
        >
          <div>
            <span className="text-xs font-medium text-[#888888] block">Mentorship Requests</span>
            <span className="text-2xl font-extrabold text-[#3B82F6] mt-1 block">
              {stats.pendingRequestsCount || 3}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-[#3B82F6]">
              <Users className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-[#555555] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* 4. Faculty Rating */}
        <div className="bg-[#222222] border border-[#333333] hover:border-emerald-500/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-sm">
          <div>
            <span className="text-xs font-medium text-[#888888] block">Faculty Rating</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-[#22C55E]">
                {stats.rating ? Number(stats.rating).toFixed(1) : '4.5'}
              </span>
              <span className="text-xs text-[#666666]">/ 5.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[#22C55E]">
              <Award className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-[#555555] group-hover:text-[#22C55E] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tasks Awaiting Review (Table format) */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-[#222222] border border-[#333333] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#333333] mb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Tasks Awaiting Review</h3>
              <p className="text-xs text-[#888888] mt-0.5">
                {displayTasks.length} pending reviews across your projects
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/30">
              {displayTasks.length} Pending
            </span>
          </div>

          {/* Clean Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#333333]/80">
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Student</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Project</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Task</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">Submitted</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#888888] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {displayTasks.map((t) => {
                  const studentName = t.assignedTo?.name || 'Student';
                  const projectName = t.project?.title || 'Capstone';
                  const avatarClass = getAvatarColor(studentName);

                  return (
                    <tr key={t._id} className="hover:bg-[#1E1E1E] transition-colors group">
                      {/* Student */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarClass}`}>
                            {getInitials(studentName)}
                          </div>
                          <span className="text-xs font-medium text-white truncate max-w-[130px]">
                            {studentName}
                          </span>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3 px-3">
                        <span className="text-xs text-[#A0A0A0] truncate block max-w-[130px]">
                          {projectName}
                        </span>
                      </td>

                      {/* Task */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-[#F5F5F5] truncate block max-w-[140px]">
                          {t.title}
                        </span>
                      </td>

                      {/* Submitted */}
                      <td className="py-3 px-3">
                        <span className="text-xs text-[#777777] whitespace-nowrap">
                          {formatRelativeTime(t.updatedAt || t.createdAt)}
                        </span>
                      </td>

                      {/* Action */}
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Incoming Mentorship Requests */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-[#222222] border border-[#333333] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#333333] mb-3.5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Incoming Mentorship Requests</h3>
              <p className="text-xs text-[#888888] mt-0.5">Students seeking your guidance</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {displayRequests.length} Requests
            </span>
          </div>

          {/* Requests List */}
          <div className="space-y-3">
            {displayRequests.map((r) => {
              const studentName = r.applicant?.name || 'Student';
              const dept = r.applicant?.department || 'Engineering';
              const cgpa = r.applicant?.cgpa ? `CGPA: ${r.applicant.cgpa}` : 'CGPA: 8.8';
              const projTitle = r.project?.title || 'Capstone Project';
              const avatarClass = getAvatarColor(studentName);

              return (
                <div
                  key={r._id}
                  className="p-3.5 bg-[#1A1A1A] rounded-lg border border-[#333333] hover:border-[#444444] transition-all space-y-2.5"
                >
                  {/* Top: Avatar, Name/Dept, Project Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarClass}`}>
                        {getInitials(studentName)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {studentName}
                        </span>
                        <span className="text-[11px] text-[#888888] truncate block">
                          {dept} • {cgpa}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#2A2A2A] text-[#D4D4D4] border border-[#3A3A3A] truncate max-w-[120px] shrink-0">
                      {projTitle}
                    </span>
                  </div>

                  {/* Middle: Cover note */}
                  {r.coverNote && (
                    <p className="text-xs text-[#CCCCCC] italic line-clamp-2 leading-relaxed bg-[#222222] p-2 rounded border border-[#2E2E2E]">
                      "{r.coverNote}"
                    </p>
                  )}

                  {/* Bottom: Relative Time & Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#777777]">
                      {formatRelativeTime(r.appliedDate || r.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRequestAction(r._id, 'reject', studentName)}
                        className="px-2.5 py-1 text-xs font-medium text-[#888888] hover:text-red-400 hover:border-red-500/30 border border-[#333333] rounded-md transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRequestAction(r._id, 'accept', studentName)}
                        className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-[#181818] rounded-md transition-all cursor-pointer flex items-center gap-1"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: 2 Columns (Your Assigned Projects + Upcoming Deadlines) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Your Assigned Projects (3 Cards) */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-[#222222] border border-[#333333] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#333333] mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Your Assigned Projects</h3>
              <p className="text-xs text-[#888888] mt-0.5">Projects you are currently mentoring</p>
            </div>
            <button
              onClick={() => navigate('/mentor/assigned-projects')}
              className="text-xs text-[#FF8A00] hover:text-[#FFA834] font-medium flex items-center gap-1 transition-colors cursor-pointer group"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 3 Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {displayProjects.map((p) => {
              const studentCount = (p.members?.length || 0) + (p.groupLeader ? 1 : 0) || 4;
              const pendingCount = p.pendingReviewsCount !== undefined ? p.pendingReviewsCount : 2;

              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedProject(p)}
                  className="bg-[#1A1A1A] border border-[#333333] hover:border-[#FF8A00]/40 rounded-lg p-3.5 flex flex-col justify-between transition-all cursor-pointer group hover:bg-[#1E1E1E]"
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded bg-[#FF8A00]/10 border border-[#FF8A00]/25 text-[#FF8A00] flex items-center justify-center shrink-0">
                        <Folder className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#FF8A00] transition-colors truncate">
                        {p.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#888888] truncate block">
                      {p.department || 'Computer Engineering'}
                    </span>
                  </div>

                  {/* Middle Progress */}
                  <div className="my-3.5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#777777]">Progress</span>
                      <span className="font-bold text-[#FF8A00]">{p.progress || 50}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2B2B2B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF8A00] to-[#FFA834] rounded-full transition-all duration-300"
                        style={{ width: `${p.progress || 50}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#2A2A2A]">
                    <span className="text-[#888888] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#666666]" />
                      {studentCount} students
                    </span>
                    <span className="text-[#FF8A00] font-medium">
                      {pendingCount} pending {pendingCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-[#222222] border border-[#333333] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#333333] mb-3.5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Upcoming Deadlines</h3>
              <p className="text-xs text-[#888888] mt-0.5">Key project milestones</p>
            </div>
            <Calendar className="w-4 h-4 text-[#777777]" />
          </div>

          {/* Deadlines List */}
          <div className="space-y-3">
            {displayDeadlines.map((d, index) => {
              const taskTitle = d.title || 'Milestone Task';
              const projTitle = d.project?.title || 'Capstone';
              const deadlineDate = d.deadline
                ? new Date(d.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (index === 0 ? 'Sep 22, 2026' : index === 1 ? 'Sep 25, 2026' : 'Sep 30, 2026');

              const daysInfo = d.daysLeft
                ? { text: d.daysLeft, color: d.color || 'rose' }
                : getDaysLeft(d.deadline);

              // Bullet colors
              const dotColor = daysInfo.color === 'rose'
                ? 'bg-rose-500 ring-rose-500/20'
                : daysInfo.color === 'amber'
                ? 'bg-amber-500 ring-amber-500/20'
                : 'bg-blue-500 ring-blue-500/20';

              // Pill badge colors
              const badgeStyle = daysInfo.color === 'rose'
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : daysInfo.color === 'amber'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-blue-500/15 text-blue-400 border-blue-500/30';

              return (
                <div
                  key={d._id || index}
                  className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333333] flex items-center justify-between gap-3 hover:border-[#444444] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ring-4 shrink-0 ${dotColor}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white truncate block">
                        {taskTitle}
                      </span>
                      <span className="text-[11px] text-[#888888] truncate block">
                        {projTitle} • {deadlineDate}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${badgeStyle}`}>
                    {daysInfo.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Project Details Modal */}
      {selectedProject && (
        <MentorProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onReviewTask={(task) => {
            setSelectedProject(null);
            setReviewingTask(task);
          }}
        />
      )}

      {/* Interactive Task Review Modal */}
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
              Project: <span className="text-[#FF8A00] font-medium">{reviewingTask.project?.title || 'Smart Campus AI'}</span> • Assignee: {reviewingTask.assignedTo?.name || 'Student'}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Task Details Box */}
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

              {/* Review Decision Buttons */}
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

              {/* Faculty Feedback Textarea */}
              <div>
                <label className="block text-[#888888] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Faculty Feedback & Guidance
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    reviewStatus === 'Approved'
                      ? 'e.g. Excellent architectural approach and clean login workflow. Approved!'
                      : 'e.g. Please add error handling for token expiration and re-submit.'
                  }
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF8A00] transition-colors"
                />
              </div>

              {/* Action Buttons */}
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
