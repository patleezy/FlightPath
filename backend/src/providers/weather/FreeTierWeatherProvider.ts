import type { WeatherDto } from "../../types.js";
import type { WeatherProvider } from "./WeatherProvider.js";
import { MemoryTtlCache } from "../../utils/cache.js";

const cache = new MemoryTtlCache();

const airportConditions: Record<string, Partial<WeatherDto>> = {
  SFO: { summary: "Marine layer, moderate wind", temperatureC: 13, windKph: 19, visibilityKm: 8 },
  JFK: { summary: "Partly cloudy", temperatureC: 16, windKph: 14, visibilityKm: 10 },
  LAX: { summary: "Clear skies", temperatureC: 21, windKph: 7, visibilityKm: 12 }
};

function riskForWind(windKph = 0): WeatherDto["disruptionRisk"] {
  if (windKph > 35) return "high";
  if (windKph > 20) return "medium";
  return "low";
}

export class FreeTierWeatherProvider implements WeatherProvider {
  async getWeatherByAirport(airportIata: string): Promise<WeatherDto> {
    const iata = airportIata.toUpperCase();
    const cacheKey = `weather:${iata}`;
    const cached = cache.get<WeatherDto>(cacheKey);
    if (cached) return cached;

    const seed = airportConditions[iata] ?? {
      summary: "Conditions unavailable, using fallback profile",
      temperatureC: 18,
      windKph: 12,
      visibilityKm: 9
    };

    const payload: WeatherDto = {
      airportIata: iata,
      summary: seed.summary ?? "Unknown",
      temperatureC: seed.temperatureC,
      windKph: seed.windKph,
      visibilityKm: seed.visibilityKm,
      disruptionRisk: riskForWind(seed.windKph),
      observedAt: new Date().toISOString()
    };
    cache.set(cacheKey, payload, 5 * 60_000);
    return payload;
  }
}
