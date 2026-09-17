import { api } from '@/lib/api';
import { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, User, AuthTokens } from '@/types';

export const authApi = {
  login: async (data: LoginInput): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<{ user: User; tokens: AuthTokens }>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<void> => {
    await api.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordInput): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  resendVerification: async (): Promise<void> => {
    await api.post('/auth/resend-verification');
  },
};