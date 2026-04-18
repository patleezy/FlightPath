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

  // Narrow for TypeScript inside async handlers (closures do not keep narrowing on `query.data`).
  const f = flight;

  const summaryText = `${f.flightNumber} ${f.departure.iata} -> ${f.arrival.iata} | Status: ${statusText} | Updated ${relativeTime(f.lastUpdatedAt)}`;

  async function handleShare() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `FlightPath ${f.flightNumber}`,
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
    link.download = `${f.flightNumber}-flightpath.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="stack">
      <section className="card" ref={exportRef}>
        <h1>
          {f.airline} {f.flightNumber}
        </h1>
        <p className={`status status-${f.status}`}>Status: {statusText}</p>
        <p className="muted">Updated {relativeTime(f.lastUpdatedAt)}</p>
        <div className="grid2">
          <div>
            <h3>Departure</h3>
            <p>{f.departure.iata}</p>
            <p>Scheduled: {formatTime(f.departureTimes.scheduled)}</p>
            <p>Estimated: {formatTime(f.departureTimes.estimated)}</p>
            <p>Actual: {formatTime(f.departureTimes.actual)}</p>
          </div>
          <div>
            <h3>Arrival</h3>
            <p>{f.arrival.iata}</p>
            <p>Scheduled: {formatTime(f.arrivalTimes.scheduled)}</p>
            <p>Estimated: {formatTime(f.arrivalTimes.estimated)}</p>
            <p>Actual: {formatTime(f.arrivalTimes.actual)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            saveTrackedFlight({
              id: f.id,
              flightNumber: f.flightNumber,
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
            <p>{f.position?.speedKts ?? 455} kts</p>
          </article>
          <article className="specCard">
            <h3>Altitude</h3>
            <p>{f.position?.altitudeFt ?? 35000} ft</p>
          </article>
        </div>
      </section>
      <FlightMap flight={f} />
      <FlightTimeline flight={f} />
    </div>
  );
}
