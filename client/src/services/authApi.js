import api from "./api";

export const authApi = {
  uploadAvatar: (formData) => api.post("/api/auth/avatar", formData),
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (studentData) => api.post("/api/auth/register", studentData),
  getMe: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  createStaff: (staffData) => api.post("/api/auth/create-staff", staffData),
};

export default authApi;
