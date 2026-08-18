import { CATALOG_ITEMS } from '../data/catalog';
import { ORDER_PRIORITY, ORDER_STATUS } from '../data/initialOrders';
import { KAKINADA_CUSTOMERS, VIJAYAWADA_CUSTOMERS } from '../data/warehouseLocations';

let orderCounter = 2050;

/**
 * Generates a random realistic incoming warehouse order for a specific warehouse location
 */
export function generateRandomOrder(customTier = null, warehouseId = 'KAKINADA') {
  const customerPool = warehouseId === 'VIJAYAWADA' ? VIJAYAWADA_CUSTOMERS : KAKINADA_CUSTOMERS;
  let customer;
  if (customTier) {
    const matching = customerPool.filter(c => c.tier === customTier);
    customer = matching[Math.floor(Math.random() * matching.length)] || customerPool[0];
  } else {
    customer = customerPool[Math.floor(Math.random() * customerPool.length)];
  }

  orderCounter++;
  const prefix = warehouseId === 'VIJAYAWADA' ? 'ORD-VJA' : 'ORD-KKD';
  const orderId = `${prefix}-${orderCounter}`;

  // Select 1 to 4 random items
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const pickedSkus = new Set();
  const items = [];

  for (let i = 0; i < itemCount; i++) {
    const randomSku = CATALOG_ITEMS[Math.floor(Math.random() * CATALOG_ITEMS.length)];
    if (!pickedSkus.has(randomSku.sku)) {
      pickedSkus.add(randomSku.sku);
      const qty = customer.tier === 'BULK' 
        ? Math.floor(Math.random() * 20) + 10 
        : Math.floor(Math.random() * 8) + 2;

      items.push({
        sku: randomSku.sku,
        name: randomSku.name,
        quantity: qty,
        allocated: false,
        binId: null,
        picked: false
      });
    }
  }

  const shippingMethods = {
    VIP: 'Same-Day Air Express Priority',
    EXPRESS: 'Overnight Air Priority',
    STANDARD: 'Ground Freight 2-Day',
    BULK: 'LTL Pallet Freight'
  };

  return {
    id: orderId,
    customer: customer.name,
    tier: customer.tier,
    priority: customer.priority,
    status: ORDER_STATUS.CREATED,
    createdAt: new Date().toISOString(),
    assignedPicker: null,
    items,
    preempted: false,
    shippingMethod: shippingMethods[customer.tier] || 'Standard Ground',
    destination: customer.destination,
    routeDistanceMeters: 0,
    estimatedMinutes: 0
  };
}

/**
 * Generates an intentional high-stress VIP conflict scenario
 */
export function createVipConflictScenario(bins, orders) {
  orderCounter++;
  const orderId = `ORD-${orderCounter}-VIP`;

  // Find an allocated Standard order
  const standardOrder = orders.find(
    o => o.status === ORDER_STATUS.ALLOCATED && o.priority.score <= ORDER_PRIORITY.STANDARD.score
  );

  let targetSku = 'SKU-EL-102';
  let targetSkuName = 'LiPo 3.7V 5000mAh Battery Cell';
  let qtyNeeded = 14;

  if (standardOrder && standardOrder.items.length > 0) {
    const allocatedItem = standardOrder.items.find(it => it.allocated);
    if (allocatedItem) {
      targetSku = allocatedItem.sku;
      targetSkuName = allocatedItem.name;
      qtyNeeded = allocatedItem.quantity + 4;
    }
  }

  const vipOrder = {
    id: orderId,
    customer: 'Orbital Dynamics Prime (VIP)',
    tier: 'VIP',
    priority: ORDER_PRIORITY.VIP,
    status: ORDER_STATUS.CREATED,
    createdAt: new Date().toISOString(),
    assignedPicker: null,
    items: [
      {
        sku: targetSku,
        name: targetSkuName,
        quantity: qtyNeeded,
        allocated: false,
        binId: null,
        picked: false
      },
      {
        sku: 'SKU-EL-101',
        name: 'STM32 Microcontroller Core Board',
        quantity: 5,
        allocated: false,
        binId: null,
        picked: false
      }
    ],
    preempted: false,
    shippingMethod: 'Emergency Critical Jet Delivery',
    destination: 'Kennedy Space Center, FL - Launch Pad 39A',
    routeDistanceMeters: 0,
    estimatedMinutes: 0
  };

  return vipOrder;
}

/**
 * Generates a batch of 16+ mixed-priority orders for the Rush Hour Simulation
 */
export function generateRushHourBatch(count = 16, warehouseId = 'KAKINADA') {
  const tiers = [
    'VIP', 'VIP', 'VIP',
    'EXPRESS', 'EXPRESS', 'EXPRESS', 'EXPRESS',
    'STANDARD', 'STANDARD', 'STANDARD', 'STANDARD', 'STANDARD', 'STANDARD',
    'BULK', 'BULK', 'BULK'
  ];

  const batch = [];
  for (let i = 0; i < count; i++) {
    const tier = tiers[i % tiers.length];
    batch.push(generateRandomOrder(tier, warehouseId));
  }
  return batch;
}
