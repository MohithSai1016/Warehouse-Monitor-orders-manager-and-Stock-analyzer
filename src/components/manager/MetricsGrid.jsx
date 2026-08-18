import React from 'react';
import { useWms } from '../../context/WmsContext';
import { Zap, AlertTriangle, CheckCircle2, Navigation, TrendingUp, ShieldAlert, PackageCheck } from 'lucide-react';

export function MetricsGrid() {
  const { metrics, exceptions, orders, bins, activeLocation } = useWms();

  const totalReserved = Object.values(bins).reduce((sum, b) => sum + (b.reserved || 0), 0);
  const totalStock = Object.values(bins).reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="metrics">
      {/* Metric 1: SLA Fulfillment */}
      <div className="metric">
        <div className="metric-icon green">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <small>{activeLocation.city.toUpperCase()} SLA COMPLIANCE</small>
          <strong>{metrics.fulfillmentSla}</strong>
          <span>{activeLocation.district}</span>
        </div>
      </div>

      {/* Metric 2: Active Waves & Queue */}
      <div className="metric">
        <div className="metric-icon">
          <PackageCheck size={18} />
        </div>
        <div>
          <small>ACTIVE PICK WAVES</small>
          <strong>{metrics.activeWavesCount}</strong>
          <em>{totalReserved} items currently reserved</em>
        </div>
      </div>

      {/* Metric 3: Low Stock & Damaged Risk */}
      <div className="metric">
        <div className={`metric-icon ${metrics.lowStockBinsCount > 0 ? 'warn' : ''}`}>
          <ShieldAlert size={18} />
        </div>
        <div>
          <small>SAFETY STOCK AT RISK</small>
          <strong>{metrics.lowStockBinsCount} Bins</strong>
          <span className="warn-text">{metrics.damagedBinsCount} damaged units quarantined</span>
        </div>
      </div>

      {/* Metric 4: Decision Engine Preemptions & Distance Saved */}
      <div className="metric">
        <div className="metric-icon" style={{ background: '#2f2452', color: '#c5adff' }}>
          <Zap size={18} />
        </div>
        <div>
          <small>VIP PREEMPTIONS & TSP</small>
          <strong>{metrics.preemptionsCount} Preempts</strong>
          <span style={{ color: '#8290ff' }}>{metrics.distanceSavedMeters}m walk distance saved</span>
        </div>
      </div>
    </div>
  );
}
