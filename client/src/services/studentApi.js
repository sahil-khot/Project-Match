import api from './api';

export const studentApi = {
  getTeammates: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== 'All') {
        query.append(key, params[key]);
      }
    });
    const qs = query.toString();
    return api.get(`/api/students/teammates${qs ? `?${qs}` : ''}`);
  },

  getProfile: (userId) => {
    if (userId) return api.get(`/api/students/profile/${userId}`);
    return api.get('/api/students/profile');
  },

  getDashboard: () => api.get('/api/students/dashboard'),

  updateProfile: (profileData) => api.put('/api/students/profile', profileData),

  uploadDocuments: (formData) => api.post('/api/students/upload-documents', formData)
};

export default studentApi;
