import api from "./api";

export const leaderboardApi = {
  getLeaderboard: (category = "Students", department = "", filters = {}) => {
    const query = new URLSearchParams();
    if (category) query.append("category", category);
    if (department && department !== "All")
      query.append("department", department);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && !String(value).startsWith("All")) query.append(key, value);
    });
    const qs = query.toString();
    return api.get(`/api/leaderboards${qs ? `?${qs}` : ""}`);
  },
};

export default leaderboardApi;
