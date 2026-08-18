import React from 'react';
import { useWms } from '../../context/WmsContext';
import { 
  Play, 
  Pause, 
  Activity, 
  Smartphone, 
  LayoutDashboard, 
  CheckCircle2,
  Flame,
  MapPin,
  Bot
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
    <header role="banner" aria-label="Warehouse Command Header">
      <div>
        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#E99A45', fontWeight: 'bold' }}>SAI'S WAREHOUSE</span>
          <span aria-hidden="true">&bull;</span>
          <span style={{ color: '#17213A', fontWeight: '600' }}>{activeLocation.name.toUpperCase()}</span>
          <span aria-hidden="true">&bull;</span>
          <span style={{ color: '#52627A' }}>{activeLocation.address}</span>
        </div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {role === 'PICKER' || viewMode === 'PICKER' 
            ? `Floor Picker Handheld Terminal (${activeLocation.city} Hub)` 
            : `Operations Command & Autonomous Decision Center`}
        </h1>
      </div>

      <div className="header-actions" role="toolbar" aria-label="Facility Operations Toolbar">
        {/* Hub Selector Pills */}
        <div 
          role="tablist" 
          aria-label="Select Warehouse Facility"
          style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #E1E6ED' }}
        >
          {warehouseLocations.map(loc => (
            <button
              key={loc.id}
              role="tab"
              aria-selected={selectedWarehouseId === loc.id}
              aria-label={`Switch to ${loc.name} in ${loc.city}`}
              onClick={() => switchWarehouse(loc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedWarehouseId === loc.id ? '#17213A' : 'transparent',
                color: selectedWarehouseId === loc.id ? '#FFFFFF' : '#52627A',
                fontSize: '11px',
                fontWeight: selectedWarehouseId === loc.id ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <MapPin size={11} color={selectedWarehouseId === loc.id ? '#E99A45' : '#64748B'} aria-hidden="true" />
              {loc.city} Hub
            </button>
          ))}
        </div>

        {/* Role Toggle */}
        <div className="role-switcher" role="group" aria-label="Perspective and View Mode Selector">
          <button
            className={`role-btn ${role === 'MANAGER' && viewMode === 'MAP' ? 'active' : ''}`}
            aria-pressed={role === 'MANAGER' && viewMode === 'MAP'}
            aria-label="Switch to 2D Warehouse Floor Map"
            onClick={() => {
              setRole('MANAGER');
              setViewMode('MAP');
            }}
          >
            <LayoutDashboard size={13} aria-hidden="true" />
            2D Map
          </button>

          <button
            className={`role-btn ${viewMode === 'AGV_SIMULATION' ? 'active' : ''}`}
            aria-pressed={viewMode === 'AGV_SIMULATION'}
            aria-label="Switch to 3D Autonomous Mobile Robot Simulation View"
            onClick={() => {
              setRole('MANAGER');
              setViewMode('AGV_SIMULATION');
            }}
          >
            <Bot size={13} aria-hidden="true" />
            3D AGV Fleet
          </button>

          <button
            className={`role-btn ${role === 'PICKER' || viewMode === 'PICKER' ? 'active' : ''}`}
            aria-pressed={role === 'PICKER' || viewMode === 'PICKER'}
            aria-label="Switch to Floor Picker Terminal View"
            onClick={() => {
              setRole('PICKER');
              setViewMode('PICKER');
            }}
          >
            <Smartphone size={13} aria-hidden="true" />
            Floor Picker
          </button>
        </div>

        {/* HIGH PRIORITY: RUN RUSH HOUR SIMULATION */}
        <button
          className="rush"
          style={{
            background: 'linear-gradient(135deg, #E99A45, #D98835)',
            boxShadow: '0 4px 14px rgba(233, 154, 69, 0.35)',
            color: '#ffffff',
            fontWeight: '800'
          }}
          onClick={runRushHourSimulation}
          aria-label="Run Rush Hour Simulation with 16+ mixed priority orders and dynamic waves"
          title="Inject 16+ mixed-priority orders, trigger cascade allocations, priority preemptions and dynamic waves"
        >
          <Flame size={15} aria-hidden="true" />
          <span>RUN RUSH HOUR SIMULATION</span>
        </button>

        {/* Live Continuous Traffic Simulation Switch */}
        <button
          className={`rush secondary ${simulationActive ? 'on' : ''}`}
          onClick={() => setSimulationActive(!simulationActive)}
          aria-pressed={simulationActive}
          aria-label={simulationActive ? 'Pause continuous traffic simulation' : 'Start continuous live traffic simulation'}
          title="Toggle continuous incoming orders & inventory events"
        >
          {simulationActive ? <Activity size={14} className="pulse" aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          <span>{simulationActive ? 'Live Traffic: ACTIVE' : 'Simulate Traffic'}</span>
        </button>

        {/* Simulation Speed Control */}
        {simulationActive && (
          <div className="live" style={{ padding: '4px 8px' }} role="group" aria-label="Simulation Speed Controls">
            <span style={{ fontSize: '9px', color: '#52627A' }} id="sim-speed-label">SPEED:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                aria-label={`Set simulation speed to ${spd}x`}
                aria-pressed={simulationSpeed === spd}
                style={{
                  background: simulationSpeed === spd ? '#17213A' : 'transparent',
                  color: simulationSpeed === spd ? '#FFFFFF' : '#52627A',
                  border: 0,
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontFamily: 'DM Mono, monospace',
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
          style={{ background: '#17213A', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(23, 33, 58, 0.2)' }}
          onClick={allocateAllPendingOrders}
          aria-label={`Run Autonomous Decision Engine. ${pendingCount} pending orders`}
          title="Run priority allocation & preemption engine across all pending orders"
        >
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>Run Decision Engine {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
        </button>
      </div>
    </header>
  );
}
