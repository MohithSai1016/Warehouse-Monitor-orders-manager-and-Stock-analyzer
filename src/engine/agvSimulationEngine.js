import { generateDedicatedTrackPath } from './agv3dTrackEngine';

// Warehouse Physical Dimensions (in simulation coordinate units)
export const MAP_CONFIG = {
  width: 960,
  height: 600,
  depotArea: { x: 40, y: 440, width: 220, height: 120, label: 'Packaging & Staging Depot' },
  shippingArea: { x: 280, y: 440, width: 240, height: 120, label: 'Outbound Courier Dispatch' },
  chargingStations: [
    { id: 'CHG-01', agvId: 'AGV-01', x: 550, y: 480, label: 'Port 01 (AGV-01)' },
    { id: 'CHG-02', agvId: 'AGV-02', x: 590, y: 480, label: 'Port 02 (AGV-02)' },
    { id: 'CHG-03', agvId: 'AGV-03', x: 630, y: 480, label: 'Port 03 (AGV-03)' },
    { id: 'CHG-04', agvId: 'AGV-04', x: 670, y: 480, label: 'Port 04 (AGV-04)' },
    { id: 'CHG-05', agvId: 'AGV-05', x: 710, y: 480, label: 'Port 05 (AGV-05)' },
    { id: 'CHG-06', agvId: 'AGV-06', x: 750, y: 480, label: 'Port 06 (AGV-06)' },
    { id: 'CHG-07', agvId: 'AGV-07', x: 790, y: 480, label: 'Port 07 (AGV-07)' },
    { id: 'CHG-08', agvId: 'AGV-08', x: 830, y: 480, label: 'Port 08 (AGV-08)' },
    { id: 'CHG-09', agvId: 'AGV-09', x: 870, y: 480, label: 'Port 09 (AGV-09)' },
    { id: 'CHG-10', agvId: 'AGV-10', x: 910, y: 480, label: 'Port 10 (AGV-10)' }
  ],
  // 6 Main Aisle Storage Racks
  racks: [
    { id: 'RACK-A1', aisle: 'Aisle 01', zone: 'Zone A', x: 60, y: 70, width: 90, height: 110, color: '#32d49b', name: 'Atta, Flours & Basmati Rice' },
    { id: 'RACK-A2', aisle: 'Aisle 01', zone: 'Zone A', x: 60, y: 220, width: 90, height: 110, color: '#32d49b', name: 'Edible Oils, Ghee & Pulses' },
    { id: 'RACK-B1', aisle: 'Aisle 02', zone: 'Zone B', x: 210, y: 70, width: 90, height: 110, color: '#cfb4ff', name: 'Potato Chips & Crisps' },
    { id: 'RACK-B2', aisle: 'Aisle 02', zone: 'Zone B', x: 210, y: 220, width: 90, height: 110, color: '#cfb4ff', name: 'Chocolates & Soft Drinks' },
    { id: 'RACK-C1', aisle: 'Aisle 03', zone: 'Zone C', x: 360, y: 70, width: 90, height: 110, color: '#f7ba63', name: 'Laundry Detergents & Gels' },
    { id: 'RACK-C2', aisle: 'Aisle 03', zone: 'Zone C', x: 360, y: 220, width: 90, height: 110, color: '#f7ba63', name: 'Floor Cleaners & Sprays' },
    { id: 'RACK-D1', aisle: 'Aisle 04', zone: 'Zone D', x: 510, y: 70, width: 90, height: 110, color: '#6ee6e6', name: 'Handwash & Shampoos' },
    { id: 'RACK-D2', aisle: 'Aisle 04', zone: 'Zone D', x: 510, y: 220, width: 90, height: 110, color: '#6ee6e6', name: 'Skincare & Oral Wellness' },
    { id: 'RACK-E1', aisle: 'Aisle 05', zone: 'Zone E', x: 660, y: 70, width: 90, height: 110, color: '#8290ff', name: 'Instant Noodles & Biscuits' },
    { id: 'RACK-E2', aisle: 'Aisle 05', zone: 'Zone E', x: 660, y: 220, width: 90, height: 110, color: '#8290ff', name: 'Juices, Tea & Coffees' },
    { id: 'RACK-F1', aisle: 'Aisle 06', zone: 'Zone F', x: 810, y: 70, width: 90, height: 110, color: '#ff9aa2', name: 'Paper Towels & Tissues' },
    { id: 'RACK-F2', aisle: 'Aisle 06', zone: 'Zone F', x: 810, y: 220, width: 90, height: 110, color: '#ff9aa2', name: 'Insect Sprays & Batteries' }
  ]
};

