import type { FlightDetail } from "../types/flight";
import { formatTime } from "../lib/time";

interface Props {
  flight: FlightDetail;
}

export function FlightTimeline({ flight }: Props) {
  return (
    <section className="card">
      <h2>Timeline</h2>
      <ul className="timeline">
        {flight.timeline.map((event) => (
          <li key={`${event.type}-${event.label}-${event.time}`}>
            <span className="timelineLabel">{event.label}</span>
            <span>{formatTime(event.time)}</span>
            {event.note ? <small>{event.note}</small> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
