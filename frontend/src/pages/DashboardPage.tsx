import { useAuth } from "../context/AuthContext"


export function DashboardPage () {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: 24 }}>
            <h1>Front Desk</h1>
            <p>Welcome, {user?.email}</p>
            <button onClick={logout}>Logout</button>
            <p>
                <a href="/queue">Queue</a> . <a href="/appointments">Appointments</a> (placeholders)
            </p>
        </div>
    );
}
