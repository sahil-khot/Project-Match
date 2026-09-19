import api from './api';

const recommendApi = {
  // AI-powered teammate recommendations
  recommendTeammates: async (projectRequirements) => {
    try {
      const res = await api.post('/ai/recommend-teammates', projectRequirements);
      return res.data;
    } catch (error) {
      return { success: false, recommendations: [], message: error.response?.data?.message || 'Recommendation service unavailable.' };
    }
  },

  // AI project recommendations based on student profile
  recommendProjects: async () => {
    try {
      const res = await api.post('/ai/recommend-projects', {});
      return res.data;
    } catch (error) {
      return { success: false, recommendations: [] };
    }
  },

  // AI mentor recommendations based on project domain and student skills
  recommendMentors: async ({ projectDomain = '', projectSkills = [], projectTitle = '' } = {}) => {
    try {
      const res = await api.post('/ai/recommend-mentors', { projectDomain, projectSkills, projectTitle });
      return res.data;
    } catch (error) {
      return { success: false, recommendations: [] };
    }
  },

  // Skill gap analysis between student profile and project requirements
  getSkillGap: async ({ projectId = null, requiredSkills = [] } = {}) => {
    try {
      const res = await api.post('/ai/skill-gap', { projectId, requiredSkills });
      return res.data;
    } catch (error) {
      return { success: false, matched: [], missing: [], matchPercent: 0 };
    }
  }
};

export default recommendApi;
