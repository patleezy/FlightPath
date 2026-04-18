import { Router } from "express";
import type { WeatherProvider } from "../providers/weather/WeatherProvider.js";

export function createWeatherRouter(provider: WeatherProvider): Router {
  const router = Router();

  router.get("/:iata", async (req, res) => {
    try {
      const payload = await provider.getWeatherByAirport(req.params.iata);
      return res.json(payload);
    } catch (error) {
      return res.status(502).json({
        error: "Weather data unavailable.",
        detail: error instanceof Error ? error.message : "Unknown provider error"
      });
    }
  });

  return router;
}
