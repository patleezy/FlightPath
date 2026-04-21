import type { AirportBoardDto, FlightDetailDto, FlightStatus } from "../../types.js";
import type { FlightProvider } from "./FlightProvider.js";
import { MemoryTtlCache } from "../../utils/cache.js";

const cache = new MemoryTtlCache();
const API_BASE = process.env.AVIATIONSTACK_BASE_URL ?? "http://api.aviationstack.com/v1";
const API_KEY = process.env.AVIATIONSTACK_API_KEY ?? "";

interface AviationStackFlight {
  flight_date?: string;
  flight_status?: string;
  departure?: {
    airport?: string;
    timezone?: string;
    iata?: string;
    estimated?: string;
    actual?: string;
    scheduled?: string;
  };
  arrival?: {
    airport?: string;
    timezone?: string;
    iata?: string;
    estimated?: string;
    actual?: string;
    scheduled?: string;
  };
  airline?: { name?: string; iata?: string };
  flight?: { iata?: string; number?: string };
  live?: {
    updated?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    speed_horizontal?: number;
    direction?: number;
  };
}

interface AviationStackResponse {
  data?: AviationStackFlight[];
}

function pseudoStatus(seed: string): FlightStatus {
  const statuses: FlightStatus[] = ["scheduled", "boarding", "departed", "landed", "delayed"];
  const index = Math.abs(seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % statuses.length;
  return statuses[index];
}

function mapStatus(input?: string): FlightStatus {
  const normalized = (input ?? "").toLowerCase();
  if (normalized.includes("scheduled")) return "scheduled";
  if (normalized.includes("active")) return "departed";
  if (normalized.includes("landed")) return "landed";
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("divert")) return "delayed";
  if (normalized.includes("incident")) return "delayed";
  if (normalized.includes("delayed")) return "delayed";
  return "unknown";
}

function toTimelineEvent(type: FlightStatus, label: string, time?: string, note?: string) {
  return { type, label, time, note };
}

function buildFlight(id: string): FlightDetailDto {
  const now = Date.now();
  const status = pseudoStatus(id);
  const depScheduled = new Date(now - 60 * 60000).toISOString();
  const arrScheduled = new Date(now + 90 * 60000).toISOString();
  const delayed = status === "delayed";

  return {
    id,
    airline: id.slice(0, 2).toUpperCase(),
    flightNumber: id.split("-")[0].toUpperCase(),
    status,
    departure: { iata: "SFO", city: "San Francisco", lat: 37.6213, lon: -122.379 },
    arrival: { iata: "JFK", city: "New York", lat: 40.6413, lon: -73.7781 },
    departureTimes: {
      scheduled: depScheduled,
      estimated: delayed ? new Date(now - 35 * 60000).toISOString() : depScheduled,
      actual: status === "departed" || status === "landed" ? new Date(now - 30 * 60000).toISOString() : undefined
    },
    arrivalTimes: {
      scheduled: arrScheduled,
      estimated: delayed ? new Date(now + 125 * 60000).toISOString() : arrScheduled,
      actual: status === "landed" ? new Date(now - 5 * 60000).toISOString() : undefined
    },
    position:
      status === "scheduled" || status === "cancelled"
        ? undefined
        : {
            lat: 39.7,
            lon: -98.5,
            heading: 87,
            altitudeFt: status === "landed" ? 0 : 32000,
            speedKts: status === "landed" ? 0 : 435,
            updatedAt: new Date().toISOString()
          },
    timeline: [
      { type: "scheduled", label: "Scheduled", time: depScheduled },
      { type: "boarding", label: "Boarding", time: new Date(now - 45 * 60000).toISOString() },
      { type: "departed", label: "Departed", time: new Date(now - 30 * 60000).toISOString() },
      { type: "landed", label: "Estimated Arrival", time: arrScheduled },
      delayed ? { type: "delayed", label: "Delay", note: "Air traffic flow delay" } : undefined
    ].filter(Boolean) as FlightDetailDto["timeline"],
    lastUpdatedAt: new Date().toISOString()
  };
}

function buildFromAviationStack(row: AviationStackFlight, fallbackId: string): FlightDetailDto {
  const flightNumber = row.flight?.iata ?? fallbackId.split("-")[0].toUpperCase();
  const status = mapStatus(row.flight_status);
  const depScheduled = row.departure?.scheduled;
  const arrScheduled = row.arrival?.scheduled;
  const depEstimated = row.departure?.estimated;
  const arrEstimated = row.arrival?.estimated;
  const depActual = row.departure?.actual;
  const arrActual = row.arrival?.actual;

  return {
    id: `${flightNumber}-${row.flight_date ?? fallbackId.split("-")[1] ?? new Date().toISOString().slice(0, 10)}`,
    airline: row.airline?.name ?? row.airline?.iata ?? flightNumber.slice(0, 2),
    flightNumber,
    status,
    departure: {
      iata: (row.departure?.iata ?? "N/A").toUpperCase(),
      name: row.departure?.airport,
      timezone: row.departure?.timezone
    },
    arrival: {
      iata: (row.arrival?.iata ?? "N/A").toUpperCase(),
      name: row.arrival?.airport,
      timezone: row.arrival?.timezone
    },
    departureTimes: { scheduled: depScheduled, estimated: depEstimated, actual: depActual },
    arrivalTimes: { scheduled: arrScheduled, estimated: arrEstimated, actual: arrActual },
    position:
      row.live?.latitude !== undefined && row.live?.longitude !== undefined
        ? {
            lat: row.live.latitude,
            lon: row.live.longitude,
            heading: row.live.direction,
            altitudeFt: row.live.altitude,
            speedKts: row.live.speed_horizontal,
            updatedAt: row.live.updated ?? new Date().toISOString()
          }
        : undefined,
    timeline: [
      toTimelineEvent("scheduled", "Scheduled Departure", depScheduled),
      depEstimated ? toTimelineEvent("boarding", "Estimated Departure", depEstimated) : undefined,
      depActual ? toTimelineEvent("departed", "Actual Departure", depActual) : undefined,
      toTimelineEvent("landed", "Scheduled Arrival", arrScheduled),
      arrEstimated ? toTimelineEvent("landed", "Estimated Arrival", arrEstimated) : undefined,
      arrActual ? toTimelineEvent("landed", "Actual Arrival", arrActual) : undefined,
      status === "delayed" ? toTimelineEvent("delayed", "Delay", undefined, row.flight_status) : undefined
    ].filter(Boolean) as FlightDetailDto["timeline"],
    lastUpdatedAt: new Date().toISOString()
  };
}

