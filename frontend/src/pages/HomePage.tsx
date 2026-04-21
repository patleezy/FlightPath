import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getFlightDetail } from "../lib/apiClient";
import { getTrackedFlights } from "../lib/localStore";
import type { FlightDetail } from "../types/flight";

export function HomePage() {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState<"route" | "flight">("route");
  const [searchInput, setSearchInput] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  const tracked = getTrackedFlights();
  const statusQueries = useQueries({
    queries: tracked.slice(0, 2).map((item) => ({
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

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (searchMode === "flight") {
      const query = searchInput.trim().toUpperCase();
      if (!query) return;
      if (/^[A-Z]{3,4}$/.test(query)) {
        navigate(`/airport/${query}`);
      } else {
        const id = `${query}-${new Date().toISOString().slice(0, 10)}`;
        navigate(`/flight/${encodeURIComponent(id)}`);
      }
    } else {
      if (fromInput && toInput) {
        // Just mock routing for now
        navigate(`/airport/${fromInput.toUpperCase()}`);
      }
    }
  }

  return (
    <div className="stack">
      <section className="hero-section">
        <h1>Explore the Stratosphere.</h1>
        <p className="hero-subtitle">Precision aviation intelligence at your fingertips.</p>
        
        <form onSubmit={handleSearch} className="search-card">
          <div className="toggle-group">
            <button 
              type="button" 
              className={`toggle-btn ${searchMode === "route" ? "active" : ""}`}
              onClick={() => setSearchMode("route")}
            >
              Route
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${searchMode === "flight" ? "active" : ""}`}
              onClick={() => setSearchMode("flight")}
            >
              Flight No.
            </button>
          </div>

          {searchMode === "route" ? (
            <>
              <div className="input-group">
                <span className="input-icon">🛫</span>
                <input
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  placeholder="From (City or Airport)"
                  autoComplete="off"
                />
              </div>
              <div className="input-group">
                <span className="input-icon">🛬</span>
                <input
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  placeholder="To (City or Airport)"
                  autoComplete="off"
                />
              </div>
            </>
          ) : (
            <div className="input-group">
              <span className="input-icon">🔍</span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Flight Number (e.g. UA123)"
                autoComplete="off"
              />
            </div>
          )}

          <button type="submit" className="primary-btn">
            🔍 Find Flights
          </button>
        </form>
      </section>

      <section>
        <div className="section-header">
          <div>
            <h2>Tracked Flights</h2>
            <div className="section-subtitle">TELEMETRY LOGS</div>
          </div>
          <button type="button" className="text-link" style={{background: 'none', border: 'none', cursor: 'pointer'}} onClick={() => { localStorage.removeItem("flightpath_tracked"); window.location.reload(); }}>
            Clear History
          </button>
        </div>

        {flights.length === 0 ? (
          <div className="card journey-card" style={{opacity: 0.6}}>
            <p className="muted" style={{textAlign: 'center', margin: '1rem 0'}}>No tracked flights yet. Search and track a flight to see it here.</p>
          </div>
        ) : (
          flights.map(flight => (
            <div key={flight.id} className="card journey-card" style={{marginBottom: '1rem', cursor: 'pointer'}} onClick={() => navigate(`/flight/${encodeURIComponent(flight.id)}`)}>
              <div className="route-display">
                <div>
                  <div className="city-code">{flight.departure.iata}</div>
                  <div className="city-name">{flight.departure.name?.substring(0, 10) || "DEPART"}</div>
                </div>
                <div className="flight-path-line">
                  <span className="plane-icon">✈</span>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="city-code">{flight.arrival.iata}</div>
                  <div className="city-name">{flight.arrival.name?.substring(0, 10) || "ARRIVE"}</div>
                </div>
              </div>
              <div className="journey-footer">
                <span className="journey-date">{new Date(flight.lastUpdatedAt).toLocaleDateString()}</span>
                <span className="flight-badge">{flight.flightNumber}</span>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="grid-2">
        <div className="small-card">
          <div className="card-icon">🕒</div>
          <div>
            <h3 className="small-card-title">SFO → HND</h3>
            <p className="small-card-subtitle">2 days ago</p>
          </div>
        </div>
        <div className="small-card">
          <div className="card-icon">🔍</div>
          <div>
            <h3 className="small-card-title">Flight EK202</h3>
            <p className="small-card-subtitle">Active Track</p>
          </div>
        </div>
      </section>

      <section>
        <a href="#" className="image-card">
          {/* Simulated Image Background */}
          <div className="image-card-bg" style={{background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'}}></div>
          <div className="image-card-content">
            <div className="image-card-label">AERO INSIGHTS</div>
            <h3 className="image-card-title">Global Traffic Flow</h3>
          </div>
          <div className="icon-btn">→</div>
        </a>
      </section>
    </div>
  );
}
