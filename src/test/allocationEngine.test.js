import { describe, it, expect } from 'vitest';
import { 
  evaluateAndAllocateOrder, 
  transferStock, 
  reportDamageAndQuarantine, 
  findAvailableBinsForSku, 
  getTotalAvailableStock 
} from '../engine/allocationEngine';
import { generateWarehouseBins } from '../data/initialWarehouse';
import { ORDER_STATUS, ORDER_PRIORITY } from '../data/initialOrders';

describe('Warehouse Allocation & Decision Engine', () => {
  it('should find available bins for a SKU', () => {
    const bins = generateWarehouseBins();
    const sku = 'SKU-GR-101';
    const foundBins = findAvailableBinsForSku(sku, bins);

    expect(foundBins.length).toBeGreaterThan(0);
    expect(foundBins[0].bin.sku).toBe(sku);
    expect(foundBins[0].available).toBeGreaterThan(0);
  });

  it('should compute total available stock across warehouse bins', () => {
    const bins = generateWarehouseBins();
    const sku = 'SKU-GR-101';
    const total = getTotalAvailableStock(sku, bins);
    expect(total).toBeGreaterThan(0);
  });

  it('should allocate standard order when inventory is available', () => {
    const bins = generateWarehouseBins();
    const order = {
      id: 'TEST-ORD-01',
      customer: 'Test Grocery Mart',
      priority: ORDER_PRIORITY.STANDARD,
      status: ORDER_STATUS.CREATED,
      items: [
        { sku: 'SKU-GR-101', name: 'Wheat Atta 5kg', quantity: 2, allocated: false }
      ]
    };

    const result = evaluateAndAllocateOrder({
      order,
      bins,
      allOrders: [order]
    });

    expect(result.isFullyAllocated).toBe(true);
    expect(result.currentOrder.status).toBe(ORDER_STATUS.ALLOCATED);
    expect(result.currentOrder.items[0].allocated).toBe(true);
    expect(result.currentOrder.items[0].binId).toBeDefined();
  });

  it('should trigger VIP preemption when VIP order needs stock held by standard order', () => {
    // Construct single-bin universe where all stock is reserved by standard order
    const testSku = 'SKU-SPECIAL-999';
    const bins = {
      'A-01-A1': {
        id: 'A-01-A1',
        sku: testSku,
        skuName: 'Special Item',
        quantity: 5,
        reserved: 5,
        damaged: 0,
        capacity: 50
      }
    };

    const standardOrder = {
      id: 'STD-ORD-01',
      customer: 'Standard Retailer',
      priority: ORDER_PRIORITY.STANDARD,
      status: ORDER_STATUS.ALLOCATED,
      items: [
        { sku: testSku, name: 'Special Item', quantity: 5, allocated: true, binId: 'A-01-A1' }
      ]
    };

    const vipOrder = {
      id: 'VIP-ORD-99',
      customer: 'Kakinada Super-Mart VIP',
      priority: ORDER_PRIORITY.VIP,
      status: ORDER_STATUS.CREATED,
      items: [
        { sku: testSku, name: 'Special Item', quantity: 3, allocated: false }
      ]
    };

    const result = evaluateAndAllocateOrder({
      order: vipOrder,
      bins,
      allOrders: [standardOrder, vipOrder]
    });

    expect(result.currentOrder.status).toBe(ORDER_STATUS.ALLOCATED);
    const updatedVictim = result.updatedOrders.find(o => o.id === 'STD-ORD-01');
    expect(updatedVictim.preempted).toBe(true);
    expect(result.exceptions.some(ex => ex.type === 'VIP_PREEMPTION')).toBe(true);
  });

  it('should transfer stock between two bins successfully', () => {
    const bins = generateWarehouseBins();
    const sourceBinId = 'A-01-A1';
    const destBinId = 'A-01-A2';

    const sourceQtyBefore = bins[sourceBinId].quantity;
    const destQtyBefore = bins[destBinId].quantity;

    const result = transferStock({
      sourceBinId,
      destBinId,
      sku: bins[sourceBinId].sku,
      qty: 5,
      bins
    });

    expect(result.success).toBe(true);
    expect(result.updatedBins[sourceBinId].quantity).toBe(sourceQtyBefore - 5);
    expect(result.updatedBins[destBinId].quantity).toBe(destQtyBefore + 5);
  });

  it('should quarantine damaged stock and decrement available units', () => {
    const bins = generateWarehouseBins();
    const binId = 'A-01-A1';
    const binBefore = bins[binId];

    const result = reportDamageAndQuarantine({
      binId,
      sku: binBefore.sku,
      damagedQty: 4,
      bins,
      orders: []
    });

    expect(result.success).toBe(true);
    expect(result.updatedBins[binId].damaged).toBe((binBefore.damaged || 0) + 4);
    expect(result.exception.type).toBe('STOCK_DAMAGE');
  });
});
