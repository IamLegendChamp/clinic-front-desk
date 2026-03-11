import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Button, TextField } from "../components/ui";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(email, password);
      if (result.done) {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <Box className="page page--narrow" component="div">
      <Box component="h1" sx={{ mb: 2 }}>Login</Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320 }}
      >
        <TextField
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <Box component="p" sx={{ color: 'error.main', m: 0 }} className="form-error">
            {error}
          </Box>
        )}
        <Button type="submit">Login</Button>
      </Box>
    </Box>
  );
};
