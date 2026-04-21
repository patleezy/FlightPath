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

    let summary = "Conditions unavailable";
    let temperatureC = 18;
    let windKph = 12;
    let visibilityKm = 10;

    try {
      // For US airports, NWS usually uses K + IATA (e.g. KSFO, KJFK)
      const station = iata.length === 3 ? `K${iata}` : iata;
      const response = await fetch(`https://api.weather.gov/stations/${station}/observations/latest`, {
        headers: {
          "User-Agent": "FlightPath/1.0"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const props = data.properties;
        if (props) {
          summary = props.textDescription || summary;
          if (props.temperature?.value !== null) temperatureC = props.temperature.value;
          if (props.windSpeed?.value !== null) windKph = props.windSpeed.value;
          if (props.visibility?.value !== null) visibilityKm = Math.round(props.visibility.value / 1000);
        }
      }
    } catch (e) {
      console.error(`Failed to fetch weather for ${iata}`, e);
    }

    const payload: WeatherDto = {
      airportIata: iata,
      summary,
      temperatureC: Math.round(temperatureC),
      windKph: Math.round(windKph),
      visibilityKm: Math.round(visibilityKm),
      disruptionRisk: riskForWind(windKph),
      observedAt: new Date().toISOString()
    };
    cache.set(cacheKey, payload, 5 * 60_000);
    return payload;
  }
}
