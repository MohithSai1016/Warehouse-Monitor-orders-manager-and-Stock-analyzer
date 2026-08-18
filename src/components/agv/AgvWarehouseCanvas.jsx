import React, { useMemo, memo } from 'react';
import { MAP_CONFIG } from '../../engine/agvSimulationEngine';

// Memoized Static Floor & Layout
const StaticWarehouseMap = memo(function StaticWarehouseMap({
  showRackIds,
  showChargingStations
}) {
  return (
    <>
      {/* 1. Floor & Grid Background */}
      <rect width={MAP_CONFIG.width} height={MAP_CONFIG.height} fill="#090d16" />
      <rect width={MAP_CONFIG.width} height={MAP_CONFIG.height} fill="url(#gridFloor)" />

      {/* 2. Walkable AGV Corridor Guideway Tracks (Floor Lines) */}
      <g className="corridor-lines" stroke="rgba(120, 135, 255, 0.12)" strokeWidth="2" strokeDasharray="5,5">
        {/* North Arterial Highway */}
        <line x1="30" y1="35" x2="925" y2="35" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2.5" />
        {/* Center Cross-Corridor */}
        <line x1="30" y1="195" x2="925" y2="195" stroke="rgba(129, 140, 248, 0.25)" strokeWidth="2" />
        {/* South Arterial Highway */}
        <line x1="30" y1="365" x2="925" y2="365" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="3" />
        
        {/* Vertical Aisle Guideways */}
        {[175, 325, 475, 625, 775, 925].map(x => (
          <line key={`aisle-${x}`} x1={x} y1="35" x2={x} y2="365" />
        ))}

        {/* Dedicated Depot Connections */}
        {[60, 100, 140, 180, 220].map(x => (
          <line key={`depot-line-${x}`} x1={x} y1="365" x2={x} y2="480" stroke="rgba(56, 189, 248, 0.3)" />
        ))}

        {/* Courier Dispatch Connections */}
        <line x1="340" y1="365" x2="340" y2="480" stroke="rgba(99, 102, 241, 0.3)" />
        <line x1="440" y1="365" x2="440" y2="480" stroke="rgba(99, 102, 241, 0.3)" />

        {/* Dedicated 10 Charging Dock Connectors */}
        {MAP_CONFIG.chargingStations.map(cs => (
          <line key={`chg-line-${cs.id}`} x1={cs.x} y1="365" x2={cs.x} y2={cs.y} stroke="rgba(16, 185, 129, 0.3)" />
        ))}
      </g>

      {/* 3. Physical Storage Racks */}
      {MAP_CONFIG.racks.map(rack => (
        <g key={rack.id} className="rack-group">
          {/* Outer Rack Shell */}
          <rect
            x={rack.x}
            y={rack.y}
            width={rack.width}
            height={rack.height}
            rx="6"
            fill="#101726"
            stroke="#243048"
            strokeWidth="1.5"
          />
          {/* Shelf Shelves Interior Lines */}
          <line x1={rack.x + 8} y1={rack.y + 28} x2={rack.x + rack.width - 8} y2={rack.y + 28} stroke="#1e293b" strokeWidth="1.5" />
          <line x1={rack.x + 8} y1={rack.y + 55} x2={rack.x + rack.width - 8} y2={rack.y + 55} stroke="#1e293b" strokeWidth="1.5" />
          <line x1={rack.x + 8} y1={rack.y + 82} x2={rack.x + rack.width - 8} y2={rack.y + 82} stroke="#1e293b" strokeWidth="1.5" />
          
          {/* Zone Color Top Strip */}
          <rect
            x={rack.x}
            y={rack.y}
            width={rack.width}
            height="6"
            rx="3"
            fill={rack.color}
            opacity="0.8"
          />

          {/* Rack Label */}
          {showRackIds && (
            <>
              <text
                x={rack.x + rack.width / 2}
                y={rack.y + 19}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="10"
                fontFamily="DM Mono, monospace"
                fontWeight="700"
              >
                {rack.id}
              </text>
              <text
                x={rack.x + rack.width / 2}
                y={rack.y + 44}
                textAnchor="middle"
                fill="#64748b"
                fontSize="8"
                fontFamily="Manrope, sans-serif"
              >
                {rack.aisle}
              </text>
              <text
                x={rack.x + rack.width / 2}
                y={rack.y + 98}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="7.5"
                fontFamily="Manrope, sans-serif"
                fontWeight="600"
              >
                {rack.name.split(' ')[0]}
              </text>
            </>
          )}
        </g>
      ))}

      {/* 4. Symmetrical Packaging & Staging Depot Area */}
      <g className="depot-zone">
        <rect
          x={MAP_CONFIG.depotArea.x}
          y={MAP_CONFIG.depotArea.y}
          width={MAP_CONFIG.depotArea.width}
          height={MAP_CONFIG.depotArea.height}
          rx="8"
          fill="url(#depotGrad)"
          stroke="#0284c7"
          strokeWidth="1.5"
          strokeDasharray="6,4"
        />
        <text
          x={MAP_CONFIG.depotArea.x + MAP_CONFIG.depotArea.width / 2}
          y={MAP_CONFIG.depotArea.y + 22}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="10"
          fontFamily="Manrope, sans-serif"
          fontWeight="800"
        >
          📦 PACKAGING & STAGING DEPOT
        </text>

        {/* 5 Dedicated Symmetrical Staging Bays */}
        {[1, 2, 3, 4, 5].map(bay => {
          const posX = MAP_CONFIG.depotArea.x + 8 + (bay - 1) * 42;
          return (
            <g key={bay} transform={`translate(${posX}, ${MAP_CONFIG.depotArea.y + 35})`}>
              <rect width="36" height="65" rx="5" fill="#07111e" stroke="#0284c7" strokeWidth="1" />
              <text x="18" y="16" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="700" fontFamily="DM Mono">
                BAY 0{bay}
              </text>
              <text x="18" y="38" textAnchor="middle" fill="#6ee7b7" fontSize="10">
                ✓
              </text>
              <text x="18" y="54" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="Manrope">
                Ready
              </text>
            </g>
          );
        })}
      </g>

      {/* 5. Outbound Courier Docks Area */}
      <g className="shipping-zone">
        <rect
          x={MAP_CONFIG.shippingArea.x}
          y={MAP_CONFIG.shippingArea.y}
          width={MAP_CONFIG.shippingArea.width}
          height={MAP_CONFIG.shippingArea.height}
          rx="8"
          fill="#0c1020"
          stroke="#4f46e5"
          strokeWidth="1.5"
        />
        <text
          x={MAP_CONFIG.shippingArea.x + MAP_CONFIG.shippingArea.width / 2}
          y={MAP_CONFIG.shippingArea.y + 22}
          textAnchor="middle"
          fill="#818cf8"
          fontSize="10"
          fontFamily="Manrope, sans-serif"
          fontWeight="800"
        >
          🚚 OUTBOUND COURIER DOCKS
        </text>
        {[1, 2].map(d => {
          const posX = MAP_CONFIG.shippingArea.x + 20 + (d - 1) * 105;
          return (
            <g key={d} transform={`translate(${posX}, ${MAP_CONFIG.shippingArea.y + 35})`}>
              <rect width="90" height="65" rx="5" fill="#030712" stroke="#1e3a8a" strokeWidth="1" />
              <text x="45" y="18" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="DM Mono">
                DOCK 0{d} - ACTIVE
              </text>
              <text x="45" y="40" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="Manrope">
                Express Courier
              </text>
            </g>
          );
        })}
      </g>

      {/* 6. 10 Symmetrical Dedicated Charging Stations */}
      {showChargingStations && (
        <g className="charging-zone">
          {MAP_CONFIG.chargingStations.map((cs, cIdx) => (
            <g key={cs.id} transform={`translate(${cs.x - 17}, ${cs.y - 25})`}>
              <rect width="34" height="68" rx="5" fill="url(#chargeGrad)" stroke="#10b981" strokeWidth="1.2" />
              <rect x="3" y="4" width="28" height="3" rx="1.5" fill="#34d399" />
              <text x="17" y="20" textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="800" fontFamily="DM Mono">
                {cs.id}
              </text>
              <text x="17" y="32" textAnchor="middle" fill="#93c5fd" fontSize="6.5" fontFamily="DM Mono">
                AGV-0{cIdx + 1 > 9 ? '10' : cIdx + 1}
              </text>
              <circle cx="17" cy="48" r="8" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
              <text x="17" y="52" textAnchor="middle" fill="#34d399" fontSize="9">⚡</text>
            </g>
          ))}
        </g>
      )}
    </>
  );
});

