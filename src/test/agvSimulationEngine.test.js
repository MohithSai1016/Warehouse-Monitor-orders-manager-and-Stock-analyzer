import { describe, it, expect } from 'vitest';
import { 
  findShortestPath, 
  pathToCoordinates, 
  lerpAngle, 
  smoothVelocity, 
  AGV_STATES, 
  MAP_CONFIG, 
  WAYPOINTS 
} from '../engine/agvSimulationEngine';

describe('Autonomous Mobile Robot (AGV) Simulation Engine', () => {
  it('should find shortest path using BFS corridor graph', () => {
    const path = findShortestPath('CHG-01', 'PICK-RACK-A1');
    expect(path.length).toBeGreaterThan(1);
    expect(path[0]).toBe('CHG-01');
    expect(path[path.length - 1]).toBe('PICK-RACK-A1');
  });

  it('should return immediate node when start and target are the same', () => {
    const path = findShortestPath('CHG-01', 'CHG-01');
    expect(path).toEqual(['CHG-01']);
  });

  it('should map waypoint node IDs to coordinate objects', () => {
    const coords = pathToCoordinates(['CHG-01', 'S-4', 'C-4']);
    expect(coords.length).toBe(3);
    expect(coords[0].x).toBe(WAYPOINTS['CHG-01'].x);
    expect(coords[0].y).toBe(WAYPOINTS['CHG-01'].y);
  });

  it('should smoothly interpolate angles without jumping 360 degrees', () => {
    const interpolated = lerpAngle(10, 50, 180, 0.1);
    expect(interpolated).toBeGreaterThan(10);
    expect(interpolated).toBeLessThanOrEqual(50);
  });

  it('should apply trapezoidal velocity smoothing during acceleration and braking', () => {
    // Accelerate from 0 to 100
    const accelerated = smoothVelocity(0, 100, 50, 80, 0.5);
    expect(accelerated).toBe(25); // 0 + 50 * 0.5 = 25

    // Decelerate from 100 to 0
    const decelerated = smoothVelocity(100, 0, 50, 80, 0.5);
    expect(decelerated).toBe(60); // 100 - 80 * 0.5 = 60
  });

  it('should have valid layout configuration and racks', () => {
    expect(MAP_CONFIG.racks.length).toBe(12);
    expect(MAP_CONFIG.chargingStations.length).toBe(10);
    expect(MAP_CONFIG.width).toBe(960);
    expect(MAP_CONFIG.height).toBe(600);
  });

  it('should define all expected AGV state machine states', () => {
    expect(AGV_STATES.IDLE).toBe('IDLE');
    expect(AGV_STATES.MOVING_TO_PICK).toBe('MOVING_TO_PICK');
    expect(AGV_STATES.PICKING).toBe('PICKING');
    expect(AGV_STATES.CHARGING).toBe('CHARGING');
  });
});
