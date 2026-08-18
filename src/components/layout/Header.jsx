import React from 'react';
import { useWms } from '../../context/WmsContext';
import { 
  Play, 
  Pause, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  LayoutDashboard, 
  PlusCircle, 
  CheckCircle2,
  Zap,
  Flame,
  MapPin,
  Building2
} from 'lucide-react';

export function Header() {
  const {
    selectedWarehouseId,
    activeLocation,
    warehouseLocations,
    switchWarehouse,
    role,
    setRole,
    viewMode,
    setViewMode,
    simulationActive,
    setSimulationActive,
    simulationSpeed,
    setSimulationSpeed,
    allocateAllPendingOrders,
    runRushHourSimulation,
    orders
  } = useWms();

  const pendingCount = orders.filter(o => o.status === 'CREATED' || o.status === 'SPLIT_HELD').length;

  return (
    <header>
      <div>
        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>SAI'S WAREHOUSE</span>
          <span>&bull;</span>
          <span style={{ color: '#a78bfa' }}>{activeLocation.name.toUpperCase()}</span>
          <span>&bull;</span>
          <span>{activeLocation.address}</span>
        </div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {role === 'PICKER' || viewMode === 'PICKER' 
            ? `Floor Picker Handheld Terminal (${activeLocation.city} Hub)` 
            : `Operations Command & Autonomous Decision Center`}
        </h1>
      </div>

      <div className="header-actions">
        {/* Hub Selector Pills */}
        <div style={{ display: 'flex', background: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          {warehouseLocations.map(loc => (
            <button
              key={loc.id}
              onClick={() => switchWarehouse(loc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: selectedWarehouseId === loc.id ? '#2563eb' : 'transparent',
                color: selectedWarehouseId === loc.id ? '#fff' : '#94a3b8',
                fontSize: '11px',
                fontWeight: selectedWarehouseId === loc.id ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              <MapPin size={11} color={selectedWarehouseId === loc.id ? '#fff' : '#64748b'} />
              {loc.city} Hub
            </button>
          ))}
        </div>
        {/* Role Toggle */}
        <div className="role-switcher">
          <button
            className={`role-btn ${role === 'MANAGER' && viewMode === 'MAP' ? 'active' : ''}`}
            onClick={() => {
              setRole('MANAGER');
              setViewMode('MAP');
            }}
          >
            <LayoutDashboard size={13} />
            2D Map
          </button>

          <button
            className={`role-btn ${viewMode === 'AGV_SIMULATION' ? 'active' : ''}`}
            style={viewMode === 'AGV_SIMULATION' ? { background: '#1e3a8a', color: '#60a5fa', fontWeight: 'bold' } : { color: '#38bdf8' }}
            onClick={() => {
              setRole('MANAGER');
              setViewMode('AGV_SIMULATION');
            }}
          >
            <Activity size={13} />
            3D AGV Fleet
          </button>

          <button
            className={`role-btn ${role === 'PICKER' || viewMode === 'PICKER' ? 'active' : ''}`}
            onClick={() => {
              setRole('PICKER');
              setViewMode('PICKER');
            }}
          >
            <Smartphone size={13} />
            Floor Picker
          </button>
        </div>

        {/* HIGH PRIORITY: RUN RUSH HOUR SIMULATION (15+ Orders) */}
        <button
          className="rush"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)',
            color: '#ffffff',
            fontWeight: '800'
          }}
          onClick={runRushHourSimulation}
          title="Inject 16+ mixed-priority orders, trigger cascade allocations, priority preemptions and dynamic waves"
        >
          <Flame size={15} />
          <span>RUN RUSH HOUR SIMULATION</span>
        </button>

        {/* Live Continuous Traffic Simulation Switch */}
        <button
          className={`rush secondary ${simulationActive ? 'on' : ''}`}
          onClick={() => setSimulationActive(!simulationActive)}
          title="Toggle continuous incoming orders & inventory events"
        >
          {simulationActive ? <Activity size={14} className="pulse" /> : <Play size={14} />}
          <span>{simulationActive ? 'Live Traffic: ACTIVE' : 'Simulate Traffic'}</span>
        </button>

        {/* Simulation Speed Control */}
        {simulationActive && (
          <div className="live" style={{ padding: '4px 8px' }}>
            <span style={{ fontSize: '9px', color: '#7e8ba3' }}>SPEED:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                style={{
                  background: simulationSpeed === spd ? '#7887ff' : 'transparent',
                  color: simulationSpeed === spd ? '#fff' : '#8c97ad',
                  border: 0,
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontFamily: 'DM Mono',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={() => setSimulationSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        )}

        {/* Batch Run Decision Engine */}
        <button
          className="rush"
          onClick={allocateAllPendingOrders}
          title="Run priority allocation & preemption engine across all pending orders"
        >
          <CheckCircle2 size={14} />
          <span>Run Decision Engine {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
        </button>
      </div>
    </header>
  );
}
