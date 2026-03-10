import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, TextField } from "@iamlegendchamp/design-system";
import Box from "@mui/material/Box";
import { mfaSetup, mfaEnable } from "../api/auth";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [mfaFlow, setMfaFlow] = useState<'idle' | 'qr' | 'done'>('idle');
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");

  const handleEnableMfaClick = async () => {
    setMfaError("");
    try {
      const { qrDataUrl: url } = await mfaSetup();
      setQrDataUrl(url);
      setMfaFlow('qr');
    } catch (e) {
      setMfaError(e instanceof Error ? e.message : "Setup failed");
    }
  };

  const handleMfaConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError("");
    try {
      await mfaEnable(mfaCode);
      setMfaFlow('done');
      setMfaCode("");
    } catch (e) {
      setMfaError(e instanceof Error ? e.message : "Invalid code");
    }
  };

  return (
    <div className="page">
      <h1>Front Desk</h1>
      <p>Welcome, {user?.email}</p>
      <Button type="button" variant="outlined" onClick={logout}>
        Logout
      </Button>
      <Box sx={{ mt: 3 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Two-factor authentication</h2>
        {mfaFlow === 'idle' && (
          <Button type="button" variant="outlined" onClick={handleEnableMfaClick}>
            Enable MFA
          </Button>
        )}
        {mfaFlow === 'qr' && (
          <Box component="form" onSubmit={handleMfaConfirm} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 280 }}>
            <p style={{ margin: 0 }}>Scan with your authenticator app, then enter the code:</p>
            <Box component="img" src={qrDataUrl} alt="MFA QR" sx={{ width: 200, height: 200 }} />
            <TextField
              label="Code"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            />
            {mfaError && <Box component="p" sx={{ color: 'error.main', m: 0 }}>{mfaError}</Box>}
            <Button type="submit">Confirm</Button>
            <Button type="button" variant="outlined" onClick={() => { setMfaFlow('idle'); setMfaError(""); }}>Cancel</Button>
          </Box>
        )}
        {mfaFlow === 'done' && <p style={{ margin: 0, color: 'green' }}>MFA enabled.</p>}
      </Box>
      <p className="page-links">
        <Link to="/queue">Queue</Link>
        <Link to="/appointments">Appointments</Link>
        <span style={{ color: "#888", marginLeft: "0.25rem" }}>(placeholders)</span>
      </p>
    </div>
  );
};
