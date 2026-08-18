import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Battery, 
  BatteryCharging, 
  Navigation, 
  Layers, 
  Activity, 
  Flame, 
  Eye, 
  ShieldCheck, 
  AlertTriangle,
  Bot,
  Box,
  Sliders,
  Send,
  X
} from 'lucide-react';

export function AgvFleetPanel({
  fleet,
  selectedAgvId,
  onSelectAgv,
  simRunning,
  onToggleSim,
  onResetSim,
  simSpeed,
  onChangeSpeed,
  onTriggerRush,
  showPaths,
  setShowPaths,
  showHeatmap,
  setShowHeatmap,
  heatmapMode,
  setHeatmapMode,
  showTaskLabels,
  setShowTaskLabels,
  showRackIds,
  setShowRackIds,
  showChargingStations,
  setShowChargingStations,
  showDebugOverlay,
  setShowDebugOverlay,
  onSendToCharge,
  onReassignTask
}) {
  const selectedRobot = fleet.find(r => r.id === selectedAgvId);

  // Fleet breakdown counts
  const totalRobots = fleet.length;
  const activeCount = fleet.filter(r => r.status === 'ACTIVE' || r.status === 'TRANSPORTING' || r.status === 'PICKING').length;
  const idleCount = fleet.filter(r => r.status === 'IDLE').length;
  const chargingCount = fleet.filter(r => r.status === 'CHARGING').length;
  const waitingCount = fleet.filter(r => r.status === 'WAITING').length;

  return (
    <div className="agv-side-panel">
      {/* 1. Fleet Status Quick Summary */}
      <div className="agv-panel-card">
        <div className="agv-card-header">
          <Bot size={15} className="purple" />
          <b>FLEET TELEMETRY STATUS</b>
          <span className="live-tag">100% ONLINE</span>
        </div>

        <div className="fleet-status-grid">
          <div className="fleet-stat-box">
            <span>TOTAL</span>
            <strong>{totalRobots}</strong>
          </div>
          <div className="fleet-stat-box active">
            <span>ACTIVE</span>
            <strong style={{ color: '#32d49b' }}>{activeCount}</strong>
          </div>
          <div className="fleet-stat-box">
            <span>IDLE</span>
            <strong style={{ color: '#94a3b8' }}>{idleCount}</strong>
          </div>
          <div className="fleet-stat-box charging">
            <span>CHARGING</span>
            <strong style={{ color: '#38bdf8' }}>{chargingCount}</strong>
          </div>
        </div>

        {waitingCount > 0 && (
          <div className="congestion-alert-pill">
            <AlertTriangle size={12} color="#f59e0b" />
            <span>{waitingCount} AMR yielding at corridor junction (Congestion Managed)</span>
          </div>
        )}
      </div>

      {/* 2. Dedicated Multi-Track Legend */}
      <div className="agv-panel-card">
        <div className="agv-card-header">
          <Layers size={14} color="#38bdf8" />
          <b>DEDICATED TRACK LEGEND (ZERO TRAFFIC)</b>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
          {[
            { id: 'AGV-01', track: 'Track 1', color: '#38bdf8' },
            { id: 'AGV-02', track: 'Track 2', color: '#818cf8' },
            { id: 'AGV-03', track: 'Track 3', color: '#34d399' },
            { id: 'AGV-04', track: 'Track 4', color: '#fbbf24' },
            { id: 'AGV-05', track: 'Track 5', color: '#f43f5e' },
            { id: 'AGV-06', track: 'Track 6', color: '#a855f7' },
            { id: 'AGV-07', track: 'Track 7', color: '#2dd4bf' },
            { id: 'AGV-08', track: 'Track 8', color: '#f97316' },
            { id: 'AGV-09', track: 'Track 9', color: '#ec4899' },
            { id: 'AGV-10', track: 'Track 10', color: '#60a5fa' }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => onSelectAgv(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                borderRadius: '4px',
                background: selectedAgvId === item.id ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                border: `1px solid ${selectedAgvId === item.id ? item.color : '#1e293b'}`,
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'DM Mono, monospace'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 5px ${item.color}`
                }}
              />
              <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{item.id}</span>
              <span style={{ color: '#64748b', fontSize: '9px' }}>({item.track})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Simulation Controls */}
      <div className="agv-panel-card">
        <div className="agv-card-header">
          <Sliders size={14} />
          <b>SIMULATION CONTROLLER</b>
        </div>

        <div className="sim-button-row">
          <button
            className={`sim-action-btn ${simRunning ? 'running' : 'start'}`}
            onClick={onToggleSim}
          >
            {simRunning ? <Pause size={13} /> : <Play size={13} />}
            <span>{simRunning ? 'Pause Sim' : 'Start Sim'}</span>
          </button>

          <button
            className="sim-action-btn secondary"
            onClick={onResetSim}
            title="Reset fleet positions & tasks to origin"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            className="sim-action-btn rush-btn"
            onClick={onTriggerRush}
            title="Inject simultaneous pick surge across all zones"
          >
            <Flame size={13} />
            <span>Wave Surge</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="speed-control-row">
          <small>SPEED MULTIPLIER:</small>
          <div className="speed-pills">
            {[0.5, 1, 2, 4].map(spd => (
              <button
                key={spd}
                className={`speed-pill ${simSpeed === spd ? 'active' : ''}`}
                onClick={() => onChangeSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Heatmap & Visual Layer Controls */}
      <div className="agv-panel-card">
        <div className="agv-card-header">
          <Layers size={14} />
          <b>VISUALIZATION & HEATMAP</b>
        </div>

        <div className="layer-toggle-list">
          <label className="layer-checkbox">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
            />
            <span>Show Corridor Heatmap</span>
          </label>

          {showHeatmap && (
            <div className="heatmap-mode-selector">
              <small>HEATMAP INTENSITY MODE:</small>
              <select
                className="filter"
                style={{ width: '100%', marginTop: '4px' }}
                value={heatmapMode}
                onChange={(e) => setHeatmapMode(e.target.value)}
              >
                <option value="TRAFFIC">🚦 Corridor Traffic Density</option>
                <option value="PICKING">📦 Rack Picking Frequency</option>
                <option value="CONGESTION">⚠️ Junction Congestion Heat</option>
              </select>

              <div className="heatmap-legend-bar">
                <span>LOW</span>
                <div className="heat-grad-bar"></div>
                <span>HIGH DENSITY</span>
              </div>
            </div>
          )}

          <label className="layer-checkbox">
            <input
              type="checkbox"
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
            />
            <span>Show Active Robot Paths</span>
          </label>

          <label className="layer-checkbox">
            <input
              type="checkbox"
              checked={showTaskLabels}
              onChange={(e) => setShowTaskLabels(e.target.checked)}
            />
            <span>Show Order Task Badges</span>
          </label>

          <label className="layer-checkbox">
            <input
              type="checkbox"
              checked={showRackIds}
              onChange={(e) => setShowRackIds(e.target.checked)}
            />
            <span>Show Storage Rack IDs</span>
          </label>

          <label className="layer-checkbox">
            <input
              type="checkbox"
              checked={showChargingStations}
              onChange={(e) => setShowChargingStations(e.target.checked)}
            />
            <span>Show Charging Docks</span>
          </label>

          <label className="layer-checkbox" style={{ color: '#c084fc' }}>
            <input
              type="checkbox"
              checked={showDebugOverlay}
              onChange={(e) => setShowDebugOverlay(e.target.checked)}
            />
            <span>Show 2-Way Passing Debug (Radii &amp; States)</span>
          </label>
        </div>
      </div>

      {/* 4. Selected Robot Telemetry Inspector */}
      {selectedRobot ? (
        <div className="agv-panel-card selected-inspector">
          <div className="agv-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} color="#38bdf8" />
              <b>{selectedRobot.id} TELEMETRY</b>
            </div>
            <button
              onClick={() => onSelectAgv(null)}
              className="close-btn"
              title="Deselect"
            >
              <X size={13} />
            </button>
          </div>

          <div className="robot-profile-header">
            <div>
              <strong>{selectedRobot.name}</strong>
              <small>Speed: {Math.round(selectedRobot.currentVelocity || 0)} units/s &bull; Travel: {selectedRobot.totalDistanceMeters || 0}m</small>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
              <span className={`priority ${(selectedRobot.status || 'idle').toLowerCase()}`}>
                {selectedRobot.status || 'IDLE'}
              </span>
              {selectedRobot.passingState && selectedRobot.passingState !== 'NORMAL' && (
                <span className="priority" style={{ background: '#581c87', color: '#e9d5ff', fontSize: '9px' }}>
                  {selectedRobot.passingState} {selectedRobot.opposingRobotId ? `(${selectedRobot.opposingRobotId})` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Battery Status */}
          <div className="robot-battery-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                {selectedRobot.status === 'CHARGING' ? <BatteryCharging size={13} color="#38bdf8" /> : <Battery size={13} />}
                Battery Level
              </span>
              <strong style={{ color: (selectedRobot.battery ?? 100) <= 25 ? '#ef4444' : '#34d399' }}>
                {(selectedRobot.battery ?? 0).toFixed(0)}%
              </strong>
            </div>
            <div className="progress">
              <i style={{
                width: `${selectedRobot.battery ?? 0}%`,
                background: (selectedRobot.battery ?? 100) <= 25 ? '#ef4444' : (selectedRobot.battery ?? 100) <= 50 ? '#f59e0b' : '#10b981'
              }}></i>
            </div>
          </div>

          {/* Current Task Box */}
          <div className="robot-task-card">
            <small>ACTIVE TRANSPORT MISSION:</small>
            {selectedRobot.currentTask ? (
              <div style={{ marginTop: '4px' }}>
                <b>#{selectedRobot.currentTask.orderId} &bull; {selectedRobot.currentTask.skuName}</b>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Target: {selectedRobot.currentTask.rackId} &bull; Qty: {selectedRobot.currentTask.quantity} units ({selectedRobot.currentTask.priority})
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                No active payload. Staged in corridor for autonomous dispatch.
              </div>
            )}
          </div>

          {/* Quick Manual Override Actions */}
          <div className="robot-action-buttons">
            <button
              className="outline-btn success"
              onClick={() => onSendToCharge(selectedRobot.id)}
              disabled={selectedRobot.status === 'CHARGING'}
            >
              <Zap size={12} />
              Send to Fast Charger
            </button>
            <button
              className="outline-btn"
              onClick={() => onReassignTask(selectedRobot.id)}
            >
              <Send size={12} />
              Reassign Mission
            </button>
          </div>
        </div>
      ) : (
        <div className="agv-panel-card" style={{ textAlign: 'center', padding: '20px 14px' }}>
          <Navigation size={22} style={{ color: '#475569', margin: '0 auto 8px' }} />
          <strong style={{ fontSize: '12px', display: 'block', color: '#94a3b8' }}>Select an AGV on Map</strong>
          <small style={{ color: '#64748b', fontSize: '10px' }}>
            Click any autonomous vehicle to inspect live telemetry, speed, battery, and route waypoints.
          </small>
        </div>
      )}
    </div>
  );
}
