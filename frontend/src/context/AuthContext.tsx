import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, getMe, mfaVerify, logoutApi, refreshTokens } from '../api/auth';

type User = { id: string; email: string; role: string } | null;

type LoginResult =
  | { done: true }
  | { done: false; mfaRequired: true; tempToken: string; user: User };

type AuthContextType = {
    user: User;
    loading: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    loginMfa: (tempToken: string, code: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        const res = await loginApi(email, password);
        if ('requiresMfa' in res && res.requiresMfa) {
            return {
                done: false,
                mfaRequired: true,
                tempToken: res.tempToken,
                user: res.user,
            };
        }
        setUser(res.user);
        return { done: true };
    }, []);

    const loginMfa = useCallback(async (tempToken: string, code: string) => {
        const res = await mfaVerify(tempToken, code);
        setUser(res.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        getMe()
            .then((res) => setUser(res.user))
            .catch(() =>
                refreshTokens()
                    .then(() => getMe().then((res) => setUser(res.user)))
                    .catch(() => setUser(null))
            )
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, loginMfa, logout }}>
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
