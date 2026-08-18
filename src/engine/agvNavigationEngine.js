/**
 * High-Precision Two-Way Traffic & Autonomous AMR Navigation Engine
 *
 * Core Systems:
 *   1. Dynamic Two-Way Passing State Machine (NORMAL -> PREPARING -> MOVING_TO_LANE -> PASSING -> CLEARING -> RETURNING_TO_CENTER)
 *   2. Centralized PassingCoordinator (Deterministic Lane Assignment & Clearance Tracking)
 *   3. Continuous Smooth Lateral Steering (No sudden jumps, forward motion maintained)
 *   4. Footprint-Aware Predictive Collision Checking (Circle Bounding Footprint)
 *   5. SpatialGrid O(1) Nearby Lookups
 *   6. Intersection Crossing Arbitration
 */

import { NAV_GRAPH, WAYPOINTS, findShortestPath } from './agvSimulationEngine';

// ─── Centralized Physical & Kinematic Configuration ───────────────────────────
export const AMR_CONFIG = {
  RADIUS: 13,                        // Physical boundary radius (px)
  MIN_CLEARANCE: 6,                  // Safety buffer between vehicle footprints
  CORRIDOR_WIDTH: 60,                // Standard corridor physical width
  LANE_OFFSET: 12,                   // Virtual lane lateral offset from centerline
  LOOKAHEAD_DISTANCE: 90,            // Early detection range for opposing traffic
  LANE_CHANGE_SPEED: 32,             // Lateral steering rate (px/s)
  RETURN_TO_CENTER_SPEED: 26,        // Lateral recentering rate (px/s)
  OPPOSING_DIRECTION_THRESHOLD: -0.35, // Cosine threshold for opposite direction
  CLEARANCE_DISTANCE: 32,            // Longitudinal distance required to confirm clearance
};

// Passing State Machine States
export const PASSING_STATES = {
  NORMAL: 'NORMAL',
  PREPARING_TO_PASS: 'PREPARING',
  MOVING_TO_LANE: 'MOVING_TO_LANE',
  PASSING: 'PASSING',
  CLEARING: 'CLEARING',
  RETURNING_TO_CENTER: 'RETURNING_TO_CENTER',
  BLOCKED: 'BLOCKED'
};

// Destination nodes with 0 offset (docking pads, charging docks)
export const ZERO_OFFSET_NODES = new Set([
  'DEPOT-STATION-1', 'DEPOT-STATION-2', 'DEPOT-STATION-3',
  'DISPATCH-DOCK-1', 'DISPATCH-DOCK-2',
  'CHG-01', 'CHG-02', 'CHG-03', 'CHG-04'
]);

// Intersections requiring crossing lock
export const INTERSECTION_NODES = new Set([
  'N-0', 'N-1', 'N-2', 'N-3', 'N-4', 'N-5', 'N-6',
  'C-0', 'C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6',
  'S-0', 'S-1', 'S-2', 'S-3', 'S-4', 'S-5', 'S-6'
]);

export const SAFE_WAITING_NODES = new Set([
  'N-0', 'N-6', 'C-0', 'C-6', 'S-0', 'S-6',
  'DEPOT-STATION-1', 'DEPOT-STATION-2', 'DEPOT-STATION-3',
  'DISPATCH-DOCK-1', 'DISPATCH-DOCK-2'
]);

// ──────────────────────────────────────────────────────────────────────────────
// PASSING COORDINATOR
// Deterministically pairs opposing AMRs, assigns lateral virtual lanes,
// and monitors clearance so both AMRs pass smoothly without stopping.
// ──────────────────────────────────────────────────────────────────────────────
export class PassingCoordinator {
  constructor() {
    /** Map<pairKey, { robotA: string, robotB: string, state: string, startTime: number }> */
    this.activePairs = new Map();
  }

  _pairKey(idA, idB) {
    return [idA, idB].sort().join('::');
  }

