import React from 'react';
import { useWms } from '../../context/WmsContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrendingUp, AlertTriangle, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

const THROUGHPUT_DATA = [
  { time: '08:00', picks: 65, dispatched: 52 },
  { time: '10:00', picks: 110, dispatched: 98 },
  { time: '12:00', picks: 145, dispatched: 130 },
  { time: '14:00', picks: 190, dispatched: 175 },
  { time: '16:00', picks: 220, dispatched: 210 },
  { time: '18:00', picks: 175, dispatched: 182 },
  { time: '20:00', picks: 140, dispatched: 135 }
];

const PIE_COLORS = ['#6366F1', '#E99A45', '#52627A', '#10B981'];

export function AnalyticsView() {
  const { orders, bins, metrics, exceptions, activeLocation } = useWms();

  // Compute order tier distribution
  const vipCount = orders.filter(o => o.tier === 'VIP').length;
  const expressCount = orders.filter(o => o.tier === 'EXPRESS').length;
  const standardCount = orders.filter(o => o.tier === 'STANDARD').length;
  const bulkCount = orders.filter(o => o.tier === 'BULK').length;

  const pieData = [
    { name: 'VIP Priority', value: Math.max(1, vipCount) },
    { name: 'Express', value: Math.max(1, expressCount) },
    { name: 'Standard', value: Math.max(1, standardCount) },
    { name: 'Bulk Batch', value: Math.max(1, bulkCount) }
  ];

  return (
    <div className="analytics">
      {/* Chart 1: Pick & Dispatch Throughput */}
      <div className="panel chart-panel">
        <div className="panel-head">
          <div>
            <h2>
              Hourly Fulfillment Throughput ({activeLocation.city} Hub)
              <span>Live Picks vs Dispatches &bull; {activeLocation.district}</span>
            </h2>
          </div>
          <span className="trend-up" style={{ color: '#10B981', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
            +14.2% Peak Velocity
          </span>
        </div>

        <div style={{ height: '230px', padding: '0 10px 10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={THROUGHPUT_DATA}>
              <defs>
                <linearGradient id="picksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#17213A" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#17213A" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E99A45" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#E99A45" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#8A96A8" tick={{ fontSize: 10, fill: '#52627A' }} />
              <YAxis stroke="#8A96A8" tick={{ fontSize: 10, fill: '#52627A' }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#FFFFFF', 
                  borderColor: '#E1E6ED', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 14px rgba(23, 33, 58, 0.08)', 
                  fontSize: '11.5px',
                  color: '#17213A'
                }} 
              />
              <Area type="monotone" dataKey="picks" stroke="#17213A" fillOpacity={1} fill="url(#picksGrad)" strokeWidth={2} name="Units Picked" />
              <Area type="monotone" dataKey="dispatched" stroke="#E99A45" fillOpacity={1} fill="url(#dispGrad)" strokeWidth={2} name="Orders Dispatched" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Order Priority Breakdown */}
      <div className="panel chart-panel">
        <div className="panel-head">
          <div>
            <h2>
              Order Tier Distribution
              <span>SLA Allocation Weights</span>
            </h2>
          </div>
          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#6366F1', fontWeight: '700' }}>VIP First Rule</span>
        </div>

        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#FFFFFF', 
                  borderColor: '#E1E6ED', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 14px rgba(23, 33, 58, 0.08)', 
                  fontSize: '11.5px',
                  color: '#17213A'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pie-legend" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
          {pieData.map((item, idx) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#52627A' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[idx] }}></span>
              <span>{item.name}: <strong>{item.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
