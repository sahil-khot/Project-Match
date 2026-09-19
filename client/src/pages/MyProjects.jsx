import React, { useState, useEffect, useRef } from 'react';
import {
  FolderGit2,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  MessageSquare,
  Award,
  Calendar,
  X,
  Trash2,
  UserPlus,
  AlertTriangle,
  Search,
  Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import projectApi from '../services/projectApi';
import taskApi from '../services/taskApi';
import studentApi from '../services/studentApi';
import messageApi from '../services/messageApi';

export default function MyProjects({ setActiveTab, onOpenCreateProject, initialSelectedProject = null }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(initialSelectedProject);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '2026-10-15',
    assignedTo: ''
  });

  const [submittingTask, setSubmittingTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [taskErrorMessage, setTaskErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [studentCandidates, setStudentCandidates] = useState([]);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberMessage, setAddMemberMessage] = useState({ text: '', type: '' });

  // Delete Task Modal State
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Delete Project Modal State
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Team Chat Modal State
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [teamMessages, setTeamMessages] = useState([]);
  const [newTeamMessage, setNewTeamMessage] = useState('');
  const [loadingTeamChat, setLoadingTeamChat] = useState(false);
  const [sendingTeamMessage, setSendingTeamMessage] = useState(false);
  const teamChatEndRef = useRef(null);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  useEffect(() => {
    if (!showTeamChat || !selectedProject?._id) return;
    const convId = `team_${selectedProject._id}`;
    let isMounted = true;
    const fetchChat = async (isFirst = false) => {
      try {
        if (isFirst) setLoadingTeamChat(true);
        const res = await messageApi.getThreadMessages(convId);
        if (isMounted && res?.success && res.messages) {
          setTeamMessages(res.messages);
        }
      } catch (err) {
        // silent polling
      } finally {
        if (isFirst && isMounted) setLoadingTeamChat(false);
      }
    };

    fetchChat(true);
    const interval = setInterval(() => fetchChat(false), 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showTeamChat, selectedProject?._id]);

  useEffect(() => {
    if (showTeamChat) {
      teamChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [teamMessages, showTeamChat]);

  const handleSendTeamMessage = async (e) => {
    e.preventDefault();
    if (!newTeamMessage.trim() || !selectedProject?._id || sendingTeamMessage) return;
    const content = newTeamMessage.trim();
    setNewTeamMessage('');

    const tempMsg = {
      _id: 'temp_' + Date.now(),
      sender: {
        _id: currentUserId,
        name: user?.name || 'You',
        avatar: user?.avatar,
      },
      content,
      createdAt: new Date().toISOString(),
      isTeamChat: true,
    };
    setTeamMessages((prev) => [...prev, tempMsg]);

    try {
      setSendingTeamMessage(true);
      const res = await messageApi.sendMessage({
        projectId: selectedProject._id,
        isTeamChat: true,
        content,
      });
      if (res?.success && res.message) {
        setTeamMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? res.message : m))
        );
      }
    } catch (err) {
      console.error('Error sending team message:', err);
    } finally {
      setSendingTeamMessage(false);
    }
  };

  useEffect(() => {
    if (initialSelectedProject) {
      setSelectedProject(initialSelectedProject);
    }
  }, [initialSelectedProject]);

  useEffect(() => {
    if (selectedProject?._id) {
      fetchProjectTasks(selectedProject._id);
    }
  }, [selectedProject]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getMyProjects();
      if (data.success) {
        const list = data.projects || [];
        setProjects(list);
        if (list.length > 0 && !selectedProject) {
          setSelectedProject(list[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching user projects:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      const data = await taskApi.getTasksByProject(projectId);
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error('Error fetching project tasks:', e);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      setIsSubmitting(true);
      setTaskErrorMessage('');
      const payload = {
        projectId: selectedProject._id,
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        deadline: taskForm.deadline,
        assignedTo: taskForm.assignedTo || user?._id
      };
      const data = await taskApi.createTask(payload);
      if (data.success) {
        setShowCreateTask(false);
        setTaskForm({ title: '', description: '', priority: 'Medium', deadline: '2026-10-15', assignedTo: '' });
        fetchProjectTasks(selectedProject._id);
      } else {
        setTaskErrorMessage(data.message || 'Task creation failed.');
      }
    } catch (err) {
      console.error('Task creation error:', err);
      setTaskErrorMessage('Error creating task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submittingTask) return;
    try {
      setIsSubmitting(true);
      const data = await taskApi.submitTask(submittingTask._id, { submissionNotes });
      if (data.success) {
        setSubmittingTask(null);
        setSubmissionNotes('');
        fetchProjectTasks(selectedProject._id);
      } else {
        alert(data.message || 'Failed to submit task.');
      }
    } catch (err) {
      console.error('Task submission error:', err);
      alert('Error submitting task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUserId = user?._id || user?.id;
  const isOwnerOrLeader = selectedProject && (
    (selectedProject.creator?._id || selectedProject.creator) === currentUserId ||
    (selectedProject.groupLeader?._id || selectedProject.groupLeader) === currentUserId ||
    user?.role === 'admin'
  );

  const handleOpenAddMemberModal = async () => {
    setShowAddMemberModal(true);
    setAddMemberMessage({ text: '', type: '' });
    setCandidateSearchQuery('');
    try {
      setLoadingCandidates(true);
      const res = await studentApi.getTeammates({ limit: 40 });
      if (res?.success) {
        const existingMemberIds = (selectedProject?.members || []).map(
          (m) => (m.user?._id || m.user)?.toString()
        );
        const candidates = (res.teammates || []).filter((s) => {
          const sId = (s.user?._id || s.studentId || s._id)?.toString();
          return !existingMemberIds.includes(sId) && sId !== currentUserId?.toString();
        });
        setStudentCandidates(candidates);
      }
    } catch (err) {
      console.error('Error loading candidates:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleAddMember = async (student) => {
    if (!selectedProject) return;
    const targetUserId = student.user?._id || student.studentId || student._id;
    try {
      setAddMemberLoading(true);
      setAddMemberMessage({ text: '', type: '' });
      const res = await projectApi.addMember(selectedProject._id, targetUserId);
      if (res?.success) {
        setAddMemberMessage({
          text: `${student.user?.name || student.name} has been added to the project team!`,
          type: 'success'
        });
        setStudentCandidates((prev) =>
          prev.filter((c) => (c.user?._id || c.studentId || c._id)?.toString() !== targetUserId?.toString())
        );
        const updatedProjects = projects.map((p) =>
          p._id === selectedProject._id ? res.project : p
        );
        setProjects(updatedProjects);
        setSelectedProject(res.project);
      } else {
        setAddMemberMessage({ text: res?.message || 'Failed to add member.', type: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error adding team member.';
      setAddMemberMessage({ text: msg, type: 'error' });
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !selectedProject) return;
    try {
      setIsDeletingTask(true);
      const res = await taskApi.deleteTask(taskToDelete._id);
      if (res?.success) {
        setTaskToDelete(null);
        fetchProjectTasks(selectedProject._id);
        fetchMyProjects();
      } else {
        alert(res?.message || 'Failed to delete task.');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Error deleting task.');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      setIsDeletingProject(true);
      const res = await projectApi.deleteProject(selectedProject._id);
      if (res?.success) {
        setShowDeleteProjectModal(false);
        const remaining = projects.filter((p) => p._id !== selectedProject._id);
        setProjects(remaining);
        setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        setTasks([]);
      } else {
        alert(res?.message || 'Failed to delete project.');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Error deleting project.');
    } finally {
      setIsDeletingProject(false);
    }
  };

  const filteredCandidates = studentCandidates.filter((s) => {
    if (!candidateSearchQuery.trim()) return true;
    const q = candidateSearchQuery.toLowerCase();
    const sName = (s.user?.name || s.name || '').toLowerCase();
    const sDept = (s.department || s.user?.department || '').toLowerCase();
    const sSkills = (s.skills || s.technicalSkills || []).join(' ').toLowerCase();
    return sName.includes(q) || sDept.includes(q) || sSkills.includes(q);
  });

  const taskStatuses = ['To Do', 'In Progress', 'Submitted', 'Approved'];

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
              Team Workspace & Projects
            </h1>
            <span className="text-[13.5px] px-3 py-0.5 rounded-full bg-[rgba(255,138,0,0.10)] text-[#FF8A00] border border-[rgba(255,138,0,0.35)] font-semibold">
              {projects.length} Total
            </span>
          </div>
          <p className="text-[16px] text-[#A0A0A0] mt-1.5">
            Manage your project milestones, collaborate on tasks, and coordinate with your assigned faculty mentor.
          </p>
        </div>
        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="h-[42px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-semibold text-[16px] rounded-[8px] flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Project Selector Tabs */}
      {projects.length > 0 ? (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {projects.map((proj) => (
            <button
              key={proj._id}
              onClick={() => setSelectedProject(proj)}
              className={`px-4 py-2 rounded-[8px] text-[15px] font-semibold whitespace-nowrap transition-all border flex items-center gap-2.5 cursor-pointer ${
                selectedProject?._id === proj._id
                  ? 'bg-[rgba(255,138,0,0.12)] text-[#FF8A00] border-[rgba(255,138,0,0.40)]'
                  : 'bg-[#262626] text-[#A0A0A0] border-[#3A3A3A] hover:text-[#F5F5F5] hover:bg-[#2D2D2D]'
              }`}
            >
              <FolderGit2 className="w-4 h-4 text-[#FF8A00]" />
              <span>{proj.title}</span>
              <span className="text-[12px] px-2 py-0.5 rounded-[4px] bg-[#1A1A1A] text-[#A0A0A0] border border-[#3A3A3A]">
                {proj.status}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#262626] border border-[#3A3A3A] rounded-[10px] text-[15px] text-[#A0A0A0]">
          You are not currently part of any team projects. Explore projects or create a new one!
        </div>
      )}

      {selectedProject && (
        <div className="space-y-6">
          {/* Project Details Card */}
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] p-6 shadow-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#3A3A3A]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-[24px] font-bold text-[#F5F5F5]">{selectedProject.title}</h2>
                  <span className="text-[13px] font-semibold px-3 py-0.5 rounded-full bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.35)]">
                    {selectedProject.status}
                  </span>
                </div>
                <p className="text-[15px] text-[#A0A0A0] mt-1.5 max-w-2xl leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {isOwnerOrLeader && (
                  <button
                    onClick={handleOpenAddMemberModal}
                    className="h-[42px] px-3.5 rounded-[8px] text-[14.5px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#FF8A00] hover:text-[#FF9E2C] transition-colors flex items-center gap-2 cursor-pointer"
                    title="Add a student to the team"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setTaskErrorMessage('');
                    setShowCreateTask(true);
                  }}
                  className="h-[42px] px-4 rounded-[8px] text-[14.5px] font-bold bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => setShowTeamChat(true)}
                  className="h-[42px] px-4 rounded-[8px] text-[14.5px] font-semibold bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] text-[#F5F5F5] transition-colors flex items-center gap-2 cursor-pointer"
                  title="Open live team chat"
                >
                  <MessageSquare className="w-4 h-4 text-[#FF8A00]" />
                  <span>Team Chat</span>
                </button>
                {isOwnerOrLeader && (
                  <button
                    onClick={() => setShowDeleteProjectModal(true)}
                    className="h-[42px] px-3.5 rounded-[8px] text-[14px] font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-[#EF4444] transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Delete this project"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete Project</span>
                  </button>
                )}
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-[14px]">
              <div>
                <p className="text-[#777777] font-medium">Domain</p>
                <p className="font-semibold text-[#F5F5F5] mt-1">{selectedProject.domain || 'Engineering'}</p>
              </div>
              <div>
                <p className="text-[#777777] font-medium">Faculty Mentor</p>
                <p className="font-semibold text-[#FF8A00] mt-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{selectedProject.mentor?.name || 'No mentor assigned yet'}</span>
                </p>
              </div>
              <div>
                <p className="text-[#777777] font-medium">Team Size</p>
                <p className="font-semibold text-[#F5F5F5] mt-1">
                  {selectedProject.members?.length || 1} / {selectedProject.teamSize || 4} Members
                </p>
              </div>
              <div>
                <p className="text-[#777777] font-medium">Deadline</p>
                <p className="font-semibold text-[#F5F5F5] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#777777]" />
                  <span>{selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'Dec 2026'}</span>
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="pt-4 mt-4 border-t border-[#3A3A3A]">
              <div className="flex justify-between text-[14px] mb-2">
                <span className="text-[#A0A0A0] font-medium">Sprint Completion Progress</span>
                <span className="text-[#FF8A00] font-bold">{selectedProject.progress || 0}%</span>
              </div>
              <div className="w-full bg-[#1A1A1A] h-2.5 rounded-full border border-[#3A3A3A] overflow-hidden">
                <div
                  className="bg-[#FF8A00] h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedProject.progress || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Kanban / Task Stages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-bold text-[#F5F5F5]">Task Workflow & Milestones</h3>
              <span className="text-[14px] text-[#A0A0A0]">{tasks.length} tasks registered</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5">
              {taskStatuses.map((status) => {
                const statusTasks = tasks.filter((t) => {
                  if (status === 'Approved') return t.status === 'Approved' || t.status === 'Completed';
                  if (status === 'Submitted') return t.status === 'Submitted' || t.status === 'Under Review';
                  return t.status === status;
                });

                return (
                  <div key={status} className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-[10px] p-3.5 flex flex-col shadow-card">
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#3A3A3A]">
                      <span className="text-[16px] font-bold text-[#F5F5F5]">{status}</span>
                      <span className="w-6 h-6 rounded-[4px] bg-[#262626] text-[12.5px] font-mono font-bold text-[#A0A0A0] flex items-center justify-center border border-[#3A3A3A]">
                        {statusTasks.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="space-y-3 flex-1 min-h-[140px]">
                      {statusTasks.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[13.5px] text-[#777777] italic py-6">
                          No {status.toLowerCase()} tasks
                        </div>
                      ) : (
                        statusTasks.map((task) => {
                          const isAssignedToMe = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;

                          return (
                            <div
                              key={task._id}
                              className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/40 rounded-[8px] p-3.5 space-y-2.5 text-[14px] transition-colors shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <h4 className="text-[15px] font-semibold text-[#F5F5F5] leading-snug">{task.title}</h4>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[12px] font-bold uppercase px-2 py-0.5 rounded-[4px] ${
                                    task.priority === 'Urgent' || task.priority === 'High'
                                      ? 'bg-red-500/15 text-[#EF4444]'
                                      : 'bg-[#3B82F6]/15 text-[#3B82F6]'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  {status === 'To Do' && (isOwnerOrLeader || isAssignedToMe) && (
                                    <button
                                      type="button"
                                      onClick={() => setTaskToDelete(task)}
                                      className="p-1 text-[#777777] hover:text-[#EF4444] transition-colors rounded cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {task.description && (
                                <p className="text-[#A0A0A0] text-[13px] line-clamp-2">{task.description}</p>
                              )}

                              {task.mentorFeedback && (
                                <div className="p-2.5 bg-[#1A1A1A] rounded-[6px] border border-purple-500/30 text-[13px] text-purple-300">
                                  <span className="font-bold">Mentor Feedback: </span>
                                  {task.mentorFeedback}
                                </div>
                              )}

                              <div className="pt-2.5 border-t border-[#3A3A3A] flex items-center justify-between text-[13px] text-[#A0A0A0]">
                                <span>{task.assignedTo?.name ? task.assignedTo.name.split(' ')[0] : 'Unassigned'}</span>
                                {task.status === 'In Progress' && isAssignedToMe && (
                                  <button
                                    onClick={() => setSubmittingTask(task)}
                                    className="text-[13px] font-bold text-[#FF8A00] hover:text-[#FF9E2C] cursor-pointer transition-colors"
                                  >
                                    Submit Work →
                                  </button>
                                )}
                                {task.status === 'To Do' && isAssignedToMe && (
                                  <button
                                    onClick={async () => {
                                      await taskApi.updateTaskStatus(task._id, 'In Progress');
                                      fetchProjectTasks(selectedProject._id);
                                    }}
                                    className="text-[13px] font-bold text-[#3B82F6] hover:underline cursor-pointer"
                                  >
                                    Start →
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-md p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setShowCreateTask(false)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-[20px] font-bold text-[#F5F5F5] mb-1">Add Project Milestone Task</h3>
            <p className="text-[14px] text-[#A0A0A0] mb-4">Assign work to yourself or a teammate on {selectedProject?.title}</p>

            {taskErrorMessage && (
              <div className="p-3 mb-3 bg-red-500/10 border border-red-500/25 rounded-[8px] text-[14px] text-red-400">
                {taskErrorMessage}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4 text-[14px]">
              <div>
                <label className="block text-[14px] text-[#A0A0A0] font-medium mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g., Train solar regression model"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[15px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block text-[14px] text-[#A0A0A0] font-medium mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Milestone goals, deliverables, or acceptance criteria..."
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3 text-[15px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[14px] text-[#A0A0A0] font-medium mb-1.5">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] text-[#A0A0A0] font-medium mb-1.5">Deadline</label>
                  <input
                    type="date"
                    required
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] text-[#A0A0A0] font-medium mb-1.5">Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[15px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                >
                  <option value="">Myself ({user?.name})</option>
                  {selectedProject?.members?.map((m) => (
                    <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                      {m.user?.name || 'Teammate'} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="h-[42px] px-5 text-[15px] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[42px] px-5 font-bold text-[15px] text-[#1A1A1A] bg-[#FF8A00] hover:bg-[#FF9E2C] rounded-[8px] cursor-pointer transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Adding...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Task Modal */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-md p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setSubmittingTask(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-[20px] font-bold text-[#F5F5F5] mb-1">Submit Task for Review</h3>
            <p className="text-[14px] text-[#A0A0A0] mb-4">{submittingTask.title}</p>

            <form onSubmit={handleSubmitTask} className="space-y-4 text-[14px]">
              <div>
                <label className="block text-[14px] text-[#A0A0A0] font-medium mb-1.5">Submission Notes & Artifacts</label>
                <textarea
                  rows={4}
                  required
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Detail your solution, PR link, metric results, or deployment URL..."
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3.5 text-[15px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="h-[42px] px-5 text-[15px] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[42px] px-5 font-bold text-[15px] text-[#1A1A1A] bg-[#FF8A00] hover:bg-[#FF9E2C] rounded-[8px] cursor-pointer transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Warning Modal */}
      {showDeleteProjectModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-red-500/40 rounded-[12px] w-full max-w-md p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setShowDeleteProjectModal(false)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-[10px] bg-red-500/15 border border-red-500/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#F5F5F5]">Delete Project</h3>
                <p className="text-[13px] text-[#A0A0A0]">Permanent action warning</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 bg-[#1A1A1A] p-4 rounded-[8px] border border-[#3A3A3A]">
              <p className="text-[16px] font-semibold text-[#F5F5F5]">
                Are you sure you want to delete this project?
              </p>
              <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
                Project: <span className="text-[#FF8A00] font-semibold">{selectedProject.title}</span>
              </p>
              <p className="text-[13px] text-[#777777] leading-relaxed">
                This will permanently remove the project, all registered milestone tasks, and team applications. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(false)}
                className="h-[42px] px-5 text-[15px] font-semibold text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProject}
                disabled={isDeletingProject}
                className="h-[42px] px-6 font-bold text-[15px] text-white bg-[#DC2626] hover:bg-[#EF4444] rounded-[8px] cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingProject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-md p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setTaskToDelete(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-[10px] bg-red-500/15 border border-red-500/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-[#F5F5F5]">Delete Task</h3>
                <p className="text-[13px] text-[#A0A0A0]">Remove task from sprint workflow</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 bg-[#1A1A1A] p-4 rounded-[8px] border border-[#3A3A3A]">
              <p className="text-[15px] font-semibold text-[#F5F5F5]">
                Are you sure you want to delete this task?
              </p>
              <p className="text-[14px] text-[#FF8A00] font-medium">
                "{taskToDelete.title}"
              </p>
              <p className="text-[13px] text-[#777777]">
                Project sprint progress will be automatically recalculated upon deletion.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="h-[40px] px-4.5 text-[14px] font-semibold text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                disabled={isDeletingTask}
                className="h-[40px] px-5 font-bold text-[14px] text-white bg-[#DC2626] hover:bg-[#EF4444] rounded-[8px] cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingTask ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddMemberModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-lg p-6 relative shadow-2xl text-[#F5F5F5] max-h-[90vh] flex flex-col">
            <button
              onClick={() => {
                setShowAddMemberModal(false);
                setAddMemberMessage({ text: '', type: '' });
              }}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-11 h-11 rounded-[10px] bg-[#FF8A00]/15 border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#F5F5F5]">Add Team Member</h3>
                <p className="text-[13px] text-[#A0A0A0]">
                  Project: <span className="text-[#FF8A00] font-semibold">{selectedProject.title}</span> ({selectedProject.members?.length || 1}/{selectedProject.teamSize || 4} Members)
                </p>
              </div>
            </div>

            {addMemberMessage.text && (
              <div
                className={`p-3 mb-3 rounded-[8px] flex items-center gap-2 text-[14px] shrink-0 ${
                  addMemberMessage.type === 'success'
                    ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400'
                }`}
              >
                {addMemberMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{addMemberMessage.text}</span>
              </div>
            )}

            <div className="relative mb-3 shrink-0">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={candidateSearchQuery}
                onChange={(e) => setCandidateSearchQuery(e.target.value)}
                placeholder="Search students by name, department, or skills..."
                className="w-full h-[40px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] pl-9 pr-3.5 text-[14px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#3A3A3A]/40">
              {loadingCandidates ? (
                <div className="p-8 text-center text-[14px] text-[#777777] flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF8A00]" />
                  <span>Loading students...</span>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-8 text-center text-[14px] text-[#777777]">
                  No eligible students found matching your search.
                </div>
              ) : (
                filteredCandidates.map((student) => {
                  const sName = student.user?.name || student.name || 'Student';
                  const sDept = student.department || student.user?.department || '';
                  const sSkills = (student.skills || student.technicalSkills || []).slice(0, 3);
                  const sAvatar = student.user?.avatar || student.avatar;

                  return (
                    <div
                      key={student.user?._id || student.studentId || student._id}
                      className="pt-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {sAvatar ? (
                          <img
                            src={sAvatar}
                            alt={sName}
                            className="w-10 h-10 rounded-full object-cover border border-[#3A3A3A] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#FF8A00] flex items-center justify-center text-[14px] font-bold shrink-0">
                            {sName[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[14.5px] font-semibold text-[#F5F5F5] truncate">{sName}</p>
                          <p className="text-[12.5px] text-[#A0A0A0] truncate">{sDept}</p>
                          {sSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[11px] px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#3A3A3A] text-[#D4D4D4]"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddMember(student)}
                        disabled={addMemberLoading || selectedProject.openPositions <= 0}
                        className="px-3.5 py-1.5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-bold text-[13px] rounded-[6px] shrink-0 cursor-pointer transition-colors disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#3A3A3A] mt-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddMemberMessage({ text: '', type: '' });
                }}
                className="h-[40px] px-5 text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Page Team Chat Modal */}
      {showTeamChat && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-2xl h-[650px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#F5F5F5]">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-[#3A3A3A] flex items-center justify-between bg-[#262626] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[8px] bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-[#F5F5F5] truncate">
                      Team Chat • {selectedProject.title}
                    </h3>
                    <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 font-semibold shrink-0 hidden sm:inline-block">
                      Workspace Channel
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#A0A0A0] truncate mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                    <span>Live channel for all {selectedProject.members?.length || 1} team members</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamChat(false)}
                className="text-[#777777] hover:text-[#F5F5F5] p-1.5 rounded-[6px] transition-colors cursor-pointer shrink-0 ml-2"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#1A1A1A]">
              {loadingTeamChat && teamMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[14px] text-[#777777] gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF8A00]" />
                  <span>Loading team conversation...</span>
                </div>
              ) : teamMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#777777] text-[14px] px-4">
                  <MessageSquare className="w-10 h-10 mb-2.5 text-[#555555]" />
                  <p className="text-[15px] font-semibold text-[#D4D4D4]">
                    Welcome to the {selectedProject.title} Team Chat!
                  </p>
                  <p className="text-[13px] text-[#777777] mt-1 max-w-sm">
                    This is a shared conversation channel for all project members and mentors to coordinate tasks and share updates.
                  </p>
                </div>
              ) : (
                teamMessages.map((msg) => {
                  const isMe =
                    msg.sender?._id?.toString() === currentUserId?.toString() ||
                    msg.sender === currentUserId;
                  const senderName = msg.sender?.name || 'Teammate';
                  const senderInitial = senderName[0]?.toUpperCase() || 'T';

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#3A3A3A] flex items-center justify-center text-[#FF8A00] font-bold text-[12px] shrink-0 mt-0.5 overflow-hidden">
                          {msg.sender?.avatar ? (
                            <img src={msg.sender.avatar} alt={senderName} className="w-full h-full object-cover" />
                          ) : (
                            senderInitial
                          )}
                        </div>
                      )}
                      <div className="max-w-[78%] space-y-1">
                        {!isMe && (
                          <p className="text-[12px] text-[#A0A0A0] font-semibold pl-1">
                            {senderName}
                          </p>
                        )}
                        <div
                          className={`rounded-[10px] px-4 py-2.5 text-[15px] leading-relaxed break-words ${
                            isMe
                              ? 'bg-[#3D2510] border border-[rgba(255,138,0,0.35)] text-[#F5F5F5] rounded-tr-none shadow-sm'
                              : 'bg-[#262626] text-[#F5F5F5] border border-[#3A3A3A] rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 text-[11px] text-[#777777] px-1 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={teamChatEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendTeamMessage}
              className="p-3 sm:px-4 border-t border-[#3A3A3A] bg-[#262626] flex items-center gap-2.5 shrink-0"
            >
              <input
                type="text"
                value={newTeamMessage}
                onChange={(e) => setNewTeamMessage(e.target.value)}
                placeholder={`Message team #${selectedProject.title}...`}
                className="flex-1 h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[14.5px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
              />
              <button
                type="submit"
                disabled={!newTeamMessage.trim() || sendingTeamMessage}
                className="h-[42px] px-4 sm:px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-bold text-[14px] rounded-[8px] disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                {sendingTeamMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
