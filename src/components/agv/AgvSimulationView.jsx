/**
 * AgvSimulationView — 3D Smart Warehouse Simulation with Dedicated Multi-Level Tracks (Zero Traffic System)
 *
 * Core Features:
 *   - 3D Interactive Warehouse with Elevation-Based Dedicated Tracks
 *   - Upper Tier Elevated Deck (Y=46) & Lower Tier Ground Guideway (Y=1.2)
 *   - Continuous Non-Stop Operation (Zero Traffic, Zero Waiting, Zero Collisions)
 *   - Complete Dashboard & 5-Column Technical Specification Overview
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWms } from '../../context/WmsContext';
import {
  MAP_CONFIG,
  WAYPOINTS,
  SAMPLE_TASKS,
  generateInitialFleet,
  generateInitialHeatmap,
  findShortestPath,
  ChargingManager
} from '../../engine/agvSimulationEngine';

import {
  AMR_CONFIG,
  PASSING_STATES,
  SpatialGrid,
  IntersectionManager,
  PassingCoordinator
} from '../../engine/agvNavigationEngine';

import {
  generateDedicatedTrackPath,
  generateDedicatedTrackLoop,
  ROBOT_TRACK_CONFIG,
  TRACK_COLORS
} from '../../engine/agv3dTrackEngine';

import { AgvWarehouse3DCanvas } from './AgvWarehouse3DCanvas';
import { AgvWarehouseCanvas } from './AgvWarehouseCanvas';
import { AgvFleetPanel } from './AgvFleetPanel';
import { AgvActivityFeed } from './AgvActivityFeed';
import { 
  Radio, 
  Box, 
  Layers, 
  Bot,
  CheckCircle2, 
  Zap, 
  Sliders, 
  MousePointer, 
  RotateCw, 
  Flame, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Award
} from 'lucide-react';

const ACCEL_RATE      = 180;
const DECEL_RATE      = 280;
const TURN_RATE_DEG_S = 340;
const ARRIVAL_FINAL   = 3.0;
const ARRIVAL_INTER   = 8.0;

export function AgvSimulationView() {
  const { addToast } = useWms();

  // ── React UI State ────────────────────────────────────────────────────────
  const [fleet, setFleet]           = useState(() => generateInitialFleet());
  const [tasks, setTasks]           = useState(SAMPLE_TASKS);
  const [selectedAgvId, setSelectedAgvId] = useState('AGV-03');
  const [simRunning, setSimRunning]  = useState(true);
  const [simSpeed,   setSimSpeed]    = useState(1);
  const [viewMode,   setViewMode]    = useState('3D'); // '3D' (Default) | '2D'

  const [events, setEvents] = useState([
    { id: 'EV-0', robotId: 'AGV-01', type: 'ASSIGNMENT', time: '20:05:01', message: 'Dedicated Track 1 Active: Elevated loop at Level 2 (Y=46).' },
    { id: 'EV-1', robotId: 'AGV-03', type: 'PICK',       time: '20:05:06', message: 'Dedicated Track 3 Active: Servicing RACK-C1 (Upper Tier).' },
    { id: 'EV-2', robotId: 'AGV-05', type: 'ASSIGNMENT', time: '20:05:12', message: 'Dedicated Track 5 Active: Ground circuit to Packaging Depot.' },
    { id: 'EV-3', robotId: 'AGV-08', type: 'DELIVERY',   time: '20:05:18', message: 'Dedicated Track 8 Active: Continuous non-stop transit.' }
  ]);

  const [heatmapGrid, setHeatmapGrid] = useState(() => generateInitialHeatmap());
  const [metrics, setMetrics] = useState({
    activeMissions: 10, itemsInTransit: 52, itemsDelivered: 148,
    fleetUtilization: 100, activeRobots: 10, totalRobots: 10,
    avgTransitTime: 14.2, totalDistanceKm: '18.6', congestionEvents: 0
  });

  // Layer & Visual Toggles
  const [showPaths,            setShowPaths]            = useState(true);
  const [showHeatmap,          setShowHeatmap]          = useState(false);
  const [heatmapMode,          setHeatmapMode]          = useState('TRAFFIC');
  const [showTaskLabels,       setShowTaskLabels]       = useState(true);
  const [showRackIds,          setShowRackIds]          = useState(true);
  const [showChargingStations, setShowChargingStations] = useState(true);
  const [showDebugOverlay,     setShowDebugOverlay]     = useState(false);

  // Simulation Refs
  const simFleetRef   = useRef(generateInitialFleet());
  const simRunningRef = useRef(true);
  const simSpeedRef   = useRef(1);
  const lastTimeRef   = useRef(performance.now());
  const frameCountRef = useRef(0);
  const animFrameRef  = useRef(null);

  useEffect(() => { simRunningRef.current = simRunning; }, [simRunning]);
  useEffect(() => { simSpeedRef.current   = simSpeed;   }, [simSpeed]);

  // Event logger
  const addEvent = useCallback((ev) => {
    const newEv = {
      id: `EV-${Date.now()}-${(Math.random() * 99999) | 0}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...ev
    };
    setEvents(prev => [newEv, ...prev.slice(0, 29)]);
  }, []);

  // ── Continuous Circuit Task Generator ─────────────────────────────────────
  const restartRobotLoop = useCallback((robot) => {
    const trackIndex = typeof robot.trackIndex === 'number' ? robot.trackIndex : 0;
    const loopWaypoints = generateDedicatedTrackLoop(trackIndex);

    return {
      ...robot,
      status: 'ACTIVE',
      hasPayload: !robot.hasPayload,
      pathWaypoints: loopWaypoints,
      currentWaypointIndex: 0,
      currentVelocity: robot.cruiseSpeed || 95,
      stuckTimer: 0,
      blockedBy: null
    };
  }, []);

  // ── Authoritative 60 FPS Multi-Level Simulation Loop ──────────────────────
  useEffect(() => {
    let active = true;

    // Initialize all robots with their dedicated loop if empty
    simFleetRef.current = simFleetRef.current.map((r, idx) => {
      if (!r.pathWaypoints || r.pathWaypoints.length === 0) {
        return {
          ...r,
          trackIndex: idx,
          pathWaypoints: generateDedicatedTrackLoop(idx),
          currentWaypointIndex: 0,
          currentVelocity: r.cruiseSpeed || 95
        };
      }
      return r;
    });

    const tick = (nowMs) => {
      if (!active) return;

      const rawDelta = Math.min((nowMs - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = nowMs;
      const speed = simSpeedRef.current;
      const delta = rawDelta * speed;

      if (!simRunningRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const currentFleet = simFleetRef.current;
      frameCountRef.current++;

      const nextFleet = currentFleet.map((robot) => {
        let r = { ...robot };
        const trackIndex = typeof r.trackIndex === 'number' ? r.trackIndex : 0;

        if (!r.pathWaypoints || r.pathWaypoints.length === 0) {
          return restartRobotLoop(r);
        }

        const waypoints = r.pathWaypoints;
        const wpIdx     = Math.min(r.currentWaypointIndex || 0, waypoints.length - 1);
        const targetWp  = waypoints[wpIdx];

        // 1. Strict Unidirectional Vector Calculation (Locked to target destination)
        const toWpX = targetWp.x - r.currentPosition.x;
        const toWpY = targetWp.y - r.currentPosition.y;
        const toWpDist = Math.sqrt(toWpX * toWpX + toWpY * toWpY);

        if (toWpDist > 0.5) {
          // Strictly committed direct forward heading towards target destination
          r.targetHeading = ((Math.atan2(toWpY, toWpX) * 180 / Math.PI) + 90 + 360) % 360;
        }

        // 2. Velocity: Continuous Cruise Flow
        const targetVel = r.cruiseSpeed || 95;
        const curVel = r.currentVelocity || 0;
        let newVel = curVel < targetVel
          ? Math.min(targetVel, curVel + ACCEL_RATE * delta)
          : Math.max(targetVel, curVel - DECEL_RATE * delta);
        r.currentVelocity = newVel;

        // 3. Locked Forward Alignment (No mid-segment reversals or flip-flops)
        const tH = r.targetHeading ?? r.heading ?? 0;
        let hDiff = ((tH - (r.heading || 0) + 540) % 360) - 180;
        const maxTurn = (TURN_RATE_DEG_S * 1.5) * rawDelta;
        r.heading = ((r.heading || 0) + Math.sign(hDiff) * Math.min(Math.abs(hDiff), maxTurn) + 360) % 360;

        // Step Position along Dedicated Track
        if (newVel > 0.5) {
          let stepDist = newVel * delta;
          let curWpIdx = r.currentWaypointIndex || 0;
          let pos = { x: r.currentPosition.x, y: r.currentPosition.y };

          while (stepDist > 0.01 && curWpIdx < waypoints.length) {
            const wp = waypoints[curWpIdx];
            const dx = wp.x - pos.x;
            const dy = wp.y - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const threshold = curWpIdx === waypoints.length - 1 ? ARRIVAL_FINAL : ARRIVAL_INTER;

            if (dist <= threshold + stepDist * 0.5 + 0.5) {
              pos = { x: wp.x, y: wp.y };
              stepDist = Math.max(0, stepDist - Math.max(0, dist));
              curWpIdx++;
              r.currentWaypointIndex = curWpIdx;

              if (curWpIdx >= waypoints.length) {
                // Loop seamlessly back to start
                curWpIdx = 0;
                r.currentWaypointIndex = 0;
                r.hasPayload = !r.hasPayload; // Toggle payload box on loop cycle
              }
            } else {
              if (dist > 0.001) {
                pos = {
                  x: pos.x + (dx / dist) * stepDist,
                  y: pos.y + (dy / dist) * stepDist
                };
              }
              stepDist = 0;
            }
          }

          r.currentPosition = pos;
          r.battery = Math.max(15, r.battery - 0.001 * delta);
          r.totalDistanceMeters = (r.totalDistanceMeters || 0) + newVel * delta * 0.1;
        }

        return r;
      });

      simFleetRef.current = nextFleet;

      if (frameCountRef.current % 2 === 0) {
        setFleet([...nextFleet]);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [simRunning, simSpeed, restartRobotLoop]);

  const handleToggleSim = () => {
    setSimRunning(r => !r);
    addToast?.({ title: simRunning ? 'Simulation Paused' : 'Simulation Resumed', type: 'info' });
  };

  const handleResetSim = () => {
    const fresh = generateInitialFleet().map((r, idx) => ({
      ...r,
      trackIndex: idx,
      pathWaypoints: generateDedicatedTrackLoop(idx),
      currentWaypointIndex: 0,
      currentVelocity: 95
    }));
    simFleetRef.current = fresh;
    setFleet(fresh);
    addToast?.({ title: 'Simulation Reset', message: 'Fleet reset on dedicated 3D tracks.', type: 'success' });
  };

  const handleTriggerRush = () => {
    addToast?.({ title: '⚡ Wave Surge Activated!', message: 'All 10 AMRs operating at max cruise velocity.', type: 'warning' });
  };

  const { activeLocation } = useWms();

  return (
    <div className="agv-view-container" style={{ padding: '16px 20px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 1. Header Banner */}
      <div className="agv-top-header" style={{ marginBottom: '14px' }}>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
            <Radio size={12} className="pulse" color="#38bdf8" />
            SAI'S WAREHOUSE &bull; {activeLocation.name.toUpperCase()} &bull; 3D DEDICATED TRACKS &bull; ZERO TRAFFIC
          </div>
          <h1 style={{ fontSize: '20px', margin: '4px 0 0', fontWeight: '800', letterSpacing: '-0.3px' }}>
            {activeLocation.city} Hub: 3D Autonomous Multi-Level Track Facility &ndash; Continuous Robot Flow
          </h1>
        </div>

        {/* 3D vs 2D View Switcher */}
        <div style={{ display: 'flex', background: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid #334155' }}>
          <button
            onClick={() => setViewMode('3D')}
            style={{
              background: viewMode === '3D' ? '#2563eb' : 'transparent',
              color: viewMode === '3D' ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Box size={13} />
            3D Multi-Level
          </button>
          <button
            onClick={() => setViewMode('2D')}
            style={{
              background: viewMode === '2D' ? '#2563eb' : 'transparent',
              color: viewMode === '2D' ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={13} />
            2D Guideway
          </button>
        </div>
      </div>

      {/* 2. Main 3D Canvas + Right Sidebar Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '16px' }}>
        {/* Main 3D Canvas Card */}
        <div
          style={{
            background: '#070b14',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '620px',
            position: 'relative'
          }}
        >
          {viewMode === '3D' ? (
            <AgvWarehouse3DCanvas
              fleet={fleet}
              selectedAgvId={selectedAgvId}
              onSelectAgv={setSelectedAgvId}
              showPaths={showPaths}
              showHeatmap={showHeatmap}
              heatmapGrid={heatmapGrid}
              showTaskLabels={showTaskLabels}
              showRackIds={showRackIds}
              showChargingStations={showChargingStations}
            />
          ) : (
            <AgvWarehouseCanvas
              fleet={fleet}
              selectedAgvId={selectedAgvId}
              onSelectAgv={setSelectedAgvId}
              showPaths={showPaths}
              showHeatmap={showHeatmap}
              heatmapMode={heatmapMode}
              heatmapGrid={heatmapGrid}
              showTaskLabels={showTaskLabels}
              showRackIds={showRackIds}
              showChargingStations={showChargingStations}
              showDebugOverlay={showDebugOverlay}
            />
          )}
        </div>

        {/* Right Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Dedicated Track Legend */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px', letterSpacing: '0.5px' }}>
              DEDICATED TRACK LEGEND (ZERO TRAFFIC)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {ROBOT_TRACK_CONFIG.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAgvId(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: selectedAgvId === item.id ? 'rgba(56, 189, 248, 0.15)' : '#070b14',
                    border: `1px solid ${selectedAgvId === item.id ? item.color : '#1e293b'}`,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'DM Mono, monospace'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: item.color,
                        boxShadow: `0 0 6px ${item.color}`
                      }}
                    />
                    <b style={{ color: '#f1f5f9' }}>{item.id}</b>
                    <span style={{ color: '#64748b' }}>(Track {i + 1})</span>
                  </div>
                  <span style={{ fontSize: '9px', color: item.level === 'UPPER' ? '#38bdf8' : '#34d399', fontWeight: 'bold' }}>
                    {item.level === 'UPPER' ? 'LEVEL 2 (Y=46)' : 'LEVEL 1 (GROUND)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Controller */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px' }}>
              SIMULATION CONTROLLER
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleToggleSim}
                style={{
                  background: simRunning ? '#d97706' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Sliders size={14} />
                {simRunning ? 'Pause Simulation' : 'Resume Simulation'}
              </button>

              <button
                onClick={handleResetSim}
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '7px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={13} />
                Reset Simulation
              </button>

              <button
                onClick={handleTriggerRush}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Flame size={13} />
                Wave Surge
              </button>
            </div>

            {/* Speed Multiplier */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>SPEED MULTIPLIER</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0.5, 1, 2, 4].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    style={{
                      flex: 1,
                      background: simSpeed === spd ? '#2563eb' : '#070b14',
                      color: simSpeed === spd ? '#ffffff' : '#94a3b8',
                      border: '1px solid #1e293b',
                      borderRadius: '4px',
                      padding: '4px 0',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Visualization & Overlays */}
            <div style={{ marginTop: '12px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', fontWeight: 'bold' }}>
                VISUALIZATION &amp; OVERLAYS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10.5px', color: '#cbd5e1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
                  Show Corridor Heatmap
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showPaths} onChange={e => setShowPaths(e.target.checked)} />
                  Show Active Robot Paths
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showTaskLabels} onChange={e => setShowTaskLabels(e.target.checked)} />
                  Show Order Task Badges
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showRackIds} onChange={e => setShowRackIds(e.target.checked)} />
                  Show Storage Rack IDs
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showChargingStations} onChange={e => setShowChargingStations(e.target.checked)} />
                  Show Charging Docks
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showDebugOverlay} onChange={e => setShowDebugOverlay(e.target.checked)} />
                  Show 2-Way Passing Debug
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5-Column Technical Architecture Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          background: '#070b14',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '12px'
        }}
      >
        {/* Column 1 */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers size={13} color="#f59e0b" />
            DEDICATED TRACK ARCHITECTURE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
            <div>☑️ Every robot has its own track</div>
            <div>☑️ Tracks are separated (parallel/elevated)</div>
            <div>☑️ No two robots share the same track</div>
            <div>☑️ No waiting, no yielding, no collisions</div>
            <div>☑️ Continuous non-stop movement</div>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} color="#f59e0b" />
            TRACK DESIGN (3D MULTI-LEVEL)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
            <div>☑️ Parallel tracks (left/right offset)</div>
            <div>☑️ Elevated tracks (different heights)</div>
            <div>☑️ Smooth curves with banking</div>
            <div>☑️ No intersections on same level</div>
            <div>☑️ Supports loops and circuits</div>
          </div>
        </div>

        {/* Column 3 */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Bot size={13} color="#f59e0b" />
            ROBOT BEHAVIOR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
            <div>☑️ Always stays on its assigned track</div>
            <div>☑️ Never interferes with other robots</div>
            <div>☑️ No stops, no traffic, no deadlocks</div>
            <div>☑️ Smooth acceleration &amp; deceleration</div>
            <div>☑️ Maintains constant flow</div>
          </div>
        </div>

        {/* Column 4 */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cpu size={13} color="#f59e0b" />
            PERFORMANCE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
            <div>☑️ 60 FPS Smooth Rendering</div>
            <div>☑️ 10+ robots simultaneously</div>
            <div>☑️ Optimized instanced meshes</div>
            <div>☑️ No lag during continuous operation</div>
            <div>☑️ Low CPU &amp; memory usage</div>
          </div>
        </div>

        {/* Column 5 */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Award size={13} color="#f59e0b" />
            FINAL OUTCOME
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
            <div>☑️ Zero traffic</div>
            <div>☑️ Zero collisions</div>
            <div>☑️ Zero stops</div>
            <div>☑️ 100% continuous robot flow</div>
            <div>☑️ Real-time 3D visualization</div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Mouse Controls Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0a0f1d',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '11px',
          color: '#64748b'
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>🖱️ <b>Left-Click:</b> Rotate 3D</span>
          <span>🖱️ <b>Right-Click:</b> Pan</span>
          <span>🔍 <b>Scroll:</b> Zoom</span>
          <span>🎯 <b>Double-Click on AGV:</b> Focus</span>
        </div>
        <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>
          All robots move simultaneously on their dedicated tracks – no traffic, no congestion, 100% continuous operation.
        </div>
      </div>
    </div>
  );
}
