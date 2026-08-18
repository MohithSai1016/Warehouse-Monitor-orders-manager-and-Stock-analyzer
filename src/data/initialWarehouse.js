import { CATALOG_ITEMS } from './catalog';

export const ZONES = [
  {
    id: 'ZONE_A',
    name: 'Zone A: Groceries & Fresh Staples',
    category: 'Atta, Rice, Dals, Oils & Ghee',
    aisles: 4,
    description: 'High-density shelving for daily kitchen staples, unpolished pulses, premium basmati rice, and edible oils.'
  },
  {
    id: 'ZONE_B',
    name: 'Zone B: Snacks, Munchies & Beverages',
    category: 'Chips, Cold Drinks, Chocolates & Biscuits',
    aisles: 4,
    description: 'Ultra-fast moving pick modules for party-pack chips, carbonated sodas, instant noodles, juices, and confectionery.'
  },
  {
    id: 'ZONE_C',
    name: 'Zone C: Household Essentials & Cleaning',
    category: 'Detergents, Floor Cleaners & Disinfectants',
    aisles: 4,
    description: 'Reinforced pallet flow racks with spill-proof containment for laundry detergents, dishwash gels, sprays, and tissue rolls.'
  },
  {
    id: 'ZONE_D',
    name: 'Zone D: Beauty, Personal Care & Wellness',
    category: 'Skincare, Shampoos, Oral Care & First-Aid',
    aisles: 4,
    description: 'Climate-controlled clean racks for premium hair care, luxury body washes, perfumes, hygiene care, and pain sprays.'
  }
];

export function generateWarehouseBins() {
  const bins = {};
  let skuIndex = 0;

  ZONES.forEach((zone) => {
    // 4 Aisles per zone
    for (let aisle = 1; aisle <= 4; aisle++) {
      const aisleCode = `0${aisle}`;
      // 4 Racks per aisle: A, B, C, D
      const racks = ['A', 'B', 'C', 'D'];
      racks.forEach((rack, rackIdx) => {
        // 4 Shelves per rack: 1, 2, 3, 4
        for (let shelf = 1; shelf <= 4; shelf++) {
          const binId = `${zone.id.replace('ZONE_', '')}-${aisleCode}-${rack}${shelf}`;

          // Assign SKU matching zone category
          let assignedSku = null;
          if (zone.id === 'ZONE_A') {
            const pool = CATALOG_ITEMS.filter(s => s.category.includes('Groceries'));
            assignedSku = pool[skuIndex % pool.length];
          } else if (zone.id === 'ZONE_B') {
            const pool = CATALOG_ITEMS.filter(s => s.category.includes('Snacks'));
            assignedSku = pool[skuIndex % pool.length];
          } else if (zone.id === 'ZONE_C') {
            const pool = CATALOG_ITEMS.filter(s => s.category.includes('Household'));
            assignedSku = pool[skuIndex % pool.length];
          } else {
            const pool = CATALOG_ITEMS.filter(s => s.category.includes('Beauty'));
            assignedSku = pool[skuIndex % pool.length];
          }
          skuIndex++;

          // Initial inventory state (optimal with realistic edge cases)
          const capacity = 80;
          let qty = Math.floor(Math.random() * 45) + 25; // 25 - 70
          let damaged = 0;
          let reserved = 0;

          // Seed realistic low-stock or damaged edge cases
          if (binId === 'A-01-A2' || binId === 'B-02-B1' || binId === 'C-03-C4') {
            qty = 4; // Below safety stock for test
          } else if (binId === 'B-01-D3') {
            damaged = 6;
            qty = 3;
          } else if (binId === 'A-02-B2' || binId === 'D-01-A1') {
            qty = 18;
            reserved = 12;
          }

          // 2D Spatial layout coordinates
          const posX = (aisle - 1) * 180 + (rackIdx % 2 === 0 ? 30 : 90);
          const posY = Math.floor(rackIdx / 2) * 160 + (shelf - 1) * 35;

          bins[binId] = {
            id: binId,
            zone: zone.id,
            zoneName: zone.name,
            aisle: aisleCode,
            rack,
            shelf,
            sku: assignedSku ? assignedSku.sku : 'SKU-GR-101',
            skuName: assignedSku ? assignedSku.name : 'Groceries Item',
            category: assignedSku ? assignedSku.category : 'Groceries',
            capacity,
            quantity: qty,
            reserved,
            damaged,
            batchNumber: `LOT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            expiryDate: '2027-08-31',
            x: posX,
            y: posY,
            status: qty <= 10 ? 'LOW' : (damaged > 0 ? 'DAMAGED' : 'OPTIMAL')
          };
        }
      });
    }
  });

  return bins;
}
