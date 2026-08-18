import React from 'react';
import { 
  Bot, 
  Package, 
  CheckCircle2, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Radio 
} from 'lucide-react';

export function AgvActivityFeed({ events }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'DELIVERY': return <CheckCircle2 size={13} color="#34d399" />;
      case 'PICK': return <Package size={13} color="#c084fc" />;
      case 'CHARGE': return <Zap size={13} color="#38bdf8" />;
      case 'CONGESTION': return <AlertTriangle size={13} color="#fbbf24" />;
      case 'ASSIGNMENT': return <Bot size={13} color="#60a5fa" />;
      default: return <Clock size={13} color="#94a3b8" />;
    }
  };

  return (
    <div className="agv-panel-card" style={{ marginTop: '14px', background: '#FFFFFF', border: '1px solid #E1E6ED', borderRadius: '14px', padding: '16px', boxShadow: 'var(--shadow-card)' }}>
      <div className="agv-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} className="pulse" color="#059669" />
          <b style={{ color: '#17213A', fontSize: '12px' }}>LIVE AGV EVENT AUDIT STREAM</b>
        </div>
        <small style={{ color: '#52627A', fontSize: '11px' }}>Real-Time Fleet Actions</small>
      </div>

      <div className="agv-event-scroll" style={{ maxHeight: '240px', overflowY: 'auto' }}>
        {events.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#52627A', fontSize: '11px' }}>
            No recent robot events. Start the simulation to watch autonomous actions.
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="agv-event-item" style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div className="agv-event-icon-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: '#F8FAFC' }}>
                {getEventIcon(event.type)}
              </div>
              <div className="agv-event-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ color: '#17213A', fontSize: '11.5px' }}>{event.robotId}</b>
                  <span className="agv-event-time" style={{ fontSize: '10px', color: '#52627A', fontFamily: 'DM Mono, monospace' }}>{event.time}</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#52627A', lineHeight: 1.4 }}>
                  {event.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
