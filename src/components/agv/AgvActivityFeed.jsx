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
    <div className="agv-panel-card" style={{ marginTop: '14px' }}>
      <div className="agv-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} className="pulse" color="#34d399" />
          <b>LIVE AGV EVENT AUDIT STREAM</b>
        </div>
        <small style={{ color: '#64748b' }}>Real-Time Fleet Actions</small>
      </div>

      <div className="agv-event-scroll">
        {events.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
            No recent robot events. Start the simulation to watch autonomous actions.
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="agv-event-item">
              <div className="agv-event-icon-wrap">
                {getEventIcon(event.type)}
              </div>
              <div className="agv-event-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ color: '#e2e8f0', fontSize: '11px' }}>{event.robotId}</b>
                  <span className="agv-event-time">{event.time}</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.4 }}>
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
