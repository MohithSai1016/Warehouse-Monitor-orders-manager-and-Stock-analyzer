import { describe, it, expect } from 'vitest';
import { 
  calculateWarehouseDistance, 
  solveTspPickRoute, 
  buildOrderPickRoute 
} from '../engine/routingEngine';
import { generateWarehouseBins } from '../data/initialWarehouse';

describe('Warehouse TSP Routing & Pathfinding Engine', () => {
  it('should calculate distance within the same aisle', () => {
    const binA = { x: 30, y: 20 };
    const binB = { x: 30, y: 100 };
    const dist = calculateWarehouseDistance(binA, binB);
    expect(dist).toBe(80);
  });

  it('should calculate distance across different aisles with cross-aisle routing', () => {
    const binA = { x: 30, y: 50 };
    const binB = { x: 150, y: 50 };
    const dist = calculateWarehouseDistance(binA, binB);
    // Across aisles: dx (120) + min(50+50, (200-50)+(200-50)) = 120 + 100 = 220
    expect(dist).toBe(220);
  });

  it('should handle empty stops gracefully', () => {
    const result = solveTspPickRoute([]);
    expect(result.orderedStops).toEqual([]);
    expect(result.totalDistanceMeters).toBe(0);
    expect(result.instructions).toEqual([]);
  });

  it('should optimize pick route with 2-Opt and generate step-by-step instructions', () => {
    const stops = [
      { id: 'A-01-A1', x: 20, y: 80, sku: 'SKU-GR-101', skuName: 'Wheat Atta', pickQty: 2, aisle: '01', rack: 'A', shelf: '1' },
      { id: 'B-02-B2', x: 120, y: 40, sku: 'SKU-SB-201', skuName: 'Potato Chips', pickQty: 3, aisle: '02', rack: 'B', shelf: '2' },
      { id: 'A-01-A3', x: 20, y: 20, sku: 'SKU-GR-102', skuName: 'Basmati Rice', pickQty: 1, aisle: '01', rack: 'A', shelf: '3' }
    ];

    const result = solveTspPickRoute(stops);

    expect(result.orderedStops.length).toBe(3);
    expect(result.totalDistanceMeters).toBeGreaterThan(0);
    expect(result.instructions.length).toBe(stops.length + 2); // Start + 3 picks + Finish
    expect(result.instructions[0].type).toBe('START');
    expect(result.instructions[result.instructions.length - 1].type).toBe('FINISH');
  });

  it('should build order pick route from allocated order items', () => {
    const bins = generateWarehouseBins();
    const allocatedOrder = {
      id: 'ORD-TEST-99',
      items: [
        { sku: 'SKU-GR-101', name: 'Wheat Atta', quantity: 2, binId: 'A-01-A1' },
        { sku: 'SKU-SB-201', name: 'Chips', quantity: 1, binId: 'B-01-A1' }
      ]
    };

    const route = buildOrderPickRoute(allocatedOrder, bins);
    expect(route.orderedStops.length).toBe(2);
    expect(route.instructions.length).toBe(4);
  });
});
