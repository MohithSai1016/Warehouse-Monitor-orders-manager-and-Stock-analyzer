export const ORDER_PRIORITY = {
  VIP: { label: 'VIP Priority', score: 100, color: '#c5adff', bg: '#392c59', badgeClass: 'priority' },
  EXPRESS: { label: 'Express (10-Min)', score: 50, color: '#ffc16b', bg: '#4b3520', badgeClass: 'express' },
  STANDARD: { label: 'Standard', score: 10, color: '#90a0b8', bg: '#1c2436', badgeClass: 'standard' },
  BULK: { label: 'Bulk Batch', score: 5, color: '#68d4a6', bg: '#153d30', badgeClass: 'bulk' }
};

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  ALLOCATED: 'ALLOCATED',
  PICKING: 'PICKING',
  PACKED: 'PACKED',
  QUALITY_CHECK: 'QUALITY_CHECK',
  DISPATCHED: 'DISPATCHED',
  SPLIT_HELD: 'SPLIT_HELD'
};

export const INITIAL_ORDERS = [
  {
    id: 'ORD-KKD-1048',
    customer: 'Kakinada Super-Mart & Gourmet Foods',
    tier: 'VIP',
    priority: ORDER_PRIORITY.VIP,
    status: ORDER_STATUS.PICKING,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    assignedPicker: 'Sai Varma (ID #PK-K04)',
    items: [
      { sku: 'SKU-GR-101', name: 'Aashirvaad Superior MP Sharbati Whole Wheat Atta 5kg', quantity: 6, allocated: true, binId: 'A-01-A1', picked: true },
      { sku: 'SKU-GR-104', name: 'Fortune Sunlite Refined Sunflower Oil Pouch 1L', quantity: 12, allocated: true, binId: 'A-01-C3', picked: false },
      { sku: 'SKU-GR-107', name: 'Everest Royal Garam Masala Powder 100g Box', quantity: 10, allocated: true, binId: 'A-02-A3', picked: false }
    ],
    preempted: false,
    shippingMethod: '10-Minute Rapid Express Dispatch',
    destination: 'Bhanugudi Junction, Near Medical Center, Kakinada - 533003',
    routeDistanceMeters: 48,
    estimatedMinutes: 4.2
  },
  {
    id: 'ORD-KKD-1049',
    customer: 'Varma Grand Family Supermarket',
    tier: 'VIP',
    priority: ORDER_PRIORITY.VIP,
    status: ORDER_STATUS.ALLOCATED,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    assignedPicker: 'Ch. Venkata Rao (ID #PK-K07)',
    items: [
      { sku: 'SKU-BP-401', name: 'Dettol Original Liquid Handwash Refill Pouch 1500ml', quantity: 8, allocated: true, binId: 'D-01-A1', picked: false },
      { sku: 'SKU-BP-402', name: 'Dove Intense Repair Shampoo with Keratin 650ml', quantity: 5, allocated: true, binId: 'D-02-B2', picked: false }
    ],
    preempted: false,
    shippingMethod: 'Fast Express Doorstep Courier',
    destination: 'Sarpavaram Junction, ADB Bypass, Kakinada - 533005',
    routeDistanceMeters: 32,
    estimatedMinutes: 2.8
  },
  {
    id: 'ORD-KKD-1050',
    customer: 'Suryanarayana Kirana & General Stores',
    tier: 'STANDARD',
    priority: ORDER_PRIORITY.STANDARD,
    status: ORDER_STATUS.ALLOCATED,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    assignedPicker: null,
    items: [
      { sku: 'SKU-HH-301', name: 'Surf Excel Matic Top Load Liquid Detergent 2L', quantity: 4, allocated: true, binId: 'C-01-A1', picked: false },
      { sku: 'SKU-HH-304', name: 'Lizol Citrus Floor Cleaner Disinfectant 2L Bottle', quantity: 15, allocated: true, binId: 'C-01-D4', picked: false }
    ],
    preempted: false,
    shippingMethod: 'Local Ground Delivery 1-Day',
    destination: 'Cinema Road, Near Jagannath Temple, Kakinada - 533001',
    routeDistanceMeters: 64,
    estimatedMinutes: 5.5
  },
  {
    id: 'ORD-KKD-1051',
    customer: 'Godavari Daily Needs & Fresh Mart',
    tier: 'EXPRESS',
    priority: ORDER_PRIORITY.EXPRESS,
    status: ORDER_STATUS.ALLOCATED,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    assignedPicker: null,
    items: [
      { sku: 'SKU-SB-203', name: 'Coca-Cola Original Carbonated Soft Drink 750ml', quantity: 14, allocated: true, binId: 'B-01-B2', picked: false },
      { sku: 'SKU-SB-206', name: 'Maggi 2-Minute Masala Instant Noodles 12-Pack', quantity: 10, allocated: true, binId: 'B-02-C1', picked: false }
    ],
    preempted: false,
    shippingMethod: 'Bhanugudi Express Courier',
    destination: 'Main Road, Jagannaickpur, Kakinada - 533002',
    routeDistanceMeters: 42,
    estimatedMinutes: 3.6
  },
  {
    id: 'ORD-KKD-1045',
    customer: 'Mandapeta Wholesale Grain & Oil Depo',
    tier: 'BULK',
    priority: ORDER_PRIORITY.BULK,
    status: ORDER_STATUS.DISPATCHED,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
    assignedPicker: 'P. Subrahmanyam (PK-K02)',
    items: [
      { sku: 'SKU-SB-201', name: "Lay's Magic Masala Potato Chips 90g Party Pack", quantity: 30, allocated: true, binId: 'B-01-A1', picked: true },
      { sku: 'SKU-SB-208', name: 'Haldiram’s Nagpur Bhujia Sev Spicy Snack 400g', quantity: 25, allocated: true, binId: 'B-02-A1', picked: true }
    ],
    preempted: false,
    shippingMethod: 'Canal Road Heavy Truck Cargo',
    destination: 'Alamuru Road, Mandapeta - 533308',
    routeDistanceMeters: 55,
    estimatedMinutes: 4.8
  },
  {
    id: 'ORD-KKD-1042',
    customer: 'Sri Satya Sai Quick-Bites & Beverages',
    tier: 'STANDARD',
    priority: ORDER_PRIORITY.STANDARD,
    status: ORDER_STATUS.SPLIT_HELD,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    assignedPicker: null,
    items: [
      { sku: 'SKU-GR-102', name: 'India Gate Classic Basmati Rice Aged 5kg Bag', quantity: 8, allocated: true, binId: 'A-01-B2', picked: false, splitBatch: 'Batch A (Ready)' },
      { sku: 'SKU-GR-106', name: 'Amul Pure Cow Ghee Tin 1L', quantity: 10, allocated: false, binId: null, picked: false, splitBatch: 'Batch B (Replenishing)' }
    ],
    preempted: true,
    preemptReason: 'Inventory pre-empted by VIP Order #ORD-KKD-1048. Partial batch queued for replenishment.',
    shippingMethod: 'Samalkota Bypass Delivery',
    destination: 'Samalkota Sugar Factory Road, Samalkota - 533440',
    routeDistanceMeters: 28,
    estimatedMinutes: 2.5
  }
];
