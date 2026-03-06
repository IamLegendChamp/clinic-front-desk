import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setBackendStatus('VITE_API_URL not set');
      return;
    }
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then((data) => setBackendStatus(data?.message ?? 'Connected'))
      .catch(() => setBackendStatus('Backend unreachable'))
  }, [apiUrl]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Clinic Front Desk</h1>
      <p>Backend: {backendStatus}</p>
      <p>
        <a href={apiUrl} target="_blank" rel="noopener noreferrer">API</a>
        {' · '}
        <a href="https://clinic-frontend-phi-jade.vercel.app" target="_blank" rel="noopener noreferrer">Frontend</a>
      </p>
    </div>
  )
}

export default App;