// Precise Navigation Waypoints (Corridor intersections and docking nodes)
export const WAYPOINTS = {
  // North Cross-Corridor (Y = 35)
  'N-0': { x: 30, y: 35 },
  'N-1': { x: 175, y: 35 },
  'N-2': { x: 325, y: 35 },
  'N-3': { x: 475, y: 35 },
  'N-4': { x: 625, y: 35 },
  'N-5': { x: 775, y: 35 },
  'N-6': { x: 925, y: 35 },

  // Center Cross-Corridor (Y = 195)
  'C-0': { x: 30, y: 195 },
  'C-1': { x: 175, y: 195 },
  'C-2': { x: 325, y: 195 },
  'C-3': { x: 475, y: 195 },
  'C-4': { x: 625, y: 195 },
  'C-5': { x: 775, y: 195 },
  'C-6': { x: 925, y: 195 },

  // South Cross-Corridor (Main Arterial Highway, Y = 365)
  'S-0': { x: 30, y: 365 },
  'S-1': { x: 175, y: 365 },
  'S-2': { x: 325, y: 365 },
  'S-3': { x: 475, y: 365 },
  'S-4': { x: 625, y: 365 },
  'S-5': { x: 775, y: 365 },
  'S-6': { x: 925, y: 365 },

  // Dedicated Packaging Depot Stations (Y = 480)
  'DEPOT-STATION-1': { x: 60, y: 480 },
  'DEPOT-STATION-2': { x: 100, y: 480 },
  'DEPOT-STATION-3': { x: 140, y: 480 },
  'DEPOT-STATION-4': { x: 180, y: 480 },
  'DEPOT-STATION-5': { x: 220, y: 480 },

  // South Front Picking Platform Staging Dock Nodes (Y = 560)
  'PLATFORM-STAGING-1': { x: 175, y: 560 },
  'PLATFORM-STAGING-2': { x: 325, y: 560 },

  // Dispatch Docks (Y = 480)
  'DISPATCH-DOCK-1': { x: 340, y: 480 },
  'DISPATCH-DOCK-2': { x: 440, y: 480 },

  // 10 Individual Dedicated Charging Stations (Exclusive for AGV-01 .. AGV-10)
  'CHG-01': { x: 550, y: 480 },
  'CHG-02': { x: 590, y: 480 },
  'CHG-03': { x: 630, y: 480 },
  'CHG-04': { x: 670, y: 480 },
  'CHG-05': { x: 710, y: 480 },
  'CHG-06': { x: 750, y: 480 },
  'CHG-07': { x: 790, y: 480 },
  'CHG-08': { x: 830, y: 480 },
  'CHG-09': { x: 870, y: 480 },
  'CHG-10': { x: 910, y: 480 },

  // Rack Pick Access Points
  'PICK-RACK-A1': { x: 175, y: 110 },
  'PICK-RACK-A2': { x: 175, y: 260 },
  'PICK-RACK-B1': { x: 325, y: 110 },
  'PICK-RACK-B2': { x: 325, y: 260 },
  'PICK-RACK-C1': { x: 475, y: 110 },
  'PICK-RACK-C2': { x: 475, y: 260 },
  'PICK-RACK-D1': { x: 625, y: 110 },
  'PICK-RACK-D2': { x: 625, y: 260 },
  'PICK-RACK-E1': { x: 775, y: 110 },
  'PICK-RACK-E2': { x: 775, y: 260 },
  'PICK-RACK-F1': { x: 925, y: 110 },
  'PICK-RACK-F2': { x: 925, y: 260 }
};

