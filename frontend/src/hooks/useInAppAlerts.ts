import { useEffect, useState } from "react";
import type { FlightDetail } from "../types/flight";
import { markStatusSeen, shouldNotifyStatusChange } from "../lib/localStore";

export function useInAppAlerts(flights: FlightDetail[]) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    flights.forEach((flight) => {
      if (shouldNotifyStatusChange(flight)) {
        setMessages((prev) => [
          `${flight.flightNumber} changed to ${flight.status.toUpperCase()}`,
          ...prev
        ]);
      }
      markStatusSeen(flight);
    });
  }, [flights]);

  return {
    messages,
    dismissMessage: (index: number) =>
      setMessages((prev) => prev.filter((_, current) => current !== index))
  };
}
