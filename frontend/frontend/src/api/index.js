const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
    me: async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },

  vehicles: {
    getAll: async (query = {}) => {
      const params = new URLSearchParams(query);
      const response = await fetch(`${API_URL}/vehicles?${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/vehicles/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  drivers: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/drivers`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/drivers/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    updateStatus: async (id, duty_status) => {
      const response = await fetch(`${API_URL}/drivers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ duty_status }),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/drivers/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  trips: {
    getAll: async (query = {}) => {
      const params = new URLSearchParams(query);
      const response = await fetch(`${API_URL}/trips?${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/trips/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    updateStatus: async (id, status) => {
      const response = await fetch(`${API_URL}/trips/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/trips/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  maintenance: {
    getAll: async (query = {}) => {
      const params = new URLSearchParams(query);
      const response = await fetch(`${API_URL}/maintenance?${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  expenses: {
    getAll: async (query = {}) => {
      const params = new URLSearchParams(query);
      const response = await fetch(`${API_URL}/expenses?${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getSummary: async (vehicleId) => {
      const response = await fetch(`${API_URL}/expenses/summary/${vehicleId}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  dashboard: {
    getStats: async () => {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getTrips: async () => {
      const response = await fetch(`${API_URL}/dashboard/trips`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getFuelEfficiency: async () => {
      const response = await fetch(`${API_URL}/dashboard/fuel-efficiency`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getVehicleROI: async (id) => {
      const response = await fetch(`${API_URL}/dashboard/vehicle-roi/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getMonthlySummary: async () => {
      const response = await fetch(`${API_URL}/dashboard/monthly-summary`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
    getAnalytics: async () => {
      const response = await fetch(`${API_URL}/dashboard/analytics`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },
};
