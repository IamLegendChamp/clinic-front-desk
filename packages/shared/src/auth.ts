import { api } from './axios';

export interface LoginResponse {
  user: { id: string; email: string; role: string };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/api/auth/login', {
    email,
    password,
  });
  return data;
};

export interface RefreshResponse {
  user: { id: string; email: string; role: string };
}

export const refreshTokens = async (): Promise<RefreshResponse> => {
  const { data } = await api.post<RefreshResponse>('/api/auth/refresh');
  return data;
};

export const logoutApi = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const getMe = async () => {
  const { data } = await api.get<{ user: { id: string; email: string; role: string } }>('/api/auth/me');
  return data;
};
