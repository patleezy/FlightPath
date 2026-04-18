import type {
  AirportBoardResponse,
  FlightDetail,
  WeatherContext
} from "../types/flight";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:4000/api" : "/_backend/api");

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function searchFlight(flightNumber: string, date: string): Promise<FlightDetail> {
  const query = new URLSearchParams({ flightNumber, date });
  return getJson<FlightDetail>(`/flights/search?${query.toString()}`);
}

export function getFlightDetail(id: string): Promise<FlightDetail> {
  return getJson<FlightDetail>(`/flights/${encodeURIComponent(id)}`);
}

export function getAirportBoard(airportIata: string): Promise<AirportBoardResponse> {
  return getJson<AirportBoardResponse>(`/airports/${encodeURIComponent(airportIata)}/board`);
}

export function getAirportWeather(airportIata: string): Promise<WeatherContext> {
  return getJson<WeatherContext>(`/weather/${encodeURIComponent(airportIata)}`);
}
