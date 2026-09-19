import api from './api';

export const applicationApi = {
  getMyApplications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return api.get(`/api/applications/my${qs ? `?${qs}` : ''}`);
  },

  getApplications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return api.get(`/api/applications${qs ? `?${qs}` : ''}`);
  },

  createApplication: (applicationData) => api.post('/api/applications', applicationData),

  updateStatus: (id, status, feedback = '') => api.put(`/api/applications/${id}/status`, { status, feedback }),

  deleteApplication: (id) => api.delete(`/api/applications/${id}`)
};

export default applicationApi;