// Graph Adjacency List for Shortest Path Navigation (BFS / Dijkstra)
export const NAV_GRAPH = {
  // North Corridor
  'N-0': ['N-1', 'C-0'],
  'N-1': ['N-0', 'N-2', 'PICK-RACK-A1', 'C-1'],
  'N-2': ['N-1', 'N-3', 'PICK-RACK-B1', 'C-2'],
  'N-3': ['N-2', 'N-4', 'PICK-RACK-C1', 'C-3'],
  'N-4': ['N-3', 'N-5', 'PICK-RACK-D1', 'C-4'],
  'N-5': ['N-4', 'N-6', 'PICK-RACK-E1', 'C-5'],
  'N-6': ['N-5', 'PICK-RACK-F1', 'C-6'],

  // Center Corridor
  'C-0': ['N-0', 'C-1', 'S-0'],
  'C-1': ['N-1', 'C-0', 'C-2', 'PICK-RACK-A1', 'PICK-RACK-A2', 'S-1'],
  'C-2': ['N-2', 'C-1', 'C-3', 'PICK-RACK-B1', 'PICK-RACK-B2', 'S-2'],
  'C-3': ['N-3', 'C-2', 'C-4', 'PICK-RACK-C1', 'PICK-RACK-C2', 'S-3'],
  'C-4': ['N-4', 'C-3', 'C-5', 'PICK-RACK-D1', 'PICK-RACK-D2', 'S-4'],
  'C-5': ['N-5', 'C-4', 'C-6', 'PICK-RACK-E1', 'PICK-RACK-E2', 'S-5'],
  'C-6': ['N-6', 'C-5', 'PICK-RACK-F1', 'PICK-RACK-F2', 'S-6'],

  // South Corridor
  'S-0': ['C-0', 'S-1', 'DEPOT-STATION-1'],
  'S-1': ['C-1', 'S-0', 'S-2', 'PICK-RACK-A2', 'DEPOT-STATION-1', 'DEPOT-STATION-2', 'DEPOT-STATION-3'],
  'S-2': ['C-2', 'S-1', 'S-3', 'PICK-RACK-B2', 'DISPATCH-DOCK-1'],
  'S-3': ['C-3', 'S-2', 'S-4', 'PICK-RACK-C2', 'DISPATCH-DOCK-2'],
  'S-4': ['C-4', 'S-3', 'S-5', 'PICK-RACK-D2', 'CHG-01'],
  'S-5': ['C-5', 'S-4', 'S-6', 'PICK-RACK-E2', 'CHG-02', 'CHG-03'],
  'S-6': ['C-6', 'S-5', 'PICK-RACK-F2', 'CHG-04'],

  // Pick Points
  'PICK-RACK-A1': ['N-1', 'C-1'],
  'PICK-RACK-A2': ['C-1', 'S-1'],
  'PICK-RACK-B1': ['N-2', 'C-2'],
  'PICK-RACK-B2': ['C-2', 'S-2'],
  'PICK-RACK-C1': ['N-3', 'C-3'],
  'PICK-RACK-C2': ['C-3', 'S-3'],
  'PICK-RACK-D1': ['N-4', 'C-4'],
  'PICK-RACK-D2': ['C-4', 'S-4'],
  'PICK-RACK-E1': ['N-5', 'C-5'],
  'PICK-RACK-E2': ['C-5', 'S-5'],
  'PICK-RACK-F1': ['N-6', 'C-6'],
  'PICK-RACK-F2': ['C-6', 'S-6'],

  // Depot Stations
  'DEPOT-STATION-1': ['S-0', 'S-1', 'DEPOT-STATION-2'],
  'DEPOT-STATION-2': ['S-1', 'DEPOT-STATION-1', 'DEPOT-STATION-3'],
  'DEPOT-STATION-3': ['S-1', 'DEPOT-STATION-2'],

  // Dispatch Docks
  'DISPATCH-DOCK-1': ['S-2', 'DISPATCH-DOCK-2'],
  'DISPATCH-DOCK-2': ['S-3', 'DISPATCH-DOCK-1'],

  // Charging Stations
  'CHG-01': ['S-4'],
  'CHG-02': ['S-5'],
  'CHG-03': ['S-5'],
  'CHG-04': ['S-6']
};

/**
 * Shortest Path Finder (Breadth-First Search on Corridor Graph)
 */
export function findShortestPath(startNodeId, targetNodeId) {
  if (!startNodeId || !targetNodeId) return [];
  if (startNodeId === targetNodeId) return [startNodeId];
  
  const queue = [[startNodeId]];
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === targetNodeId) {
      return path;
    }

    const neighbors = NAV_GRAPH[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  // Fallback direct
  return [startNodeId, targetNodeId];
}

