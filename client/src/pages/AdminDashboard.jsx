import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FolderGit2,
  FileText,
  ShieldCheck,
  ChevronRight,
  Clock,
  Zap,
  BarChart3,
  Activity,
  CheckCircle2,
  Search,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Folder,
  ArrowRight,
  Eye,
  UserX,
  UserCheck2,
  Trash2,
  Plus
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

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 331,
    studentsCount: 280,
    mentorsCount: 50,
    principalsCount: 1,
    adminsCount: 1,
    projectsCount: 70,
    departmentsCount: 7,
    projectsPerDept: 10,
    totalApplications: 127,
    applicationsThisWeek: 12,
    systemStatus: 'Healthy'
  });

  const [userRoleDist, setUserRoleDist] = useState({
    totalUsers: 331,
    students: { count: 280, percent: 84.6 },
    mentors: { count: 50, percent: 15.1 },
    principal: { count: 1, percent: 0.3 },
    admins: { count: 1, percent: 0.3 }
  });

  const [projectsByDept, setProjectsByDept] = useState([
    { name: 'Computer', count: 10, color: '#3B82F6' },
    { name: 'AIDS', count: 10, color: '#22C55E' },
    { name: 'IT', count: 10, color: '#8B5CF6' },
    { name: 'Civil', count: 10, color: '#EF4444' },
    { name: 'Mechanical', count: 10, color: '#FF9800' },
    { name: 'ENTC', count: 10, color: '#06B6D4' },
    { name: 'Electrical', count: 10, color: '#EAB308' }
  ]);

  const [appsByStatus, setAppsByStatus] = useState({
    total: 127,
    accepted: { count: 48, percent: 37.8 },
    pending: { count: 56, percent: 44.1 },
    rejected: { count: 23, percent: 18.1 }
  });

  const [systemHealth, setSystemHealth] = useState([
    { id: 'db', name: 'Database (MongoDB)', status: 'Connected', isHealthy: true },
    { id: 'api', name: 'Backend API', status: 'Operational', isHealthy: true },
    { id: 'auth', name: 'Authentication', status: 'Operational', isHealthy: true },
    { id: 'uptime', name: 'Server Uptime', status: '99.9%', isHealthy: true }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 'act-1',
      title: 'New student registered',
      detail: 'sneha.patil@dut.ac.in',
      time: '2 hours ago',
      icon: UserPlus,
      bg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
    },
    {
      id: 'act-2',
      title: 'New project created',
      detail: 'Smart Irrigation System',
      time: '4 hours ago',
      icon: Folder,
      bg: 'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30'
    },
    {
      id: 'act-3',
      title: 'Application submitted',
      detail: 'Rahul Sharma → SolarSense AI',
      time: '6 hours ago',
      icon: FileText,
      bg: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30'
    },
    {
      id: 'act-4',
      title: 'New mentor registered',
      detail: 'Prof. Amit Deshmukh',
      time: '1 day ago',
      icon: UserCheck,
      bg: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
    },
    {
      id: 'act-5',
      title: 'Failed login attempt',
      detail: 'unknown@domain.com',
      time: '1 day ago',
      icon: ShieldAlert,
      bg: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
    }
  ]);

  const [users, setUsers] = useState([
    {
      _id: 'u-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@dut.ac.in',
      role: 'student',
      department: 'Computer Engineering',
      isActive: true,
      createdAt: '2024-10-10T10:00:00Z'
    },
    {
      _id: 'u-2',
      name: 'Sneha Patil',
      email: 'sneha.patil@dut.ac.in',
      role: 'student',
      department: 'Information Technology',
      isActive: true,
      createdAt: '2024-10-10T09:30:00Z'
    },
    {
      _id: 'u-3',
      name: 'Amit Deshmukh',
      email: 'amit.deshmukh@dut.ac.in',
      role: 'mentor',
      department: 'Mechanical Engineering',
      isActive: true,
      createdAt: '2024-10-09T14:15:00Z'
    },
    {
      _id: 'u-4',
      name: 'Neha Kulkarni',
      email: 'neha.kulkarni@dut.ac.in',
      role: 'student',
      department: 'AIDS',
      isActive: false,
      createdAt: '2024-10-08T11:20:00Z'
    },
    {
      _id: 'u-5',
      name: 'Dr. Suresh Narayan',
      email: 'suresh.narayan@dut.ac.in',
      role: 'principal',
      department: 'Administration',
      isActive: true,
      createdAt: '2024-10-05T08:00:00Z'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getAdminDashboard();
      if (res?.success) {
        const d = res;
        if (d.stats) setStats(d.stats);
        if (d.userRoleDistribution) setUserRoleDist(d.userRoleDistribution);
        if (d.projectsByDepartment && d.projectsByDepartment.length > 0) {
          setProjectsByDept(d.projectsByDepartment);
        }
        if (d.applicationsByStatus) setAppsByStatus(d.applicationsByStatus);
        if (d.systemHealth) setSystemHealth(d.systemHealth);
        if (d.recentActivity && d.recentActivity.length > 0) {
          const iconMap = {
            UserPlus: UserPlus,
            Folder: Folder,
            FileText: FileText,
            UserCheck: UserCheck,
            ShieldAlert: ShieldAlert
          };
          const bgMap = {
            '#22C55E': 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
            '#FF9800': 'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30',
            '#8B5CF6': 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30',
            '#3B82F6': 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30',
            '#EF4444': 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
          };
          setRecentActivity(
            d.recentActivity.map(item => ({
              ...item,
              icon: iconMap[item.icon] || Clock,
              bg: bgMap[item.color] || 'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30'
            }))
          );
        }
        if (d.users && d.users.length > 0) {
          setUsers(d.users);
        }
      }
    } catch (err) {
      console.error('Failed to load Admin Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const res = await dashboardApi.toggleUserStatus(userId);
      if (res?.success) {
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoading(null);
      setActiveMenuId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    try {
      setActionLoading(userId);
      const res = await dashboardApi.deleteAdminUser(userId);
      if (res?.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setStats(prev => ({
          ...prev,
          totalUsers: Math.max(0, (prev.totalUsers || 1) - 1)
        }));
      }
    } catch (err) {
      alert(err.message || 'Error deleting user');
    } finally {
      setActionLoading(null);
      setActiveMenuId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (role) => {
    switch (role) {
      case 'student':
        return 'bg-[#3B82F6] text-[#FFFFFF]';
      case 'mentor':
        return 'bg-[#22C55E] text-[#FFFFFF]';
      case 'principal':
        return 'bg-[#8B5CF6] text-[#FFFFFF]';
      case 'admin':
        return 'bg-[#FF9800] text-[#181818]';
      default:
        return 'bg-[#3B82F6] text-[#FFFFFF]';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Oct 10, 2024';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
  };

  // Math for User Role Donut Chart
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ≈ 238.76

  const totalUserCount = userRoleDist.totalUsers || 331;
  const sPct = (userRoleDist.students?.count || 280) / totalUserCount;
  const mPct = (userRoleDist.mentors?.count || 50) / totalUserCount;
  const prPct = (userRoleDist.principal?.count || 1) / totalUserCount;
  const aPct = (userRoleDist.admins?.count || 1) / totalUserCount;

  const sDash = sPct * circumference;
  const mDash = mPct * circumference;
  const prDash = prPct * circumference;
  const aDash = aPct * circumference;

  // Math for Applications by Status Donut Chart
  const totalAppsCount = appsByStatus.total || 127;
  const accPct = (appsByStatus.accepted?.count || 48) / totalAppsCount;
  const pndPct = (appsByStatus.pending?.count || 56) / totalAppsCount;
  const rejPct = (appsByStatus.rejected?.count || 23) / totalAppsCount;

  const accDash = accPct * circumference;
  const pndDash = pndPct * circumference;
  const rejDash = rejPct * circumference;

  // Filtered Users Table
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || u.role?.toLowerCase() === roleFilter.toLowerCase();
    const matchDept = deptFilter === 'All' || u.department === deptFilter;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' ? u.isActive !== false : u.isActive === false);
    return matchQ && matchRole && matchDept && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1440px] mx-auto text-[#FFFFFF] font-sans antialiased">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[26px] lg:text-[28px] font-bold text-[#FFFFFF] tracking-tight">
              System Administration Console
            </h1>
            <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#3F1618] text-[#EF4444] border border-[#EF4444]/30 font-semibold tracking-wide">
              Admin
            </span>
          </div>
          <p className="text-[13px] text-[#A0A0A0] leading-snug max-w-[700px]">
            Manage users, monitor platform activity, maintain data integrity, and ensure smooth operation of Project Match.
          </p>
        </div>

        {/* Informational Quote Card */}
        <div className="bg-[#242424] border border-[#353535] border-l-[3px] border-l-[#FF9800] px-4 py-3 rounded-[8px] w-full lg:w-[320px] shrink-0">
          <p className="text-[13px] text-[#D4D4D4] italic font-medium leading-tight">
            "A secure platform builds brighter innovators."
          </p>
          <span className="text-[11px] text-[#777777] mt-1 block">
            — Project Match
          </span>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Total Users */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-[#242424] border border-[#353535] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-[#A0A0A0] text-[12px]">
              <span>Total Users</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#FFFFFF] transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-[28px] font-bold text-[#FFFFFF] tracking-tight block leading-tight">
              {stats.totalUsers}
            </span>
            <div className="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[#3B82F6] font-medium">{stats.studentsCount} Students</span>
              <span>·</span>
              <span className="text-[#22C55E] font-medium">{stats.mentorsCount} Mentors</span>
              <span>·</span>
              <span className="text-[#8B5CF6] font-medium">{stats.principalsCount} Principal</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Projects */}
        <div
          onClick={() => navigate('/admin/projects')}
          className="bg-[#242424] border border-[#353535] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#FF9800]/15 border border-[#FF9800]/30 flex items-center justify-center text-[#FF9800]">
              <Folder className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-[#A0A0A0] text-[12px]">
              <span>Total Projects</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#FFFFFF] transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-[28px] font-bold text-[#FFFFFF] tracking-tight block leading-tight">
              {stats.projectsCount}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">
              7 Departments · 10 each
            </span>
          </div>
        </div>

        {/* CARD 3: Total Applications */}
        <div
          onClick={() => navigate('/admin/applications')}
          className="bg-[#242424] border border-[#353535] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-[#A0A0A0] text-[12px]">
              <span>Total Applications</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#FFFFFF] transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-[28px] font-bold text-[#FFFFFF] tracking-tight block leading-tight">
              {stats.totalApplications}
            </span>
            <span className="text-[11px] text-[#22C55E] font-medium mt-1 block">
              +{stats.applicationsThisWeek} this week
            </span>
          </div>
        </div>

        {/* CARD 4: System Status */}
        <div className="bg-[#242424] border border-[#353535] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-[#A0A0A0] text-[12px]">
              <span>System Status</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#777777]" />
            </div>
          </div>
          <div>
            <span className={`text-[28px] font-bold tracking-tight block leading-tight ${
              stats.systemStatus === 'Healthy' ? 'text-[#22C55E]' : 'text-[#EF4444]'
            }`}>
              {stats.systemStatus}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: User Role Distribution + Recent System Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CARD 1: User Role Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-[#242424] border border-[#353535] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#FF9800]" />
              <h2 className="text-[14px] font-bold text-[#FFFFFF]">User Role Distribution</h2>
            </div>
            <p className="text-[11px] text-[#777777] mb-3">
              Total {userRoleDist.totalUsers} registered users
            </p>

            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Donut Chart SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r={radius} stroke="#2D2D35" strokeWidth="8" fill="transparent" />
                  {/* Students (Blue) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#3B82F6" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${sDash} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                  {/* Mentors (Green) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#22C55E" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${mDash} ${circumference}`}
                    strokeDashoffset={-sDash}
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                  {/* Principal (Purple) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#8B5CF6" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${prDash} ${circumference}`}
                    strokeDashoffset={-(sDash + mDash)}
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                  {/* Admin (Orange) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#FF9800" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${aDash} ${circumference}`}
                    strokeDashoffset={-(sDash + mDash + prDash)}
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[19px] font-bold text-[#FFFFFF] leading-none">
                    {userRoleDist.totalUsers}
                  </span>
                  <span className="text-[9px] text-[#777777] mt-0.5 leading-none">
                    Total Users
                  </span>
                </div>
              </div>

              {/* Right Legend */}
              <div className="space-y-2 text-[11px] min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Students</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {userRoleDist.students?.count} ({userRoleDist.students?.percent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Mentors</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {userRoleDist.mentors?.count} ({userRoleDist.mentors?.percent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Principal</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {userRoleDist.principal?.count} ({userRoleDist.principal?.percent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#FF9800] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Admins</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {userRoleDist.admins?.count} ({userRoleDist.admins?.percent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Recent System Activity (5 cols) */}
        <div className="lg:col-span-5 bg-[#242424] border border-[#353535] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#353535]/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF9800]" />
                <h2 className="text-[14px] font-bold text-[#FFFFFF]">Recent System Activity</h2>
              </div>
              <button
                onClick={() => navigate('/admin/logs')}
                className="text-[12px] text-[#FF9800] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.map(act => {
                const IconComponent = act.icon;
                return (
                  <div key={act.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${act.bg}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[#FFFFFF] leading-snug">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-[#A0A0A0] truncate leading-snug">
                          {act.detail}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#777777] shrink-0 font-mono">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARD 3: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-[#242424] border border-[#353535] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#353535]/60 pb-2.5 mb-3">
              <Zap className="w-4 h-4 text-[#FF9800]" />
              <h2 className="text-[14px] font-bold text-[#FFFFFF]">Quick Actions</h2>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-[#1F1F23] hover:bg-[#282828] border border-[#353535] rounded-[8px] p-2.5 flex items-center justify-between transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[6px] bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#FFFFFF] truncate">Manage Users</p>
                    <p className="text-[10px] text-[#777777] truncate">Add, edit or deactivate accounts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#FFFFFF] shrink-0 transition-colors" />
              </button>

              <button
                onClick={() => navigate('/admin/projects')}
                className="w-full bg-[#1F1F23] hover:bg-[#282828] border border-[#353535] rounded-[8px] p-2.5 flex items-center justify-between transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[6px] bg-[#FF9800]/15 text-[#FF9800] flex items-center justify-center shrink-0">
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#FFFFFF] truncate">Manage Projects</p>
                    <p className="text-[10px] text-[#777777] truncate">View and moderate projects</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#FFFFFF] shrink-0 transition-colors" />
              </button>

              <button
                onClick={() => navigate('/admin/applications')}
                className="w-full bg-[#1F1F23] hover:bg-[#282828] border border-[#353535] rounded-[8px] p-2.5 flex items-center justify-between transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[6px] bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#FFFFFF] truncate">View Applications</p>
                    <p className="text-[10px] text-[#777777] truncate">Review project applications</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#FFFFFF] shrink-0 transition-colors" />
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full bg-[#1F1F23] hover:bg-[#282828] border border-[#353535] rounded-[8px] p-2.5 flex items-center justify-between transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[6px] bg-[#4B5563]/25 text-[#9CA3AF] flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#FFFFFF] truncate">System Settings</p>
                    <p className="text-[10px] text-[#777777] truncate">Configure platform settings</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#FFFFFF] shrink-0 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Second Middle Row: Projects by Department + Applications by Status + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CARD 1: Projects by Department (5 cols) */}
        <div className="lg:col-span-5 bg-[#242424] border border-[#353535] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#353535]/60 pb-2.5 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF9800]" />
                <h2 className="text-[14px] font-bold text-[#FFFFFF]">Projects by Department</h2>
              </div>
              <button
                onClick={() => navigate('/admin/projects')}
                className="text-[12px] text-[#FF9800] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Vertical Bar Chart (7 columns) */}
            <div className="pt-2 pb-1">
              <div className="h-28 flex items-end justify-between gap-2 px-2 border-b border-[#353535]/60 pb-2">
                {projectsByDept.map(dept => (
                  <div key={dept.name} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-bold text-[#FFFFFF] font-mono leading-none">
                      {dept.count}
                    </span>
                    <div
                      className="w-full max-w-[28px] rounded-t-[4px] transition-all duration-700"
                      style={{
                        height: `${Math.min(75, Math.max(25, (dept.count / 10) * 65))}px`,
                        backgroundColor: dept.color
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Labels below */}
              <div className="flex items-center justify-between gap-2 px-2 pt-2 text-[10px] text-[#A0A0A0] text-center font-medium">
                {projectsByDept.map(dept => (
                  <span key={dept.name} className="flex-1 truncate">
                    {dept.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Applications by Status (4 cols) */}
        <div className="lg:col-span-4 bg-[#242424] border border-[#353535] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#353535]/60 pb-2.5 mb-3">
              <Activity className="w-4 h-4 text-[#FF9800]" />
              <h2 className="text-[14px] font-bold text-[#FFFFFF]">Applications by Status</h2>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {/* Donut Chart SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r={radius} stroke="#2D2D35" strokeWidth="8" fill="transparent" />
                  {/* Accepted (Green) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#22C55E" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${accDash} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                  {/* Pending (Blue) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#3B82F6" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${pndDash} ${circumference}`}
                    strokeDashoffset={-accDash}
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                  {/* Rejected (Red) */}
                  <circle
                    cx="48" cy="48" r={radius}
                    stroke="#EF4444" strokeWidth="8" fill="transparent"
                    strokeDasharray={`${rejDash} ${circumference}`}
                    strokeDashoffset={-(accDash + pndDash)}
                    strokeLinecap="butt"
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[19px] font-bold text-[#FFFFFF] leading-none">
                    {appsByStatus.total}
                  </span>
                  <span className="text-[9px] text-[#777777] mt-0.5 leading-none">
                    Applications
                  </span>
                </div>
              </div>

              {/* Right Legend */}
              <div className="space-y-2 text-[11px] min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Accepted</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {appsByStatus.accepted?.count} ({appsByStatus.accepted?.percent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Pending</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {appsByStatus.pending?.count} ({appsByStatus.pending?.percent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
                    <span className="text-[#D4D4D4] truncate">Rejected</span>
                  </div>
                  <span className="text-[#A0A0A0] font-mono text-[10.5px]">
                    {appsByStatus.rejected?.count} ({appsByStatus.rejected?.percent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: System Health (3 cols) */}
        <div className="lg:col-span-3 bg-[#242424] border border-[#353535] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#353535]/60 pb-2.5 mb-3">
              <Activity className="w-4 h-4 text-[#FF9800]" />
              <h2 className="text-[14px] font-bold text-[#FFFFFF]">System Health</h2>
            </div>

            <div className="space-y-3 pt-1">
              {systemHealth.map(item => (
                <div key={item.id} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-[#D4D4D4]">{item.name}</span>
                  </div>
                  <span className="text-[#22C55E] font-medium text-[11px] font-mono">
                    {item.status.startsWith('●') ? item.status : `● ${item.status}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Recent Users Table */}
      <div className="bg-[#242424] border border-[#353535] rounded-[10px] overflow-hidden">
        {/* Table Header & Search/Filters */}
        <div className="p-4 border-b border-[#353535] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF9800]" />
              <h2 className="text-[15px] font-bold text-[#FFFFFF]">Recent Users</h2>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="h-7 px-2.5 bg-[#FF9800] hover:bg-[#FFB020] text-[#181818] font-bold text-[11px] rounded-[6px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-[11px] text-[#A0A0A0] hover:text-[#FFFFFF] underline transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[12px] rounded-[6px] pl-8 pr-3 focus:outline-none focus:border-[#FF9800] w-44"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[11px] rounded-[6px] px-2.5 focus:outline-none focus:border-[#FF9800]"
            >
              <option value="All">All Roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="principal">Principal</option>
              <option value="admin">Admin</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[11px] rounded-[6px] px-2.5 focus:outline-none focus:border-[#FF9800]"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.slice(1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 bg-[#181818] border border-[#353535] text-[#FFFFFF] text-[11px] rounded-[6px] px-2.5 focus:outline-none focus:border-[#FF9800]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#181818] text-[11px] text-[#777777] uppercase tracking-wider border-b border-[#353535]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">NAME</th>
                <th className="py-2.5 px-4 font-semibold">EMAIL</th>
                <th className="py-2.5 px-4 font-semibold">ROLE</th>
                <th className="py-2.5 px-4 font-semibold">DEPARTMENT</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold">JOINED AT</th>
                <th className="py-2.5 px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353535]/50">
              {filteredUsers.slice(0, 15).map(u => (
                <tr key={u._id} className="hover:bg-[#282828] transition-colors">
                  {/* Name + Avatar */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarBg(u.role)}`}>
                        {getInitials(u.name)}
                      </div>
                      <span className="font-semibold text-[#FFFFFF]">{u.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-2.5 px-4 text-[#A0A0A0] font-mono text-[11.5px]">{u.email}</td>

                  {/* Role Badge */}
                  <td className="py-2.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      u.role === 'student'
                        ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
                        : u.role === 'mentor'
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                        : u.role === 'principal'
                        ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30'
                        : 'bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30'
                    }`}>
                      {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student'}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-2.5 px-4 text-[#D4D4D4]">{u.department || 'Administration'}</td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${
                      u.isActive !== false
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                        : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                    }`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Joined At */}
                  <td className="py-2.5 px-4 text-[#777777] font-mono text-[11px]">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-2.5 px-4 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === u._id ? null : u._id)}
                      className="p-1 rounded-[4px] hover:bg-[#353535] text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === u._id && (
                      <div className="absolute right-4 mt-1 w-44 bg-[#1F1F23] border border-[#353535] rounded-[8px] shadow-2xl p-1.5 z-50 text-left animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(`/admin/profile/${u._id}`);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[#D4D4D4] hover:text-[#FFFFFF] hover:bg-[#282828] rounded-[4px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate('/admin/logs');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[#D4D4D4] hover:text-[#FFFFFF] hover:bg-[#282828] rounded-[4px] transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>View Activity</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                          disabled={actionLoading === u._id}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] rounded-[4px] transition-colors cursor-pointer ${
                            u.isActive !== false
                              ? 'text-[#EF4444] hover:bg-[#EF4444]/10'
                              : 'text-[#22C55E] hover:bg-[#22C55E]/10'
                          }`}
                        >
                          {u.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck2 className="w-3.5 h-3.5" />}
                          <span>{u.isActive !== false ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <div className="my-1 border-t border-[#353535]" />
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            handleDeleteUser(u._id, u.name);
                          }}
                          disabled={actionLoading === u._id}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[#EF4444] hover:bg-[#EF4444]/10 rounded-[4px] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete User</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
