import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  Navigation, 
  Layers, 
  ArrowRightLeft, 
  Truck,
  Filter
} from 'lucide-react';

export function ExceptionStream() {
  const { exceptions } = useWms();
  const [filterType, setFilterType] = useState('ALL');

  const filtered = exceptions.filter(ex => {
    if (filterType === 'ALL') return true;
    return ex.type === filterType;
  });

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '14:22:01';
    }
  };

  return (
    <div className="panel log-panel">
      <div className="panel-head">
        <div>
          <h2>
            Autonomous Decision & Exception Stream
            <span>{exceptions.length} Active System Events</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterType === 'VIP_AUTO_DISPATCH' ? 'active' : ''}`}
            style={filterType === 'VIP_AUTO_DISPATCH' ? { background: '#581c87', color: '#f3e8ff' } : { color: '#c084fc' }}
            onClick={() => setFilterType('VIP_AUTO_DISPATCH')}
          >
            🚀 VIP Auto-Ships
          </button>
          <button
            className={`filter-btn ${filterType === 'VIP_PREEMPTION' ? 'active' : ''}`}
            onClick={() => setFilterType('VIP_PREEMPTION')}
          >
            Preemptions
          </button>
          <button
            className={`filter-btn ${filterType === 'SAFETY_STOCK_REORDER' ? 'active' : ''}`}
            onClick={() => setFilterType('SAFETY_STOCK_REORDER')}
          >
            Reorders
          </button>
          <button
            className={`filter-btn ${filterType === 'STOCK_DAMAGE' ? 'active' : ''}`}
            onClick={() => setFilterType('STOCK_DAMAGE')}
          >
            Damage
          </button>
        </div>
      </div>

      <div className="log-scroll">
        {filtered.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#7a859b', fontSize: '11px' }}>
            No exceptions recorded in this category. System operating with zero conflicts.
          </div>
        ) : (
          filtered.map((ex, idx) => {
            let icon = <Layers size={13} className="purple" />;
            if (ex.type === 'VIP_AUTO_DISPATCH') icon = <Zap size={13} color="#f43f5e" />;
            else if (ex.type === 'VIP_PREEMPTION') icon = <Zap size={13} color="#c5adff" />;
            else if (ex.type === 'SAFETY_STOCK_REORDER') icon = <ShieldAlert size={13} color="#e9af47" />;
            else if (ex.type === 'STOCK_DAMAGE') icon = <AlertTriangle size={13} color="#e15b62" />;
            else if (ex.type === 'ROUTE_OPTIMIZATION') icon = <Navigation size={13} color="#7988ff" />;
            else if (ex.type === 'INBOUND_DELIVERY') icon = <Truck size={13} color="#36c999" />;
            else if (ex.type === 'STOCK_TRANSFER') icon = <ArrowRightLeft size={13} color="#94a0ff" />;

            return (
              <div key={`${ex.id || 'ex'}-${idx}`} className="log">
                <span>{formatTime(ex.timestamp)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {icon}
                    <b>{ex.title}</b>
                    {ex.sku && <code>{ex.sku}</code>}
                    {ex.orderId && <code style={{ color: '#c5adff' }}>#{ex.orderId}</code>}
                  </div>
                  <p>{ex.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
