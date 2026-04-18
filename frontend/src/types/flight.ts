export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "landed"
  | "delayed"
  | "cancelled"
  | "unknown";

export interface FlightTimeBlock {
  scheduled?: string;
  estimated?: string;
  actual?: string;
}

export interface FlightLocation {
  iata: string;
  city?: string;
  name?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

export interface FlightPosition {
  lat: number;
  lon: number;
  heading?: number;
  altitudeFt?: number;
  speedKts?: number;
  updatedAt: string;
}

export interface TimelineEvent {
  type: FlightStatus;
  label: string;
  time?: string;
  note?: string;
}

export interface FlightDetail {
  id: string;
  airline: string;
  flightNumber: string;
  status: FlightStatus;
  departure: FlightLocation;
  arrival: FlightLocation;
  departureTimes: FlightTimeBlock;
  arrivalTimes: FlightTimeBlock;
  position?: FlightPosition;
  timeline: TimelineEvent[];
  lastUpdatedAt: string;
}

export interface AirportBoardItem {
  id: string;
  airline: string;
  flightNumber: string;
  destinationOrOrigin: string;
  direction: "arrival" | "departure";
  status: FlightStatus;
  scheduledTime?: string;
  estimatedTime?: string;
}

export interface AirportBoardResponse {
  airport: string;
  arrivals: AirportBoardItem[];
  departures: AirportBoardItem[];
}

export interface WeatherContext {
  airportIata: string;
  summary: string;
  temperatureC?: number;
  windKph?: number;
  visibilityKm?: number;
  disruptionRisk: "low" | "medium" | "high";
  observedAt: string;
}
