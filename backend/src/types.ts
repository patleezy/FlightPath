export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "landed"
  | "delayed"
  | "cancelled"
  | "unknown";

export interface FlightDetailDto {
  id: string;
  airline: string;
  flightNumber: string;
  status: FlightStatus;
  departure: { iata: string; city?: string; name?: string; timezone?: string; lat?: number; lon?: number };
  arrival: { iata: string; city?: string; name?: string; timezone?: string; lat?: number; lon?: number };
  departureTimes: { scheduled?: string; estimated?: string; actual?: string };
  arrivalTimes: { scheduled?: string; estimated?: string; actual?: string };
  position?: { lat: number; lon: number; heading?: number; altitudeFt?: number; speedKts?: number; updatedAt: string };
  timeline: { type: FlightStatus; label: string; time?: string; note?: string }[];
  lastUpdatedAt: string;
}

export interface AirportBoardItemDto {
  id: string;
  airline: string;
  flightNumber: string;
  destinationOrOrigin: string;
  direction: "arrival" | "departure";
  status: FlightStatus;
  scheduledTime?: string;
  estimatedTime?: string;
}

export interface AirportBoardDto {
  airport: string;
  arrivals: AirportBoardItemDto[];
  departures: AirportBoardItemDto[];
}

export interface WeatherDto {
  airportIata: string;
  summary: string;
  temperatureC?: number;
  windKph?: number;
  visibilityKm?: number;
  disruptionRisk: "low" | "medium" | "high";
  observedAt: string;
}
