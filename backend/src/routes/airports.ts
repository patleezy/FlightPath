import { Router } from "express";
import type { FlightProvider } from "../providers/flight/FlightProvider.js";

export function createAirportsRouter(provider: FlightProvider): Router {
  const router = Router();

  router.get("/:iata/board", async (req, res) => {
    try {
      const payload = await provider.getAirportBoard(req.params.iata);
      return res.json(payload);
    } catch (error) {
      return res.status(502).json({
        error: "Airport board unavailable.",
        detail: error instanceof Error ? error.message : "Unknown provider error"
      });
    }
  });

  return router;
}
