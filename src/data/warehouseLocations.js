/**
 * Multi-Warehouse Configuration for Sai's Warehouse (Quick-Commerce Model)
 * Location 1: Kakinada Hub (East Godavari)
 * Location 2: Vijayawada Hub (NTR District / Krishna)
 */

import { ORDER_PRIORITY, ORDER_STATUS } from './initialOrders';

export const WAREHOUSE_LOCATIONS = [
  {
    id: 'KAKINADA',
    name: "Sai's Warehouse — Kakinada Hub (Quick-Commerce)",
    shortName: 'Kakinada Hub',
    city: 'Kakinada',
    district: 'Kakinada / East Godavari District',
    state: 'Andhra Pradesh',
    pincode: '533001',
    address: 'Plot 14-22, Autonagar Industrial Area, Port Road, Kakinada - 533003',
    manager: 'Sai Ramakrishna Varma',
    phone: '+91 884 2378901',
    slaTarget: '99.8%',
    activeAmrs: 10,
    tagline: '10-Minute Rapid Groceries, Snacks & Household Essentials Fulfillment',
    surroundingAreas: [
      'Bhanugudi Junction',
      'Sarpavaram Junction',
      'Cinema Road & Main Road',
      'Jagannaickpur',
      'Madhavapatnam',
      'Vakalapudi Port Corridor',
      'Samalkota Industrial Estate',
      'Peddapuram ADB Road',
      'Pithapuram Town',
      'Yanam Border Bypass',
      'Annavaram Highway Zone',
      'Rajahmundry Central Bypass',
      'Mandapeta Commercial Zone',
      'Ramachandrapuram Depot'
    ]
  },
  {
    id: 'VIJAYAWADA',
    name: "Sai's Warehouse — Vijayawada Hub (Quick-Commerce)",
    shortName: 'Vijayawada Hub',
    city: 'Vijayawada',
    district: 'NTR District / Krishna Region',
    state: 'Andhra Pradesh',
    pincode: '520001',
    address: 'Block C, Auto Nagar Industrial Estate, MG Road, Vijayawada - 520007',
    manager: 'Sai Venkata Krishna Rao',
    phone: '+91 866 2489100',
    slaTarget: '99.6%',
    activeAmrs: 10,
    tagline: '10-Minute Express Grocery, Beverages & Personal Care Delivery Hub',
    surroundingAreas: [
      'Auto Nagar Industrial Area',
      'MG Road (Bandar Road)',
      'Governorpet Commercial Hub',
      'Benz Circle Plaza',
      'Gollapudi Wholesale Market',
      'Enikepadu Industrial Belt',
      'Gannavaram Airport Cargo Terminal',
      'Tadigadapa Bypass',
      'Kanuru IT Hub',
      'Ibrahimpatnam Super Highway',
      'Mangalagiri AIIMS Corridor',
      'Guntur Amaravati Expressway',
      'Tadepalli Capital Zone',
      'Tenali Commercial Depot'
    ]
  }
];

