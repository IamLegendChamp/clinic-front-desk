import axios from 'axios';
import { refreshTokens } from './auth';
import { getApiBaseURL } from './config';

export const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshing = false;
let queue: Array<() => void> = [];

const onRefreshFail = () => {
  queue = [];
  window.location.href = '/login';
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401) {
      return Promise.reject(err);
    }
    if (original?.url?.includes('/api/auth/refresh') || original?.url?.includes('/api/auth/logout')) {
      onRefreshFail();
      return Promise.reject(err);
    }
    if (!original?._retry) {
      original._retry = true;
      if (refreshing) {
        return new Promise((resolve, _reject) => {
          queue.push(() => resolve(api(original)));
        });
      }
      refreshing = true;
      try {
        await refreshTokens();
        queue.forEach((cb) => cb());
        queue = [];
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
