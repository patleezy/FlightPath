import { Link } from "react-router-dom";

export function MyTripsPage() {
  return (
    <div className="stack">
      <div style={{marginBottom: '1rem'}}>
        <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem'}}>Flight Deck Status</div>
        <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>My Trips</h1>
        <p className="muted" style={{fontSize: '0.95rem'}}>Commander, you have 2 active flight paths and 14 archived journeys in your log.</p>
      </div>

      <div className="card" style={{position: 'relative', overflow: 'hidden'}}>
        <div style={{display: 'inline-block', background: 'var(--surface-raised)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--muted)'}}>
          <span style={{color: 'var(--primary)', marginRight: '0.5rem'}}>●</span>
          EN ROUTE
        </div>
        <div style={{position: 'absolute', top: '1.25rem', right: '1.25rem', textAlign: 'right'}}>
          <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Flight ID</div>
          <div style={{fontWeight: 600, color: 'var(--primary)'}}>FP-4022</div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 700}}>LHR</div>
          <div style={{color: 'var(--primary)', fontSize: '1.5rem'}}>🛫</div>
          <div style={{fontSize: '2.5rem', fontWeight: 700}}>JFK</div>
        </div>

        <div style={{height: '4px', background: 'var(--surface-raised)', borderRadius: '2px', marginBottom: '1.5rem', position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: '100%', width: '65%', background: 'var(--primary)', borderRadius: '2px'}}></div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem'}}>Arrival Est.</div>
            <div style={{fontSize: '1.25rem', fontWeight: 700}}>14:45 <span style={{fontSize: '0.85rem', fontWeight: 400, color: 'var(--muted)'}}>EDT</span></div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem'}}>Gate</div>
            <div style={{fontSize: '1.25rem', fontWeight: 700}}>B-22</div>
          </div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', marginBottom: '1rem'}}>
        <h2 style={{margin: 0}}>Upcoming</h2>
        <button style={{background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600}}>Calendar View</button>
      </div>

      <div className="card" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
        <div style={{width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
          🧳
        </div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem'}}>Tokyo Expedition</div>
          <div style={{fontSize: '0.85rem', color: 'var(--muted)'}}>October 24 - 31, 2024</div>
        </div>
        <div style={{color: 'var(--muted)'}}>›</div>
      </div>

      <div className="card" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
        <div style={{width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
          ⛰️
        </div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem'}}>Swiss Alps Retreat</div>
          <div style={{fontSize: '0.85rem', color: 'var(--muted)'}}>December 12 - 19, 2024</div>
        </div>
        <div style={{color: 'var(--muted)'}}>›</div>
      </div>
      
      <div style={{marginTop: '1rem', marginBottom: '1rem'}}>
        <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem'}}>Annual Flight Metrics</div>
        <div className="grid-2">
          <div className="card">
            <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🌍</div>
            <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem'}}>42.4k</div>
            <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Air Miles</div>
          </div>
          <div className="card">
            <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⏱️</div>
            <div style={{fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem'}}>118h</div>
            <div style={{fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Flight Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
