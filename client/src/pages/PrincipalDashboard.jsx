import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FolderGit2,
  FileText,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  Plus,
  Check,
  User,
  Trophy,
  ArrowRight
} from 'lucide-react';
import dashboardApi from '../services/dashboardApi';

const COLLEGE_NAME = "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology, Baramati";

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 280,
    totalMentors: 50,
    totalProjects: 70,
    completedProjects: 8,
    inProgressProjects: 55,
    onHoldProjects: 7,
    totalApplications: 127,
    averageCollegeCgpa: 8.12
  });

  const [departmentOverview, setDepartmentOverview] = useState([
    { department: 'Computer Engineering', dotColor: '#F97316', students: 40, faculty: 8, projects: 10, activeTeams: 10, avgCgpa: 8.21 },
    { department: 'AIDS', dotColor: '#3B82F6', students: 40, faculty: 7, projects: 10, activeTeams: 10, avgCgpa: 8.08 },
    { department: 'Information Technology', dotColor: '#10B981', students: 40, faculty: 7, projects: 10, activeTeams: 10, avgCgpa: 8.12 },
    { department: 'Civil Engineering', dotColor: '#A855F7', students: 40, faculty: 7, projects: 10, activeTeams: 10, avgCgpa: 7.96 },
    { department: 'Mechanical Engineering', dotColor: '#EF4444', students: 40, faculty: 7, projects: 10, activeTeams: 10, avgCgpa: 8.05 },
    { department: 'ENTC', dotColor: '#F59E0B', students: 40, faculty: 7, projects: 10, activeTeams: 10, avgCgpa: 8.18 },
    { department: 'Electrical Engineering', dotColor: '#06B6D4', students: 40, faculty: 7, projects: 10, activeTeams: 10, avgCgpa: 7.99 }
  ]);

  const [studentParticipation, setStudentParticipation] = useState({
    totalStudents: 280,
    activeInProjects: 252,
    activePercentage: 90,
    notParticipating: 28,
    notParticipatingPercentage: 10
  });

  const [projectStatus, setProjectStatus] = useState({
    totalProjects: 70,
    inProgress: 55,
    inProgressPercentage: 79,
    completed: 8,
    completedPercentage: 11,
    onHold: 7,
    onHoldPercentage: 10
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 'act-1',
      type: 'project_created',
      title: 'New project created',
      subtitle: 'Smart Irrigation System',
      timeAgo: '2h ago',
      icon: Plus,
      iconBg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
    },
    {
      id: 'act-2',
      type: 'mentorship_request',
      title: 'Mentorship request',
      subtitle: 'from Rahul Sharma (Comp)',
      timeAgo: '3h ago',
      icon: Users,
      iconBg: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30'
    },
    {
      id: 'act-3',
      type: 'project_completed',
      title: 'Project completed',
      subtitle: 'MediTrack',
      timeAgo: '5h ago',
      icon: Check,
      iconBg: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
    },
    {
      id: 'act-4',
      type: 'student_registered',
      title: 'New student registered',
      subtitle: 'Aditi Patil (IT)',
      timeAgo: '6h ago',
      icon: User,
      iconBg: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30'
    },
    {
      id: 'act-5',
      type: 'application_submitted',
      title: 'Application submitted',
      subtitle: 'to SolarSense AI',
      timeAgo: '8h ago',
      icon: FileText,
      iconBg: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
    }
  ]);

  const [topDepartmentsByOutput, setTopDepartmentsByOutput] = useState([
    { name: 'Computer', color: '#F97316', count: 6, max: 8 },
    { name: 'AIDS', color: '#3B82F6', count: 6, max: 8 },
    { name: 'IT', color: '#10B981', count: 6, max: 8 },
    { name: 'Civil', color: '#A855F7', count: 5, max: 8 },
    { name: 'Mechanical', color: '#EF4444', count: 6, max: 8 },
    { name: 'ENTC', color: '#F59E0B', count: 6, max: 8 },
    { name: 'Electrical', color: '#06B6D4', count: 5, max: 8 }
  ]);

  const [topSkills, setTopSkills] = useState([
    { skill: 'JavaScript', percent: 78 },
    { skill: 'Python', percent: 72 },
    { skill: 'React', percent: 65 },
    { skill: 'Node.js', percent: 58 },
    { skill: 'Machine Learning', percent: 52 },
    { skill: 'SQL', percent: 50 },
    { skill: 'Java', percent: 48 }
  ]);

  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    {
      id: 'd-1',
      title: 'SolarSense AI – Final Report',
      date: 'Sep 25, 2026',
      badgeText: '3 days left',
      badgeColor: 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30',
      dotColor: '#F97316'
    },
    {
      id: 'd-2',
      title: 'MediTrack – Model Training',
      date: 'Sep 28, 2026',
      badgeText: '6 days left',
      badgeColor: 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30',
      dotColor: '#EAB308'
    },
    {
      id: 'd-3',
      title: 'AgriConnect – Final Presentation',
      date: 'Sep 30, 2026',
      badgeText: '8 days left',
      badgeColor: 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30',
      dotColor: '#F97316'
    },
    {
      id: 'd-4',
      title: 'Campus Navigator – Documentation',
      date: 'Oct 02, 2026',
      badgeText: '10 days left',
      badgeColor: 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30',
      dotColor: '#3B82F6'
    },
    {
      id: 'd-5',
      title: 'EcoLearn – Demo Submission',
      date: 'Oct 05, 2026',
      badgeText: '13 days left',
      badgeColor: 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30',
      dotColor: '#10B981'
    }
  ]);

  const [college, setCollege] = useState(COLLEGE_NAME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrincipalData();
  }, []);

  const fetchPrincipalData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getPrincipalDashboard();
      if (res.success) {
        if (res.college) setCollege(res.college);
        if (res.stats) setStats(res.stats);

        if (res.departmentOverview && res.departmentOverview.length > 0) {
          const colorMap = {
            'Computer Engineering': '#F97316',
            'Artificial Intelligence & Data Science': '#3B82F6',
            'Information Technology': '#10B981',
            'Civil Engineering': '#A855F7',
            'Mechanical Engineering': '#EF4444',
            'Electronics & Telecommunication Engineering': '#F59E0B',
            'Electrical Engineering': '#06B6D4'
          };

          const shortNames = {
            'Computer Engineering': 'Computer Engineering',
            'Artificial Intelligence & Data Science': 'AIDS',
            'Information Technology': 'Information Technology',
            'Civil Engineering': 'Civil Engineering',
            'Mechanical Engineering': 'Mechanical Engineering',
            'Electronics & Telecommunication Engineering': 'ENTC',
            'Electrical Engineering': 'Electrical Engineering'
          };

          const mappedDepts = res.departmentOverview.map((d) => ({
            department: shortNames[d.department] || d.department,
            dotColor: colorMap[d.department] || '#FF8A00',
            students: d.students || 40,
            faculty: d.faculty || 7,
            projects: d.projects || 10,
            activeTeams: d.activeTeams || 10,
            avgCgpa: d.avgCgpa || 8.12
          }));
          setDepartmentOverview(mappedDepts);

          // Update Top Departments Output bars dynamically
          const outputBars = mappedDepts.map((d) => {
            let label = d.department;
            if (label === 'Computer Engineering') label = 'Computer';
            if (label === 'Information Technology') label = 'IT';
            if (label === 'Civil Engineering') label = 'Civil';
            if (label === 'Mechanical Engineering') label = 'Mechanical';
            if (label === 'Electrical Engineering') label = 'Electrical';
            return {
              name: label,
              color: d.dotColor,
              count: ['Computer', 'AIDS', 'IT', 'Mechanical', 'ENTC'].includes(label) ? 6 : 5,
              max: 8
            };
          });
          setTopDepartmentsByOutput(outputBars);
        }

        if (res.studentParticipation) setStudentParticipation(res.studentParticipation);
        if (res.projectStatus) setProjectStatus(res.projectStatus);

        if (res.topSkills && res.topSkills.length > 0) {
          setTopSkills(res.topSkills);
        }

        if (res.upcomingDeadlines && res.upcomingDeadlines.length > 0) {
          const badgeColors = [
            'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30',
            'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30',
            'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30',
            'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30',
            'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30'
          ];
          const dotColors = ['#F97316', '#EAB308', '#F97316', '#3B82F6', '#10B981'];

          setUpcomingDeadlines(
            res.upcomingDeadlines.map((item, idx) => ({
              id: item._id || `dl-${idx}`,
              title: `${item.project} – ${item.title || 'Milestone'}`,
              date: item.deadline || 'Upcoming',
              badgeText: `${item.daysLeft || 5} days left`,
              badgeColor: badgeColors[idx % badgeColors.length],
              dotColor: dotColors[idx % dotColors.length]
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load Principal Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Donut chart stroke calculations (r = 38, circumference ≈ 238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  // Student Participation donut (90% active, 10% inactive)
  const activeFrac = (studentParticipation.activePercentage || 90) / 100;
  const activeDash = activeFrac * circumference;

  // Project Status donut (In Progress, Completed, On Hold)
  const totalProj = stats.totalProjects || 70;
  const inProgCount = stats.inProgressProjects || 55;
  const compCount = stats.completedProjects || 8;
  const onHoldCount = stats.onHoldProjects || 7;

  const inProgFrac = totalProj > 0 ? inProgCount / totalProj : 0.79;
  const compFrac = totalProj > 0 ? compCount / totalProj : 0.11;
  const onHoldFrac = totalProj > 0 ? onHoldCount / totalProj : 0.10;

  const inProgDash = inProgFrac * circumference;
  const compDash = compFrac * circumference;
  const onHoldDash = onHoldFrac * circumference;

  return (
    <div className="p-6 space-y-5 max-w-[1440px] mx-auto text-[#F5F5F5] font-sans antialiased">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[26px] lg:text-[28px] font-bold text-[#F5F5F5] tracking-tight">
              Institutional Overview
            </h1>
            <span className="text-[12px] px-3 py-1 rounded-full bg-[#381E66] text-[#C084FC] border border-[#8B5CF6]/30 font-semibold tracking-wide">
              Principal Console
            </span>
          </div>
          <p className="text-[13px] text-[#A0A0A0] leading-snug">
            {college}
          </p>
          <p className="text-[13px] text-[#777777] leading-snug">
            Real-time insights into students, faculty, projects and innovation across all departments.
          </p>
        </div>

        {/* Quote Card */}
        <div className="bg-[#212124] border border-[#3A3A3A] border-l-[3px] border-l-[#FF8A00] px-4 py-3 rounded-[8px] w-full lg:w-[320px] shrink-0">
          <p className="text-[13px] text-[#D4D4D4] italic font-medium leading-tight">
            "Empowering ideas, building tomorrow."
          </p>
          <span className="text-[11px] text-[#777777] mt-1 block">
            — Dr. Suresh Narayan
          </span>
        </div>
      </div>

      {/* 2. Top 6 KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Students */}
        <div className="bg-[#212124] border border-[#3A3A3A] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="w-8 h-8 rounded-[6px] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A855F7] mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] text-[#A0A0A0] font-medium block">Total Students</span>
            <span className="text-[26px] font-bold text-[#A855F7] tracking-tight block leading-tight mt-0.5">
              {stats.totalStudents}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">7 departments · 40 each</span>
          </div>
        </div>

        {/* Card 2: Faculty & Mentors */}
        <div className="bg-[#212124] border border-[#3A3A3A] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="w-8 h-8 rounded-[6px] bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-2.5">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] text-[#A0A0A0] font-medium block">Faculty & Mentors</span>
            <span className="text-[26px] font-bold text-[#22C55E] tracking-tight block leading-tight mt-0.5">
              {stats.totalMentors}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">Across all departments</span>
          </div>
        </div>

        {/* Card 3: Total Projects */}
        <div className="bg-[#212124] border border-[#3A3A3A] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="w-8 h-8 rounded-[6px] bg-[#FF8A00]/15 border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00] mb-2.5">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] text-[#A0A0A0] font-medium block">Total Projects</span>
            <span className="text-[26px] font-bold text-[#FF8A00] tracking-tight block leading-tight mt-0.5">
              {stats.totalProjects}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">Active projects</span>
          </div>
        </div>

        {/* Card 4: Total Applications */}
        <div className="bg-[#212124] border border-[#3A3A3A] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="w-8 h-8 rounded-[6px] bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-2.5">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] text-[#A0A0A0] font-medium block">Total Applications</span>
            <span className="text-[26px] font-bold text-[#EF4444] tracking-tight block leading-tight mt-0.5">
              {stats.totalApplications}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">Project applications</span>
          </div>
        </div>

        {/* Card 5: Completed Projects */}
        <div className="bg-[#212124] border border-[#3A3A3A] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="w-8 h-8 rounded-[6px] bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] text-[#A0A0A0] font-medium block">Completed Projects</span>
            <span className="text-[26px] font-bold text-[#10B981] tracking-tight block leading-tight mt-0.5">
              {stats.completedProjects}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">This semester</span>
          </div>
        </div>

        {/* Card 6: Institutional Avg CGPA */}
        <div className="bg-[#212124] border border-[#3A3A3A] p-4 rounded-[10px] flex flex-col justify-between hover:border-[#4A4A4A] transition-colors">
          <div className="w-8 h-8 rounded-[6px] bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12px] text-[#A0A0A0] font-medium block">Institutional Avg CGPA</span>
            <span className="text-[26px] font-bold text-[#3B82F6] tracking-tight block leading-tight mt-0.5">
              {stats.averageCollegeCgpa ? stats.averageCollegeCgpa.toFixed(2) : '8.12'}
            </span>
            <span className="text-[11px] text-[#777777] mt-1 block">Across all students</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Department Overview + Donut Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 cols): Department Overview Table */}
        <div className="lg:col-span-5 bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#3A3A3A]/60 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF8A00]" />
                <h2 className="text-[14px] font-bold text-[#F5F5F5] tracking-tight">
                  Department Overview (Students & Projects)
                </h2>
              </div>
              <button
                onClick={() => navigate('/principal/department-analytics')}
                className="text-[12px] text-[#FF8A00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View All Departments</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="text-[11px] text-[#777777] uppercase tracking-wider">
                  <tr className="border-b border-[#3A3A3A]/40">
                    <th className="py-2 pr-2 font-semibold">Department</th>
                    <th className="py-2 px-2 text-right font-semibold">Students</th>
                    <th className="py-2 px-2 text-right font-semibold">Faculty</th>
                    <th className="py-2 px-2 text-right font-semibold">Projects</th>
                    <th className="py-2 px-2 text-right font-semibold">Active Teams</th>
                    <th className="py-2 pl-2 text-right font-semibold">Avg CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E34]">
                  {departmentOverview.map((dept) => (
                    <tr key={dept.department} className="hover:bg-[#2A2A30]/50 transition-colors">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: dept.dotColor }}
                          />
                          <span className="font-medium text-[#D4D4D4] truncate max-w-[150px]">
                            {dept.department}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-[#A0A0A0]">{dept.students}</td>
                      <td className="py-2 px-2 text-right font-mono text-[#A0A0A0]">{dept.faculty}</td>
                      <td className="py-2 px-2 text-right font-mono text-[#D4D4D4] font-medium">{dept.projects}</td>
                      <td className="py-2 px-2 text-right font-mono text-[#A0A0A0]">{dept.activeTeams}</td>
                      <td className="py-2 pl-2 text-right font-mono text-[#D4D4D4] font-medium">
                        {dept.avgCgpa ? Number(dept.avgCgpa).toFixed(2) : '8.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Middle Column (3 cols): 2 Donut Cards */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          {/* Donut Card 1: Student Participation */}
          <div className="bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4">
            <h3 className="text-[13px] font-bold text-[#F5F5F5] mb-3">
              Student Participation
            </h3>
            <div className="flex items-center justify-between gap-3">
              {/* Donut Chart SVG */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  {/* Background Circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#2D2D35"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Active Green Arc */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#10B981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${activeDash} ${circumference}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[17px] font-bold text-[#F5F5F5] leading-none">
                    {studentParticipation.totalStudents}
                  </span>
                  <span className="text-[9px] text-[#777777] mt-0.5 leading-none">
                    Total Students
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-[11px] min-w-0 flex-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-[#D4D4D4] font-medium truncate">Active in Projects</span>
                  </div>
                  <span className="text-[#A0A0A0] pl-3.5 block">
                    {studentParticipation.activeInProjects} ({studentParticipation.activePercentage}%)
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4B5563] shrink-0" />
                    <span className="text-[#D4D4D4] font-medium truncate">Not Participating</span>
                  </div>
                  <span className="text-[#A0A0A0] pl-3.5 block">
                    {studentParticipation.notParticipating} ({studentParticipation.notParticipatingPercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Donut Card 2: Project Status */}
          <div className="bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4">
            <h3 className="text-[13px] font-bold text-[#F5F5F5] mb-3">
              Project Status
            </h3>
            <div className="flex items-center justify-between gap-3">
              {/* Donut Chart SVG with 3 Segments */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  {/* Background Circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#2D2D35"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* In Progress (Blue) */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#3B82F6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${inProgDash} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="butt"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Completed (Green) */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#10B981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${compDash} ${circumference}`}
                    strokeDashoffset={-inProgDash}
                    strokeLinecap="butt"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* On Hold (Orange) */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#F59E0B"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${onHoldDash} ${circumference}`}
                    strokeDashoffset={-(inProgDash + compDash)}
                    strokeLinecap="butt"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[17px] font-bold text-[#F5F5F5] leading-none">
                    {stats.totalProjects}
                  </span>
                  <span className="text-[9px] text-[#777777] mt-0.5 leading-none">
                    Total Projects
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[11px] min-w-0 flex-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
                    <span className="text-[#D4D4D4] font-medium truncate">In Progress</span>
                  </div>
                  <span className="text-[#A0A0A0] pl-3.5 block">
                    {inProgCount} ({projectStatus.inProgressPercentage}%)
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-[#D4D4D4] font-medium truncate">Completed</span>
                  </div>
                  <span className="text-[#A0A0A0] pl-3.5 block">
                    {compCount} ({projectStatus.completedPercentage}%)
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                    <span className="text-[#D4D4D4] font-medium truncate">On Hold</span>
                  </div>
                  <span className="text-[#A0A0A0] pl-3.5 block">
                    {onHoldCount} ({projectStatus.onHoldPercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Activity */}
        <div className="lg:col-span-4 bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#3A3A3A]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF8A00]" />
                <h2 className="text-[14px] font-bold text-[#F5F5F5] tracking-tight">
                  Recent Activity
                </h2>
              </div>
              <button
                onClick={() => navigate('/principal/notifications')}
                className="text-[12px] text-[#FF8A00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.map((act) => {
                const IconComponent = act.icon;
                return (
                  <div key={act.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${act.iconBg}`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[#F5F5F5] leading-snug">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-[#A0A0A0] truncate leading-snug">
                          {act.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#777777] shrink-0 font-mono">
                      {act.timeAgo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Top Depts by Project Output + Top Skills + Upcoming Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Top Departments by Project Output */}
        <div className="bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#3A3A3A]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FF8A00]" />
                <h3 className="text-[13px] font-bold text-[#F5F5F5]">
                  Top Departments by Project Output
                </h3>
              </div>
              <button
                onClick={() => navigate('/principal/department-analytics')}
                className="text-[11px] text-[#FF8A00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {topDepartmentsByOutput.map((dept) => {
                const widthPercent = Math.min(100, Math.max(10, (dept.count / (dept.max || 8)) * 100));
                return (
                  <div key={dept.name} className="flex items-center gap-2 text-[12px]">
                    <span className="w-20 text-[#A0A0A0] font-medium truncate">{dept.name}</span>
                    <div className="flex-1 h-2 bg-[#2D2D35] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${widthPercent}%`, backgroundColor: dept.color }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[#D4D4D4] w-4 text-right">
                      {dept.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Box 2: Top Skills Across Students */}
        <div className="bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#3A3A3A]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-[13px] font-bold text-[#F5F5F5]">
                  Top Skills Across Students
                </h3>
              </div>
              <button
                onClick={() => navigate('/principal/reports')}
                className="text-[11px] text-[#FF8A00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Report</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {topSkills.map((sk) => (
                <div key={sk.skill} className="flex items-center gap-2 text-[12px]">
                  <span className="w-28 text-[#A0A0A0] font-medium truncate">{sk.skill}</span>
                  <div className="flex-1 h-2 bg-[#2D2D35] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6] rounded-full transition-all duration-700"
                      style={{ width: `${sk.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#D4D4D4] w-7 text-right">
                    {sk.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Box 3: Upcoming Deadlines */}
        <div className="bg-[#212124] border border-[#3A3A3A] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#3A3A3A]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF8A00]" />
                <h3 className="text-[13px] font-bold text-[#F5F5F5]">
                  Upcoming Deadlines
                </h3>
              </div>
              <button
                onClick={() => navigate('/principal/projects')}
                className="text-[11px] text-[#FF8A00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((dl) => (
                <div key={dl.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dl.dotColor }}
                    />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#F5F5F5] truncate">
                        {dl.title}
                      </p>
                      <p className="text-[10px] text-[#777777] font-mono">
                        {dl.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold shrink-0 ${dl.badgeColor}`}
                  >
                    {dl.badgeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
