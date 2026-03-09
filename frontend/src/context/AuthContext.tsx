import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, getMe } from '../api/auth';
import type { LoginResponse } from '../api/auth';

type User = { id: string; email: string; role: string } | null;

type AuthContextType = {
    user: User;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (email: string, password: string) => {
        const res: LoginResponse = await loginApi(email, password);
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }, []);

    useEffect(() => {
        if (!token) {
            queueMicrotask(() => setLoading(false));
            return;
        }
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as User;
                queueMicrotask(() => setUser(parsed));
            } catch {
                queueMicrotask(() => setUser(null));
            }
        }
        getMe()
            .then((res) => setUser(res.user))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
