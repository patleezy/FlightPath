import { Router } from "express";
import { z } from "zod";
import type { FlightProvider } from "../providers/flight/FlightProvider.js";

const searchQuery = z.object({
  flightNumber: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export function createFlightsRouter(provider: FlightProvider): Router {
  const router = Router();

  router.get("/search", async (req, res) => {
    try {
      const parsed = searchQuery.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid flight search query." });
      }
      const { flightNumber, date } = parsed.data;
      const payload = await provider.searchFlight(flightNumber, date);
      return res.json(payload);
    } catch (error) {
      return res.status(502).json({
        error: "Flight provider unavailable.",
        detail: error instanceof Error ? error.message : "Unknown provider error"
      });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const payload = await provider.getFlightById(req.params.id);
      return res.json(payload);
    } catch (error) {
      return res.status(502).json({
        error: "Flight detail unavailable.",
        detail: error instanceof Error ? error.message : "Unknown provider error"
      });
    }
  });

  return router;
}