/**
 * Converts waypoint ID list to coordinate array
 */
export function pathToCoordinates(pathNodeIds) {
  if (!pathNodeIds || !Array.isArray(pathNodeIds)) return [];
  return pathNodeIds.map(nodeId => {
    const wp = WAYPOINTS[nodeId];
    return wp ? { x: wp.x, y: wp.y, id: nodeId } : { x: 100, y: 100, id: nodeId };
  });
}

/**
 * Smooth Angle Interpolation (Slerp / Shortest Angular Arc)
 * Prevents instant 90°/180° snapping or angular jitter
 */
export function lerpAngle(currentAngle, targetAngle, maxTurnRateDegreesPerSec, deltaTime) {
  let diff = ((targetAngle - currentAngle + 540) % 360) - 180;
  const maxStep = maxTurnRateDegreesPerSec * deltaTime;
  if (Math.abs(diff) <= maxStep) {
    return (targetAngle + 360) % 360;
  }
  return (currentAngle + Math.sign(diff) * maxStep + 360) % 360;
}

/**
 * Velocity & Acceleration Smoothing (Trapezoidal Acceleration Profile)
 */
export function smoothVelocity(currentVel, targetVel, accelRate, decelRate, deltaTime) {
  if (currentVel < targetVel) {
    return Math.min(targetVel, currentVel + accelRate * deltaTime);
  } else if (currentVel > targetVel) {
    return Math.max(targetVel, currentVel - decelRate * deltaTime);
  }
  return currentVel;
}

/**
 * Strict Robot Operational States
 */
export const AGV_STATES = {
  IDLE: 'IDLE',
  MOVING_TO_PICK: 'MOVING_TO_PICK',
  PICKING: 'PICKING',
  MOVING_TO_PACKAGING: 'MOVING_TO_PACKAGING',
  DELIVERING: 'DELIVERING',
  MOVING_TO_CHARGER: 'MOVING_TO_CHARGER',
  CHARGING: 'CHARGING',
  WAITING_CONGESTION: 'WAITING'
};

/**
 * Charging Stations Pool Management
 */
export class ChargingManager {
  constructor() {
    this.reservations = new Map(); // stationId -> robotId
  }

  reserve(stationId, robotId) {
    this.reservations.set(stationId, robotId);
  }

  release(robotId) {
    for (const [stationId, rId] of this.reservations.entries()) {
      if (rId === robotId) {
        this.reservations.delete(stationId);
      }
    }
  }

  findAvailableStation(preferredId = null) {
    const allStations = ['CHG-01', 'CHG-02', 'CHG-03', 'CHG-04'];
    if (preferredId && !this.reservations.has(preferredId)) {
      return preferredId;
    }
    for (const stationId of allStations) {
      if (!this.reservations.has(stationId)) {
        return stationId;
      }
    }
    return null;
  }
}

/**
 * Sample Initial Tasks for dynamic fulfillment
 */