// Memoized Heatmap Component
const HeatmapOverlay = memo(function HeatmapOverlay({
  heatmapGrid,
  heatmapMode
}) {
  if (!heatmapGrid) return null;

  const getHeatmapColor = (intensity) => {
    if (intensity < 0.12) return 'transparent';
    if (heatmapMode === 'CONGESTION') {
      if (intensity > 0.6) return 'rgba(239, 68, 68, 0.45)';
      return 'rgba(245, 158, 11, 0.25)';
    }
    if (heatmapMode === 'PICKING') {
      if (intensity > 0.65) return 'rgba(168, 85, 247, 0.5)';
      if (intensity > 0.4) return 'rgba(124, 58, 237, 0.3)';
      return 'rgba(99, 102, 241, 0.18)';
    }
    // Traffic Density
    if (intensity > 0.75) return 'rgba(244, 63, 94, 0.55)';
    if (intensity > 0.5) return 'rgba(245, 158, 11, 0.4)';
    if (intensity > 0.25) return 'rgba(14, 165, 233, 0.25)';
    return 'rgba(6, 182, 212, 0.12)';
  };

  const cellW = MAP_CONFIG.width / 20;
  const cellH = MAP_CONFIG.height / 13;

  return (
    <g className="heatmap-layer" filter="url(#heatBlur)">
      {heatmapGrid.map((row, rIdx) =>
        row.map((cellVal, cIdx) => {
          const color = getHeatmapColor(cellVal);
          if (color === 'transparent') return null;
          return (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx * cellW}
              y={rIdx * cellH}
              width={cellW}
              height={cellH}
              fill={color}
            />
          );
        })
      )}
    </g>
  );
});

