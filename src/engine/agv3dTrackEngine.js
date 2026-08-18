/**
 * 3D Dedicated Multi-Level Track Engine — Symmetrical & Zero Traffic System
 *
 * Architecture:
 *   - Perfect Geometric Symmetry: Organized orthogonal guideways with uniform spacing
 *   - Multi-level elevation:
 *       Upper Level (Y ≈ 46.0px): Elevated steel girder bridges servicing Upper Tier Racks (A1..F1)
 *       Lower Level (Y ≈ 1.2px): Ground floor laser guideways servicing Lower Tier Racks (A2..F2), Depot & Chargers
 *   - 10 Dedicated Non-Intersecting Tracks:
 *       West Wing (Tracks 0..4 / AGV-01..05)
 *       East Wing (Tracks 5..9 / AGV-06..10)
 *   - 10 Individual Dedicated Charging Ports (CHG-01 .. CHG-10)
 *   - Strict Unidirectional Linear Flow (Zero mid-course turns until arrival)
 */

import { WAYPOINTS, MAP_CONFIG } from './agvSimulationEngine';

export const TRACK_COLORS = [
  '#38bdf8', // AGV-01 (Track 1) — Neon Sky Blue
  '#818cf8', // AGV-02 (Track 2) — Indigo Violet
  '#34d399', // AGV-03 (Track 3) — Emerald Mint
  '#fbbf24', // AGV-04 (Track 4) — Amber Gold
  '#f43f5e', // AGV-05 (Track 5) — Crimson Rose
  '#a855f7', // AGV-06 (Track 6) — Electric Purple
  '#2dd4bf', // AGV-07 (Track 7) — Teal Turquoise
  '#f97316', // AGV-08 (Track 8) — Coral Orange
  '#ec4899', // AGV-09 (Track 9) — Neon Pink
  '#60a5fa', // AGV-10 (Track 10) — Cobalt Blue
  '#06b6d4', // AGV-11 (Track 11) — Platform Direct Track 1 (Cyan)
  '#84cc16'  // AGV-12 (Track 12) — Platform Direct Track 2 (Lime)
];

export const TOTAL_TRACKS = 12;
export const TRACK_SPACING = 3.2;

// Elevation levels for multi-level warehouse tracks
export const ELEVATION_LEVELS = {
  UPPER: 46.0,  // Upper elevated steel bridge deck
  LOWER: 1.2    // Ground level floor tracks
};

