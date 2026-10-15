const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('tradecal_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // If token expired/invalid, clear it
    localStorage.removeItem('tradecal_token');
    localStorage.removeItem('tradecal_user');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem('tradecal_token', data.access_token);
      localStorage.setItem('tradecal_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, email, password) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.access_token) {
      localStorage.setItem('tradecal_token', data.access_token);
      localStorage.setItem('tradecal_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    return request('/auth/me');
  },

  logout() {
    localStorage.removeItem('tradecal_token');
    localStorage.removeItem('tradecal_user');
  },

  // Calendar
  async getCalendar(monthStr) {
    return request(`/calendar?month=${encodeURIComponent(monthStr)}`);
  },

  // Entries CRUD
  async createEntry(entryData) {
    return request('/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  async getEntries(monthStr, dateStr) {
    const params = new URLSearchParams();
    if (monthStr) params.append('month', monthStr);
    if (dateStr) params.append('entry_date', dateStr);
    return request(`/entries?${params.toString()}`);
  },

  async updateEntry(id, entryData) {
    return request(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  },

  async deleteEntry(id) {
    return request(`/entries/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  async getMonthlyAnalytics(monthStr) {
    return request(`/analytics/monthly?month=${encodeURIComponent(monthStr)}`);
  },

  async getYearlyAnalytics(year) {
    return request(`/analytics/yearly?year=${year}`);
  },

  // Holidays
  async getHolidays(year) {
    return request(`/holidays?year=${year}`);
  },
};

