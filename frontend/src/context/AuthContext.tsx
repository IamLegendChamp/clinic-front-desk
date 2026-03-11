import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

type AuthModule = typeof import('shared/auth');

type User = { id: string; email: string; role: string } | null;

type LoginResult = { done: true };

type AuthContextType = {
    user: User;
    loading: boolean;
    loadError: Error | null;
    authApi: AuthModule | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const [authApi, setAuthApi] = useState<AuthModule | null>(null);

    useEffect(() => {
        function unwrapAuthModule(m: unknown): Promise<AuthModule> {
            return Promise.resolve(m).then((resolved) => {
                if (resolved && typeof (resolved as { login?: unknown }).login === 'function') {
                    return resolved as AuthModule;
                }
                if (typeof resolved === 'function') {
                    return unwrapAuthModule((resolved as () => unknown)());
                }
                if (resolved && typeof resolved === 'object' && 'default' in resolved) {
                    return unwrapAuthModule((resolved as { default: unknown }).default);
                }
                throw new Error('Auth module did not expose login');
            });
        }

        import('shared/auth')
            .then((m) => unwrapAuthModule(m).then(setAuthApi))
            .catch((err) => {
                setLoadError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            });
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        if (!authApi) {
            throw new Error('Auth not ready. Please wait and try again.');
        }
        if (typeof authApi.login !== 'function') {
            throw new Error('Auth module failed to load. Please refresh the page.');
        }
        const res = await authApi.login(email, password);
        setUser(res.user);
        return { done: true };
    }, [authApi]);

    const logout = useCallback(async () => {
        try {
            if (authApi) await authApi.logoutApi();
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    }, [authApi]);

    useEffect(() => {
        if (!authApi) return;
        const api = authApi as { getMe?: () => Promise<{ user: User }>; refreshTokens?: () => Promise<unknown> };
        if (typeof api.getMe !== 'function') {
            setLoading(false);
            return;
        }
        api.getMe()
            .then((res) => setUser(res.user))
            .catch(() => {
                if (typeof api.refreshTokens !== 'function') {
                    setUser(null);
                    return Promise.resolve();
                }
                return api
                    .refreshTokens()
                    .then(() => api.getMe?.().then((res) => setUser(res.user)))
                    .catch(() => setUser(null));
            })
            .finally(() => setLoading(false));
    }, [authApi]);

    return (
        <AuthContext.Provider value={{ user, loading, loadError, authApi, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
