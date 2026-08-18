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

const PIE_COLORS = ['#c5adff', '#ffc16b', '#7988ff', '#36c999'];

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
          <span className="trend-up">+14.2% Peak Velocity</span>
        </div>

        <div style={{ height: '230px', padding: '0 10px 10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={THROUGHPUT_DATA}>
              <defs>
                <linearGradient id="picksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7887ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7887ff" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36c999" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#36c999" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#54607a" tick={{ fontSize: 10 }} />
              <YAxis stroke="#54607a" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ background: '#131929', borderColor: '#2b3652', borderRadius: '8px', fontSize: '11px' }} 
              />
              <Area type="monotone" dataKey="picks" stroke="#7887ff" fillOpacity={1} fill="url(#picksGrad)" strokeWidth={2} name="Units Picked" />
              <Area type="monotone" dataKey="dispatched" stroke="#36c999" fillOpacity={1} fill="url(#dispGrad)" strokeWidth={2} name="Orders Dispatched" />
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
          <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: '#c5adff' }}>VIP First Rule</span>
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
                contentStyle={{ background: '#131929', borderColor: '#2b3652', borderRadius: '8px', fontSize: '11px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pie-legend">
          <span><i style={{ background: '#c5adff' }}></i> VIP: <b>{vipCount}</b></span>
          <span><i style={{ background: '#ffc16b' }}></i> Express: <b>{expressCount}</b></span>
          <span><i style={{ background: '#7988ff' }}></i> Standard: <b>{standardCount}</b></span>
          <span><i style={{ background: '#36c999' }}></i> Bulk: <b>{bulkCount}</b></span>
        </div>
      </div>

      {/* Section 3: Zone Utilization & Safety Buffer Status */}
      <div className="panel bars">
        <div className="panel-head">
          <div>
            <h2>
              Physical Storage Capacity by Zone
              <span>Current vs Maximum Capacity</span>
            </h2>
          </div>
        </div>

        <div className="bar-row">
          <span>Zone A (Fast)</span>
          <div><i style={{ width: '78%' }}></i></div>
          <b>78%</b>
        </div>

        <div className="bar-row">
          <span>Zone B (Optics)</span>
          <div><i style={{ width: '62%' }}></i></div>
          <b>62%</b>
        </div>

        <div className="bar-row">
          <span>Zone C (Heavy)</span>
          <div><i style={{ width: '85%', background: '#e9af47' }}></i></div>
          <b>85%</b>
        </div>

        <div className="bar-row">
          <span>Zone D (Cold)</span>
          <div><i style={{ width: '44%', background: '#6ee6e6' }}></i></div>
          <b>44%</b>
        </div>

        <div className="alert">
          <Zap size={16} />
          <div>
            <b>Decision Engine Optimization Active:</b> System has autonomously resolved {metrics.preemptionsCount} stock allocation conflicts and shaved {metrics.distanceSavedMeters} meters off picker routes using 2-Opt TSP path planning.
          </div>
        </div>
      </div>
    </div>
  );
}
