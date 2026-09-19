import api from './api';

export const mentorApi = {
  getMentors: (params = {}) => {
    const query = new URLSearchParams();
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.subject && params.subject !== 'All') query.append('subject', params.subject);
    if (params.availability && params.availability !== 'All') query.append('availability', params.availability);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get(`/api/mentors${qs ? `?${qs}` : ''}`);
  },

  sendRequest: (data) => api.post('/api/mentors/request', data)
};

export default mentorApi;
