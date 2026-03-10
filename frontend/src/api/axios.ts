import axios from 'axios';
import { refreshTokens } from './auth';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshing = false;
let queue: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
    queue.forEach((cb) => cb(token));
    queue = [];
};
const onRefreshFail = () => {
    queue = [];
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        if (err.response?.status !== 401) {
            return Promise.reject(err);
        }
        if (original.url?.includes('/api/auth/refresh')) {
            onRefreshFail();
            return Promise.reject(err);
        }
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            onRefreshFail();
            return Promise.reject(err);
        }
        if (!original._retry) {
            original._retry = true;
            if (refreshing) {
                return new Promise((resolve, reject) => {
                    queue.push((token: string) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(api(original));
                    });
                });
            }
            refreshing = true;
            try {
                const data = await refreshTokens(refreshToken);
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                onRefreshed(data.token);
                original.headers.Authorization = `Bearer ${data.token}`;
                return api(original);
            } catch {
                onRefreshFail();
                return Promise.reject(err);
            } finally {
                refreshing = false;
            }
        }
        return Promise.reject(err);
    }
);
