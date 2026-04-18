import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrackedFlights, removeTrackedFlight, type TrackedFlight } from "../lib/localStore";

interface Props {
  refreshToken: number;
}

export function TrackedFlightsPanel({ refreshToken }: Props) {
  const [tracked, setTracked] = useState<TrackedFlight[]>([]);

  useEffect(() => {
    setTracked(getTrackedFlights());
  }, [refreshToken]);

  return (
    <section className="card">
      <h2>Tracked Flights</h2>
      <p className="muted">Saved locally in your browser (no account).</p>
      {tracked.length === 0 ? <p>No tracked flights yet.</p> : null}
      <ul className="list">
        {tracked.map((flight) => (
          <li key={`${refreshToken}-${flight.id}`}>
            <Link to={`/flight/${encodeURIComponent(flight.id)}`}>{flight.flightNumber}</Link>
            <span>{flight.date}</span>
            <button
              onClick={() => {
                removeTrackedFlight(flight.id);
                setTracked(getTrackedFlights());
              }}
              type="button"
              aria-label={`Remove tracked flight ${flight.flightNumber}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
