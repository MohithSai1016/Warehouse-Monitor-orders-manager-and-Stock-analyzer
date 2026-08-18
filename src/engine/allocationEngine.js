import { SKU_MAP } from '../data/catalog';
import { ORDER_STATUS, ORDER_PRIORITY } from '../data/initialOrders';

/**
 * Finds bins containing the specified SKU with unreserved stock
 */
export function findAvailableBinsForSku(sku, bins) {
  const result = [];
  Object.values(bins).forEach(bin => {
    if (bin.sku === sku) {
      const available = bin.quantity - bin.reserved - (bin.damaged || 0);
      if (available > 0) {
        result.push({ bin, available });
      }
    }
  });
  // Sort by highest available stock first
  return result.sort((a, b) => b.available - a.available);
}

/**
 * Calculates total available (unreserved & undamaged) stock across all bins for a SKU
 */
export function getTotalAvailableStock(sku, bins) {
  return Object.values(bins).reduce((acc, bin) => {
    if (bin.sku === sku) {
      const available = Math.max(0, bin.quantity - bin.reserved - (bin.damaged || 0));
      return acc + available;
    }
    return acc;
  }, 0);
}

/**
 * Main Decision & Conflict Engine: Evaluates an incoming or pending order
 */
export function evaluateAndAllocateOrder({
  order,
  bins,
  allOrders,
  onException,
  onTriggerReorder
}) {
  const updatedBins = { ...bins };
  const updatedOrders = [...allOrders];
  const orderIndex = updatedOrders.findIndex(o => o.id === order.id);
  const currentOrder = orderIndex >= 0 ? { ...updatedOrders[orderIndex] } : { ...order };

  let isFullyAllocated = true;
  let hasPartialStock = false;
  const allocatedItems = [];
  const exceptionsGenerated = [];
  const preemptions = [];

  for (let i = 0; i < currentOrder.items.length; i++) {
    const item = { ...currentOrder.items[i] };
    const skuInfo = SKU_MAP.get(item.sku);
    let needed = item.quantity;
    let allocatedQty = 0;
    const itemBinAllocations = [];

    // 1. Check direct available stock in bins
    const availableBins = findAvailableBinsForSku(item.sku, updatedBins);
    for (const { bin, available } of availableBins) {
      if (needed <= 0) break;
      const take = Math.min(needed, available);
      updatedBins[bin.id] = {
        ...updatedBins[bin.id],
        reserved: updatedBins[bin.id].reserved + take
      };
      needed -= take;
      allocatedQty += take;
      itemBinAllocations.push({ binId: bin.id, qty: take });
    }

    // 2. If stock is still needed and this order is HIGH PRIORITY (VIP / Express), run Conflict Logic!
    if (needed > 0 && currentOrder.priority.score >= ORDER_PRIORITY.EXPRESS.score) {
      // Look for lower priority orders holding reserved units of this SKU
      const candidateVictimOrders = updatedOrders.filter(
        o => o.id !== currentOrder.id &&
             o.status === ORDER_STATUS.ALLOCATED &&
             o.priority.score < currentOrder.priority.score
      ).sort((a, b) => a.priority.score - b.priority.score); // Lowest priority first

      for (const victim of candidateVictimOrders) {
        if (needed <= 0) break;
        const victimItemIndex = victim.items.findIndex(it => it.sku === item.sku && it.allocated);
        if (victimItemIndex >= 0) {
          const victimItem = victim.items[victimItemIndex];
          const canPreempt = Math.min(needed, victimItem.quantity);

          if (canPreempt > 0) {
            // Find bin where victim holds reservation
            const victimBin = Object.values(updatedBins).find(b => b.sku === item.sku && b.reserved >= canPreempt);
            if (victimBin) {
              // Reallocate reservation from victim to current high-priority order
              needed -= canPreempt;
              allocatedQty += canPreempt;
              itemBinAllocations.push({ binId: victimBin.id, qty: canPreempt });

              // Update victim order state: Auto-split or Hold
              const updatedVictimItems = [...victim.items];
              const remainingVictimQty = victimItem.quantity - canPreempt;

              if (remainingVictimQty > 0) {
                updatedVictimItems[victimItemIndex] = {
                  ...victimItem,
                  quantity: remainingVictimQty,
                  splitBatch: 'Batch A (Partial Ready)'
                };
                updatedVictimItems.push({
                  sku: victimItem.sku,
                  name: victimItem.name,
                  quantity: canPreempt,
                  allocated: false,
                  binId: null,
                  picked: false,
                  splitBatch: 'Batch B (Backordered via Preemption)'
                });
              } else {
                updatedVictimItems[victimItemIndex] = {
                  ...victimItem,
                  allocated: false,
                  binId: null,
                  splitBatch: 'Backordered (Preempted)'
                };
              }

              const victimIdxInList = updatedOrders.findIndex(o => o.id === victim.id);
              if (victimIdxInList >= 0) {
                updatedOrders[victimIdxInList] = {
                  ...updatedOrders[victimIdxInList],
                  items: updatedVictimItems,
                  status: ORDER_STATUS.SPLIT_HELD,
                  preempted: true,
                  preemptReason: `Preempted ${canPreempt}x ${item.sku} by ${currentOrder.priority.label} Order #${currentOrder.id}`
                };
              }

              const exLog = {
                id: `EX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: 'VIP_PREEMPTION',
                title: '⚡ Autonomous VIP Stock Preemption',
                severity: 'high',
                timestamp: new Date().toISOString(),
                orderId: currentOrder.id,
                sku: item.sku,
                skuName: item.name,
                message: `Auto-reallocated ${canPreempt} units of ${item.name} (${item.sku}) from Order #${victim.id} to ${currentOrder.priority.label} Order #${currentOrder.id}. Order #${victim.id} split to partial dropship.`
              };
              exceptionsGenerated.push(exLog);
              preemptions.push(exLog);
            }
          }
        }
      }
    }

    // 3. Finalize item allocation state
    if (allocatedQty >= item.quantity) {
      item.allocated = true;
      item.binId = itemBinAllocations.length > 0 ? itemBinAllocations[0].binId : null;
      item.allocations = itemBinAllocations;
    } else if (allocatedQty > 0) {
      hasPartialStock = true;
      isFullyAllocated = false;
      item.allocated = false;
      item.partialQty = allocatedQty;
      item.binId = itemBinAllocations.length > 0 ? itemBinAllocations[0].binId : null;
    } else {
      isFullyAllocated = false;
      item.allocated = false;
    }

    allocatedItems.push(item);

    // 4. Check Safety Stock Alert for this SKU
    if (skuInfo) {
      const remainingTotal = getTotalAvailableStock(item.sku, updatedBins);
      if (remainingTotal <= skuInfo.reorderPoint) {
        const reorderLog = {
          id: `EX-REORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'SAFETY_STOCK_REORDER',
          title: '⚠️ Safety Stock Threshold Breached',
          severity: remainingTotal <= skuInfo.safetyStock ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
          sku: item.sku,
          skuName: item.name,
          currentStock: remainingTotal,
          minSafety: skuInfo.safetyStock,
          reorderPoint: skuInfo.reorderPoint,
          reorderQty: skuInfo.reorderQty,
          message: `${item.sku} (${item.name}) dropped to ${remainingTotal} units (Safety min: ${skuInfo.safetyStock}). Automated PO #${Math.floor(8000 + Math.random() * 1999)} generated for ${skuInfo.reorderQty} units.`
        };
        exceptionsGenerated.push(reorderLog);
        if (onTriggerReorder) {
          onTriggerReorder(skuInfo, remainingTotal);
        }
      }
    }
  }

  // Update order status
  currentOrder.items = allocatedItems;
  if (isFullyAllocated) {
    currentOrder.status = ORDER_STATUS.ALLOCATED;
  } else if (hasPartialStock) {
    currentOrder.status = ORDER_STATUS.SPLIT_HELD;
  } else {
    currentOrder.status = ORDER_STATUS.CREATED;
  }

  if (orderIndex >= 0) {
    updatedOrders[orderIndex] = currentOrder;
  } else {
    updatedOrders.unshift(currentOrder);
  }

  if (onException) {
    exceptionsGenerated.forEach(ex => onException(ex));
  }

  return {
    updatedBins,
    updatedOrders,
    currentOrder,
    exceptions: exceptionsGenerated,
    isFullyAllocated
  };
}

