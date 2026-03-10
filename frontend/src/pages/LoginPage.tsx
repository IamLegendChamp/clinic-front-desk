import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Button, TextField } from "@iamlegendchamp/design-system";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const { login, loginMfa } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mfaStep) {
        await loginMfa(tempToken, mfaCode);
        navigate("/", { replace: true });
      } else {
        const result = await login(email, password);
        if (result.done) {
          navigate("/", { replace: true });
        } else {
          setTempToken(result.tempToken);
          setMfaStep(true);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <Box className="page page--narrow" component="div">
      <Box component="h1" sx={{ mb: 2 }}>{mfaStep ? "Enter verification code" : "Login"}</Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320 }}
      >
        {!mfaStep ? (
          <>
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
          </>
        ) : (
          <TextField
            label="Authentication code"
            placeholder="000000"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            required
          />
        )}
        {error && (
          <Box component="p" sx={{ color: 'error.main', m: 0 }} className="form-error">
            {error}
          </Box>
        )}
        <Button type="submit">{mfaStep ? "Verify" : "Login"}</Button>
        {mfaStep && (
          <Button type="button" variant="outlined" onClick={() => { setMfaStep(false); setMfaCode(""); setError(""); }}>
            Back
          </Button>
        )}
      </Box>
    </Box>
  );
};
