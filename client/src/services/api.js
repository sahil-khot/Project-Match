/**
 * Centralized API Client for Project Match
 * Handles HTTP-only cookie credentials, standard headers, response parsing, and errors.
 */

const API_BASE = import.meta.env.VITE_API_URL || ''; // Relies on relative API routing or configured VITE_API_URL

export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    ...customConfig
  } = options;

  const isFormData = body instanceof FormData;

  const token = typeof window !== 'undefined' ? localStorage.getItem('pm_token') : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    method,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders,
      ...headers
    },
    credentials: 'include', // Always send and receive HTTP-only cookies
    ...customConfig
  };

  if (body !== null && body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    let data = {};
    try {
      const rawText = await response.text();
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText ? (rawText.length > 200 ? rawText.slice(0, 200) + '...' : rawText) : `Request failed with status ${response.status}` };
      }
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        status: response.status,
        message: errorMessage,
        code: data.code || 'REQUEST_FAILED'
      };
    }

    return {
      success: true,
      ...data
    };
  } catch (err) {
    console.error(`[API Network Error] ${method} ${endpoint}:`, err);
    return {
      success: false,
      message: 'Network connection failed. Please check your connection and try again.',
      code: 'NETWORK_ERROR'
    };
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};

export default api;
