import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { FlightDetailPage } from "./pages/FlightDetailPage";
import { AirportBoardPage } from "./pages/AirportBoardPage";

type Theme = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const persisted = localStorage.getItem("flight_theme");
    if (persisted === "light" || persisted === "dark") return persisted;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("flight_theme", theme);
  }, [theme]);

  return (
    <div className="app">
      <a href="#main-content" className="skipLink">
        Skip to main content
      </a>
      <header className="topBar">
        <Link to="/" className="brand">
          FlightPath
        </Link>
        <button
          type="button"
          className="themeToggle"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </header>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flight/:id" element={<FlightDetailPage />} />
          <Route path="/airport/:iata" element={<AirportBoardPage />} />
        </Routes>
      </main>
    </div>
  );
}