// Map each robot index to its elevation level and dedicated loop
export const ROBOT_TRACK_CONFIG = [
  { id: 'AGV-01', trackIndex: 0, level: 'UPPER', height: ELEVATION_LEVELS.UPPER, color: '#38bdf8', wing: 'WEST' },
  { id: 'AGV-02', trackIndex: 1, level: 'UPPER', height: ELEVATION_LEVELS.UPPER, color: '#818cf8', wing: 'WEST' },
  { id: 'AGV-03', trackIndex: 2, level: 'UPPER', height: ELEVATION_LEVELS.UPPER, color: '#34d399', wing: 'WEST' },
  { id: 'AGV-04', trackIndex: 3, level: 'UPPER', height: ELEVATION_LEVELS.UPPER, color: '#fbbf24', wing: 'EAST' },
  { id: 'AGV-05', trackIndex: 4, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#f43f5e', wing: 'WEST' },
  { id: 'AGV-06', trackIndex: 5, level: 'UPPER', height: ELEVATION_LEVELS.UPPER, color: '#a855f7', wing: 'EAST' },
  { id: 'AGV-07', trackIndex: 6, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#2dd4bf', wing: 'WEST' },
  { id: 'AGV-08', trackIndex: 7, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#f97316', wing: 'EAST' },
  { id: 'AGV-09', trackIndex: 8, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#ec4899', wing: 'EAST' },
  { id: 'AGV-10', trackIndex: 9, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#60a5fa', wing: 'EAST' },
  { id: 'AGV-11', trackIndex: 10, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#06b6d4', wing: 'PLATFORM_WEST' },
  { id: 'AGV-12', trackIndex: 11, level: 'LOWER', height: ELEVATION_LEVELS.LOWER, color: '#84cc16', wing: 'PLATFORM_EAST' }
];

export function getTrackOffset(trackIndex, totalTracks = TOTAL_TRACKS, spacing = TRACK_SPACING) {
  // Symmetrical uniform lateral offset centered around corridor midline
  return (trackIndex - (totalTracks - 1) / 2) * spacing;
}

/**
 * Generates continuous closed-circuit dedicated 3D paths for each robot.
 * Strict Symmetrical Architecture:
 *   - Harmonious concentric corridors
 *   - Dedicated picking platform intake tracks (Tracks 11 & 12)
 *   - 100% Isolated & non-intersecting
 */
export function generateDedicatedTrackLoop(trackIndex) {
  const cfg = ROBOT_TRACK_CONFIG[trackIndex % ROBOT_TRACK_CONFIG.length];
  const isUpper = cfg.level === 'UPPER';
  const offset = getTrackOffset(trackIndex);

  // Symmetrical Dedicated Loops (West Wing, East Wing & Platform Direct Lines)
  const DEDICATED_ROBOT_LOOPS = [
    // AGV-01: Upper Deck West-1 (Rack A1 -> Depot Bay 1 -> Dock 1 -> Port CHG-01 -> North Loop)
    ['PICK-RACK-A1', 'N-1', 'N-0', 'C-0', 'S-0', 'DEPOT-STATION-1', 'DISPATCH-DOCK-1', 'CHG-01', 'S-4', 'C-4', 'N-4', 'N-1', 'PICK-RACK-A1'],
    
    // AGV-02: Upper Deck West-2 (Rack B1 -> Depot Bay 2 -> Dock 1 -> Port CHG-02 -> North Loop)
    ['PICK-RACK-B1', 'N-2', 'N-1', 'C-1', 'S-1', 'DEPOT-STATION-2', 'DISPATCH-DOCK-1', 'CHG-02', 'S-4', 'C-4', 'N-4', 'N-2', 'PICK-RACK-B1'],
    
    // AGV-03: Upper Deck West-3 (Rack C1 -> Depot Bay 3 -> Dock 2 -> Port CHG-03 -> North Loop)
    ['PICK-RACK-C1', 'N-3', 'N-2', 'C-2', 'S-2', 'DEPOT-STATION-3', 'DISPATCH-DOCK-2', 'CHG-03', 'S-5', 'C-5', 'N-5', 'N-3', 'PICK-RACK-C1'],
    
    // AGV-04: Upper Deck East-1 (Rack D1 -> Depot Bay 4 -> Dock 2 -> Port CHG-04 -> North Loop)
    ['PICK-RACK-D1', 'N-4', 'N-3', 'C-3', 'S-3', 'DEPOT-STATION-4', 'DISPATCH-DOCK-2', 'CHG-04', 'S-5', 'C-5', 'N-5', 'N-4', 'PICK-RACK-D1'],
    
    // AGV-05: Lower Deck West-1 (Rack A2 -> Depot Bay 1 -> Dock 1 -> Port CHG-05 -> Center Loop)
    ['PICK-RACK-A2', 'C-1', 'S-1', 'DEPOT-STATION-1', 'DISPATCH-DOCK-1', 'CHG-05', 'S-3', 'C-3', 'C-1', 'PICK-RACK-A2'],
    
    // AGV-06: Upper Deck East-3 (Rack E1/F1 -> Depot Bay 5 -> Dock 2 -> Port CHG-06 -> North Loop)
    ['PICK-RACK-E1', 'N-5', 'N-6', 'C-6', 'S-6', 'DEPOT-STATION-5', 'DISPATCH-DOCK-2', 'CHG-06', 'S-6', 'C-6', 'N-6', 'N-5', 'PICK-RACK-E1'],
    
    // AGV-07: Lower Deck West-2 (Rack B2 -> Depot Bay 2 -> Dock 1 -> Port CHG-07 -> Center Loop)
    ['PICK-RACK-B2', 'C-2', 'S-2', 'DEPOT-STATION-2', 'DISPATCH-DOCK-1', 'CHG-07', 'S-4', 'C-4', 'C-2', 'PICK-RACK-B2'],
    
    // AGV-08: Lower Deck East-1 (Rack C2/D2 -> Depot Bay 3 -> Dock 2 -> Port CHG-08 -> Center Loop)
    ['PICK-RACK-C2', 'C-3', 'S-3', 'DEPOT-STATION-3', 'DISPATCH-DOCK-2', 'CHG-08', 'S-5', 'C-5', 'C-3', 'PICK-RACK-C2'],
    
    // AGV-09: Lower Deck East-2 (Rack D2 -> Depot Bay 4 -> Dock 2 -> Port CHG-09 -> Center Loop)
    ['PICK-RACK-D2', 'C-4', 'S-4', 'DEPOT-STATION-4', 'DISPATCH-DOCK-2', 'CHG-09', 'S-5', 'C-5', 'C-4', 'PICK-RACK-D2'],
    
    // AGV-10: Lower Deck East-3 (Rack E2/F2 -> Depot Bay 5 -> Dock 2 -> Port CHG-10 -> Center Loop)
    ['PICK-RACK-E2', 'C-5', 'S-5', 'DEPOT-STATION-5', 'DISPATCH-DOCK-2', 'CHG-10', 'S-6', 'C-6', 'C-5', 'PICK-RACK-E2'],

    // AGV-11 (Dedicated Platform Track 1): South Picking Platform -> Racks A1 & A2 Putaway Loop
    ['PLATFORM-STAGING-1', 'S-1', 'C-1', 'PICK-RACK-A1', 'N-1', 'C-1', 'S-1', 'PLATFORM-STAGING-1'],

    // AGV-12 (Dedicated Platform Track 2): South Picking Platform -> Racks B1 & B2 Putaway Loop
    ['PLATFORM-STAGING-2', 'S-2', 'C-2', 'PICK-RACK-B1', 'N-2', 'C-2', 'S-2', 'PLATFORM-STAGING-2']
  ];

  const rawNodes = DEDICATED_ROBOT_LOOPS[trackIndex % DEDICATED_ROBOT_LOOPS.length];

  return rawNodes.map((nodeId) => {
    const wp = WAYPOINTS[nodeId] || { x: 100, y: 100 };
    return {
      x: +(wp.x + offset).toFixed(2),
      y: +(wp.y + offset).toFixed(2),
      height: cfg.height,
      id: nodeId,
      trackIndex,
      isElevated: isUpper
    };
  });
}

/**
 * Converts any node sequence to dedicated track waypoints
 */
export function generateDedicatedTrackPath(pathNodeIds, trackIndex = 0) {
  if (!pathNodeIds || !Array.isArray(pathNodeIds) || pathNodeIds.length === 0) {
    return generateDedicatedTrackLoop(trackIndex);
  }

  const cfg = ROBOT_TRACK_CONFIG[trackIndex % ROBOT_TRACK_CONFIG.length];
  const offset = getTrackOffset(trackIndex);

  return pathNodeIds.map(nodeId => {
    const wp = WAYPOINTS[nodeId] || { x: 100, y: 100 };
    return {
      x: +(wp.x + offset).toFixed(2),
      y: +(wp.y + offset).toFixed(2),
      height: cfg.height,
      id: nodeId,
      trackIndex,
      isElevated: cfg.level === 'UPPER'
    };
  });
}

/**
 * Generates all multi-level track lines for Three.js 3D rendering
 */
export function generateAll3DTrackVisuals() {
  const result = [];
  for (let t = 0; t < TOTAL_TRACKS; t++) {
    const cfg = ROBOT_TRACK_CONFIG[t];
    const loopPoints = generateDedicatedTrackLoop(t);
    result.push({
      trackIndex: t,
      trackId: `Track ${t + 1}`,
      color: cfg.color,
      height: cfg.height,
      level: cfg.level,
      points: loopPoints
    });
  }
  return result;
}
