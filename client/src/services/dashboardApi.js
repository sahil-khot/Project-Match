import api from './api';

export const dashboardApi = {
  getMentorDashboard: () => api.get('/api/mentor/dashboard'),
  getMentorStudentsTeams: () => api.get('/api/mentor/students-teams'),
  getPrincipalDashboard: () => api.get('/api/principal/dashboard'),
  getPrincipalStudents: (params) => api.get('/api/principal/students', { params }),
  getPrincipalFaculty: (params) => api.get('/api/principal/faculty', { params }),
  getPrincipalProjects: (params) => api.get('/api/principal/projects', { params }),
  getPrincipalApplications: () => api.get('/api/principal/applications'),
  getAdminDashboard: () => api.get('/api/admin/dashboard'),
  getAdminProjects: () => api.get('/api/admin/projects'),
  getAdminApplications: () => api.get('/api/admin/applications'),
  getAdminReports: () => api.get('/api/admin/reports'),
  getAdminLogs: () => api.get('/api/admin/logs'),
  toggleUserStatus: (userId) => api.put(`/api/admin/user/${userId}/toggle-status`),
  changeUserRole: (userId, role) => api.put(`/api/admin/user/${userId}/role`, { role }),
  createAdminUser: (userData) => api.post('/api/admin/users', userData),
  deleteAdminUser: (userId) => api.delete(`/api/admin/user/${userId}`),
  getAdminUserDetails: (userId) => api.get(`/api/admin/user/${userId}`),
  updateAdminProjectStatus: (projectId, status) => api.put(`/api/admin/projects/${projectId}/status`, { status }),
  deleteAdminProject: (projectId) => api.delete(`/api/admin/projects/${projectId}`),
  updateAdminApplicationStatus: (appId, status) => api.put(`/api/admin/applications/${appId}/status`, { status }),
  deleteAdminApplication: (appId) => api.delete(`/api/admin/applications/${appId}`),
  getAdminSettings: () => api.get('/api/admin/settings'),
  updateAdminSettings: (settings) => api.put('/api/admin/settings', settings)
};

export default dashboardApi;
