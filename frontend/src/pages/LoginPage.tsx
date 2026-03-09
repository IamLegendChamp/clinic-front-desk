import { useState } from "react"
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export function LoginPage () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit (e: React.SubmitEvent) {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed')
        }
    }

    return (
        <div style={{ maxWidth: '320', margin: '2rem auto', padding: 16 }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 8 }}>
                    <input 
                        type="email" 
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>
                <div style={{ margin: 8 }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>
                {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
                <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
            </form>
        </div>
    );
}
