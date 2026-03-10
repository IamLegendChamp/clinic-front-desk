import { api } from './axios';

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: { id: string; email: string; role: string };
}

export interface LoginMfaRequiredResponse {
    requiresMfa: true;
    tempToken: string;
    user: { id: string; email: string; role: string };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse | LoginMfaRequiredResponse> => {
    const { data } = await api.post<LoginResponse | LoginMfaRequiredResponse>('/api/auth/login', {
      email,
      password,
    });
    return data;
};

export interface RefreshResponse {
    token: string;
    refreshToken: string;
    user: { id: string; email: string; role: string };
}

export const refreshTokens = async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await api.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
    return data;
};

export const getMe = async () => {
    const { data } = await api.get<{ user: { id: string; email: string; role: string } }>('/api/auth/me');
    return data;
};

export interface MfaSetupResponse {
    secret: string;
    qrDataUrl: string;
}

export const mfaSetup = async (): Promise<MfaSetupResponse> => {
    const { data } = await api.get<MfaSetupResponse>('/api/auth/mfa/setup');
    return data;
};

export const mfaEnable = async (code: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/api/auth/mfa/enable', { code });
    return data;
};

export interface MfaVerifyResponse {
    token: string;
    refreshToken: string;
    user: { id: string; email: string; role: string };
}

export const mfaVerify = async (tempToken: string, code: string): Promise<MfaVerifyResponse> => {
    const { data } = await api.post<MfaVerifyResponse>('/api/auth/mfa/verify', { tempToken, code });
    return data;
};

export const mfaDisable = async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/api/auth/mfa/disable');
    return data;
};
