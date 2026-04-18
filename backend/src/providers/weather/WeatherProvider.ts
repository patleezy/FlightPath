import type { WeatherDto } from "../../types.js";

export interface WeatherProvider {
  getWeatherByAirport(airportIata: string): Promise<WeatherDto>;
}
