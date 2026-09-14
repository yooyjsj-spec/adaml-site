import { apiRequest } from './client';

export { login, verifyOtp, logout } from './admin';

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  affiliation?: string;
  phone?: string;
}

export const signup = (data: SignupInput) =>
  apiRequest<{ ok: true; id: string }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyEmail = (token: string) =>
  apiRequest<{ ok: true }>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

export const resendVerification = () =>
  apiRequest<{ ok: true }>('/api/auth/resend-verification', { method: 'POST' });
