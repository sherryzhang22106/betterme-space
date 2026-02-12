const API_BASE = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('betterme-auth')
    ? JSON.parse(localStorage.getItem('betterme-auth')!).state?.token
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || '请求失败' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: '网络错误，请稍后重试' };
  }
}

// 认证相关 API
export const authApi = {
  register: (account: string, password: string) =>
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    }),

  login: (account: string, password: string) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    }),

  me: () => request<{ user: any }>('/auth/me'),

  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 测评相关 API
export const assessmentApi = {
  list: () => request<{ assessments: any[] }>('/assessments'),

  get: (id: string) => request<{ assessment: any }>(`/assessments/${id}`),

  submit: (id: string, answers: Record<string, any>, duration: number) =>
    request<{ record: any; result: any }>(`/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, duration }),
    }),
};

// 记录相关 API
export const recordApi = {
  list: () => request<{ records: any[] }>('/records'),

  get: (id: string) => request<{ record: any }>(`/records/${id}`),

  generatePoster: (id: string) =>
    request<{ posterUrl: string }>(`/records/${id}/poster`, {
      method: 'POST',
    }),
};