export const KAKINADA_CUSTOMERS = [
  { name: 'Kakinada Super-Mart & Gourmet Foods', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Bhanugudi Junction, Near Medical Center, Kakinada - 533003' },
  { name: 'Godavari Daily Needs & Fresh Mart', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Main Road, Jagannaickpur, Kakinada - 533002' },
  { name: 'Varma Grand Family Supermarket', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Sarpavaram Junction, ADB Bypass, Kakinada - 533005' },
  { name: 'Sri Satya Sai Quick-Bites & Beverages', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Samalkota Sugar Factory Road, Samalkota - 533440' },
  { name: 'Peddapuram City Grocers & Essentials', tier: 'EXPRESS', priority: ORDER_PRIORITY.EXPRESS, destination: 'Peddapuram Town Center, Main Bazaar - 533437' },
  { name: 'Pithapuram Divine Sweets & Snacks', tier: 'EXPRESS', priority: ORDER_PRIORITY.EXPRESS, destination: 'Fort Road, Near Sri Kukkuteswara Temple, Pithapuram - 533450' },
  { name: 'Vakalapudi Beach Resort Pantry & Drinks', tier: 'EXPRESS', priority: ORDER_PRIORITY.EXPRESS, destination: 'Beach Road, Vakalapudi, Kakinada - 533005' },
  { name: 'Suryanarayana Kirana & General Stores', tier: 'STANDARD', priority: ORDER_PRIORITY.STANDARD, destination: 'Cinema Road, Near Jagannath Temple, Kakinada - 533001' },
  { name: 'Rajahmundry Highway Hypermarket', tier: 'STANDARD', priority: ORDER_PRIORITY.STANDARD, destination: 'River Road Bypass Terminal, Rajahmundry - 533101' },
  { name: 'Annavaram Pilgrim Refreshments Hub', tier: 'STANDARD', priority: ORDER_PRIORITY.STANDARD, destination: 'NH-16 Highway Junction, Annavaram - 533406' },
  { name: 'Mandapeta Wholesale Grain & Oil Depo', tier: 'BULK', priority: ORDER_PRIORITY.BULK, destination: 'Alamuru Road, Mandapeta - 533308' },
  { name: 'Ramachandrapuram Mega Provision Stores', tier: 'BULK', priority: ORDER_PRIORITY.BULK, destination: 'Draksharamam Road, Ramachandrapuram - 533255' },
  { name: 'Port Marine Workers Canteen Supplies', tier: 'BULK', priority: ORDER_PRIORITY.BULK, destination: 'Port Gate 3, Beach Road, Kakinada - 533007' }
];

export const VIJAYAWADA_CUSTOMERS = [
  { name: 'Amaravati Express Grocers & Organic Mart', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Mangalagiri AIIMS Highway Road, Vijayawada - 522503' },
  { name: 'Benz Circle Mega Hypermarket & Bakery', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Benz Circle Plaza, MG Road, Vijayawada - 520010' },
  { name: 'Venkata Sai Gourmet Snacks & Beverages', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Kanuru IT SEZ Corridor, Bandar Road, Vijayawada - 520007' },
  { name: 'Gannavaram Airport Lounge & Pantry Express', tier: 'VIP', priority: ORDER_PRIORITY.VIP, destination: 'Air Cargo Complex, NH-16, Gannavaram - 521102' },
  { name: 'Gollapudi Agri-Wholesale Mega Market', tier: 'EXPRESS', priority: ORDER_PRIORITY.EXPRESS, destination: 'Commercial Grain Market, Gollapudi Bypass, Vijayawada - 521225' },
  { name: 'Governorpet Daily Provisions & Household', tier: 'EXPRESS', priority: ORDER_PRIORITY.EXPRESS, destination: 'Prakasam Road, Governorpet, Vijayawada - 520002' },
  { name: 'Auto Nagar Commercial Mart & Cleaning Hub', tier: 'EXPRESS', priority: ORDER_PRIORITY.EXPRESS, destination: 'Block A, Auto Nagar Industrial Estate, Vijayawada - 520007' },
  { name: 'Tadigadapa Fresh Mart & Dairy Depot', tier: 'STANDARD', priority: ORDER_PRIORITY.STANDARD, destination: 'Enikepadu - Tadigadapa Outer Ring Road, Vijayawada - 521137' },
  { name: 'Tadepalli Capital City Quick-Store', tier: 'STANDARD', priority: ORDER_PRIORITY.STANDARD, destination: 'Kanakadurga Varadhi South End, Tadepalli - 522501' },
  { name: 'Ibrahimpatnam Highway Snacks & Drinks', tier: 'STANDARD', priority: ORDER_PRIORITY.STANDARD, destination: 'Ferry Road, NTTPS Complex, Ibrahimpatnam - 521456' },
  { name: 'Guntur Spice & Household Super-Stockist', tier: 'BULK', priority: ORDER_PRIORITY.BULK, destination: 'Mirchi Yard Road, Guntur Outer Ring Bypass - 522004' },
  { name: 'Tenali Central Wholesale Provision Hub', tier: 'BULK', priority: ORDER_PRIORITY.BULK, destination: 'Bose Road Commercial Belt, Tenali - 522201' },
  { name: 'Kondapalli Industrial Colony Essentials', tier: 'BULK', priority: ORDER_PRIORITY.BULK, destination: 'Kondapalli Industrial Estate, Near Railway Siding - 521228' }
];

export function getInitialOrdersForWarehouse(warehouseId = 'KAKINADA') {
  if (warehouseId === 'VIJAYAWADA') {
    return [
      {
        id: 'ORD-VJA-101',
        customer: 'Amaravati Express Grocers & Organic Mart',
        tier: 'VIP',
        priority: ORDER_PRIORITY.VIP,
        status: ORDER_STATUS.PICKING,
        createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
        assignedPicker: 'Sai Srinivas (ID #PK-V01)',
        items: [
          { sku: 'SKU-BP-401', name: 'Dettol Original Liquid Handwash Refill Pouch 1500ml', quantity: 6, allocated: true, binId: 'D-01-A1', picked: true },
          { sku: 'SKU-BP-403', name: 'Nivea Soft Light Moisturizing Cream Tub 300ml', quantity: 8, allocated: true, binId: 'D-02-B2', picked: false },
          { sku: 'SKU-SB-205', name: 'Cadbury Dairy Milk Silk Roasted Almond 143g', quantity: 12, allocated: true, binId: 'B-01-C3', picked: false }
        ],
        preempted: false,
        shippingMethod: '10-Minute Instant Express Courier',
        destination: 'Mangalagiri AIIMS Highway Road, Vijayawada - 522503',
        routeDistanceMeters: 42,
        estimatedMinutes: 3.8
      },
      {
        id: 'ORD-VJA-102',
        customer: 'Benz Circle Mega Hypermarket & Bakery',
        tier: 'VIP',
        priority: ORDER_PRIORITY.VIP,
        status: ORDER_STATUS.ALLOCATED,
        createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
        assignedPicker: 'K. Durga Prasad (ID #PK-V02)',
        items: [
          { sku: 'SKU-GR-101', name: 'Aashirvaad Superior MP Sharbati Whole Wheat Atta 5kg', quantity: 8, allocated: true, binId: 'A-01-A1', picked: false },
          { sku: 'SKU-HH-301', name: 'Surf Excel Matic Top Load Liquid Detergent 2L', quantity: 4, allocated: true, binId: 'C-01-A1', picked: false }
        ],
        preempted: false,
        shippingMethod: 'Same-Day Express Quick Delivery',
        destination: 'Benz Circle Plaza, MG Road, Vijayawada - 520010',
        routeDistanceMeters: 36,
        estimatedMinutes: 3.1
      },
      {
        id: 'ORD-VJA-103',
        customer: 'Gollapudi Agri-Wholesale Mega Market',
        tier: 'EXPRESS',
        priority: ORDER_PRIORITY.EXPRESS,
        status: ORDER_STATUS.ALLOCATED,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        assignedPicker: null,
        items: [
          { sku: 'SKU-SB-204', name: 'Thums Up Charged Carbonated Drink 2.25L Bottle', quantity: 18, allocated: true, binId: 'B-01-A1', picked: false },
          { sku: 'SKU-HH-304', name: 'Lizol Citrus Floor Cleaner Disinfectant 2L Bottle', quantity: 10, allocated: true, binId: 'C-01-D4', picked: false }
        ],
        preempted: false,
        shippingMethod: 'Vijayawada Outer Ring Road Express',
        destination: 'Commercial Grain Market, Gollapudi Bypass, Vijayawada - 521225',
        routeDistanceMeters: 58,
        estimatedMinutes: 5.2
      },
      {
        id: 'ORD-VJA-104',
        customer: 'Gannavaram Airport Lounge & Pantry Express',
        tier: 'VIP',
        priority: ORDER_PRIORITY.VIP,
        status: ORDER_STATUS.ALLOCATED,
        createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
        assignedPicker: null,
        items: [
          { sku: 'SKU-SB-207', name: 'Red Bull Energy Drink 250ml Can (Pack of 4)', quantity: 6, allocated: true, binId: 'B-01-B2', picked: false }
        ],
        preempted: false,
        shippingMethod: 'Airport Flight Express Priority',
        destination: 'Air Cargo Complex, NH-16, Gannavaram - 521102',
        routeDistanceMeters: 28,
        estimatedMinutes: 2.4
      },
      {
        id: 'ORD-VJA-105',
        customer: 'Governorpet Daily Provisions & Household',
        tier: 'STANDARD',
        priority: ORDER_PRIORITY.STANDARD,
        status: ORDER_STATUS.DISPATCHED,
        createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
        assignedPicker: 'M. Ramesh (PK-V03)',
        items: [
          { sku: 'SKU-GR-104', name: 'Fortune Sunlite Refined Sunflower Oil Pouch 1L', quantity: 15, allocated: true, binId: 'A-01-C3', picked: true }
        ],
        preempted: false,
        shippingMethod: 'City Center Ground Delivery',
        destination: 'Prakasam Road, Governorpet, Vijayawada - 520002',
        routeDistanceMeters: 30,
        estimatedMinutes: 2.6
      },
      {
        id: 'ORD-VJA-106',
        customer: 'Guntur Spice & Household Super-Stockist',
        tier: 'BULK',
        priority: ORDER_PRIORITY.BULK,
        status: ORDER_STATUS.SPLIT_HELD,
        createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
        assignedPicker: null,
        items: [
          { sku: 'SKU-SB-201', name: "Lay's Magic Masala Potato Chips 90g Party Pack", quantity: 40, allocated: true, binId: 'B-02-A1', picked: false, splitBatch: 'Batch A (Ready)' },
          { sku: 'SKU-GR-106', name: 'Amul Pure Cow Ghee Tin 1L', quantity: 12, allocated: false, binId: null, picked: false, splitBatch: 'Batch B (Replenishing)' }
        ],
        preempted: true,
        preemptReason: 'Inventory pre-empted by VIP Order #ORD-VJA-101. Queued for stock replenishment from Inbound PO.',
        shippingMethod: 'Guntur Expressway Heavy Van Cargo',
        destination: 'Mirchi Yard Road, Guntur Outer Ring Bypass - 522004',
        routeDistanceMeters: 65,
        estimatedMinutes: 5.8
      }
    ];
  }

  // Default: Kakinada Hub Orders
  return [
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
      shippingMethod: '10-Minute Instant Express Dispatch',
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
}
