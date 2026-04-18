import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FlightMap } from "../components/FlightMap";
import { FlightTimeline } from "../components/FlightTimeline";
import { getFlightDetail } from "../lib/apiClient";
import { formatTime, relativeTime } from "../lib/time";
import { saveTrackedFlight } from "../lib/localStore";

export function FlightDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";

  const query = useQuery({
    queryKey: ["flight-detail", id],
    queryFn: () => getFlightDetail(id),
    refetchInterval: 45000
  });

  const flight = query.data;
  const statusText = useMemo(
    () => (flight ? flight.status.toUpperCase() : "UNKNOWN"),
    [flight]
  );

  if (query.isLoading) return <p>Loading flight...</p>;
  if (query.isError || !flight) return <p>Unable to load flight details.</p>;

  return (
    <div className="stack">
      <section className="card">
        <h1>
          {flight.airline} {flight.flightNumber}
        </h1>
        <p className={`status status-${flight.status}`}>Status: {statusText}</p>
        <p className="muted">Updated {relativeTime(flight.lastUpdatedAt)}</p>
        <div className="grid2">
          <div>
            <h3>Departure</h3>
            <p>{flight.departure.iata}</p>
            <p>Scheduled: {formatTime(flight.departureTimes.scheduled)}</p>
            <p>Estimated: {formatTime(flight.departureTimes.estimated)}</p>
            <p>Actual: {formatTime(flight.departureTimes.actual)}</p>
          </div>
          <div>
            <h3>Arrival</h3>
            <p>{flight.arrival.iata}</p>
            <p>Scheduled: {formatTime(flight.arrivalTimes.scheduled)}</p>
            <p>Estimated: {formatTime(flight.arrivalTimes.estimated)}</p>
            <p>Actual: {formatTime(flight.arrivalTimes.actual)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            saveTrackedFlight({
              id: flight.id,
              flightNumber: flight.flightNumber,
              date: new Date().toISOString().slice(0, 10),
              addedAt: new Date().toISOString()
            })
          }
        >
          Track Flight
        </button>
      </section>
      <FlightMap flight={flight} />
      <FlightTimeline flight={flight} />
    </div>
  );
}
