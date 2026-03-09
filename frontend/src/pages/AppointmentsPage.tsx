import { Link } from "react-router-dom";

export const AppointmentsPage = () => (
    <div className="page">
      <p className="page-nav">
        <Link to="/">← Home</Link>
      </p>
      <h1>Appointments</h1>
      <p>Book, reschedule, or cancel appointments. (Placeholder — full feature coming later.)</p>
    </div>
);
