import { Link } from "react-router-dom";

export const QueuePage = () => (
    <div className="page">
      <p className="page-nav">
        <Link to="/">← Home</Link>
      </p>
      <h1>Queue</h1>
      <p>Walk-in queue. (Placeholder — full feature coming later.)</p>
    </div>
);
