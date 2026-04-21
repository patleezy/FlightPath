import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getAirportBoard, getAirportWeather } from "../lib/apiClient";
import { formatTime } from "../lib/time";

export function AirportBoardPage() {
  const params = useParams<{ iata: string }>();
  const iata = (params.iata ?? "SFO").toUpperCase();

  const boardQuery = useQuery({
    queryKey: ["airport-board", iata],
    queryFn: () => getAirportBoard(iata),
    refetchInterval: 60000
  });

  const weatherQuery = useQuery({
    queryKey: ["airport-weather", iata],
    queryFn: () => getAirportWeather(iata),
    refetchInterval: 600000
  });

  if (boardQuery.isLoading) return <p>Loading airport board...</p>;
  if (boardQuery.isError || !boardQuery.data) return <p>Unable to load board.</p>;

  return (
    <div className="stack">
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
        <button onClick={() => window.history.back()} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600}}>
          ← Back
        </button>
      </div>
      
      <section className="card" style={{position: 'relative', overflow: 'hidden', padding: '2rem'}}>
        <div style={{position: 'absolute', top: 0, right: 0, opacity: 0.05, fontSize: '10rem', lineHeight: 1, transform: 'translate(20%, -20%)'}}>✈</div>
        <h1 style={{fontSize: '3rem', margin: '0 0 0.5rem'}}>{iata}</h1>
        <div style={{color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600}}>Flight Board</div>
        
        {weatherQuery.data && (
          <div style={{marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{fontSize: '2.5rem'}}>{weatherQuery.data.summary.toLowerCase().includes('rain') ? '🌧️' : weatherQuery.data.summary.toLowerCase().includes('cloud') ? '☁️' : '☀️'}</div>
            <div>
              <div style={{fontSize: '1.5rem', fontWeight: 700}}>
                {weatherQuery.data.temperatureC}°C <span style={{color: 'var(--muted)', fontWeight: 400, fontSize: '1.25rem'}}>({Math.round((weatherQuery.data.temperatureC * 9/5) + 32)}°F)</span>
              </div>
              <div style={{fontSize: '0.85rem', color: 'var(--muted)'}}>{weatherQuery.data.summary}</div>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="section-header" style={{marginTop: '2rem'}}>
          <div>
            <h2>Departures</h2>
            <div className="section-subtitle">OUTBOUND</div>
          </div>
        </div>
        <div className="stack" style={{gap: '0.5rem'}}>
          {boardQuery.data.departures.length === 0 ? <p className="muted" style={{padding: '1rem', textAlign: 'center'}}>No outbound flights found.</p> : null}
          {boardQuery.data.departures.map((item) => (
            <div key={item.id} className="card" style={{display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--surface-raised)'}}>
              <div style={{minWidth: '80px'}}>
                <div style={{fontSize: '1.25rem', fontWeight: 700}}>{formatTime(item.estimatedTime ?? item.scheduledTime)}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase'}}>{item.status}</div>
              </div>
              <div style={{flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '1rem'}}>
                <div style={{fontSize: '1.25rem', fontWeight: 600}}>{item.destinationOrOrigin}</div>
                <div style={{color: 'var(--muted)', fontSize: '0.85rem'}}>{item.flightNumber}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header" style={{marginTop: '2rem'}}>
          <div>
            <h2>Arrivals</h2>
            <div className="section-subtitle">INBOUND</div>
          </div>
        </div>
        <div className="stack" style={{gap: '0.5rem'}}>
          {boardQuery.data.arrivals.length === 0 ? <p className="muted" style={{padding: '1rem', textAlign: 'center'}}>No inbound flights found.</p> : null}
          {boardQuery.data.arrivals.map((item) => (
            <div key={item.id} className="card" style={{display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--surface-raised)'}}>
              <div style={{minWidth: '80px'}}>
                <div style={{fontSize: '1.25rem', fontWeight: 700}}>{formatTime(item.estimatedTime ?? item.scheduledTime)}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase'}}>{item.status}</div>
              </div>
              <div style={{flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '1rem'}}>
                <div style={{fontSize: '1.25rem', fontWeight: 600}}>{item.destinationOrOrigin}</div>
                <div style={{color: 'var(--muted)', fontSize: '0.85rem'}}>{item.flightNumber}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
