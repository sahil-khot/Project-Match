import api from './api';

export const aiApi = {
  chat: (message, history = []) => api.post('/api/ai/chat', { message, history })
};

export default aiApi;
