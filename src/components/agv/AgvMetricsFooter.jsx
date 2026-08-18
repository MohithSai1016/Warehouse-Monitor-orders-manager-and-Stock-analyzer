import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Navigation, 
  Zap, 
  ShieldCheck, 
  Bot,
  AlertTriangle
} from 'lucide-react';

export function AgvMetricsFooter({ metrics }) {
  return (
    <div className="agv-metrics-bar">
      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#1e3a8a', color: '#60a5fa' }}>
          <Package size={16} />
        </div>
        <div>
          <small>ACTIVE MISSIONS</small>
          <strong>{metrics.activeMissions}</strong>
          <span>{metrics.itemsInTransit} units in transit</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#14382c', color: '#34d399' }}>
          <CheckCircle2 size={16} />
        </div>
        <div>
          <small>ITEMS DELIVERED</small>
          <strong>{metrics.itemsDelivered}</strong>
          <span style={{ color: '#34d399' }}>+100% On-Time SLA</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#2e1065', color: '#c084fc' }}>
          <Bot size={16} />
        </div>
        <div>
          <small>FLEET UTILIZATION</small>
          <strong>{metrics.fleetUtilization}%</strong>
          <span>{metrics.activeRobots} / {metrics.totalRobots} Robots Active</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#422006', color: '#fbbf24' }}>
          <Clock size={16} />
        </div>
        <div>
          <small>AVG PICK & TRANSIT</small>
          <strong>{metrics.avgTransitTime}s</strong>
          <span>2.4m/s Autonomous Speed</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#172554', color: '#38bdf8' }}>
          <Navigation size={16} />
        </div>
        <div>
          <small>DISTANCE TRAVELED</small>
          <strong>{metrics.totalDistanceKm} km</strong>
          <span>Corridor Optimized</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#3b0764', color: '#e879f9' }}>
          <ShieldCheck size={16} />
        </div>
        <div>
          <small>CONGESTION RESOLVED</small>
          <strong>{metrics.congestionEvents}</strong>
          <span>Autonomous Yielding</span>
        </div>
      </div>
    </div>
  );
}
