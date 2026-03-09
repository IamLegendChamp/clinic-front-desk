import { Link } from "react-router-dom";

export function QueuePage() {
  return (
    <div style={{ padding: 24 }}>
      <p><Link to="/">← Home</Link></p>
      <h1>Queue</h1>
      <p>Walk-in queue (placeholder). Coming in Pillar 3.</p>
    </div>
  );
}
