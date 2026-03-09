import { Link } from "react-router-dom";

export function AppointmentsPage() {
  return (
    <div style={{ padding: 24 }}>
      <p><Link to="/">← Home</Link></p>
      <h1>Appointments</h1>
      <p>Book / reschedule / cancel (placeholder). Coming in Pillar 4.</p>
    </div>
  );
}
