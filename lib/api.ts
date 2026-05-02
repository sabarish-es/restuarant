const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiCall(
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> {
  const {
    requiresAuth = false,
    headers = {},
    ...otherOptions
  } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...otherOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  login: (username: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createUser: (data: any) =>
    apiCall('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),
};

// Category APIs
export const categoryApi = {
  getAll: () =>
    apiCall('/categories'),

  create: (data: any) =>
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  update: (id: number, data: any) =>
    apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  delete: (id: number) =>
    apiCall(`/categories/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// Menu Item APIs
export const menuApi = {
  getAll: (categoryId?: number) => {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return apiCall(`/menu-items${query}`, { requiresAuth: true });
  },

  create: (data: any) =>
    apiCall('/menu-items', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  update: (id: number, data: any) =>
    apiCall(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  delete: (id: number) =>
    apiCall(`/menu-items/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// Order APIs
export const orderApi = {
  create: (data: any) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiCall(`/orders${query}`, { requiresAuth: true });
  },

  getDetails: (id: number) =>
    apiCall(`/orders/${id}`, { requiresAuth: true }),

  updateStatus: (id: number, status: string) =>
    apiCall(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      requiresAuth: true,
    }),

  getKitchenOrders: () =>
    apiCall('/kitchen-orders', { requiresAuth: true }),
};

// Table APIs
export const tableApi = {
  getAll: () =>
    apiCall('/tables', { requiresAuth: true }),

  updateStatus: (id: number, status: string) =>
    apiCall(`/tables/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      requiresAuth: true,
    }),
};

// Customer APIs
export const customerApi = {
  getAll: () =>
    apiCall('/customers', { requiresAuth: true }),

  create: (data: any) =>
    apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),
};

// Employee APIs
export const employeeApi = {
  getAll: () =>
    apiCall('/employees', { requiresAuth: true }),

  create: (data: any) =>
    apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),

  delete: (id: number) =>
    apiCall(`/employees/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// Settings APIs
export const settingsApi = {
  get: () =>
    apiCall('/settings', { requiresAuth: true }),

  update: (data: any) =>
    apiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    }),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () =>
    apiCall('/dashboard-stats', { requiresAuth: true }),

  getReports: (startDate?: string, endDate?: string) => {
    let query = '';
    if (startDate && endDate) {
      query = `?startDate=${startDate}&endDate=${endDate}`;
    }
    return apiCall(`/reports${query}`, { requiresAuth: true });
  },
};
