import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";

function getLoginErrorMessage(err: unknown): string {
  const ax = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  if (ax.response?.data?.message) return ax.response.data.message;
  if (ax.response?.status === 401) return "Invalid email or password.";
  if (ax.response?.status === 500 || ax.response?.status === 502) {
    return "Backend is not running or not reachable. Start it in a separate terminal: yarn workspace backend dev (runs on port 5001).";
  }
  if (ax.response?.status) return `Request failed (${ax.response.status}).`;
  if (ax.message === "Network Error") {
    return "Cannot reach server. Start the backend in a separate terminal: yarn workspace backend dev (port 5001).";
  }
  return err instanceof Error ? err.message : "Login failed.";
}

export const LoginPage = () => {
  const [error, setError] = useState("");
  const { login, loading, loadError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to dashboard only after user state is set (avoids redirect loop)
  useEffect(() => {
    if (user && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement | null;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
    const email = emailInput?.value?.trim() ?? "";
    const password = passwordInput?.value ?? "";
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = getLoginErrorMessage(err);
      setError(msg);
    }
  };

  if (loadError) {
    return (
      <Box className="page page--narrow" component="div">
        <Box component="h1" sx={{ mb: 2 }}>Login</Box>
        <Box sx={{ color: 'error.main', mb: 2 }}>
          <strong>Failed to load app:</strong> {loadError.message}
          <Box component="p" sx={{ mt: 1, fontSize: '0.875rem' }}>
            Ensure the shared server is running: <code>yarn workspace shared dev</code>
          </Box>
        </Box>
      </Box>
    );
  }
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Box
      className="page page--narrow login-page"
      component="div"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        px: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box
        component="div"
        className="login-card"
        sx={{
          width: '100%',
          maxWidth: 280,
          boxSizing: 'border-box',
          p: 2,
          borderRadius: 1.5,
          boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Box component="h1" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1.5, textAlign: 'center', color: 'text.primary' }}>
          Login
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          <Box component="label" htmlFor="login-email" sx={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', color: 'text.primary' }}>
            Email
          </Box>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="login-input"
            style={{ height: 28, minHeight: 28, maxHeight: 28, boxSizing: 'border-box' }}
          />
          <Box component="label" htmlFor="login-password" sx={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', color: 'text.primary' }}>
            Password
          </Box>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="login-input"
            style={{ height: 28, minHeight: 28, maxHeight: 28, boxSizing: 'border-box' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).form?.requestSubmit();
            }}
          />
          {error && (
            <Box component="p" sx={{ color: 'error.main', m: 0, fontSize: '0.8125rem' }} className="form-error">
              {error}
            </Box>
          )}
          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
            <button type="submit" className="btn-primary">Login</button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
