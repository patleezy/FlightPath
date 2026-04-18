import cors from "cors";
import express from "express";
import { createFlightsRouter } from "./routes/flights.js";
import { createAirportsRouter } from "./routes/airports.js";
import { createWeatherRouter } from "./routes/weather.js";
import { FreeTierFlightProvider } from "./providers/flight/FreeTierFlightProvider.js";
import { FreeTierWeatherProvider } from "./providers/weather/FreeTierWeatherProvider.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const requestWindowMs = 60_000;
const requestLimitPerWindow = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120);
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function setSecurityHeaders(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  next();
}

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + requestWindowMs });
    return next();
  }

  if (entry.count >= requestLimitPerWindow) {
    return res.status(429).json({ error: "Too many requests. Please retry shortly." });
  }

  entry.count += 1;
  requestCounts.set(ip, entry);
  return next();
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS policy."));
    },
    methods: ["GET"],
    optionsSuccessStatus: 204
  })
);
app.use(setSecurityHeaders);
app.use(rateLimiter);
app.use(express.json({ limit: "20kb" }));

const flightProvider = new FreeTierFlightProvider();
const weatherProvider = new FreeTierWeatherProvider();

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/flights", createFlightsRouter(flightProvider));
app.use("/api/airports", createAirportsRouter(flightProvider));
app.use("/api/weather", createWeatherRouter(weatherProvider));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Flight status backend listening on ${port}`);
  if (!process.env.AVIATIONSTACK_API_KEY) {
    // eslint-disable-next-line no-console
    console.log("AVIATIONSTACK_API_KEY not set; using fallback synthetic flight data.");
  }
});
