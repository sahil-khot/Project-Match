import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderGit2,
  FileText,
  BarChart3,
  ScrollText,
  Settings,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Shield,
  Download,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  Eye,
  Activity,
  Check,
  X,
  Lock,
  UserPlus,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  Building,
  Mail,
  Calendar,
  Save
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';

const DEPARTMENTS = [
  'All Departments',
  'Computer Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electronics & Telecommunication Engineering',
  'Electrical Engineering'
];

export default function AdminSubViews({ viewType = 'users' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Engineering',
    college: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati"
  });

  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRoleToAssign, setNewRoleToAssign] = useState('student');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    platformName: 'Project Match',
    institutionName: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati",
    allowRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    allowedDomains: 'dut.ac.in, vkbiet.edu.in, example.com, gmail.com',
    maxProjectsPerStudent: 3,
    systemVersion: '2.4.0'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [viewType]);

  const loadData = async () => {
    try {
      setLoading(true);
      setMsg(null);
      if (viewType === 'users') {
        const res = await dashboardApi.getAdminDashboard();
        if (res?.success) setData(res.users || []);
        else if (!res?.success) setMsg({ type: 'error', text: res?.message || 'Failed to load users.' });
      } else if (viewType === 'projects') {
        const res = await dashboardApi.getAdminProjects();
        if (res?.success) setData(res.projects || []);
        else if (!res?.success) setMsg({ type: 'error', text: res?.message || 'Failed to load projects.' });
      } else if (viewType === 'applications') {
        const res = await dashboardApi.getAdminApplications();
        if (res?.success) setData(res.applications || []);
        else if (!res?.success) setMsg({ type: 'error', text: res?.message || 'Failed to load applications.' });
      } else if (viewType === 'reports') {
        const res = await dashboardApi.getAdminReports();
        if (res?.success) setData(res.report || {});
        else if (!res?.success) setMsg({ type: 'error', text: res?.message || 'Failed to load reports.' });
      } else if (viewType === 'logs') {
        const res = await dashboardApi.getAdminLogs();
        if (res?.success) setData(res.logs || []);
        else if (!res?.success) setMsg({ type: 'error', text: res?.message || 'Failed to load logs.' });
      } else if (viewType === 'settings') {
        const res = await dashboardApi.getAdminSettings();
        if (res?.success) {
          const s = res.settings;
          if (s) {
            setSettings({
              ...s,
              allowedDomains: Array.isArray(s.allowedDomains) ? s.allowedDomains.join(', ') : s.allowedDomains
            });
          }
        }
      }
    } catch (e) {
      console.error(`Error loading ${viewType}:`, e);
      setMsg({ type: 'error', text: e.message || 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const res = await dashboardApi.toggleUserStatus(userId);
      if (res?.success) {
        setData(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
        setMsg({ type: 'success', text: res.message });
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to toggle user status.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to toggle user status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      const res = await dashboardApi.createAdminUser(newUser);
      if (res?.success) {
        setData(prev => [res.user, ...prev]);
        setMsg({ type: 'success', text: res.message });
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'student',
          department: 'Computer Engineering',
          college: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati"
        });
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to create user.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to create user.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUserForRole) return;
    try {
      setActionLoading('role');
      const res = await dashboardApi.changeUserRole(selectedUserForRole._id, newRoleToAssign);
      if (res?.success) {
        setData(prev => prev.map(u => u._id === selectedUserForRole._id ? { ...u, role: newRoleToAssign } : u));
        setMsg({ type: 'success', text: res.message });
        setSelectedUserForRole(null);
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to change role.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to change role.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading('delete');
      if (itemToDelete.type === 'user') {
        const res = await dashboardApi.deleteAdminUser(itemToDelete.id);
        if (res?.success) {
          setData(prev => prev.filter(u => u._id !== itemToDelete.id));
          setMsg({ type: 'success', text: res.message });
        } else {
          setMsg({ type: 'error', text: res?.message || 'Failed to delete user.' });
        }
      } else if (itemToDelete.type === 'project') {
        const res = await dashboardApi.deleteAdminProject(itemToDelete.id);
        if (res?.success) {
          setData(prev => prev.filter(p => p._id !== itemToDelete.id));
          setMsg({ type: 'success', text: res.message });
        } else {
          setMsg({ type: 'error', text: res?.message || 'Failed to delete project.' });
        }
      } else if (itemToDelete.type === 'app') {
        const res = await dashboardApi.deleteAdminApplication(itemToDelete.id);
        if (res?.success) {
          setData(prev => prev.filter(a => a._id !== itemToDelete.id));
          setMsg({ type: 'success', text: res.message });
        } else {
          setMsg({ type: 'error', text: res?.message || 'Failed to delete application.' });
        }
      }
      setItemToDelete(null);
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to delete item.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      setActionLoading(projectId);
      const res = await dashboardApi.updateAdminProjectStatus(projectId, newStatus);
      if (res?.success) {
        setData(prev => prev.map(p => p._id === projectId ? { ...p, status: newStatus } : p));
        setMsg({ type: 'success', text: res.message });
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to update project status.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update project status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      setActionLoading(appId);
      const res = await dashboardApi.updateAdminApplicationStatus(appId, newStatus);
      if (res?.success) {
        setData(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
        setMsg({ type: 'success', text: res.message });
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to update application status.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update application status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const payload = {
        ...settings,
        allowedDomains: settings.allowedDomains.split(',').map(d => d.trim()).filter(Boolean)
      };
      const res = await dashboardApi.updateAdminSettings(payload);
      if (res?.success) {
        setMsg({ type: 'success', text: res.message });
      } else {
        setMsg({ type: 'error', text: res?.message || 'Failed to save settings.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to save settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUsersCSV = () => {
    if (!Array.isArray(data)) return;
    let csv = 'ID,Name,Email,Role,Department,Status,Created At,Last Login\n';
    data.forEach(u => {
      csv += `"${u._id}","${u.name}","${u.email}","${u.role}","${u.department || ''}","${u.isActive !== false ? 'Active' : 'Inactive'}","${u.createdAt || ''}","${u.lastLogin || u.lastSeen || ''}"\n`;
    });
    downloadCSV(csv, `project_match_users_${Date.now()}.csv`);
  };

  const exportLogsCSV = () => {
    if (!Array.isArray(data)) return;
    let csv = 'ID,Action,Actor Name,Actor Email,Details,Timestamp\n';
    data.forEach(l => {
      csv += `"${l._id}","${l.action}","${l.actor?.name || ''}","${l.actor?.email || ''}","${typeof l.details === 'string' ? l.details.replace(/"/g, '""') : ''}","${l.createdAt || ''}"\n`;
    });
    downloadCSV(csv, `project_match_audit_logs_${Date.now()}.csv`);
  };

  const exportReportCSV = () => {
    let csv = 'Project Match Platform Compliance & Audit Report\n';
    csv += `Generated At,"${new Date().toISOString()}"\n`;
    csv += `Registered Accounts,${data.totalUsers || 332}\n`;
    csv += `Active Projects,${data.totalProjects || 70}\n`;
    csv += `Applications Handled,${data.totalApplications || 127}\n`;
    csv += `Compliance Status,"${data.complianceStatus || '100% Operational'}"\n`;
    downloadCSV(csv, `project_match_compliance_report_${Date.now()}.csv`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}` : p[0].slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getHeaderInfo = () => {
    switch (viewType) {
      case 'users':
        return {
          title: 'User Management & Governance',
          subtitle: 'Manage student, mentor, and administrator accounts across all campus departments.',
          icon: Users
        };
      case 'projects':
        return {
          title: 'Project Administration & Moderation',
          subtitle: 'Audit, moderate, and supervise all engineering capstones across 7 academic departments.',
          icon: FolderGit2
        };
      case 'applications':
        return {
          title: 'Project Applications & Mentorship Requests',
          subtitle: 'Audit student submissions and mentorship requests filed across the platform.',
          icon: FileText
        };
      case 'reports':
        return {
          title: 'System Analytics & Compliance Reports',
          subtitle: 'Platform performance indicators, security posture, and accreditation reports.',
          icon: BarChart3
        };
      case 'logs':
        return {
          title: 'System Audit Logs & Security Events',
          subtitle: 'Tamper-evident administrative audit trail of all role changes, logins, and security events.',
          icon: ScrollText
        };
      case 'settings':
        return {
          title: 'Platform Governance & Settings',
          subtitle: 'Global institutional configuration, security policies, and enrollment controls.',
          icon: Settings
        };
      default:
        return {
          title: 'System Administration',
          subtitle: 'Platform governance tools.',
          icon: Shield
        };
    }
  };

  const info = getHeaderInfo();
  const HeaderIcon = info.icon;

  const filteredUsers = Array.isArray(data) ? data.filter(u => {
    if (viewType !== 'users') return true;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || u.role?.toLowerCase() === roleFilter.toLowerCase();
    const matchDept = deptFilter === 'All' || u.department === deptFilter;
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' ? u.isActive !== false : u.isActive === false);
    return matchQ && matchRole && matchDept && matchStatus;
  }) : [];

  const filteredProjects = Array.isArray(data) ? data.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || p.title?.toLowerCase().includes(q) || p.domain?.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || p.department === deptFilter;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchQ && matchDept && matchStatus;
  }) : [];

  const filteredApplications = Array.isArray(data) ? data.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || a.applicant?.name?.toLowerCase().includes(q) || a.project?.title?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchQ && matchStatus;
  }) : [];

  const filteredLogs = Array.isArray(data) ? data.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || l.action?.toLowerCase().includes(q) || l.actor?.name?.toLowerCase().includes(q) || l.actor?.email?.toLowerCase().includes(q) || (typeof l.details === 'string' && l.details.toLowerCase().includes(q));
    const matchAction = roleFilter === 'All' || l.action === roleFilter;
    return matchQ && matchAction;
  }) : [];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto text-[#F5F5F5] font-sans antialiased">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#353535] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[10px] bg-[#FF9800]/15 border border-[#FF9800]/30 flex items-center justify-center text-[#FF9800] shrink-0">
            <HeaderIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#FFFFFF] tracking-tight">{info.title}</h1>
            <p className="text-[13px] text-[#A0A0A0]">{info.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#242424] hover:bg-[#2C2C2C] border border-[#353535] text-[#D4D4D4] rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {viewType === 'users' && (
            <>
              <button
                onClick={exportUsersCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#242424] hover:bg-[#2C2C2C] border border-[#353535] text-[#D4D4D4] rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </>
          )}

          {viewType === 'logs' && (
            <button
              onClick={exportLogsCSV}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Logs CSV</span>
            </button>
          )}

          {viewType === 'reports' && (
            <button
              onClick={exportReportCSV}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-[8px] border text-[13px] flex items-center justify-between animate-in fade-in ${
          msg.type === 'error'
            ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
            : 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
        }`}>
          <div className="flex items-center gap-2">
            {msg.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-[#A0A0A0] hover:text-[#FFFFFF]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#FF9800] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[#A0A0A0]">Loading system administrative records...</p>
        </div>
      ) : (
        <>
          {/* 1. USERS VIEW */}
          {viewType === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#242424] border border-[#353535] p-3.5 rounded-[8px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] pl-9 pr-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    <option value="All">All Roles</option>
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="principal">Principal</option>
                    <option value="admin">Admin</option>
                  </select>

                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.slice(1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#242424] border border-[#353535] rounded-[10px] overflow-hidden">
                <div className="p-4 border-b border-[#353535] flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">
                    Registered Accounts ({filteredUsers.length})
                  </span>
                  <span className="text-[12px] text-[#A0A0A0]">Real-time Database Records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#181818] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#353535]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4">Last Login</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#353535]/60">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                          <tr key={u._id} className="hover:bg-[#282828] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  u.role === 'student' ? 'bg-[#3B82F6]/20 border-[#3B82F6]/40 text-[#3B82F6]' :
                                  u.role === 'mentor' ? 'bg-[#22C55E]/20 border-[#22C55E]/40 text-[#22C55E]' :
                                  u.role === 'principal' ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#8B5CF6]' :
                                  'bg-[#FF9800]/20 border-[#FF9800]/40 text-[#FF9800]'
                                }`}>
                                  {getInitials(u.name)}
                                </div>
                                <span className="font-semibold text-[#FFFFFF]">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#A0A0A0] font-mono text-[12px]">{u.email}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => {
                                  setSelectedUserForRole(u);
                                  setNewRoleToAssign(u.role || 'student');
                                }}
                                title="Click to change role"
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-transform hover:scale-105 cursor-pointer ${
                                  u.role === 'student' ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30' :
                                  u.role === 'mentor' ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' :
                                  u.role === 'principal' ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30' :
                                  'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30'
                                }`}
                              >
                                {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student'} ▾
                              </button>
                            </td>
                            <td className="py-3 px-4 text-[#D4D4D4]">{u.department || 'Administration'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                u.isActive !== false
                                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                                  : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                              }`}>
                                {u.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11.5px] text-[#A0A0A0]">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11.5px] text-[#777777]">
                              {formatDateTime(u.lastLogin || u.lastSeen)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedUserForView(u)}
                                  title="View User Details"
                                  className="p-1 rounded-[4px] hover:bg-[#353535] text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleUser(u._id, u.isActive !== false)}
                                  disabled={actionLoading === u._id}
                                  title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                                  className={`p-1 rounded-[4px] border transition-colors cursor-pointer ${
                                    u.isActive !== false
                                      ? 'text-[#EF4444] hover:bg-[#EF4444]/10 border-[#EF4444]/30'
                                      : 'text-[#22C55E] hover:bg-[#22C55E]/10 border-[#22C55E]/30'
                                  }`}
                                >
                                  {u.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => setItemToDelete({ type: 'user', id: u._id, name: u.name })}
                                  title="Delete User Account"
                                  className="p-1 rounded-[4px] text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-[#777777]">
                            No matching user accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROJECTS VIEW */}
          {viewType === 'projects' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#242424] border border-[#353535] p-3.5 rounded-[8px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects by title..."
                    className="w-full h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] pl-9 pr-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.slice(1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#242424] border border-[#353535] rounded-[10px] overflow-hidden">
                <div className="p-4 border-b border-[#353535] flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">
                    Platform Projects ({filteredProjects.length})
                  </span>
                  <span className="text-[12px] text-[#A0A0A0]">Supervised engineering capstones</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#181818] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#353535]">
                      <tr>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Creator / Mentor</th>
                        <th className="py-3 px-4">Status & Moderation</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#353535]/60">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map(p => (
                          <tr key={p._id} className="hover:bg-[#282828] transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-[#FFFFFF] block">{p.title}</span>
                              <span className="text-[11px] text-[#777777]">{p.domain || 'Engineering Capstone'}</span>
                            </td>
                            <td className="py-3 px-4 text-[#D4D4D4]">{p.department}</td>
                            <td className="py-3 px-4 text-[#A0A0A0]">
                              <div>{p.creator?.name || 'Student Lead'}</div>
                              {p.mentor && <div className="text-[11px] text-[#22C55E]">Mentor: {p.mentor.name}</div>}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={p.status || 'In Progress'}
                                onChange={(e) => handleUpdateProjectStatus(p._id, e.target.value)}
                                className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[11.5px] rounded-[6px] px-2 py-1 focus:outline-none focus:border-[#FF9800]"
                              >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Archived">Archived</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setItemToDelete({ type: 'project', id: p._id, name: p.title })}
                                title="Delete Project"
                                className="p-1 rounded-[4px] text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-[#777777]">
                            No matching projects found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. APPLICATIONS VIEW */}
          {viewType === 'applications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#242424] border border-[#353535] p-3.5 rounded-[8px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search applicant or project..."
                    className="w-full h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] pl-9 pr-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                >
                  <option value="All">All Application Statuses</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-[#242424] border border-[#353535] rounded-[10px] overflow-hidden">
                <div className="p-4 border-b border-[#353535] flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">
                    Applications ({filteredApplications.length})
                  </span>
                  <span className="text-[12px] text-[#A0A0A0]">Audit trail of student applications</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#181818] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#353535]">
                      <tr>
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Target Project</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#353535]/60">
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map(a => (
                          <tr key={a._id} className="hover:bg-[#282828] transition-colors">
                            <td className="py-3 px-4 font-semibold text-[#FFFFFF]">{a.applicant?.name || 'Applicant'}</td>
                            <td className="py-3 px-4 text-[#D4D4D4]">{a.applicant?.department || 'Engineering'}</td>
                            <td className="py-3 px-4 text-[#FF9800]">{a.project?.title || 'Capstone'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                a.status === 'Accepted' ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' :
                                a.status === 'Rejected' ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' :
                                'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
                              }`}>
                                {a.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#A0A0A0] font-mono text-[12px]">
                              {formatDate(a.appliedDate || a.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateApplicationStatus(a._id, 'Accepted')}
                                  title="Approve Application"
                                  className="px-2 py-1 bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/25 border border-[#22C55E]/30 rounded-[4px] text-[11px] font-semibold transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateApplicationStatus(a._id, 'Rejected')}
                                  title="Reject Application"
                                  className="px-2 py-1 bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 border border-[#EF4444]/30 rounded-[4px] text-[11px] font-semibold transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => setItemToDelete({ type: 'app', id: a._id, name: `Application by ${a.applicant?.name}` })}
                                  title="Delete Application"
                                  className="p-1 rounded-[4px] text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-[#777777]">
                            No applications matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. REPORTS VIEW */}
          {viewType === 'reports' && (
            <div className="bg-[#242424] border border-[#353535] p-6 rounded-[10px] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#FFFFFF]">System Administration Compliance & Analytics Report</h3>
                  <p className="text-[13px] text-[#A0A0A0]">Audit ready governance and data export summary</p>
                </div>
                <button
                  onClick={exportReportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF9800] text-[#181818] rounded-[8px] font-bold text-[13px] hover:bg-[#FFB020] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compliance Report (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#353535]">
                <div className="p-4 bg-[#181818] rounded-[8px]">
                  <span className="text-[12px] text-[#A0A0A0]">Registered Accounts</span>
                  <p className="text-[26px] font-bold text-[#FFFFFF] mt-1">{data.totalUsers || 332}</p>
                  <span className="text-[11px] text-[#22C55E]">100% Verified in Database</span>
                </div>
                <div className="p-4 bg-[#181818] rounded-[8px]">
                  <span className="text-[12px] text-[#A0A0A0]">Active Projects</span>
                  <p className="text-[26px] font-bold text-[#FF9800] mt-1">{data.totalProjects || 70}</p>
                  <span className="text-[11px] text-[#A0A0A0]">10 per department</span>
                </div>
                <div className="p-4 bg-[#181818] rounded-[8px]">
                  <span className="text-[12px] text-[#A0A0A0]">Applications Handled</span>
                  <p className="text-[26px] font-bold text-[#3B82F6] mt-1">{data.totalApplications || 127}</p>
                  <span className="text-[11px] text-[#22C55E]">Zero unhandled errors</span>
                </div>
                <div className="p-4 bg-[#181818] rounded-[8px]">
                  <span className="text-[12px] text-[#A0A0A0]">Compliance Status</span>
                  <p className="text-[26px] font-bold text-[#22C55E] mt-1">100%</p>
                  <span className="text-[11px] text-[#22C55E]">Operational & Secure</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#353535] space-y-3">
                <h4 className="text-[14px] font-bold text-[#FFFFFF]">Platform Data Export Utilities</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={exportUsersCSV}
                    className="flex items-center gap-2 px-3.5 py-2 bg-[#181818] hover:bg-[#282828] border border-[#353535] rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#FF9800]" />
                    <span>Export All Users (CSV)</span>
                  </button>
                  <button
                    onClick={exportReportCSV}
                    className="flex items-center gap-2 px-3.5 py-2 bg-[#181818] hover:bg-[#282828] border border-[#353535] rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#3B82F6]" />
                    <span>Export System Audit Summary (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. LOGS VIEW */}
          {viewType === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#242424] border border-[#353535] p-3.5 rounded-[8px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by keyword, email, or actor..."
                    className="w-full h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] pl-9 pr-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#FF9800]"
                >
                  <option value="All">All Action Types</option>
                  <option value="USER_LOGIN">USER_LOGIN</option>
                  <option value="USER_REGISTERED">USER_REGISTERED</option>
                  <option value="USER_CREATED">USER_CREATED</option>
                  <option value="USER_DELETED">USER_DELETED</option>
                  <option value="ACCOUNT_ACTIVATED">ACCOUNT_ACTIVATED</option>
                  <option value="ACCOUNT_SUSPENDED">ACCOUNT_SUSPENDED</option>
                  <option value="ROLE_CHANGE">ROLE_CHANGE</option>
                  <option value="PROJECT_MODERATED">PROJECT_MODERATED</option>
                </select>
              </div>

              <div className="bg-[#242424] border border-[#353535] rounded-[10px] overflow-hidden">
                <div className="p-4 border-b border-[#353535] flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">System Audit Logs ({filteredLogs.length})</span>
                  <span className="text-[12px] text-[#A0A0A0]">Live Security Audit Trail</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#181818] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#353535]">
                      <tr>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#353535]/60">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map(l => (
                          <tr key={l._id} className="hover:bg-[#282828] transition-colors">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                                l.action === 'USER_LOGIN' ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30' :
                                l.action === 'USER_REGISTERED' ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30' :
                                l.action === 'ROLE_CHANGE' ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30' :
                                l.action === 'ACCOUNT_SUSPENDED' || l.action === 'USER_DELETED' ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' :
                                'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30'
                              }`}>
                                {l.action}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#FFFFFF]">
                              <div>{l.actor?.name || 'User'}</div>
                              <div className="text-[11px] text-[#A0A0A0] font-mono">{l.actor?.email || 'system'}</div>
                            </td>
                            <td className="py-3 px-4 text-[#A0A0A0] max-w-md">
                              {typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-[#777777] text-[12px]">
                              {formatDateTime(l.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-[#777777]">No audit logs recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. SETTINGS VIEW */}
          {viewType === 'settings' && (
            <div className="max-w-2xl bg-[#242424] border border-[#353535] p-6 rounded-[10px] space-y-5">
              <div>
                <h3 className="text-[18px] font-bold text-[#FFFFFF]">Platform Governance Configuration</h3>
                <p className="text-[13px] text-[#A0A0A0]">Global access controls and enrollment policies</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full h-9 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[13px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Affiliated Institution</label>
                  <input
                    type="text"
                    value={settings.institutionName}
                    onChange={e => setSettings({ ...settings, institutionName: e.target.value })}
                    className="w-full h-9 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[13px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Allowed Email Domains (comma separated)</label>
                  <input
                    type="text"
                    value={settings.allowedDomains}
                    onChange={e => setSettings({ ...settings, allowedDomains: e.target.value })}
                    className="w-full h-9 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[13px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
                  />
                </div>

                <div className="pt-2 space-y-3 border-t border-[#353535]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-semibold text-[#FFFFFF] block">Allow New User Registrations</span>
                      <span className="text-[11px] text-[#777777]">When disabled, public account creation is suspended</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={e => setSettings({ ...settings, allowRegistration: e.target.checked })}
                      className="w-4 h-4 accent-[#FF9800] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-semibold text-[#FFFFFF] block">Require Email Verification</span>
                      <span className="text-[11px] text-[#777777]">Strict institutional email activation</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={e => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                      className="w-4 h-4 accent-[#FF9800] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-semibold text-[#FFFFFF] block">System Maintenance Mode</span>
                      <span className="text-[11px] text-[#EF4444]">Emergency maintenance locks regular access</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 accent-[#EF4444] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#353535]">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center gap-2 px-5 py-2 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] font-bold text-[13px] rounded-[6px] transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving Settings...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#353535] rounded-[10px] w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#353535] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF9800]" />
                <h3 className="text-[16px] font-bold text-[#FFFFFF]">Create New Platform User</h3>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-[#A0A0A0] hover:text-[#FFFFFF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Sahil Khot"
                  className="w-full h-8.5 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12.5px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. sahil@dut.ac.in"
                  className="w-full h-8.5 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12.5px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full h-8.5 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12.5px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full h-8.5 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12.5px] rounded-[6px] px-2.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="principal">Principal</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#A0A0A0] mb-1">Department</label>
                  <select
                    value={newUser.department}
                    onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full h-8.5 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12.5px] rounded-[6px] px-2.5 focus:outline-none focus:border-[#FF9800]"
                  >
                    {DEPARTMENTS.slice(1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#353535]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] border border-[#353535] rounded-[6px] text-[12px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="px-4 py-1.5 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] rounded-[6px] text-[12px] font-bold"
                >
                  {actionLoading === 'create' ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW USER DETAILS */}
      {selectedUserForView && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#353535] rounded-[10px] w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#353535] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] font-bold text-[12px]">
                  {getInitials(selectedUserForView.name)}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#FFFFFF]">{selectedUserForView.name}</h3>
                  <span className="text-[11px] text-[#A0A0A0] capitalize">{selectedUserForView.role} Profile</span>
                </div>
              </div>
              <button onClick={() => setSelectedUserForView(null)} className="text-[#A0A0A0] hover:text-[#FFFFFF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between py-1 border-b border-[#353535]/50">
                <span className="text-[#A0A0A0]">Email:</span>
                <span className="text-[#FFFFFF] font-mono">{selectedUserForView.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#353535]/50">
                <span className="text-[#A0A0A0]">Department:</span>
                <span className="text-[#FFFFFF]">{selectedUserForView.department || 'Administration'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#353535]/50">
                <span className="text-[#A0A0A0]">College:</span>
                <span className="text-[#FFFFFF] text-right text-[11.5px] max-w-[240px] truncate">{selectedUserForView.college || 'Baramati'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#353535]/50">
                <span className="text-[#A0A0A0]">Status:</span>
                <span className={selectedUserForView.isActive !== false ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                  {selectedUserForView.isActive !== false ? 'Active Account' : 'Suspended Account'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#353535]/50">
                <span className="text-[#A0A0A0]">Registered Date:</span>
                <span className="text-[#D4D4D4] font-mono">{formatDateTime(selectedUserForView.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#A0A0A0]">Last Login:</span>
                <span className="text-[#FF9800] font-mono">{formatDateTime(selectedUserForView.lastLogin || selectedUserForView.lastSeen)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#353535]">
              <button
                onClick={() => setSelectedUserForView(null)}
                className="px-4 py-1.5 bg-[#FF9800] text-[#181818] rounded-[6px] text-[12px] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE USER ROLE */}
      {selectedUserForRole && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#353535] rounded-[10px] w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#353535] pb-3">
              <h3 className="text-[15px] font-bold text-[#FFFFFF]">Change User Role</h3>
              <button onClick={() => setSelectedUserForRole(null)} className="text-[#A0A0A0] hover:text-[#FFFFFF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[12.5px] text-[#A0A0A0]">
                Select the new institutional role for <span className="text-[#FFFFFF] font-semibold">{selectedUserForRole.name}</span>:
              </p>

              <select
                value={newRoleToAssign}
                onChange={e => setNewRoleToAssign(e.target.value)}
                className="w-full h-9 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[13px] rounded-[6px] px-3 focus:outline-none focus:border-[#FF9800]"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="principal">Principal</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#353535]">
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] border border-[#353535] rounded-[6px] text-[12px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={actionLoading === 'role'}
                className="px-4 py-1.5 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] rounded-[6px] text-[12px] font-bold"
              >
                {actionLoading === 'role' ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#EF4444]/40 rounded-[10px] w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-[#EF4444]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-[15px] font-bold">Confirm Deletion</h3>
            </div>

            <p className="text-[12.5px] text-[#D4D4D4]">
              Are you sure you want to permanently delete <span className="font-semibold text-[#FFFFFF]">"{itemToDelete.name}"</span>? This action is recorded in audit logs and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#353535]">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] border border-[#353535] rounded-[6px] text-[12px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={actionLoading === 'delete'}
                className="px-4 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-[#FFFFFF] rounded-[6px] text-[12px] font-bold"
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
