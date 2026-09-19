import api from './api';

export const taskApi = {
  getTasksByProject: (projectId) => api.get(`/api/tasks/project/${projectId}`),

  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.status) query.append('status', params.status);
    if (params.assignedTo) query.append('assignedTo', params.assignedTo);
    const qs = query.toString();
    return api.get(`/api/tasks${qs ? `?${qs}` : ''}`);
  },

  createTask: (taskData) => api.post('/api/tasks', taskData),

  submitTask: (id, submissionData) => api.put(`/api/tasks/${id}/submit`, submissionData),

  reviewTask: (id, reviewData) => api.put(`/api/tasks/${id}/review`, reviewData),

  updateTaskStatus: (id, status) => api.put(`/api/tasks/${id}/status`, { status }),
  
  deleteTask: (id) => api.delete(`/api/tasks/${id}`)
};

export default taskApi;
