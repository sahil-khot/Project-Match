import api from './api';

export const messageApi = {
  getConversations: (params = {}) => {
    const qs = params.type ? `?type=${params.type}` : '';
    return api.get(`/api/messages/conversations${qs}`);
  },

  getThreadMessages: (conversationId) => api.get(`/api/messages/thread/${conversationId}`),

  getMessagesWithUser: (userId) => api.get(`/api/messages/${userId}`),

  sendMessage: (data) => api.post('/api/messages', data),
  
  deleteConversation: (conversationId) => api.delete(`/api/messages/conversation/${conversationId}`)
};

export default messageApi;