export function AgvWarehouseCanvas({
  fleet,
  selectedAgvId,
  onSelectAgv,
  showPaths,
  showHeatmap,
  heatmapMode,
  heatmapGrid,
  showTaskLabels,
  showRackIds,
  showChargingStations,
  showDebugOverlay
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TRANSPORTING': return '#32d49b';
      case 'PICKING': return '#c5adff';
      case 'CHARGING': return '#38bdf8';
      case 'WAITING': return '#f59e0b';
      case 'ACTIVE': return '#60a5fa';
      default: return '#818cf8';
    }
  };

  return (
    <div className="agv-canvas-container">
      <svg
        viewBox={`0 0 ${MAP_CONFIG.width} ${MAP_CONFIG.height}`}
        className="agv-svg-map"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="gridFloor" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
          </pattern>

          <filter id="robotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#7887ff" floodOpacity="0.8" />
          </filter>
          <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="1" />
          </filter>
          <filter id="heatBlur" x="0" y="0" width="100%" height="100%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          <linearGradient id="depotGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="chargeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Static Background Racks, Lanes, Stations */}
        <StaticWarehouseMap
          showRackIds={showRackIds}
          showChargingStations={showChargingStations}
        />

        {/* Heatmap Layer */}
        {showHeatmap && (
          <HeatmapOverlay
            heatmapGrid={heatmapGrid}
            heatmapMode={heatmapMode}
          />
        )}

        {/* Active Robot Travel Route Lines */}
        {showPaths && (
          <g className="robot-routes-layer">
            {fleet.map(robot => {
              if (!robot.pathWaypoints || robot.pathWaypoints.length <= 1) return null;
              const isSelected = selectedAgvId === robot.id;
              const remainingWaypoints = robot.pathWaypoints.slice(robot.currentWaypointIndex || 0);
              if (remainingWaypoints.length === 0) return null;

              const posX = (robot.currentPosition?.x || 100).toFixed(1);
              const posY = (robot.currentPosition?.y || 100).toFixed(1);

              const pointsStr = [
                `${posX},${posY}`,
                ...remainingWaypoints.map(wp => `${wp.x},${wp.y}`)
              ].join(' ');

              return (
                <g key={`path-${robot.id}`}>
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : 'rgba(120, 135, 255, 0.38)'}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    strokeDasharray={isSelected ? '6,3' : '3,3'}
                  />
                  {remainingWaypoints.length > 0 && (
                    <circle
                      cx={remainingWaypoints[remainingWaypoints.length - 1].x}
                      cy={remainingWaypoints[remainingWaypoints.length - 1].y}
                      r={isSelected ? 4.5 : 3}
                      fill={isSelected ? '#38bdf8' : '#7887ff'}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Animated Autonomous AGVs / AMRs Vehicles */}
        {fleet.map(robot => {
          const isSelected = selectedAgvId === robot.id;
          const statusColor = getStatusColor(robot.status);
          const isPicking = robot.status === 'PICKING';
          const isCharging = robot.status === 'CHARGING';
          const isWaiting = robot.status === 'WAITING';

          const posX = +(robot.currentPosition?.x || 100).toFixed(2);
          const posY = +(robot.currentPosition?.y || 100).toFixed(2);
          const heading = Math.round(robot.heading || 0);

          return (
            <g
              key={robot.id}
              transform={`translate(${posX}, ${posY})`}
              onClick={() => onSelectAgv(robot.id)}
              className="agv-vehicle"
              style={{ cursor: 'pointer' }}
            >
              {/* Selected Focus Halo */}
              {isSelected && (
                <circle
                  r="23"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="4,3"
                  className="pulse"
                  filter="url(#selectedGlow)"
                />
              )}

              {/* Picking Progress Ring */}
              {isPicking && (
                <circle
                  r="19"
                  fill="none"
                  stroke="#c5adff"
                  strokeWidth="2"
                  strokeDasharray="5,3"
                  className="pulse"
                />
              )}

              {/* Vehicle Body (Smoothly rotated in travel direction) */}
              <g transform={`rotate(${heading})`}>
                <rect x="-15" y="-9" width="3" height="6" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                <rect x="12" y="-9" width="3" height="6" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                <rect x="-15" y="3" width="3" height="6" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                <rect x="12" y="3" width="3" height="6" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />

                <rect
                  x="-13"
                  y="-10"
                  width="26"
                  height="20"
                  rx="4"
                  fill="#1e293b"
                  stroke={isSelected ? '#38bdf8' : statusColor}
                  strokeWidth="1.8"
                />

                <path
                  d="M -3 -10 L 0 -14 L 3 -10 Z"
                  fill={statusColor}
                />

                {robot.hasPayload ? (
                  <rect x="-7" y="-5" width="14" height="10" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                ) : (
                  <rect x="-7" y="-5" width="14" height="10" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
                )}

                <circle
                  cx="0"
                  cy="0"
                  r="2.5"
                  fill={statusColor}
                  filter="url(#robotGlow)"
                />
              </g>

              {/* Upright HUD Elements */}
              <g transform="translate(-10, -17)">
                <rect width="20" height="3" rx="1" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" />
                <rect
                  width={Math.max(2, (robot.battery / 100) * 20)}
                  height="3"
                  rx="1"
                  fill={robot.battery <= 25 ? '#ef4444' : robot.battery <= 50 ? '#f59e0b' : '#10b981'}
                />
              </g>

              <text
                x="0"
                y="17"
                textAnchor="middle"
                fill={isSelected ? '#ffffff' : '#cbd5e1'}
                fontSize="8"
                fontFamily="DM Mono, monospace"
                fontWeight="800"
              >
                {robot.id}
              </text>

              {showTaskLabels && robot.currentTask && (
                <g transform="translate(0, -24)">
                  <rect
                    x="-32"
                    y="-9"
                    width="64"
                    height="12"
                    rx="3"
                    fill="rgba(15, 23, 42, 0.92)"
                    stroke={statusColor}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="7"
                    fontFamily="DM Mono, monospace"
                    fontWeight="700"
                  >
                    {isPicking ? 'PICKING...' : robot.currentTask.orderId}
                  </text>
                </g>
              )}

              {isCharging && (
                <text x="0" y="-23" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                  ⚡ CHARGING ({Math.round(robot.battery)}%)
                </text>
              )}

              {isWaiting && (
                <text x="0" y="-23" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">
                  ⏸ YIELDING
                </text>
              )}

              {/* Development & Debug Overlay: Footprint radius, clearance ring, passing state */}
              {showDebugOverlay && (
                <g className="debug-indicators">
                  {/* Physical Boundary Circle (Radius 13px) */}
                  <circle
                    r="13"
                    fill="rgba(56, 189, 248, 0.12)"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {/* Minimum Safety Clearance Zone (Radius 19px) */}
                  <circle
                    r="19"
                    fill="none"
                    stroke="rgba(244, 63, 94, 0.4)"
                    strokeWidth="0.8"
                    strokeDasharray="3,3"
                  />
                  {/* Passing State Badge */}
                  {robot.passingState && robot.passingState !== 'NORMAL' && (
                    <g transform="translate(0, 26)">
                      <rect
                        x="-36"
                        y="-7"
                        width="72"
                        height="14"
                        rx="3"
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="#a855f7"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#c084fc"
                        fontSize="6.5"
                        fontFamily="DM Mono, monospace"
                        fontWeight="bold"
                      >
                        {robot.passingState} {robot.opposingRobotId ? `→ ${robot.opposingRobotId}` : ''}
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