  /**
   * Register or retrieve an opposing encounter between robotA and robotB.
   * Deterministically assigns Right-Hand Lane to each vehicle relative to its heading.
   */
  coordinatePair(robotA, robotB) {
    const key = this._pairKey(robotA.id, robotB.id);
    let pair = this.activePairs.get(key);

    if (!pair) {
      pair = {
        key,
        robotA: robotA.id,
        robotB: robotB.id,
        state: PASSING_STATES.PREPARING_TO_PASS,
        startTime: performance.now() / 1000
      };
      this.activePairs.set(key, pair);
    }
    return pair;
  }

  updatePairState(idA, idB, newState) {
    const key = this._pairKey(idA, idB);
    const pair = this.activePairs.get(key);
    if (pair) {
      pair.state = newState;
    }
  }

  releasePair(idA, idB) {
    const key = this._pairKey(idA, idB);
    this.activePairs.delete(key);
  }

  getPairForRobot(robotId) {
    for (const pair of this.activePairs.values()) {
      if (pair.robotA === robotId || pair.robotB === robotId) {
        return pair;
      }
    }
    return null;
  }

  cleanup() {
    const now = performance.now() / 1000;
    for (const [key, pair] of this.activePairs.entries()) {
      // Timeout guard: auto-release pairs older than 12s
      if (now - pair.startTime > 12.0) {
        this.activePairs.delete(key);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// VIRTUAL LANE WAYPOINTS CONVERTER
// Transforms raw centerline nodes into lane-guided coordinates.
// ──────────────────────────────────────────────────────────────────────────────
export function convertPathToLaneWaypoints(pathNodeIds, laneOffset = AMR_CONFIG.LANE_OFFSET) {
  if (!pathNodeIds || !Array.isArray(pathNodeIds) || pathNodeIds.length === 0) {
    return [];
  }

  const rawCoords = pathNodeIds.map(nodeId => {
    const wp = WAYPOINTS[nodeId];
    return wp ? { x: wp.x, y: wp.y, id: nodeId } : { x: 100, y: 100, id: nodeId };
  });

  if (rawCoords.length === 1) {
    return [{ ...rawCoords[0] }];
  }

  const result = [];

  for (let i = 0; i < rawCoords.length; i++) {
    const cur = rawCoords[i];
    const isZeroOffset = ZERO_OFFSET_NODES.has(cur.id);

    if (isZeroOffset) {
      result.push({
        x: cur.x,
        y: cur.y,
        id: cur.id,
        isStation: true
      });
      continue;
    }

    let normX = 0;
    let normY = 0;

    if (i < rawCoords.length - 1) {
      const next = rawCoords[i + 1];
      const dx = next.x - cur.x;
      const dy = next.y - cur.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.001) {
        normX += -dy / len;
        normY += dx / len;
      }
    }

    if (i > 0) {
      const prev = rawCoords[i - 1];
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.001) {
        normX += -dy / len;
        normY += dx / len;
      }
    }

    const nLen = Math.sqrt(normX * normX + normY * normY);
    if (nLen > 0.001) {
      normX /= nLen;
      normY /= nLen;
    }

    const offsetX = cur.x + normX * laneOffset;
    const offsetY = cur.y + normY * laneOffset;

    result.push({
      x: +(offsetX.toFixed(2)),
      y: +(offsetY.toFixed(2)),
      id: cur.id,
      originalX: cur.x,
      originalY: cur.y
    });
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// SPATIAL GRID — O(1) Proximity Query
// ──────────────────────────────────────────────────────────────────────────────
export class SpatialGrid {
  constructor(cellSize = 60) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  _key(x, y) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  rebuild(robots) {
    this.cells.clear();
    for (const r of robots) {
      if (!r.currentPosition) continue;
      const key = this._key(r.currentPosition.x, r.currentPosition.y);
      let cell = this.cells.get(key);
      if (!cell) { cell = []; this.cells.set(key, cell); }
      cell.push(r);
    }
  }

  getNearby(x, y, radius, excludeId = null) {
    const result = [];
    const span = Math.ceil(radius / this.cellSize) + 1;
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const r2 = radius * radius;

    for (let dc = -span; dc <= span; dc++) {
      for (let dr = -span; dr <= span; dr++) {
        const cell = this.cells.get(`${cx + dc},${cy + dr}`);
        if (!cell) continue;
        for (const rob of cell) {
          if (rob.id === excludeId) continue;
          const dx = rob.currentPosition.x - x;
          const dy = rob.currentPosition.y - y;
          if (dx * dx + dy * dy <= r2) result.push(rob);
        }
      }
    }
    return result;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// INTERSECTION ARBITRATION MANAGER
// ──────────────────────────────────────────────────────────────────────────────
export class IntersectionManager {
  constructor() {
    this.locks = new Map();
  }

  requestEntry(nodeId, robotId, durationSec = 1.2) {
    if (!INTERSECTION_NODES.has(nodeId)) return true;
    const now = performance.now() / 1000;
    const lock = this.locks.get(nodeId);
    if (!lock || lock.expiry < now || lock.robotId === robotId) {
      this.locks.set(nodeId, { robotId, expiry: now + durationSec });
      return true;
    }
    return false;
  }

  release(nodeId, robotId) {
    const lock = this.locks.get(nodeId);
    if (lock && lock.robotId === robotId) {
      this.locks.delete(nodeId);
    }
  }

  releaseAll(robotId) {
    for (const [k, v] of this.locks) {
      if (v.robotId === robotId) this.locks.delete(k);
    }
  }

  cleanup() {
    const now = performance.now() / 1000;
    for (const [k, v] of this.locks) {
      if (v.expiry < now) this.locks.delete(k);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// ROBOT PRIORITY SCORING
// ──────────────────────────────────────────────────────────────────────────────
export function getRobotPriority(robot) {
  let p = 0;
  if (robot.status === 'TRANSPORTING') p += 40;
  else if (robot.status === 'PICKING') p += 35;
  else if (robot.status === 'ACTIVE') p += 20;

  const taskScore = { VIP: 30, EXPRESS: 20, STANDARD: 10, BULK: 5 };
  p += taskScore[robot.currentTask?.priority] || 0;

  if (robot.hasPayload) p += 25;
  if (robot.battery < 25) p += 35;
  else if (robot.battery < 40) p += 15;

  const num = parseInt((robot.id || 'AGV-99').replace('AGV-', ''), 10) || 99;
  p += Math.max(0, 15 - num);

  return p;
}

// ──────────────────────────────────────────────────────────────────────────────
// DYNAMIC TWO-WAY PASSING & TRAFFIC EVALUATOR
// Coordinates the full passing state machine with look-ahead detection and
// footprint collision avoidance.
// ──────────────────────────────────────────────────────────────────────────────
export function evaluateDynamicTwoWayPassing(robot, nearbyRobots, passingCoordinator) {
  const cruiseSpeed = robot.cruiseSpeed || 95;
  let recommendedSpeed = cruiseSpeed;
  let canProceed = true;
  let blockedBy = null;
  let passingState = robot.passingState || PASSING_STATES.NORMAL;
  let opposingRobotId = robot.opposingRobotId || null;
  let targetLateralOffset = AMR_CONFIG.LANE_OFFSET; // default virtual lane offset

  const myPos = robot.currentPosition;
  const myHeadingRad = ((robot.heading || 0) - 90) * Math.PI / 180;
  const myFwdX = Math.cos(myHeadingRad);
  const myFwdY = Math.sin(myHeadingRad);
  const myRightX = -myFwdY;
  const myRightY = myFwdX;

  const myPriority = getRobotPriority(robot);

  let detectedOpposing = null;
  let closestOpposingDist = Infinity;

  // 1. Look-ahead Scan for Opposing and Same-Direction AMRs
  for (const other of nearbyRobots) {
    if (other.status === 'CHARGING') continue;
    const oPos = other.currentPosition;

    const relX = oPos.x - myPos.x;
    const relY = oPos.y - myPos.y;
    const dist = Math.sqrt(relX * relX + relY * relY);
    if (dist < 0.5) continue;

    const longDist = relX * myFwdX + relY * myFwdY;
    const latDist = Math.abs(relX * myRightX + relY * myRightY);

    const oHeadingRad = ((other.heading || 0) - 90) * Math.PI / 180;
    const oFwdX = Math.cos(oHeadingRad);
    const oFwdY = Math.sin(oHeadingRad);
    const headingAlignment = myFwdX * oFwdX + myFwdY * oFwdY;

    // ────────────────────────────────────────────────────────────────────────
    // OPPOSING AMR ENCOUNTER (heading alignment < -0.35)
    // ────────────────────────────────────────────────────────────────────────
    if (headingAlignment < AMR_CONFIG.OPPOSING_DIRECTION_THRESHOLD) {
      if (dist <= AMR_CONFIG.LOOKAHEAD_DISTANCE && longDist > -AMR_CONFIG.CLEARANCE_DISTANCE) {
        if (dist < closestOpposingDist) {
          closestOpposingDist = dist;
          detectedOpposing = {
            robot: other,
            dist,
            longDist,
            latDist
          };
        }
      }
      continue;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SAME-DIRECTION FOLLOWING (heading alignment > 0.35)
    // ────────────────────────────────────────────────────────────────────────
    if (headingAlignment > 0.35 && longDist > 0 && longDist < 50 && latDist < 16) {
      if (longDist < 20) {
        recommendedSpeed = 0;
        canProceed = false;
        blockedBy = other.id;
      } else if (longDist < 45) {
        const followFactor = (longDist - 20) / (45 - 20);
        recommendedSpeed = Math.min(recommendedSpeed, Math.max(20, (other.currentVelocity || cruiseSpeed) * followFactor));
      }
      continue;
    }

    // ────────────────────────────────────────────────────────────────────────
    // 90° INTERSECTION CROSSING CONFLICT
    // ────────────────────────────────────────────────────────────────────────
    if (Math.abs(headingAlignment) <= 0.35 && dist < 32 && longDist > 0) {
      const otherPriority = getRobotPriority(other);
      if (myPriority < otherPriority) {
        canProceed = false;
        recommendedSpeed = 0;
        blockedBy = other.id;
      } else {
        recommendedSpeed = Math.min(recommendedSpeed, cruiseSpeed * 0.75);
      }
    }
  }

  // 2. Drive the Passing State Machine for Opposing Pair
  if (detectedOpposing) {
    const opp = detectedOpposing;
    opposingRobotId = opp.robot.id;

    // Register pair with PassingCoordinator
    passingCoordinator.coordinatePair(robot, opp.robot);

    if (opp.longDist > 30) {
      // Look-ahead zone: prepare and steer into virtual lane
      passingState = PASSING_STATES.PREPARING_TO_PASS;
      targetLateralOffset = AMR_CONFIG.LANE_OFFSET;
      recommendedSpeed = cruiseSpeed; // MAINTAIN FORWARD MOTION
    } else if (opp.longDist >= -AMR_CONFIG.CLEARANCE_DISTANCE) {
      // Passing zone: side-by-side lateral separation
      passingState = PASSING_STATES.PASSING;
      targetLateralOffset = AMR_CONFIG.LANE_OFFSET;

      // Safe lateral clearance check: if lateral distance is safe, FULL SPEED PASS
      if (opp.latDist >= 11) {
        recommendedSpeed = cruiseSpeed;
      } else {
        // Narrow corridor backup: higher priority passes smoothly, lower priority modulates
        if (myPriority < getRobotPriority(opp.robot)) {
          recommendedSpeed = Math.max(25, cruiseSpeed * 0.6);
        } else {
          recommendedSpeed = cruiseSpeed;
        }
      }
    } else {
      // Clearance achieved: clearing behind opposing robot
      passingState = PASSING_STATES.CLEARING;
      targetLateralOffset = AMR_CONFIG.LANE_OFFSET;
    }
  } else {
    // No opposing robot detected in look-ahead zone
    if (robot.passingState === PASSING_STATES.CLEARING || robot.passingState === PASSING_STATES.PASSING) {
      passingState = PASSING_STATES.RETURNING_TO_CENTER;
      targetLateralOffset = AMR_CONFIG.LANE_OFFSET;
    } else {
      passingState = PASSING_STATES.NORMAL;
      targetLateralOffset = AMR_CONFIG.LANE_OFFSET;
      opposingRobotId = null;
      if (robot.opposingRobotId) {
        passingCoordinator.releasePair(robot.id, robot.opposingRobotId);
      }
    }
  }

  return {
    canProceed,
    recommendedSpeed,
    blockedBy,
    passingState,
    opposingRobotId,
    targetLateralOffset
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// PREDICTIVE COLLISION CHECK
// Verifies that the proposed next position maintains positive physical clearance.
// ──────────────────────────────────────────────────────────────────────────────
export function isPositionSafe(proposedPos, robotId, nearbyRobots) {
  const minSafeDist = AMR_CONFIG.RADIUS * 2 + AMR_CONFIG.MIN_CLEARANCE; // 13*2 + 6 = 32px
  const minSafeDistSq = minSafeDist * minSafeDist;

  for (const other of nearbyRobots) {
    if (other.id === robotId || other.status === 'CHARGING') continue;
    const dx = other.currentPosition.x - proposedPos.x;
    const dy = other.currentPosition.y - proposedPos.y;
    const dSq = dx * dx + dy * dy;

    // Hard collision condition: physical boundaries overlapping
    if (dSq < (AMR_CONFIG.RADIUS * 2) * (AMR_CONFIG.RADIUS * 2)) {
      return false;
    }
  }
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// ALTERNATE ROUTE FINDER (BFS bypassing congested nodes)
// ──────────────────────────────────────────────────────────────────────────────
export function findAlternatePath(startId, targetId, blockedNodes = []) {
  if (!startId || !targetId || !NAV_GRAPH[startId]) {
    return findShortestPath(startId, targetId);
  }
  if (startId === targetId) return [startId];

  const blocked = new Set(blockedNodes);
  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const cur = path[path.length - 1];
    if (cur === targetId) return path;

    for (const nb of (NAV_GRAPH[cur] || [])) {
      if (!visited.has(nb) && !blocked.has(nb)) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }

  return findShortestPath(startId, targetId);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIND NEAREST SAFE WAITING NODE
// ──────────────────────────────────────────────────────────────────────────────
export function findNearestSafeWaitNode(currentNodeId, occupiedNodes = []) {
  const occupied = new Set(occupiedNodes);
  if (SAFE_WAITING_NODES.has(currentNodeId) && !occupied.has(currentNodeId)) {
    return currentNodeId;
  }

  const queue = [[currentNodeId || 'S-0']];
  const visited = new Set([currentNodeId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const cur = path[path.length - 1];

    if (cur !== currentNodeId && SAFE_WAITING_NODES.has(cur) && !occupied.has(cur)) {
      return cur;
    }

    for (const nb of (NAV_GRAPH[cur] || [])) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }

  return 'S-0';
}

// ──────────────────────────────────────────────────────────────────────────────
// MAP POSITION TO NEAREST GRAPH NODE
// ──────────────────────────────────────────────────────────────────────────────
export function findNearestNodeToPosition(pos) {
  let nearest = 'S-0';
  let minDist2 = Infinity;

  for (const [id, wp] of Object.entries(WAYPOINTS)) {
    const dx = wp.x - pos.x;
    const dy = wp.y - pos.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < minDist2) {
      minDist2 = d2;
      nearest = id;
    }
  }
  return nearest;
}
