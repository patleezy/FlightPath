import type { FlightDetail } from "../types/flight";

const TRACKED_FLIGHTS_KEY = "flight_status_tracked_flights";
const ALERT_HISTORY_KEY = "flight_status_alert_history";

export interface TrackedFlight {
  id: string;
  flightNumber: string;
  date: string;
  addedAt: string;
}

export function getTrackedFlights(): TrackedFlight[] {
  const raw = localStorage.getItem(TRACKED_FLIGHTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TrackedFlight[];
  } catch {
    return [];
  }
}

export function saveTrackedFlight(item: TrackedFlight): void {
  const existing = getTrackedFlights();
  if (existing.some((f) => f.id === item.id)) return;
  localStorage.setItem(TRACKED_FLIGHTS_KEY, JSON.stringify([item, ...existing]));
}

export function removeTrackedFlight(id: string): void {
  const next = getTrackedFlights().filter((f) => f.id !== id);
  localStorage.setItem(TRACKED_FLIGHTS_KEY, JSON.stringify(next));
}

function getAlertHistory(): Record<string, string> {
  const raw = localStorage.getItem(ALERT_HISTORY_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function shouldNotifyStatusChange(flight: FlightDetail): boolean {
  const history = getAlertHistory();
  const prevStatus = history[flight.id];
  return Boolean(prevStatus && prevStatus !== flight.status);
}

export function markStatusSeen(flight: FlightDetail): void {
  const history = getAlertHistory();
  history[flight.id] = flight.status;
  localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history));
}
