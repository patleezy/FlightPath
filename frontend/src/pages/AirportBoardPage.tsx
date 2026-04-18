import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getAirportBoard, getAirportWeather } from "../lib/apiClient";
import { formatTime } from "../lib/time";

export function AirportBoardPage() {
  const params = useParams<{ iata: string }>();
  const iata = (params.iata ?? "SFO").toUpperCase();

  const boardQuery = useQuery({
    queryKey: ["airport-board", iata],
    queryFn: () => getAirportBoard(iata),
    refetchInterval: 60000
  });

  const weatherQuery = useQuery({
    queryKey: ["airport-weather", iata],
    queryFn: () => getAirportWeather(iata),
    refetchInterval: 600000
  });

  if (boardQuery.isLoading) return <p>Loading airport board...</p>;
  if (boardQuery.isError || !boardQuery.data) return <p>Unable to load board.</p>;

  return (
    <div className="stack">
      <section className="card">
        <h1>{iata} Airport Board</h1>
        {weatherQuery.data ? (
          <p>
            Weather: {weatherQuery.data.summary}, {weatherQuery.data.temperatureC ?? "N/A"} C, risk{" "}
            {weatherQuery.data.disruptionRisk}
          </p>
        ) : (
          <p className="muted">Weather unavailable.</p>
        )}
      </section>
      <section className="card">
        <h2>Departures</h2>
        <ul className="list" aria-label={`${iata} departures`}>
          {boardQuery.data.departures.map((item) => (
            <li key={item.id}>
              <strong>{item.flightNumber}</strong> to {item.destinationOrOrigin} -{" "}
              <span aria-label={`status ${item.status}`}>{item.status}</span>
              <span> {formatTime(item.estimatedTime ?? item.scheduledTime)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2>Arrivals</h2>
        <ul className="list" aria-label={`${iata} arrivals`}>
          {boardQuery.data.arrivals.map((item) => (
            <li key={item.id}>
              <strong>{item.flightNumber}</strong> from {item.destinationOrOrigin} -{" "}
              <span aria-label={`status ${item.status}`}>{item.status}</span>
              <span> {formatTime(item.estimatedTime ?? item.scheduledTime)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
