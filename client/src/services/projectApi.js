import api from './api';

export const projectApi = {
  getProjects: (params = {}) => {
    const query = new URLSearchParams();
    if (params.domain && params.domain !== 'All') query.append('domain', params.domain);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return api.get(`/api/projects${qs ? `?${qs}` : ''}`);
  },

  getMyProjects: () => api.get('/api/projects/my'),

  getProjectById: (id) => api.get(`/api/projects/${id}`),

  createProject: (projectData) => api.post('/api/projects', projectData),

  updateProject: (id, updates) => api.put(`/api/projects/${id}`, updates),

  updateProjectStatus: (id, status) => api.put(`/api/projects/${id}/status`, { status }),

  addMember: (id, userId, role = 'Member') => api.post(`/api/projects/${id}/members`, { userId, role }),

  removeMember: (id, memberId) => api.delete(`/api/projects/${id}/members/${memberId}`),

  assignMentor: (id, mentorId) => api.post(`/api/projects/${id}/assign-mentor`, { mentorId }),

  applyToProject: (id, coverNote) => api.post(`/api/projects/${id}/apply`, { coverNote }),

  deleteProject: (id) => api.delete(`/api/projects/${id}`)
};

export default projectApi;
