import { useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { FlightMap } from "../components/FlightMap";
import { FlightTimeline } from "../components/FlightTimeline";
import { getFlightDetail } from "../lib/apiClient";
import { formatTime, relativeTime } from "../lib/time";
import { saveTrackedFlight } from "../lib/localStore";

export function FlightDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";

  const exportRef = useRef<HTMLElement>(null);
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

  const summaryText = `${flight.flightNumber} ${flight.departure.iata} -> ${flight.arrival.iata} | Status: ${statusText} | Updated ${relativeTime(flight.lastUpdatedAt)}`;

  async function handleShare() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `FlightPath ${flight.flightNumber}`,
        text: summaryText,
        url: shareUrl
      });
      return;
    }
    await navigator.clipboard.writeText(`${summaryText}\n${shareUrl}`);
  }

  async function handleCopyText() {
    await navigator.clipboard.writeText(summaryText);
  }

  async function handleExportScreenshot() {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: null,
      scale: 2
    });
    const link = document.createElement("a");
    link.download = `${flight.flightNumber}-flightpath.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="stack">
      <section className="card" ref={exportRef}>
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
        <div className="actionRow">
          <button type="button" onClick={handleShare}>
            Share Link
          </button>
          <button type="button" onClick={handleExportScreenshot}>
            Export Screenshot
          </button>
          <button type="button" onClick={handleCopyText}>
            Copy Info
          </button>
        </div>
        <div className="specGrid">
          <article className="specCard">
            <h3>Aircraft</h3>
            <p>Boeing 737-800</p>
          </article>
          <article className="specCard">
            <h3>Cruise Speed</h3>
            <p>{flight.position?.speedKts ?? 455} kts</p>
          </article>
          <article className="specCard">
            <h3>Altitude</h3>
            <p>{flight.position?.altitudeFt ?? 35000} ft</p>
          </article>
        </div>
      </section>
      <FlightMap flight={flight} />
      <FlightTimeline flight={flight} />
    </div>
  );
}
