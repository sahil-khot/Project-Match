import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, FolderGit2, Building2, BarChart3,
  FileText, TrendingUp, Bell, Search, Filter, CheckCircle2,
  Clock, AlertCircle, Award, ChevronRight, Download, RefreshCw
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';
import notificationApi from '../services/notificationApi';

const DEPARTMENTS = [
  'All',
  'Computer Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electronics & Telecommunication Engineering',
  'Electrical Engineering'
];

export default function PrincipalInstitutionalViews({ viewType = 'students' }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, [viewType, selectedDept, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (viewType === 'students') {
        const res = await dashboardApi.getPrincipalStudents({
          department: selectedDept,
          search: searchQuery
        });
        if (res.success) setData(res.students || []);
      } else if (viewType === 'faculty') {
        const res = await dashboardApi.getPrincipalFaculty({
          department: selectedDept
        });
        if (res.success) setData(res.faculty || []);
      } else if (viewType === 'projects') {
        const res = await dashboardApi.getPrincipalProjects({
          department: selectedDept,
          status: statusFilter
        });
        if (res.success) setData(res.projects || []);
      } else if (viewType === 'applications') {
        const res = await dashboardApi.getPrincipalApplications();
        if (res.success) setData(res.applications || []);
      } else if (viewType === 'departments' || viewType === 'department-analytics' || viewType === 'reports') {
        const res = await dashboardApi.getPrincipalDashboard();
        if (res.success) {
          setData(res.departmentOverview || []);
          setStats(res.stats || null);
        }
      } else if (viewType === 'notifications') {
        const res = await notificationApi.getNotifications();
        if (res.success) setData(res.notifications || []);
      }
    } catch (e) {
      console.error(`Error loading ${viewType}:`, e);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}` : p[0].slice(0, 2).toUpperCase();
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (viewType === 'students' || viewType === 'faculty') {
      return item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q);
    }
    if (viewType === 'projects') {
      return item.title?.toLowerCase().includes(q) || item.department?.toLowerCase().includes(q);
    }
    if (viewType === 'applications') {
      return item.applicant?.name?.toLowerCase().includes(q) || item.project?.title?.toLowerCase().includes(q);
    }
    return true;
  });

  // Render Title and Subtitle based on viewType
  const getHeaderInfo = () => {
    switch (viewType) {
      case 'students':
        return {
          title: 'Institutional Students Directory',
          subtitle: 'Institutional oversight of all 280 enrolled students across 7 academic engineering departments.',
          icon: Users
        };
      case 'faculty':
        return {
          title: 'Faculty & Mentors Directory',
          subtitle: 'Roster of 50 accredited faculty mentors and project guides across all disciplines.',
          icon: GraduationCap
        };
      case 'projects':
        return {
          title: 'Institutional Projects Directory',
          subtitle: 'Comprehensive catalog of all 70 capstone and multidisciplinary projects.',
          icon: FolderGit2
        };
      case 'departments':
      case 'department-analytics':
        return {
          title: 'Departmental Analytics & Performance',
          subtitle: 'Comparative metrics across student enrollments, faculty ratios, capstones, and average CGPA.',
          icon: BarChart3
        };
      case 'applications':
        return {
          title: 'Institutional Applications & Requests',
          subtitle: 'Oversight of student project applications and mentorship requests institution-wide.',
          icon: FileText
        };
      case 'reports':
        return {
          title: 'Institutional Reports & Accreditation Insights',
          subtitle: 'Executive summaries, student outcome indicators, and departmental output benchmarks.',
          icon: TrendingUp
        };
      case 'notifications':
        return {
          title: 'Institutional Communications & Alerts',
          subtitle: 'Official institutional notifications and broadcast history.',
          icon: Bell
        };
      default:
        return {
          title: 'Institutional Overview',
          subtitle: 'Institutional records and administrative overview.',
          icon: Building2
        };
    }
  };

  const info = getHeaderInfo();
  const HeaderIcon = info.icon;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3A3A3A] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00]">
              <HeaderIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#F5F5F5] tracking-tight">{info.title}</h1>
              <p className="text-[13px] text-[#A0A0A0] mt-0.5">{info.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00] text-[#A0A0A0] hover:text-[#F5F5F5] text-[13px] font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF8A00]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar (For students, faculty, projects, applications) */}
      {['students', 'faculty', 'projects', 'applications'].includes(viewType) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#262626] border border-[#3A3A3A] p-3.5 rounded-[10px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${viewType}...`}
              className="w-full h-9 bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[13px] rounded-[6px] pl-9 pr-3 focus:outline-none focus:border-[#FF8A00]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {['students', 'faculty', 'projects'].includes(viewType) && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#A0A0A0] font-medium">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[12px] rounded-[6px] px-3 py-1.5 focus:outline-none focus:border-[#FF8A00]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {viewType === 'projects' && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#A0A0A0] font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] text-[12px] rounded-[6px] px-3 py-1.5 focus:outline-none focus:border-[#FF8A00]"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Progress">In Progress (55)</option>
                  <option value="Completed">Completed (8)</option>
                  <option value="On Hold">On Hold (7)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#FF8A00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-[#A0A0A0]">Loading institutional records...</p>
        </div>
      ) : (
        <>
          {/* STUDENTS VIEW */}
          {viewType === 'students' && (
            <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
              <div className="p-4 border-b border-[#3A3A3A] flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">
                  Enrolled Students ({filteredData.length})
                </span>
                <span className="text-[12px] text-[#A0A0A0]">40 students per department</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#1A1A1A] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#3A3A3A]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A3A3A]/60">
                    {filteredData.slice(0, 100).map((student) => (
                      <tr key={student._id} className="hover:bg-[#2D2D2D]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A855F7] font-bold text-[11px]">
                              {getInitials(student.name)}
                            </div>
                            <span className="font-medium text-[#F5F5F5]">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#A0A0A0] font-mono text-[12px]">{student.email}</td>
                        <td className="py-3 px-4 text-[#D4D4D4]">{student.department}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                            Student
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Enrolled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FACULTY VIEW */}
          {viewType === 'faculty' && (
            <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
              <div className="p-4 border-b border-[#3A3A3A] flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">
                  Faculty & Mentors ({filteredData.length})
                </span>
                <span className="text-[12px] text-[#A0A0A0]">50 mentors across 7 departments</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#1A1A1A] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#3A3A3A]">
                    <tr>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A3A3A]/60">
                    {filteredData.map((faculty) => (
                      <tr key={faculty._id} className="hover:bg-[#2D2D2D]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] font-bold text-[11px]">
                              {getInitials(faculty.name)}
                            </div>
                            <span className="font-medium text-[#F5F5F5]">{faculty.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#A0A0A0] font-mono text-[12px]">{faculty.email}</td>
                        <td className="py-3 px-4 text-[#D4D4D4]">{faculty.department}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                            Faculty Mentor
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROJECTS VIEW */}
          {viewType === 'projects' && (
            <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
              <div className="p-4 border-b border-[#3A3A3A] flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">
                  Capstone Projects ({filteredData.length})
                </span>
                <span className="text-[12px] text-[#A0A0A0]">70 projects (10 per department)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#1A1A1A] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#3A3A3A]">
                    <tr>
                      <th className="py-3 px-4">Project Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Mentor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A3A3A]/60">
                    {filteredData.map((project) => {
                      const isCompleted = project.status === 'Completed';
                      const isOnHold = project.status === 'On Hold';
                      return (
                        <tr key={project._id} className="hover:bg-[#2D2D2D]/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#F5F5F5]">{project.title}</td>
                          <td className="py-3 px-4 text-[#D4D4D4]">{project.department}</td>
                          <td className="py-3 px-4 text-[#A0A0A0]">{project.mentor?.name || 'Faculty Guide'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                isCompleted
                                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                                  : isOnHold
                                  ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                                  : 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
                              }`}
                            >
                              {project.status || 'In Progress'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#FF8A00] rounded-full"
                                  style={{ width: `${project.progress || (isCompleted ? 100 : 65)}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-[#A0A0A0] w-8">
                                {project.progress || (isCompleted ? 100 : 65)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DEPARTMENTS / DEPARTMENT ANALYTICS VIEW */}
          {(viewType === 'departments' || viewType === 'department-analytics') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#262626] border border-[#3A3A3A] p-4 rounded-[10px]">
                  <span className="text-[12px] text-[#A0A0A0]">Total Departments</span>
                  <p className="text-[26px] font-bold text-[#FF8A00] mt-1">7</p>
                  <span className="text-[11px] text-[#777777]">Accredited engineering branches</span>
                </div>
                <div className="bg-[#262626] border border-[#3A3A3A] p-4 rounded-[10px]">
                  <span className="text-[12px] text-[#A0A0A0]">Total Enrolled</span>
                  <p className="text-[26px] font-bold text-[#8B5CF6] mt-1">280</p>
                  <span className="text-[11px] text-[#777777]">40 students per department</span>
                </div>
                <div className="bg-[#262626] border border-[#3A3A3A] p-4 rounded-[10px]">
                  <span className="text-[12px] text-[#A0A0A0]">Total Projects</span>
                  <p className="text-[26px] font-bold text-[#22C55E] mt-1">70</p>
                  <span className="text-[11px] text-[#777777]">10 projects per department</span>
                </div>
                <div className="bg-[#262626] border border-[#3A3A3A] p-4 rounded-[10px]">
                  <span className="text-[12px] text-[#A0A0A0]">College Average CGPA</span>
                  <p className="text-[26px] font-bold text-[#3B82F6] mt-1">{stats?.averageCollegeCgpa ?? '8.12'}</p>
                  <span className="text-[11px] text-[#777777]">Across 280 students</span>
                </div>
              </div>

              <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
                <div className="p-4 border-b border-[#3A3A3A]">
                  <h3 className="text-[15px] font-semibold text-[#F5F5F5]">Departmental Benchmark Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#1A1A1A] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#3A3A3A]">
                      <tr>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4 text-right">Students</th>
                        <th className="py-3 px-4 text-right">Faculty</th>
                        <th className="py-3 px-4 text-right">Projects</th>
                        <th className="py-3 px-4 text-right">Active Teams</th>
                        <th className="py-3 px-4 text-right">Avg CGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3A3A3A]/60">
                      {data.map((row) => (
                        <tr key={row.department} className="hover:bg-[#2D2D2D]/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#F5F5F5]">{row.department}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#D4D4D4]">{row.students || 40}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#D4D4D4]">{row.faculty || 7}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#FF8A00] font-semibold">{row.projects || 10}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#22C55E]">{row.activeTeams || 10}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#3B82F6] font-semibold">{row.avgCgpa?.toFixed(2) || '8.12'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* APPLICATIONS VIEW */}
          {viewType === 'applications' && (
            <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
              <div className="p-4 border-b border-[#3A3A3A] flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">
                  Student Applications & Mentorship Requests ({data.length})
                </span>
                <span className="text-[12px] text-[#A0A0A0]">Total institutional applications: 127</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#1A1A1A] text-[11px] text-[#A0A0A0] uppercase tracking-wider border-b border-[#3A3A3A]">
                    <tr>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A3A3A]/60">
                    {data.slice(0, 100).map((app) => (
                      <tr key={app._id} className="hover:bg-[#2D2D2D]/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#F5F5F5]">{app.applicant?.name || 'Student Applicant'}</span>
                        </td>
                        <td className="py-3 px-4 text-[#D4D4D4]">{app.applicant?.department || 'Engineering'}</td>
                        <td className="py-3 px-4 text-[#FF8A00]">{app.project?.title || 'Capstone Project'}</td>
                        <td className="py-3 px-4 text-[#A0A0A0] text-[12px]">{app.type || 'Project Role'}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
                            {app.status || 'In Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS VIEW */}
          {viewType === 'reports' && (
            <div className="space-y-6">
              <div className="bg-[#262626] border border-[#3A3A3A] p-6 rounded-[10px] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#F5F5F5]">Annual Institutional Capstone Report</h3>
                    <p className="text-[13px] text-[#A0A0A0]">Approved by Academic Council & Board of Studies</p>
                  </div>
                  <button
                    onClick={() => alert('Institutional Report Downloaded (PDF format)')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF8A00] text-[#1A1A1A] rounded-[8px] font-bold text-[13px] hover:bg-[#FF9B26] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#3A3A3A]">
                  <div className="p-4 bg-[#1A1A1A] rounded-[8px]">
                    <span className="text-[12px] text-[#A0A0A0]">Student Participation Rate</span>
                    <p className="text-[24px] font-bold text-[#22C55E] mt-1">90%</p>
                    <p className="text-[11px] text-[#777777]">252 of 280 enrolled students participating</p>
                  </div>
                  <div className="p-4 bg-[#1A1A1A] rounded-[8px]">
                    <span className="text-[12px] text-[#A0A0A0]">Project Completion Rate</span>
                    <p className="text-[24px] font-bold text-[#3B82F6] mt-1">11.4%</p>
                    <p className="text-[11px] text-[#777777]">8 capstones completed, 55 in progress</p>
                  </div>
                  <div className="p-4 bg-[#1A1A1A] rounded-[8px]">
                    <span className="text-[12px] text-[#A0A0A0]">Institutional Academic Index</span>
                    <p className="text-[24px] font-bold text-[#8B5CF6] mt-1">8.12 CGPA</p>
                    <p className="text-[11px] text-[#777777]">Highest: Computer Engineering (8.21)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS VIEW */}
          {viewType === 'notifications' && (
            <div className="bg-[#262626] border border-[#3A3A3A] rounded-[10px] overflow-hidden">
              <div className="p-4 border-b border-[#3A3A3A] flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#F5F5F5]">Institutional Notifications</span>
              </div>
              <div className="p-4 space-y-3">
                {data.length > 0 ? (
                  data.map((item) => (
                    <div key={item._id} className="p-4 rounded-[8px] bg-[#1A1A1A] border border-[#3A3A3A] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#F5F5F5]">{item.title}</p>
                        <p className="text-[13px] text-[#A0A0A0] mt-1">{item.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[#777777] text-center py-8">No notifications at this time.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