async function fetchAviationStack(params: Record<string, string>): Promise<AviationStackFlight[] | null> {
  if (!API_KEY) return null;
  try {
    const query = new URLSearchParams({ access_key: API_KEY, ...params });
    const response = await fetch(`${API_BASE}/flights?${query.toString()}`);
    if (!response.ok) {
      console.error(`AviationStack HTTP Error: ${response.status} ${response.statusText}`);
      return null;
    }
    const payload = (await response.json()) as AviationStackResponse & { error?: any };
    
    if (payload.error) {
      console.error("AviationStack API Error:", payload.error);
      return null;
    }
    
    if (!payload.data || payload.data.length === 0) {
      console.warn("AviationStack API returned empty data for params:", params);
      return null;
    }
    return payload.data;
  } catch (err) {
    console.error("AviationStack fetch failed:", err);
    return null;
  }
}

export class FreeTierFlightProvider implements FlightProvider {
  async getFlightById(id: string): Promise<FlightDetailDto> {
    const cacheKey = `flight:${id}`;
    const cached = cache.get<FlightDetailDto>(cacheKey);
    if (cached) return cached;
    const flightNumber = id.split("-")[0];
    const date = id.split("-")[1] ?? new Date().toISOString().slice(0, 10);

    const rows = await fetchAviationStack({
      flight_iata: flightNumber,
      limit: "1"
    });
    const payload = rows?.[0] ? buildFromAviationStack(rows[0], id) : buildFlight(id);
    cache.set(cacheKey, payload, 15_000);
    return payload;
  }

  async searchFlight(flightNumber: string, date: string): Promise<FlightDetailDto> {
    const id = `${flightNumber.toUpperCase()}-${date}`;
    return this.getFlightById(id);
  }

  async getAirportBoard(airportIata: string): Promise<AirportBoardDto> {
    const iata = airportIata.toUpperCase();
    const today = new Date().toISOString().slice(0, 10);

    const [depRows, arrRows] = await Promise.all([
      fetchAviationStack({ dep_iata: iata, limit: "10" }),
      fetchAviationStack({ arr_iata: iata, limit: "10" })
    ]);

    if (depRows && arrRows) {
      const departures = depRows.map((row, idx) => ({
        id: `${row.flight?.iata ?? "UNKNOWN"}-${today}-dep-${idx}`,
        airline: row.airline?.name ?? row.airline?.iata ?? "Unknown",
        flightNumber: row.flight?.iata ?? row.flight?.number ?? "Unknown",
        destinationOrOrigin: (row.arrival?.iata ?? "N/A").toUpperCase(),
        direction: "departure" as const,
        status: mapStatus(row.flight_status),
        scheduledTime: row.departure?.scheduled,
        estimatedTime: row.departure?.estimated
      }));

      const arrivals = arrRows.map((row, idx) => ({
        id: `${row.flight?.iata ?? "UNKNOWN"}-${today}-arr-${idx}`,
        airline: row.airline?.name ?? row.airline?.iata ?? "Unknown",
        flightNumber: row.flight?.iata ?? row.flight?.number ?? "Unknown",
        destinationOrOrigin: (row.departure?.iata ?? "N/A").toUpperCase(),
        direction: "arrival" as const,
        status: mapStatus(row.flight_status),
        scheduledTime: row.arrival?.scheduled,
        estimatedTime: row.arrival?.estimated
      }));
      return { airport: iata, arrivals, departures };
    }

    const base = ["UA123", "DL450", "AS88", "AA777"];
    const departures = await Promise.all(
      base.map(async (flightNumber, idx) => {
        const detail = await this.getFlightById(`${flightNumber}-${today}-${idx}`);
        return {
          id: detail.id,
          airline: detail.airline,
          flightNumber: detail.flightNumber,
          destinationOrOrigin: detail.arrival.iata,
          direction: "departure" as const,
          status: detail.status,
          scheduledTime: detail.departureTimes.scheduled,
          estimatedTime: detail.departureTimes.estimated
        };
      })
    );
    const arrivals = departures.map((item, idx) => ({
      ...item,
      id: `${item.id}-arrival-${idx}`,
      direction: "arrival" as const,
      destinationOrOrigin: "LAX"
    }));
    return { airport: iata, arrivals, departures };
  }
}