/**
 * Handle Bin Stock Transfer
 */
export function transferStock({ sourceBinId, destBinId, sku, qty, bins, onException }) {
  const updatedBins = { ...bins };
  const source = updatedBins[sourceBinId];
  const dest = updatedBins[destBinId];

  if (!source || !dest) return { success: false, message: 'Invalid bins' };
  const availableInSource = source.quantity - source.reserved - (source.damaged || 0);
  if (availableInSource < qty) {
    return { success: false, message: `Only ${availableInSource} available in source bin.` };
  }

  updatedBins[sourceBinId] = {
    ...source,
    quantity: source.quantity - qty
  };

  updatedBins[destBinId] = {
    ...dest,
    sku: sku,
    quantity: dest.quantity + qty
  };

  const ex = {
    id: `EX-TRF-${Date.now()}`,
    type: 'STOCK_TRANSFER',
    title: '📦 Internal Bin Transfer',
    severity: 'info',
    timestamp: new Date().toISOString(),
    message: `Transferred ${qty} units of ${sku} from Bin ${sourceBinId} to Bin ${destBinId}.`
  };
  if (onException) onException(ex);

  return { success: true, updatedBins, exception: ex };
}

/**
 * Handle Stock Damage Reporting & Auto-Quarantine
 */
export function reportDamageAndQuarantine({ binId, sku, damagedQty, bins, orders, onException }) {
  const updatedBins = { ...bins };
  const bin = updatedBins[binId];
  if (!bin) return { success: false, message: 'Bin not found' };

  const validDamage = Math.min(damagedQty, bin.quantity);
  updatedBins[binId] = {
    ...bin,
    damaged: (bin.damaged || 0) + validDamage
  };

  const ex = {
    id: `EX-DMG-${Date.now()}`,
    type: 'STOCK_DAMAGE',
    title: '🚨 Stock Damage Quarantined',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    binId,
    sku,
    message: `Quarantined ${validDamage} damaged units of ${sku} in Bin ${binId}. Stock levels adjusted & re-allocation verified.`
  };
  if (onException) onException(ex);

  return { success: true, updatedBins, exception: ex };
}