export const SAMPLE_TASKS = [
  { id: 'TSK-901', orderId: 'ORD-1048', rackId: 'RACK-A1', pickNode: 'PICK-RACK-A1', sku: 'SKU-EL-101', skuName: 'STM32 Microcontroller Core Board', quantity: 6, priority: 'VIP', status: 'PENDING' },
  { id: 'TSK-902', orderId: 'ORD-1048', rackId: 'RACK-B1', pickNode: 'PICK-RACK-B1', sku: 'SKU-FR-302', skuName: 'Achromatic Optical Lens Doublet', quantity: 4, priority: 'VIP', status: 'PENDING' },
  { id: 'TSK-903', orderId: 'ORD-1049', rackId: 'RACK-D1', pickNode: 'PICK-RACK-D1', sku: 'SKU-CC-401', skuName: 'mRNA Lyophilized Vaccine Vials', quantity: 8, priority: 'VIP', status: 'PENDING' },
  { id: 'TSK-904', orderId: 'ORD-1051', rackId: 'RACK-C2', pickNode: 'PICK-RACK-C2', sku: 'SKU-HW-504', skuName: 'Hex Bolts M10x50 Zinc Plated', quantity: 15, priority: 'EXPRESS', status: 'PENDING' },
  { id: 'TSK-905', orderId: 'ORD-1052', rackId: 'RACK-E1', pickNode: 'PICK-RACK-E1', sku: 'SKU-EL-106', skuName: 'NEMA 23 High Torque Stepper', quantity: 3, priority: 'STANDARD', status: 'PENDING' },
  { id: 'TSK-906', orderId: 'ORD-1053', rackId: 'RACK-F2', pickNode: 'PICK-RACK-F2', sku: 'SKU-HW-508', skuName: 'Aluminum Extrusion 40x40 1000mm', quantity: 10, priority: 'BULK', status: 'PENDING' },
  { id: 'TSK-907', orderId: 'ORD-1054', rackId: 'RACK-A2', pickNode: 'PICK-RACK-A2', sku: 'SKU-EL-102', skuName: 'LiPo 3.7V 5000mAh Battery Pack', quantity: 12, priority: 'STANDARD', status: 'PENDING' },
  { id: 'TSK-908', orderId: 'ORD-1055', rackId: 'RACK-B2', pickNode: 'PICK-RACK-B2', sku: 'SKU-AP-201', skuName: 'High-Vis Class 3 Safety Vest', quantity: 20, priority: 'STANDARD', status: 'PENDING' },
  { id: 'TSK-909', orderId: 'ORD-1056', rackId: 'RACK-D2', pickNode: 'PICK-RACK-D2', sku: 'SKU-CC-407', skuName: 'Insulin Bio-Sim Solution 5x3ml', quantity: 5, priority: 'VIP', status: 'PENDING' },
  { id: 'TSK-910', orderId: 'ORD-1057', rackId: 'RACK-E2', pickNode: 'PICK-RACK-E2', sku: 'SKU-EL-104', skuName: 'ESP32 Dual-Core WiFi/BLE IoT Module', quantity: 16, priority: 'EXPRESS', status: 'PENDING' }
];

/**
 * Initial Fleet of 10 Autonomous AGVs/AMRs with live diverse starting states and kinematics properties
 * Dedicated Multi-Track System: Each AMR has its own permanent track index (0 to 9)
 */
