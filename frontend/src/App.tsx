import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { FlightDetailPage } from "./pages/FlightDetailPage";
import { AirportBoardPage } from "./pages/AirportBoardPage";
import { MyTripsPage } from "./pages/MyTripsPage";

type Theme = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const persisted = localStorage.getItem("flight_theme");
    if (persisted === "light" || persisted === "dark") return persisted;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const location = useLocation();

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
        <button className="menu-button" aria-label="Menu">
          ☰
        </button>
        <Link to="/" className="brand">
          <span className="brand-icon">✈</span> FlightPath
        </Link>
        <div 
          className="profile-avatar" 
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          style={{ cursor: 'pointer' }}
          aria-label="Toggle theme"
        >
          {/* Placeholder for user avatar, clicking toggles theme for now */}
          <div style={{width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--primary-strong))'}}></div>
        </div>
      </header>

      <main id="main-content" className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="/flight/:id" element={<FlightDetailPage />} />
          <Route path="/airport/:iata" element={<AirportBoardPage />} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <span className="nav-icon">🔍</span>
          Search
        </Link>
        <Link to="/trips" className={`nav-item ${location.pathname.startsWith('/trips') ? 'active' : ''}`}>
          <span className="nav-icon">🧳</span>
          Trips
        </Link>
        <Link to="/alerts" className={`nav-item ${location.pathname.startsWith('/alerts') ? 'active' : ''}`}>
          <span className="nav-icon">🔔</span>
          Alerts
        </Link>
        <Link to="/account" className={`nav-item ${location.pathname.startsWith('/account') ? 'active' : ''}`}>
          <span className="nav-icon">👤</span>
          Account
        </Link>
      </nav>
    </div>
  );
}
