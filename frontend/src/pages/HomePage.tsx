import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { TrackedFlightsPanel } from "../components/TrackedFlightsPanel";
import { getFlightDetail } from "../lib/apiClient";
import { getTrackedFlights } from "../lib/localStore";
import { useInAppAlerts } from "../hooks/useInAppAlerts";
import type { FlightDetail } from "../types/flight";

export function HomePage() {
  const navigate = useNavigate();
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [trackedRefresh, setTrackedRefresh] = useState(0);
  const [airportIata, setAirportIata] = useState("SFO");
  const tracked = getTrackedFlights();
  const statusQueries = useQueries({
    queries: tracked.map((item) => ({
      queryKey: ["tracked-flight", item.id],
      queryFn: () => getFlightDetail(item.id),
      refetchInterval: 60000
    }))
  });
  const flights = useMemo(
    () =>
      statusQueries
        .map((query) => query.data)
        .filter((flight): flight is FlightDetail => Boolean(flight)),
    [statusQueries]
  );
  const alerts = useInAppAlerts(flights);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!flightNumber.trim()) return;
    const id = `${flightNumber.toUpperCase()}-${date}`;
    navigate(`/flight/${encodeURIComponent(id)}`);
    setTrackedRefresh((value) => value + 1);
  }

  return (
    <div className="stack">
      <section className="card">
        <h1>FlightPath</h1>
        <p>Track flights, airport boards, and weather context.</p>
        <form onSubmit={handleSearch} className="formRow">
          <label htmlFor="flight-number-input" className="srOnly">
            Flight number
          </label>
          <input
            id="flight-number-input"
            value={flightNumber}
            onChange={(event) => setFlightNumber(event.target.value)}
            placeholder="Flight number (e.g. UA123)"
            autoComplete="off"
            aria-describedby="flight-number-help"
          />
          <label htmlFor="flight-date-input" className="srOnly">
            Flight date
          </label>
          <input
            id="flight-date-input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <small id="flight-number-help" className="muted">
          Enter airline code and number, for example UA123.
        </small>
      </section>

      <section className="card">
        <h2>Airport Board</h2>
        <form
          className="formRow"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(`/airport/${airportIata.toUpperCase()}`);
          }}
        >
          <label htmlFor="airport-iata-input" className="srOnly">
            Airport IATA code
          </label>
          <input
            id="airport-iata-input"
            value={airportIata}
            maxLength={4}
            onChange={(event) => setAirportIata(event.target.value)}
            placeholder="IATA code"
            autoComplete="off"
          />
          <button type="submit">Open Board</button>
        </form>
      </section>

      <TrackedFlightsPanel refreshToken={trackedRefresh} />
      {alerts.messages.length > 0 ? (
        <section className="card">
          <h2>Alerts</h2>
          <ul className="list">
            {alerts.messages.map((message, index) => (
              <li key={`${message}-${index}`}>
                <span>{message}</span>
                <button onClick={() => alerts.dismissMessage(index)} type="button">
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
