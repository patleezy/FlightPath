import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { FlightDetail } from "../types/flight";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface Props {
  flight: FlightDetail;
}

const fallbackCenter: [number, number] = [39.8283, -98.5795];
const flightMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export function FlightMap({ flight }: Props) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const explicitTheme = document.documentElement.getAttribute("data-theme");
    if (explicitTheme === "dark") return true;
    if (explicitTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const explicitTheme = document.documentElement.getAttribute("data-theme");
      if (explicitTheme === "dark") setIsDarkMode(true);
      if (explicitTheme === "light") setIsDarkMode(false);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  const position = flight.position;
  const center: [number, number] = position
    ? [position.lat, position.lon]
    : fallbackCenter;

  return (
    <section className="card">
      <h2>Live Map</h2>
      <div className="mapShell">
        <MapContainer center={center} zoom={position ? 6 : 4} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url={
              isDarkMode
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />
          {position ? (
            <Marker position={[position.lat, position.lon]} icon={flightMarkerIcon}>
              <Popup>{flight.flightNumber} current position</Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
      {!position ? <p className="muted">Position unavailable; showing fallback view.</p> : null}
    </section>
  );
}
