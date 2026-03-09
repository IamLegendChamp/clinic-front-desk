import { api } from './axios';

export interface LoginResponse {
    token: string;
    user: { id: string; email: string; role: string };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
    return data;
}

export async function getMe() {
    const { data } = await api.get<{ user: { id: string; email: string; role: string } }>('/api/auth/me');
    return data;
}
