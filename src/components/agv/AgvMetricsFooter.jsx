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
        <div className="agv-metric-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
          <Package size={16} />
        </div>
        <div>
          <small>ACTIVE MISSIONS</small>
          <strong>{metrics.activeMissions}</strong>
          <span>{metrics.itemsInTransit} units in transit</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
          <CheckCircle2 size={16} />
        </div>
        <div>
          <small>ITEMS DELIVERED</small>
          <strong>{metrics.itemsDelivered}</strong>
          <span style={{ color: '#059669' }}>+100% On-Time SLA</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
          <Bot size={16} />
        </div>
        <div>
          <small>FLEET UTILIZATION</small>
          <strong>{metrics.fleetUtilization}%</strong>
          <span>{metrics.activeRobots} / {metrics.totalRobots} Robots Active</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
          <Clock size={16} />
        </div>
        <div>
          <small>AVG PICK & TRANSIT</small>
          <strong>{metrics.avgTransitTime}s</strong>
          <span>2.4m/s Autonomous Speed</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#F0F9FF', color: '#0284C7' }}>
          <Navigation size={16} />
        </div>
        <div>
          <small>DISTANCE TRAVELED</small>
          <strong>{metrics.totalDistanceKm} km</strong>
          <span>Corridor Optimized</span>
        </div>
      </div>

      <div className="agv-metric-card">
        <div className="agv-metric-icon" style={{ background: '#FDF2F8', color: '#DB2777' }}>
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