export function generateInitialFleet() {
  const p1 = generateDedicatedTrackPath(['PLATFORM-STAGING-1', 'S-1', 'C-1', 'N-1', 'PICK-RACK-A1'], 0);
  const p2 = generateDedicatedTrackPath(['PLATFORM-STAGING-2', 'S-2', 'C-2', 'N-2', 'PICK-RACK-B1'], 1);
  const p3 = generateDedicatedTrackPath(['S-4', 'C-4', 'PICK-RACK-D1'], 2);
  const p4 = generateDedicatedTrackPath(['S-3', 'S-2', 'S-1', 'DEPOT-STATION-2'], 3);
  const p7 = generateDedicatedTrackPath(['S-5', 'C-5', 'PICK-RACK-E1'], 6);
  const p8 = generateDedicatedTrackPath(['C-6', 'S-6', 'S-5', 'S-4', 'S-3', 'S-2', 'S-1', 'DEPOT-STATION-3'], 7);

  return [
    {
      id: 'AGV-01',
      trackIndex: 0,
      trackId: 'Track 1',
      name: 'Titan Platform Putaway Master',
      status: 'PUTAWAY',
      operationMode: 'PLATFORM_TO_RACK_PUTAWAY',
      battery: 95,
      cruiseSpeed: 95,
      currentVelocity: 88,
      targetVelocity: 95,
      heading: 0,
      targetHeading: 0,
      currentPosition: p1[0] ? { x: p1[0].x, y: p1[0].y } : { x: 175, y: 560 },
      targetNodeId: 'PICK-RACK-A1',
      pathWaypoints: p1,
      currentWaypointIndex: 1,
      currentNodeId: 'PLATFORM-STAGING-1',
      currentTask: { 
        id: 'TSK-PLATFORM-PUTAWAY-01', 
        orderId: 'INBOUND-PLT-01', 
        rackId: 'RACK-A1', 
        sku: 'SKU-GR-101', 
        skuName: 'Aashirvaad Superior MP Sharbati Atta 5kg', 
        quantity: 16, 
        priority: 'PLATFORM_RESTOCK', 
        missionType: 'PLATFORM_TO_RACK_PUTAWAY' 
      },
      hasPayload: true, 
      pickProgress: 0, 
      totalDistanceMeters: 345,
      stuckTimer: 0, 
      blockedBy: null, 
      lastPosition: p1[0] ? { x: p1[0].x, y: p1[0].y } : { x: 175, y: 560 }
    },
    {
      id: 'AGV-02',
      trackIndex: 1,
      trackId: 'Track 2',
      name: 'Quantum Platform Stock Arranger',
      status: 'PUTAWAY',
      operationMode: 'PLATFORM_TO_RACK_PUTAWAY',
      battery: 92,
      cruiseSpeed: 92,
      currentVelocity: 82,
      targetVelocity: 92,
      heading: 0,
      targetHeading: 0,
      currentPosition: p2[0] ? { x: p2[0].x, y: p2[0].y } : { x: 325, y: 560 },
      targetNodeId: 'PICK-RACK-B1',
      pathWaypoints: p2,
      currentWaypointIndex: 1,
      currentNodeId: 'PLATFORM-STAGING-2',
      currentTask: { 
        id: 'TSK-PLATFORM-PUTAWAY-02', 
        orderId: 'INBOUND-PLT-02', 
        rackId: 'RACK-B1', 
        sku: 'SKU-SB-203', 
        skuName: 'Coca-Cola Carbonated Beverage 750ml', 
        quantity: 24, 
        priority: 'PLATFORM_RESTOCK', 
        missionType: 'PLATFORM_TO_RACK_PUTAWAY' 
      },
      hasPayload: true, 
      pickProgress: 0, 
      totalDistanceMeters: 320,
      stuckTimer: 0, 
      blockedBy: null, 
      lastPosition: p2[0] ? { x: p2[0].x, y: p2[0].y } : { x: 325, y: 560 }
    },
    {
      id: 'AGV-03',
      trackIndex: 2,
      trackId: 'Track 3',
      name: 'Aero Mover Gamma',
      status: 'ACTIVE',
      battery: 92,
      cruiseSpeed: 95,
      currentVelocity: 80,
      targetVelocity: 95,
      heading: 0,
      targetHeading: 0,
      currentPosition: p3[0] ? { x: p3[0].x, y: p3[0].y } : { x: 636, y: 280 },
      targetNodeId: 'PICK-RACK-D1',
      pathWaypoints: p3,
      currentWaypointIndex: 0,
      currentNodeId: 'S-4',
      currentTask: { id: 'TSK-883', orderId: 'ORD-1049', rackId: 'RACK-D1', sku: 'SKU-CC-401', skuName: 'mRNA Lyophilized Vaccine Vials', quantity: 8, priority: 'VIP' },
      hasPayload: false, pickProgress: 0, totalDistanceMeters: 340,
      stuckTimer: 0, blockedBy: null, lastPosition: p3[0] ? { x: p3[0].x, y: p3[0].y } : { x: 636, y: 280 }
    },
    {
      id: 'AGV-04',
      trackIndex: 3,
      trackId: 'Track 4',
      name: 'Vanguard Transporter Delta',
      status: 'TRANSPORTING',
      battery: 64,
      cruiseSpeed: 88,
      currentVelocity: 75,
      targetVelocity: 88,
      heading: 270,
      targetHeading: 270,
      currentPosition: p4[0] ? { x: p4[0].x, y: p4[0].y } : { x: 475, y: 354 },
      targetNodeId: 'DEPOT-STATION-2',
      pathWaypoints: p4,
      currentWaypointIndex: 0,
      currentNodeId: 'S-3',
      currentTask: { id: 'TSK-884', orderId: 'ORD-1051', rackId: 'RACK-C2', sku: 'SKU-HW-504', skuName: 'Hex Bolts M10x50 Zinc Plated', quantity: 15, priority: 'EXPRESS' },
      hasPayload: true, pickProgress: 0, totalDistanceMeters: 412,
      stuckTimer: 0, blockedBy: null, lastPosition: p4[0] ? { x: p4[0].x, y: p4[0].y } : { x: 475, y: 354 }
    },
    {
      id: 'AGV-05',
      trackIndex: 4,
      trackId: 'Track 5',
      name: 'Photon Shuttle Epsilon',
      status: 'CHARGING',
      battery: 34,
      cruiseSpeed: 90,
      currentVelocity: 0,
      targetVelocity: 0,
      heading: 0,
      targetHeading: 0,
      currentPosition: { x: 620, y: 480 },
      targetNodeId: 'CHG-01',
      pathWaypoints: [],
      currentWaypointIndex: 0,
      currentNodeId: 'CHG-01',
      currentTask: null,
      hasPayload: false, pickProgress: 0, totalDistanceMeters: 510,
      stuckTimer: 0, blockedBy: null, lastPosition: { x: 620, y: 480 }
    },
    {
      id: 'AGV-06',
      trackIndex: 5,
      trackId: 'Track 6',
      name: 'Cyber Rover Zeta',
      status: 'IDLE',
      battery: 98,
      cruiseSpeed: 95,
      currentVelocity: 0,
      targetVelocity: 0,
      heading: 90,
      targetHeading: 90,
      currentPosition: { x: 200, y: 480 },
      targetNodeId: 'DEPOT-STATION-3',
      pathWaypoints: [],
      currentWaypointIndex: 0,
      currentNodeId: 'DEPOT-STATION-3',
      currentTask: null,
      hasPayload: false, pickProgress: 0, totalDistanceMeters: 140,
      stuckTimer: 0, blockedBy: null, lastPosition: { x: 200, y: 480 }
    },
    {
      id: 'AGV-07',
      trackIndex: 6,
      trackId: 'Track 7',
      name: 'Apex Lifter Eta',
      status: 'ACTIVE',
      battery: 81,
      cruiseSpeed: 95,
      currentVelocity: 80,
      targetVelocity: 95,
      heading: 0,
      targetHeading: 0,
      currentPosition: p7[0] ? { x: p7[0].x, y: p7[0].y } : { x: 786, y: 365 },
      targetNodeId: 'PICK-RACK-E1',
      pathWaypoints: p7,
      currentWaypointIndex: 0,
      currentNodeId: 'S-5',
      currentTask: { id: 'TSK-885', orderId: 'ORD-1052', rackId: 'RACK-E1', sku: 'SKU-EL-106', skuName: 'NEMA 23 High Torque Stepper', quantity: 3, priority: 'STANDARD' },
      hasPayload: false, pickProgress: 0, totalDistanceMeters: 260,
      stuckTimer: 0, blockedBy: null, lastPosition: p7[0] ? { x: p7[0].x, y: p7[0].y } : { x: 786, y: 365 }
    },
    {
      id: 'AGV-08',
      trackIndex: 7,
      trackId: 'Track 8',
      name: 'Heavy Hauler Theta',
      status: 'TRANSPORTING',
      battery: 58,
      cruiseSpeed: 82,
      currentVelocity: 70,
      targetVelocity: 82,
      heading: 270,
      targetHeading: 270,
      currentPosition: p8[0] ? { x: p8[0].x, y: p8[0].y } : { x: 925, y: 184 },
      targetNodeId: 'DEPOT-STATION-3',
      pathWaypoints: p8,
      currentWaypointIndex: 0,
      currentNodeId: 'C-6',
      currentTask: { id: 'TSK-886', orderId: 'ORD-1053', rackId: 'RACK-F2', sku: 'SKU-HW-508', skuName: 'Aluminum Extrusion 40x40 1000mm', quantity: 10, priority: 'BULK' },
      hasPayload: true, pickProgress: 0, totalDistanceMeters: 480,
      stuckTimer: 0, blockedBy: null, lastPosition: p8[0] ? { x: p8[0].x, y: p8[0].y } : { x: 925, y: 184 }
    },
    {
      id: 'AGV-09',
      trackIndex: 8,
      trackId: 'Track 9',
      name: 'Falcon Sorter Iota',
      status: 'CHARGING',
      battery: 45,
      cruiseSpeed: 90,
      currentVelocity: 0,
      targetVelocity: 0,
      heading: 0,
      targetHeading: 0,
      currentPosition: { x: 710, y: 480 },
      targetNodeId: 'CHG-02',
      pathWaypoints: [],
      currentWaypointIndex: 0,
      currentNodeId: 'CHG-02',
      currentTask: null,
      hasPayload: false, pickProgress: 0, totalDistanceMeters: 620,
      stuckTimer: 0, blockedBy: null, lastPosition: { x: 710, y: 480 }
    },
    {
      id: 'AGV-10',
      trackIndex: 9,
      trackId: 'Track 10',
      name: 'Stellar Transporter Kappa',
      status: 'IDLE',
      battery: 95,
      cruiseSpeed: 95,
      currentVelocity: 0,
      targetVelocity: 0,
      heading: 180,
      targetHeading: 180,
      currentPosition: { x: 360, y: 480 },
      targetNodeId: 'DISPATCH-DOCK-1',
      pathWaypoints: [],
      currentWaypointIndex: 0,
      currentNodeId: 'DISPATCH-DOCK-1',
      currentTask: null,
      hasPayload: false, pickProgress: 0, totalDistanceMeters: 210,
      stuckTimer: 0, blockedBy: null, lastPosition: { x: 360, y: 480 }
    },
    {
      id: 'AGV-11',
      trackIndex: 10,
      trackId: 'Track 11 (Platform Track 1)',
      name: 'Apex Platform Putaway Express',
      status: 'PUTAWAY',
      operationMode: 'PLATFORM_TO_RACK_PUTAWAY',
      battery: 98,
      cruiseSpeed: 96,
      currentVelocity: 90,
      targetVelocity: 96,
      heading: 0,
      targetHeading: 0,
      currentPosition: { x: 175, y: 560 },
      targetNodeId: 'PICK-RACK-A1',
      pathWaypoints: generateDedicatedTrackPath(['PLATFORM-STAGING-1', 'S-1', 'C-1', 'PICK-RACK-A1'], 10),
      currentWaypointIndex: 1,
      currentNodeId: 'PLATFORM-STAGING-1',
      currentTask: { 
        id: 'TSK-PLT-PUT-11', 
        orderId: 'INBOUND-TRUCK-01', 
        rackId: 'RACK-A1', 
        sku: 'SKU-GR-102', 
        skuName: 'Fortune Sunlite Refined Sunflower Oil 1L', 
        quantity: 20, 
        priority: 'PLATFORM_RESTOCK', 
        missionType: 'PLATFORM_TO_RACK_PUTAWAY' 
      },
      hasPayload: true,
      pickProgress: 0,
      totalDistanceMeters: 380,
      stuckTimer: 0,
      blockedBy: null,
      lastPosition: { x: 175, y: 560 }
    },
    {
      id: 'AGV-12',
      trackIndex: 11,
      trackId: 'Track 12 (Platform Track 2)',
      name: 'Nova Platform Stock Arranger',
      status: 'PUTAWAY',
      operationMode: 'PLATFORM_TO_RACK_PUTAWAY',
      battery: 96,
      cruiseSpeed: 94,
      currentVelocity: 88,
      targetVelocity: 94,
      heading: 0,
      targetHeading: 0,
      currentPosition: { x: 325, y: 560 },
      targetNodeId: 'PICK-RACK-B1',
      pathWaypoints: generateDedicatedTrackPath(['PLATFORM-STAGING-2', 'S-2', 'C-2', 'PICK-RACK-B1'], 11),
      currentWaypointIndex: 1,
      currentNodeId: 'PLATFORM-STAGING-2',
      currentTask: { 
        id: 'TSK-PLT-PUT-12', 
        orderId: 'INBOUND-TRUCK-02', 
        rackId: 'RACK-B1', 
        sku: 'SKU-SB-201', 
        skuName: 'Lay\'s India\'s Magic Masala Potato Chips 50g', 
        quantity: 30, 
        priority: 'PLATFORM_RESTOCK', 
        missionType: 'PLATFORM_TO_RACK_PUTAWAY' 
      },
      hasPayload: true,
      pickProgress: 0,
      totalDistanceMeters: 360,
      stuckTimer: 0,
      blockedBy: null,
      lastPosition: { x: 325, y: 560 }
    }
  ];
}

/**
 * Initial Heatmap Matrix Data (20 columns x 13 rows grid)
 */
export function generateInitialHeatmap() {
  const cols = 20;
  const rows = 13;
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let val = 0.05;
      if (r === 1 || r === 4 || r === 8) val += 0.35; // Corridors
      if (c === 3 || c === 6 || c === 10 || c === 13 || c === 16) val += 0.25; // Aisle junctions
      if (r >= 8 && c <= 8) val += 0.45; // Depot & Packaging nexus
      if (r <= 6 && (c % 3 === 1)) val = 0.02; // Racks (impermeable)
      row.push(Math.min(1.0, +(val + (Math.random() * 0.12)).toFixed(2)));
    }
    grid.push(row);
  }
  return grid;
}
