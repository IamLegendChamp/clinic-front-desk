import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <h1>Front Desk</h1>
      <p>Welcome, {user?.email}</p>
      <Button type="button" variant="outlined" onClick={logout}>
        Logout
      </Button>
      <p className="page-links">
        <Link to="/queue">Queue</Link>
        <Link to="/appointments">Appointments</Link>
        <span style={{ color: "#888", marginLeft: "0.25rem" }}>(placeholders)</span>
      </p>
    </div>
  );
};
