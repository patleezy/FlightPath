import type { AirportBoardDto, FlightDetailDto } from "../../types.js";

export interface FlightProvider {
  getFlightById(id: string): Promise<FlightDetailDto>;
  searchFlight(flightNumber: string, date: string): Promise<FlightDetailDto>;
  getAirportBoard(airportIata: string): Promise<AirportBoardDto>;
}
