import { apiRequest, refreshAuth, setCsrfToken } from './client';
import { AnalysisRequestItem, AnalysisRequestStatus, CommunityItem, JournalPaper, ManagedUser, PaginatedResponse, PatentItem, Person, UserRoleName } from '../types';

export type LoginResponse =
  | { ok: true; csrfToken: string; requiresTotpSetup: boolean }
  | { ok: true; requiresOtp: true; challengeId: string };

export const login = async (username: string, password: string) => {
  const result = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if ('csrfToken' in result) setCsrfToken(result.csrfToken);
  return result;
};

export const verifyOtp = async (challengeId: string, token: string) => {
  const result = await apiRequest<{ ok: true; csrfToken: string }>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ challengeId, token }),
  });
  setCsrfToken(result.csrfToken);
  return refreshAuth();
};

export const logout = async () => {
  await apiRequest('/api/auth/logout', { method: 'POST' });
  setCsrfToken(null);
};

export const startOtpSetup = () =>
  apiRequest<{ otpauth: string; qrCode: string }>('/api/auth/setup-otp', { method: 'POST' });

export const confirmOtpSetup = (token: string) =>
  apiRequest<{ ok: true; recoveryCodes: string[] }>('/api/auth/confirm-otp', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

export const disableOtp = (password: string) =>
  apiRequest<{ ok: true }>('/api/auth/disable-otp', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

export const adminPeople = {
  list: () => apiRequest<Person[]>('/api/admin/people'),
  create: (data: Partial<Person>) =>
    apiRequest<Person>('/api/admin/people', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Person>) =>
    apiRequest<Person>(`/api/admin/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest(`/api/admin/people/${id}`, { method: 'DELETE' }),
};

export const adminCommunity = {
  list: () => apiRequest<CommunityItem[]>('/api/admin/community'),
  create: (data: Partial<CommunityItem>) =>
    apiRequest<CommunityItem>('/api/admin/community', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CommunityItem>) =>
    apiRequest<CommunityItem>(`/api/admin/community/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest(`/api/admin/community/${id}`, { method: 'DELETE' }),
};

export const adminJournals = {
  list: (page = 1, pageSize = 50, q = '') =>
    apiRequest<PaginatedResponse<JournalPaper>>(
      `/api/admin/publications/journals?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(q)}`
    ),
  create: (data: Partial<JournalPaper>) =>
    apiRequest<JournalPaper>('/api/admin/publications/journals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<JournalPaper>) =>
    apiRequest<JournalPaper>(`/api/admin/publications/journals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest(`/api/admin/publications/journals/${id}`, { method: 'DELETE' }),
};

export const adminPatents = {
  list: (page = 1, pageSize = 50, q = '') =>
    apiRequest<PaginatedResponse<PatentItem>>(
      `/api/admin/publications/patents?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(q)}`
    ),
  create: (data: Partial<PatentItem>) =>
    apiRequest<PatentItem>('/api/admin/publications/patents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PatentItem>) =>
    apiRequest<PatentItem>(`/api/admin/publications/patents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest(`/api/admin/publications/patents/${id}`, { method: 'DELETE' }),
};

export const uploadMedia = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest<{ url: string }>('/api/admin/media', { method: 'POST', body: formData });
};

export const adminUsers = {
  list: (q = '') => apiRequest<ManagedUser[]>(`/api/admin/users?q=${encodeURIComponent(q)}`),
  setRole: (id: string, role: UserRoleName) =>
    apiRequest<ManagedUser>(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};

export const assignableStaff = () =>
  apiRequest<Array<{ id: string; name: string | null; email: string | null; username: string | null; role: UserRoleName }>>(
    '/api/admin/users/assignable'
  );

export interface AnalysisRequestFilter {
  status?: AnalysisRequestStatus;
  assigneeId?: string;
  q?: string;
}

export const adminAnalysisRequests = {
  list: (filter: AnalysisRequestFilter = {}) => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.assigneeId) params.set('assigneeId', filter.assigneeId);
    if (filter.q) params.set('q', filter.q);
    const qs = params.toString();
    return apiRequest<AnalysisRequestItem[]>(`/api/admin/analysis-requests${qs ? `?${qs}` : ''}`);
  },
  update: (
    id: string,
    data: Partial<{ status: AnalysisRequestStatus; assigneeId: string | null; dueDate: string | null; adminNote: string | null }>
  ) => apiRequest<AnalysisRequestItem>(`/api/admin/analysis-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  calendar: (from: string, to: string) =>
    apiRequest<AnalysisRequestItem[]>(`/api/admin/analysis-requests/calendar?from=${from}&to=${to}`),
};
