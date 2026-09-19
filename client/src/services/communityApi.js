import api from './api';

export const communityApi = {
  getPosts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All Posts' && params.category !== 'All') {
      query.append('category', params.category);
    }
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return api.get(`/api/community/posts${qs ? `?${qs}` : ''}`);
  },

  getStats: () => api.get('/api/community/stats'),

  createPost: (postData) => api.post('/api/community/posts', postData),

  editPost: (id, postData) => api.put(`/api/community/posts/${id}`, postData),

  deletePost: (id) => api.delete(`/api/community/posts/${id}`),

  toggleLike: (id) => api.post(`/api/community/posts/${id}/like`),

  addComment: (id, text) => api.post(`/api/community/posts/${id}/comment`, { text }),

  deleteComment: (postId, commentId) => api.delete(`/api/community/posts/${postId}/comments/${commentId}`)
};

export default communityApi;
