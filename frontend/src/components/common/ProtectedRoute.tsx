import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


export const ProtectedRoute = () => {
    const { user, loading, loadError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !loadError && !user) {
            navigate('/login', { replace: true });
        }
    }, [loading, loadError, user, navigate]);

    if (loadError) {
        return (
            <div className="loading" style={{ padding: 16, textAlign: 'center' }}>
                <p><strong>Failed to load app</strong></p>
                <p>{loadError.message}</p>
                <p>Ensure the shared server is running: <code>yarn workspace shared dev</code></p>
            </div>
        );
    }
    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return <div className="loading">Redirecting to login...</div>;

    return <Outlet />;
};
