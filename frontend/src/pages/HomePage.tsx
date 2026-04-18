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
  const [searchInput, setSearchInput] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [trackedRefresh, setTrackedRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<"live" | "aircraft" | "alerts">("live");
  const [starredFlights, setStarredFlights] = useState<string[]>(() => {
    const raw = localStorage.getItem("flightpath_starred");
    return raw ? (JSON.parse(raw) as string[]) : [];
  });
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
  const liveCards = flights.length > 0 ? flights : [];
  const aircraftCards = [
    { model: "Boeing 737-800", maker: "Boeing", seats: "162-189", range: "3,383 mi", type: "Narrow-body" },
    { model: "Airbus A320", maker: "Airbus", seats: "140-180", range: "3,300 mi", type: "Narrow-body" },
    { model: "Boeing 777-200", maker: "Boeing", seats: "314-396", range: "5,240 mi", type: "Wide-body" }
  ];

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;
    if (/^[A-Z]{3,4}$/.test(query)) {
      navigate(`/airport/${query}`);
    } else {
      const id = `${query}-${date}`;
      navigate(`/flight/${encodeURIComponent(id)}`);
    }
    setTrackedRefresh((value) => value + 1);
  }

  function toggleStar(flightId: string) {
    const next = starredFlights.includes(flightId)
      ? starredFlights.filter((value) => value !== flightId)
      : [...starredFlights, flightId];
    setStarredFlights(next);
    localStorage.setItem("flightpath_starred", JSON.stringify(next));
  }

  return (
    <div className="stack">
      <section className="card heroCard">
        <h1>FlightPath</h1>
        <p>Live aviation intelligence for flights, airports, fleets, and alerts.</p>
        <form onSubmit={handleSearch} className="formRow">
          <label htmlFor="flight-number-input" className="srOnly">
            Search flights, aircraft, or airports
          </label>
          <input
            id="flight-number-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search flights, aircraft, airports..."
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
          Use `UA123` for flights or `SFO` for airport boards.
        </small>
        <div className="tabBar" role="tablist" aria-label="FlightPath tabs">
          <button type="button" className={activeTab === "live" ? "tab tabActive" : "tab"} onClick={() => setActiveTab("live")}>
            Live
          </button>
          <button type="button" className={activeTab === "aircraft" ? "tab tabActive" : "tab"} onClick={() => setActiveTab("aircraft")}>
            Aircraft
          </button>
          <button type="button" className={activeTab === "alerts" ? "tab tabActive" : "tab"} onClick={() => setActiveTab("alerts")}>
            Alerts
          </button>
        </div>
      </section>

      {activeTab === "live" ? (
        <section className="stack">
          {liveCards.map((flight) => {
            const progress = flight.status === "landed" ? 100 : flight.status === "departed" ? 62 : 25;
            return (
              <article className="card flightCard" key={flight.id}>
                <div className="flightCardHeader">
                  <div>
                    <h2>{flight.flightNumber}</h2>
                    <p className="muted">{flight.airline}</p>
                  </div>
                  <span className={`pill status-${flight.status}`}>{flight.status.toUpperCase()}</span>
                </div>
                <div className="routeRow">
                  <strong>{flight.departure.iata}</strong>
                  <div className="progressTrack">
                    <div className="progressFill" style={{ width: `${progress}%` }} />
                    <span className="progressPlane" style={{ left: `calc(${progress}% - 10px)` }}>
                      ✈
                    </span>
                  </div>
                  <strong>{flight.arrival.iata}</strong>
                </div>
                <div className="metricGrid">
                  <span>{flight.position?.speedKts ?? 470} kts</span>
                  <span>{flight.position?.altitudeFt ?? 35000} ft</span>
                  <span>ETA {flight.arrivalTimes.estimated ? new Date(flight.arrivalTimes.estimated).toLocaleTimeString() : "TBD"}</span>
                </div>
                <div className="actionRow">
                  <button type="button" onClick={() => navigate(`/flight/${encodeURIComponent(flight.id)}`)}>
                    Open
                  </button>
                  <button type="button" onClick={() => toggleStar(flight.id)}>
                    {starredFlights.includes(flight.id) ? "Unstar" : "Star"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {activeTab === "aircraft" ? (
        <section className="stack">
          {aircraftCards.map((aircraft) => (
            <article className="card aircraftCard" key={aircraft.model}>
              <h2>{aircraft.model}</h2>
              <p className="muted">{aircraft.maker}</p>
              <div className="metricGrid">
                <span>{aircraft.seats} seats</span>
                <span>{aircraft.range}</span>
                <span>{aircraft.type}</span>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <TrackedFlightsPanel refreshToken={trackedRefresh} />

      {activeTab === "alerts" || alerts.messages.length > 0 ? (
        <section className="card">
          <h2>Smart Alerts</h2>
          <ul className="list">
            {(alerts.messages.length > 0
              ? alerts.messages
              : ["Boeing 747-8 overhead in 5 minutes", "Your tracked flight AA1234 is delayed", "Rare A380 spotted at LAX"]
            ).map((message, index) => (
              <li key={`${message}-${index}`}>
                <span>{message}</span>
                {alerts.messages.length > 0 ? (
                  <button onClick={() => alerts.dismissMessage(index)} type="button">
                    Dismiss
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
