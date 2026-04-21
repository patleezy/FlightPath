import { useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { getFlightDetail } from "../lib/apiClient";
import { formatTime, relativeTime } from "../lib/time";
import { saveTrackedFlight } from "../lib/localStore";

export function FlightDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = params.id ?? "";

  const exportRef = useRef<HTMLElement>(null);
  const query = useQuery({
    queryKey: ["flight-detail", id],
    queryFn: () => getFlightDetail(id),
    refetchInterval: 45000
  });

  const flight = query.data;

  if (query.isLoading) return <div className="stack" style={{padding: '2rem', textAlign: 'center'}}>Loading flight telemetry...</div>;
  if (query.isError || !flight) return <div className="stack" style={{padding: '2rem', textAlign: 'center'}}>Unable to load flight details.</div>;

  const f = flight;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  return (
    <div className="stack" ref={exportRef}>
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
        <button onClick={() => navigate(-1)} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600}}>
          ← Back
        </button>
      </div>

      <div className="card" style={{textAlign: 'center', position: 'relative'}}>
        <div style={{display: 'inline-block', background: 'var(--surface-raised)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--muted)'}}>
          <span style={{color: 'var(--primary)', marginRight: '0.5rem'}}>●</span>
          {f.status === 'landed' ? 'ARRIVED' : f.status === 'departed' ? `IN-AIR • LEVEL ${Math.floor((f.position?.altitudeFt || 35000)/100)}` : 'SCHEDULED'}
        </div>
        
        <h1 style={{fontSize: '3rem', margin: '0 0 0.5rem'}}>{f.flightNumber}</h1>
        <div style={{color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem'}}>
          {f.departure.iata} TO {f.arrival.iata} • {f.airline}
        </div>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
          <div>
            <div style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem'}}>{formatTime(f.departureTimes.estimated || f.departureTimes.scheduled)}</div>
            <div style={{fontSize: '1.25rem', fontWeight: 600}}>{f.departure.iata}</div>
            <div className="muted" style={{fontSize: '0.85rem'}}>{f.departure.name || "Airport"}, Terminal {f.departure.terminal || "1"}</div>
          </div>
          <div style={{background: 'var(--surface-raised)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600}}>
            ON TIME
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0'}}>
          <div style={{flex: 1, height: '2px', background: 'var(--surface-raised)', position: 'relative'}}>
            <div style={{position: 'absolute', top: 0, left: 0, height: '100%', width: f.status === 'departed' ? '60%' : f.status === 'landed' ? '100%' : '0%', background: 'var(--primary)'}}></div>
            <div style={{position: 'absolute', left: f.status === 'departed' ? '60%' : f.status === 'landed' ? '100%' : '0%', top: '50%', transform: 'translate(-50%, -50%)', background: 'var(--primary)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
              ✈
            </div>
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem'}}>{formatTime(f.arrivalTimes.estimated || f.arrivalTimes.scheduled)}</div>
            <div style={{fontSize: '1.25rem', fontWeight: 600}}>{f.arrival.iata}</div>
            <div className="muted" style={{fontSize: '0.85rem'}}>{f.arrival.name || "Airport"}, Terminal {f.arrival.terminal || "4"}</div>
          </div>
          <div style={{fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem'}}>
            EST
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem'}}>
          <span style={{color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem'}}>🚪</span>
          <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem'}}>Gate</div>
          <div style={{fontSize: '2rem', fontWeight: 700}}>B42</div>
        </div>
        <div className="card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem'}}>
          <span style={{color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem'}}>🧳</span>
          <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem'}}>Carousel</div>
          <div style={{fontSize: '2rem', fontWeight: 700}}>09</div>
        </div>
      </div>

      <div className="card" style={{background: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.25rem'}}>
            💺
          </div>
          <div>
            <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Your Seat</div>
            <div style={{fontSize: '1.5rem', fontWeight: 700}}>12A</div>
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Class</div>
          <div style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)'}}>Business</div>
        </div>
      </div>

      <div style={{marginTop: '1rem'}}>
        <h3 style={{fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem'}}>Destination Weather</h3>
        <div className="card" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{fontSize: '2.5rem'}}>🌧️</div>
            <div>
              <div style={{fontSize: '1.5rem', fontWeight: 700}}>18°C</div>
              <div style={{fontSize: '0.85rem', color: 'var(--muted)'}}>Light Rain Expected</div>
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Visibility</div>
            <div style={{fontSize: '1rem', fontWeight: 600}}>Good • 12km</div>
          </div>
        </div>
      </div>
      
      <div style={{marginTop: '2rem'}}>
        <button 
          className="primary-btn"
          onClick={() => {
            saveTrackedFlight({
              id: f.id,
              flightNumber: f.flightNumber,
              date: new Date().toISOString().slice(0, 10),
              addedAt: new Date().toISOString()
            });
            alert("Flight tracked successfully!");
          }}
        >
          Track Flight
        </button>
      </div>
    </div>
  );
}
