import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CATALOG_ITEMS, SKU_MAP } from '../data/catalog';
import { generateWarehouseBins, ZONES } from '../data/initialWarehouse';
import { ORDER_STATUS, ORDER_PRIORITY } from '../data/initialOrders';
import { 
  WAREHOUSE_LOCATIONS, 
  getInitialOrdersForWarehouse 
} from '../data/warehouseLocations';
import { 
  evaluateAndAllocateOrder, 
  transferStock as doTransferStock, 
  reportDamageAndQuarantine,
  findAvailableBinsForSku,
  getTotalAvailableStock 
} from '../engine/allocationEngine';
import { buildOrderPickRoute, solveTspPickRoute } from '../engine/routingEngine';
import { generateRandomOrder, createVipConflictScenario, generateRushHourBatch } from '../engine/simulationEngine';
import confetti from 'canvas-confetti';

const WmsContext = createContext(null);

export function WmsProvider({ children }) {
  // Current Selected Warehouse Location: 'KAKINADA' (Default) | 'VIJAYAWADA'
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('KAKINADA');

  // Independent Data Store Per Warehouse Location (Quick-Commerce Model)
  const [warehouseData, setWarehouseData] = useState(() => ({
    KAKINADA: {
      bins: generateWarehouseBins(),
      orders: getInitialOrdersForWarehouse('KAKINADA'),
      selectedZone: 'ZONE_A',
      selectedBin: null,
      mapFilter: 'ALL',
      exceptions: [
        {
          id: 'EX-KKD-1',
          type: 'VIP_PREEMPTION',
          title: '⚡ Autonomous VIP Stock Preemption',
          severity: 'high',
          timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
          orderId: 'ORD-KKD-1048',
          sku: 'SKU-GR-104',
          skuName: 'Fortune Sunlite Refined Sunflower Oil Pouch 1L',
          message: 'Auto-reallocated 4 units from Order #ORD-KKD-1042 to VIP Order #ORD-KKD-1048 (Kakinada Super-Mart) to guarantee 10-Minute Rapid Express Delivery.'
        },
        {
          id: 'EX-KKD-2',
          type: 'SAFETY_STOCK_REORDER',
          title: '⚠️ Safety Stock Threshold Breached',
          severity: 'warning',
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          sku: 'SKU-SB-201',
          skuName: "Lay's India's Magic Masala Potato Chips 90g",
          currentStock: 4,
          minSafety: 60,
          message: 'Bin B-02-B1 dipped to 4 units. Autonomous Purchase Order #PO-KKD-8812 triggered for 350 units to PepsiCo Distribution Hub.'
        },
        {
          id: 'EX-KKD-3',
          type: 'ROUTE_OPTIMIZATION',
          title: '📍 TSP Pick Route Optimized',
          severity: 'info',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          message: 'Wave #W-KKD-904 calculated with 2-Opt TSP for Varma Grand Supermarket. Shaved 46% off picker path across Zone A Grocery Guideways.'
        }
      ],
      purchaseOrders: [
        {
          id: 'PO-KKD-8812',
          sku: 'SKU-GR-101',
          skuName: 'Aashirvaad Superior MP Sharbati Whole Wheat Atta 5kg',
          quantity: 150,
          supplier: 'ITC Foods India Hub (Samalkota Depot)',
          unitCost: 285.00,
          totalCost: 42750.00,
          status: 'IN_TRANSIT',
          etaSeconds: 45,
          targetBin: 'A-01-A1',
          createdAt: new Date(Date.now() - 25 * 60000).toISOString()
        },
        {
          id: 'PO-KKD-8815',
          sku: 'SKU-SB-203',
          skuName: 'Coca-Cola Original Carbonated Beverage 750ml Bottle',
          quantity: 280,
          supplier: 'Hindustan Coca-Cola Beverages (ADB Road Depot)',
          unitCost: 45.00,
          totalCost: 12600.00,
          status: 'IN_TRANSIT',
          etaSeconds: 90,
          targetBin: 'B-01-B2',
          createdAt: new Date(Date.now() - 12 * 60000).toISOString()
        }
      ],
      activePicker: {
        id: 'OWN-01',
        name: 'Mohith Sai',
        role: 'Webdesigner & Owner',
        zone: 'Zone A: Groceries & Fresh Staples',
        shiftPicks: 148,
        accuracy: '99.9%',
        activeWaveId: 'WAVE-KKD-1048'
      }
    },
    VIJAYAWADA: {
      bins: generateWarehouseBins(),
      orders: getInitialOrdersForWarehouse('VIJAYAWADA'),
      selectedZone: 'ZONE_A',
      selectedBin: null,
      mapFilter: 'ALL',
      exceptions: [
        {
          id: 'EX-VJA-1',
          type: 'VIP_PREEMPTION',
          title: '⚡ Autonomous VIP Stock Preemption',
          severity: 'high',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          orderId: 'ORD-VJA-101',
          sku: 'SKU-BP-401',
          skuName: 'Dettol Original Liquid Handwash Refill Pouch 1500ml',
          message: 'Auto-reallocated 8 units from Guntur Order #ORD-VJA-106 to VIP Order #ORD-VJA-101 (Amaravati Express Grocers, Mangalagiri).'
        },
        {
          id: 'EX-VJA-2',
          type: 'SAFETY_STOCK_REORDER',
          title: '⚠️ Safety Stock Threshold Breached',
          severity: 'warning',
          timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
          sku: 'SKU-HH-301',
          skuName: 'Surf Excel Matic Top Load Liquid Detergent 2L',
          currentStock: 3,
          minSafety: 35,
          message: 'Bin C-01-A1 dipped to 3 units. Autonomous PO #PO-VJA-9910 spawned for 160 units from HUL Auto Nagar Distribution Hub.'
        },
        {
          id: 'EX-VJA-3',
          type: 'ROUTE_OPTIMIZATION',
          title: '📍 TSP Pick Route Optimized',
          severity: 'info',
          timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
          message: 'Wave #W-VJA-202 solved for Benz Circle Mega Hypermarket. Route shortened by 52 meters.'
        }
      ],
      purchaseOrders: [
        {
          id: 'PO-VJA-9910',
          sku: 'SKU-HH-301',
          skuName: 'Surf Excel Matic Top Load Liquid Detergent 2L',
          quantity: 160,
          supplier: 'Hindustan Unilever Ltd (Auto Nagar Hub)',
          unitCost: 410.00,
          totalCost: 65600.00,
          status: 'IN_TRANSIT',
          etaSeconds: 60,
          targetBin: 'C-01-A1',
          createdAt: new Date(Date.now() - 18 * 60000).toISOString()
        },
        {
          id: 'PO-VJA-9912',
          sku: 'SKU-SB-205',
          skuName: 'Cadbury Dairy Milk Silk Roasted Almond 143g',
          quantity: 160,
          supplier: 'Mondelez India (Enikepadu Logistics Hub)',
          unitCost: 185.00,
          totalCost: 29600.00,
          status: 'SCHEDULED',
          etaSeconds: 120,
          targetBin: 'B-01-C3',
          createdAt: new Date().toISOString()
        }
      ],
      activePicker: {
        id: 'OWN-01',
        name: 'Mohith Sai',
        role: 'Webdesigner & Owner',
        zone: 'Zone A: Groceries & Fresh Staples',
        shiftPicks: 162,
        accuracy: '99.8%',
        activeWaveId: 'WAVE-VJA-101'
      }
    }
  }));

  // Master User Profile Info (Mohith Sai - Webdesigner & Owner)
  const userProfile = {
    name: 'Mohith Sai',
    role: 'Webdesigner & Owner',
    phone: '7675996669',
    email: 'mohithsairangarao@gmail.com',
    address: '2-43-34, venkatnagar, kakinada',
    id: 'OWN-01',
    avatar: 'MS',
    status: 'Active (Master Owner)',
    accessLevel: 'Super Admin — Full Multi-Warehouse Control'
  };

  // Current active warehouse location details
  const activeLocation = WAREHOUSE_LOCATIONS.find(w => w.id === selectedWarehouseId) || WAREHOUSE_LOCATIONS[0];
  const currentWh = warehouseData[selectedWarehouseId] || warehouseData.KAKINADA;

  // Active sub-states for current warehouse
  const bins = currentWh.bins;
  const orders = currentWh.orders;
  const selectedZone = currentWh.selectedZone;
  const selectedBin = currentWh.selectedBin;
  const mapFilter = currentWh.mapFilter;
  const exceptions = currentWh.exceptions;
  const purchaseOrders = currentWh.purchaseOrders;
  const activePicker = currentWh.activePicker;
  const [catalog] = useState(CATALOG_ITEMS);

  // Helper to update current warehouse partition
  const updateCurrentWarehouse = useCallback((updater) => {
    setWarehouseData(prev => {
      const cur = prev[selectedWarehouseId];
      const next = typeof updater === 'function' ? updater(cur) : { ...cur, ...updater };
      return {
        ...prev,
        [selectedWarehouseId]: next
      };
    });
  }, [selectedWarehouseId]);

  // Setters bound to current warehouse
  const setBins = useCallback((b) => {
    updateCurrentWarehouse(cur => ({
      ...cur,
      bins: typeof b === 'function' ? b(cur.bins) : b
    }));
  }, [updateCurrentWarehouse]);

  const setOrders = useCallback((o) => {
    updateCurrentWarehouse(cur => ({
      ...cur,
      orders: typeof o === 'function' ? o(cur.orders) : o
    }));
  }, [updateCurrentWarehouse]);

  const setSelectedZone = useCallback((z) => {
    updateCurrentWarehouse(cur => ({ ...cur, selectedZone: z }));
  }, [updateCurrentWarehouse]);

  const setSelectedBin = useCallback((b) => {
    updateCurrentWarehouse(cur => ({ ...cur, selectedBin: b }));
  }, [updateCurrentWarehouse]);

  const setMapFilter = useCallback((f) => {
    updateCurrentWarehouse(cur => ({ ...cur, mapFilter: f }));
  }, [updateCurrentWarehouse]);

  const setExceptions = useCallback((e) => {
    updateCurrentWarehouse(cur => ({
      ...cur,
      exceptions: typeof e === 'function' ? e(cur.exceptions) : e
    }));
  }, [updateCurrentWarehouse]);

  const setPurchaseOrders = useCallback((p) => {
    updateCurrentWarehouse(cur => ({
      ...cur,
      purchaseOrders: typeof p === 'function' ? p(cur.purchaseOrders) : p
    }));
  }, [updateCurrentWarehouse]);

  const setActivePicker = useCallback((pk) => {
    updateCurrentWarehouse(cur => ({
      ...cur,
      activePicker: typeof pk === 'function' ? pk(cur.activePicker) : pk
    }));
  }, [updateCurrentWarehouse]);

  // Active Pick Wave state
  const [activeWave, setActiveWave] = useState(() => {
    const order = currentWh.orders[0];
    const route = buildOrderPickRoute(order, currentWh.bins);
    return {
      id: `WAVE-${order?.id || '1048'}`,
      orderId: order?.id,
      customer: order?.customer,
      priority: order?.priority,
      route,
      currentStepIndex: 1,
      pickedItems: {},
      scannedBarcode: '',
      isCompleted: false
    };
  });

  // UI View Modes & Roles
  const [role, setRole] = useState('MANAGER');
  const [viewMode, setViewMode] = useState('MAP');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loginUser = useCallback((userPayload) => {
    setIsAuthenticated(true);
    setRole(userPayload?.role || 'MANAGER');
    setViewMode('MAP');
  }, []);

  const logoutUser = useCallback(() => {
    setIsAuthenticated(false);
    setViewMode('MAP');
  }, []);

  // Live Simulation State
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [toasts, setToasts] = useState([]);
  const simTimerRef = useRef(null);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast = { id, ...toast };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const logException = useCallback((exception) => {
    setExceptions(prev => [exception, ...prev.slice(0, 99)]);
    addToast({
      title: exception.title || 'System Exception',
      message: exception.message,
      type: exception.severity === 'critical' || exception.severity === 'high' ? 'warning' : 'info'
    });
  }, [setExceptions, addToast]);

  // Switch Warehouse Location handler
  const switchWarehouse = useCallback((warehouseId) => {
    setSelectedWarehouseId(warehouseId);
    const targetLoc = WAREHOUSE_LOCATIONS.find(w => w.id === warehouseId);
    addToast({
      title: `🏢 Switched to ${targetLoc?.name || warehouseId}`,
      message: `Loaded live quick-commerce inventory and orders for ${targetLoc?.city} Hub.`,
      type: 'success'
    });
  }, [addToast]);

  // Automated Reorder Trigger
  const triggerAutomatedReorder = useCallback((skuInfo, currentQty) => {
    const poNumber = `PO-${selectedWarehouseId.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetBin = findAvailableBinsForSku(bins, skuInfo.sku)[0] || 'A-01-A1';
    const supplierName = selectedWarehouseId === 'VIJAYAWADA'
      ? `${skuInfo.supplier || 'Auto Nagar FMCG Hub'} (Vijayawada)`
      : `${skuInfo.supplier || 'Samalkota FMCG Depot'} (Kakinada)`;

    const newPO = {
      id: poNumber,
      sku: skuInfo.sku,
      skuName: skuInfo.name,
      quantity: skuInfo.reorderQty || 100,
      supplier: supplierName,
      unitCost: skuInfo.unitCost || 120.00,
      totalCost: (skuInfo.reorderQty || 100) * (skuInfo.unitCost || 120.00),
      status: 'IN_TRANSIT',
      etaSeconds: 30,
      targetBin,
      createdAt: new Date().toISOString()
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    logException({
      id: `EX-REORDER-${Date.now()}`,
      type: 'SAFETY_STOCK_REORDER',
      title: '📦 Autonomous Inbound PO Dispatched',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      sku: skuInfo.sku,
      skuName: skuInfo.name,
      currentStock: currentQty,
      minSafety: skuInfo.safetyStock,
      message: `Stock level ${currentQty} <= Safety Stock ${skuInfo.safetyStock}. Auto-created ${poNumber} for ${newPO.quantity} units to ${supplierName}.`
    });

    addToast({
      title: `⚡ Auto-PO ${poNumber} Dispatched`,
      message: `Ordered ${newPO.quantity}x ${skuInfo.name} for ${activeLocation.city} Hub.`,
      type: 'warning'
    });
  }, [selectedWarehouseId, bins, setPurchaseOrders, logException, addToast, activeLocation]);

  // Order Allocation & Multi-Item Wave Engine
  const allocateOrder = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const result = evaluateAndAllocateOrder({
      order,
      bins,
      allOrders: orders,
      onException: logException,
      onTriggerReorder: triggerAutomatedReorder
    });

    if (result.success) {
      setBins(result.updatedBins);
      setOrders(result.updatedOrders);
      addToast({
        title: `Order #${orderId} Allocated`,
        message: `Inventory reserved successfully at ${activeLocation.city} Quick-Store.`,
        type: 'success'
      });
    } else {
      addToast({
        title: `Allocation Exception: #${orderId}`,
        message: result.reason || 'Insufficient stock.',
        type: 'warning'
      });
    }
  }, [orders, bins, logException, triggerAutomatedReorder, setBins, setOrders, addToast, activeLocation]);

  const allocateAllPendingOrders = useCallback(() => {
    let currentBins = { ...bins };
    let currentOrders = [...orders];
    let allocatedCount = 0;

    const pendingOrders = currentOrders
      .filter(o => o.status === ORDER_STATUS.CREATED || o.status === ORDER_STATUS.SPLIT_HELD)
      .sort((a, b) => b.priority.score - a.priority.score);

    pendingOrders.forEach(order => {
      const result = evaluateAndAllocateOrder({
        order,
        bins: currentBins,
        allOrders: currentOrders,
        onException: logException,
        onTriggerReorder: triggerAutomatedReorder
      });

      if (result.success) {
        currentBins = result.updatedBins;
        currentOrders = result.updatedOrders;
        allocatedCount++;
      }
    });

    setBins(currentBins);
    setOrders(currentOrders);

    if (allocatedCount > 0) {
      addToast({
        title: `⚡ Batch Allocation Complete`,
        message: `Successfully allocated ${allocatedCount} pending quick-orders for ${activeLocation.city} Hub.`,
        type: 'success'
      });
    } else {
      addToast({
        title: 'Allocation Engine Executed',
        message: 'No pending orders eligible for allocation.',
        type: 'info'
      });
    }
  }, [bins, orders, logException, triggerAutomatedReorder, setBins, setOrders, addToast, activeLocation]);

  const startWavePick = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: ORDER_STATUS.PICKING, assignedPicker: activePicker.name } : o));

    const route = buildOrderPickRoute(order, bins);
    setActiveWave({
      id: `WAVE-${orderId}`,
      orderId,
      customer: order.customer,
      priority: order.priority,
      route,
      currentStepIndex: 1,
      pickedItems: {},
      scannedBarcode: '',
      isCompleted: false
    });

    setViewMode('PICKER');
    setRole('PICKER');

    addToast({
      title: `10-Min Wave Launched: #${orderId}`,
      message: `Active pick route calculated for ${activePicker.name}.`,
      type: 'info'
    });
  }, [orders, bins, activePicker, setOrders, addToast]);

  const confirmPickerStep = useCallback((stepIndex, scannedBarcode) => {
    if (!activeWave || !activeWave.route) return;

    const step = activeWave.route.instructions[stepIndex];
    if (!step) return;

    const nextPicked = { ...activeWave.pickedItems, [stepIndex]: true };
    const nextIndex = stepIndex + 1;
    const isCompleted = nextIndex >= activeWave.route.instructions.length;

    setActiveWave(prev => ({
      ...prev,
      currentStepIndex: nextIndex,
      pickedItems: nextPicked,
      scannedBarcode,
      isCompleted
    }));

    setActivePicker(prev => ({ ...prev, shiftPicks: prev.shiftPicks + 1 }));

    if (isCompleted) {
      setOrders(prev => prev.map(o => o.id === activeWave.orderId ? { ...o, status: ORDER_STATUS.PACKED } : o));
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      logException({
        id: `EX-WAVE-DONE-${Date.now()}`,
        type: 'PICK_COMPLETED',
        title: '✅ Wave Pick Completed',
        severity: 'info',
        timestamp: new Date().toISOString(),
        orderId: activeWave.orderId,
        message: `Order #${activeWave.orderId} fully picked and bagged at Packaging Depot (${activeLocation.city} Hub).`
      });

      addToast({
        title: '🎉 Pick Wave Completed!',
        message: `Order #${activeWave.orderId} bagged and ready for dispatch.`,
        type: 'success'
      });
    }
  }, [activeWave, setActivePicker, setOrders, logException, addToast, activeLocation]);

  const reroutePickerForDamagedItem = useCallback((stepIndex, damagedBinId, targetSku) => {
    if (!activeWave || !activeWave.route) return;

    const currentStep = activeWave.route.instructions[stepIndex];
    if (!currentStep) return;

    reportDamageAndQuarantine({
      binId: damagedBinId,
      sku: targetSku,
      damagedQty: currentStep.quantity || 2,
      bins,
      orders,
      onException: logException
    });

    const altBins = Object.values(bins).filter(b => 
      b.sku === targetSku && 
      b.id !== damagedBinId && 
      (b.quantity - b.reserved) >= (currentStep.quantity || 1) && 
      b.damaged === 0
    );

    if (altBins.length > 0) {
      const nearestAlt = altBins[0];
      const updatedInstructions = [...activeWave.route.instructions];
      updatedInstructions[stepIndex] = {
        ...currentStep,
        binId: nearestAlt.id,
        aisle: nearestAlt.aisle,
        rack: nearestAlt.rack,
        shelf: nearestAlt.shelf,
        x: nearestAlt.x,
        y: nearestAlt.y,
        title: `Pick ${nearestAlt.skuName} (Rerouted)`,
        detail: `[REROUTED from ${damagedBinId}] Navigate to Aisle ${nearestAlt.aisle} -> Rack ${nearestAlt.rack} -> Shelf ${nearestAlt.shelf} (Bin ${nearestAlt.id})`
      };

      setActiveWave(prev => ({
        ...prev,
        route: { ...prev.route, instructions: updatedInstructions }
      }));

      logException({
        id: `EX-REROUTE-${Date.now()}`,
        type: 'DYNAMIC_REROUTE',
        title: '🔄 Autonomous Picker Rerouting',
        severity: 'high',
        timestamp: new Date().toISOString(),
        orderId: activeWave.orderId,
        sku: targetSku,
        message: `🚨 Damaged item at Bin ${damagedBinId}. Decision Engine rerouted picker to Bin ${nearestAlt.id} at ${activeLocation.city} Hub.`
      });

      addToast({
        title: '🔄 Route Dynamically Updated!',
        message: `Rerouted from defective Bin ${damagedBinId} to Bin ${nearestAlt.id}.`,
        type: 'warning'
      });
    } else {
      const skuInfo = SKU_MAP.get(targetSku);
      if (skuInfo) triggerAutomatedReorder(skuInfo, 0);
      addToast({
        title: '⛔ Stock Out on Defective Shelf',
        message: `SKU ${targetSku} marked for expedited replenishment.`,
        type: 'warning'
      });
    }
  }, [activeWave, bins, orders, logException, triggerAutomatedReorder, addToast, activeLocation]);

  const verifyQualityCheck = useCallback((orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: ORDER_STATUS.QUALITY_CHECK } : o));
    logException({
      id: `EX-QC-${Date.now()}`,
      type: 'QUALITY_ASSURANCE',
      title: '🛡️ Quality & Expiry Check Passed',
      severity: 'info',
      timestamp: new Date().toISOString(),
      orderId,
      message: `Order #${orderId} passed optical barcode scan, expiry verification, and tamper-proof bag sealing at ${activeLocation.city} Hub.`
    });
    addToast({
      title: `Order #${orderId} QC Passed`,
      message: 'Quality, freshness & tamper-seal verified. Cleared for rider dispatch.',
      type: 'success'
    });
  }, [setOrders, logException, addToast, activeLocation]);

  const dispatchOrder = useCallback((orderId) => {
    const orderToDispatch = orders.find(o => o.id === orderId);
    if (orderToDispatch) {
      setBins(prev => {
        const next = { ...prev };
        (orderToDispatch.items || []).forEach(item => {
          if (item.binId && next[item.binId]) {
            const b = next[item.binId];
            next[item.binId] = {
              ...b,
              quantity: Math.max(0, b.quantity - item.quantity),
              reserved: Math.max(0, b.reserved - item.quantity)
            };
          }
        });
        return next;
      });
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: ORDER_STATUS.DISPATCHED } : o));
    
    logException({
      id: `EX-DISPATCH-${Date.now()}`,
      type: 'ORDER_DISPATCH',
      title: '🛵 10-Minute Express Order Dispatched',
      severity: 'info',
      timestamp: new Date().toISOString(),
      orderId,
      message: `Order #${orderId} handed to delivery rider. Destination: ${orderToDispatch?.destination || activeLocation.city}.`
    });

    addToast({
      title: `Order #${orderId} Dispatched (Rider En Route)`,
      message: `Express rider dispatched to ${orderToDispatch?.destination || activeLocation.city}.`,
      type: 'success'
    });
  }, [orders, setBins, setOrders, logException, addToast, activeLocation]);

  // ── AUTONOMOUS VIP SLA AUTO-PACK & AUTO-SHIP (>5 MINS WATCHDOG) ─────────────
  const autoPackAndShipVipOrder = useCallback((orderId, reason = 'VIP SLA > 5 min threshold exceeded') => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (!order || order.status === ORDER_STATUS.DISPATCHED) return prev;

      setBins(bPrev => {
        const nextBins = { ...bPrev };
        (order.items || []).forEach(item => {
          if (item.binId && nextBins[item.binId]) {
            const b = nextBins[item.binId];
            nextBins[item.binId] = {
              ...b,
              quantity: Math.max(0, b.quantity - item.quantity),
              reserved: Math.max(0, b.reserved - item.quantity)
            };
          }
        });
        return nextBins;
      });

      const elapsedMinutes = Math.max(5.1, ((Date.now() - new Date(order.createdAt).getTime()) / 60000)).toFixed(1);
      logException({
        id: `EX-VIP-AUTOSHIP-${Date.now()}`,
        type: 'VIP_AUTO_DISPATCH',
        title: '🚀 VIP SLA Auto-Shipment Triggered (>5min)',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        orderId: order.id,
        message: `🚨 VIP 10-Min SLA Threshold Reached (${elapsedMinutes}m elapsed since placement). System autonomously completed packing, weight check, and dispatched Order #${order.id} (${order.customer}) to ${order.destination} via Rapid Express Rider.`
      });

      addToast({
        title: `🚨 VIP Order #${order.id} Auto-Dispatched!`,
        message: `VIP Order for ${order.customer} (${order.destination}) exceeded 5m SLA. Autonomous packing & express delivery completed. Admin notified.`,
        type: 'warning'
      });

      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      return prev.map(o => o.id === orderId ? {
        ...o,
        status: ORDER_STATUS.DISPATCHED,
        autoShipped: true,
        autoShippedAt: new Date().toISOString(),
        autoShippedReason: reason,
        items: (o.items || []).map(it => ({ ...it, allocated: true, picked: true }))
      } : o);
    });
  }, [setOrders, setBins, logException, addToast]);

  const checkAndAutoShipAgedVipOrders = useCallback(() => {
    const VIP_SLA_MS = 5 * 60 * 1000;
    const now = Date.now();

    orders.forEach(order => {
      const isVip = order.tier === 'VIP' || order.priority?.label === 'VIP Priority';
      if (isVip && order.status !== ORDER_STATUS.DISPATCHED) {
        const orderTime = new Date(order.createdAt).getTime();
        if (now - orderTime >= VIP_SLA_MS) {
          autoPackAndShipVipOrder(order.id);
        }
      }
    });
  }, [orders, autoPackAndShipVipOrder]);

  const restockBin = useCallback((binId, qty = 30) => {
    setBins(prev => {
      const bin = prev[binId];
      if (!bin) return prev;
      return {
        ...prev,
        [binId]: {
          ...bin,
          quantity: Math.min(bin.capacity, bin.quantity + qty),
          damaged: 0
        }
      };
    });
    addToast({
      title: `Bin ${binId} Restocked`,
      message: `Added +${qty} units of ${bins[binId]?.skuName || bins[binId]?.sku || 'inventory'}.`,
      type: 'success'
    });
  }, [bins, setBins, addToast]);

  const reportDamage = useCallback((binId, damagedQty = 4) => {
    const bin = bins[binId];
    if (!bin) return;
    const result = reportDamageAndQuarantine({
      binId,
      sku: bin.sku,
      damagedQty,
      bins,
      orders,
      onException: logException
    });
    if (result.success) {
      setBins(result.updatedBins);
    }
  }, [bins, orders, setBins, logException]);

  const transferBinStock = useCallback((sourceBinId, destBinId, qty) => {
    const source = bins[sourceBinId];
    if (!source) return;
    const result = doTransferStock({
      sourceBinId,
      destBinId,
      sku: source.sku,
      qty,
      bins,
      onException: logException
    });
    if (result.success) {
      setBins(result.updatedBins);
      addToast({
        title: 'Stock Transfer Success',
        message: `Moved ${qty}x ${source.skuName || source.sku} from ${sourceBinId} to ${destBinId}.`,
        type: 'success'
      });
    } else {
      addToast({
        title: 'Transfer Failed',
        message: result.message,
        type: 'warning'
      });
    }
  }, [bins, setBins, logException, addToast]);

  const receivePurchaseOrder = useCallback((poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    setBins(prev => {
      const targetBin = prev[po.targetBin] || Object.values(prev)[0];
      if (!targetBin) return prev;
      return {
        ...prev,
        [targetBin.id]: {
          ...targetBin,
          quantity: Math.min(targetBin.capacity, targetBin.quantity + po.quantity)
        }
      };
    });

    setPurchaseOrders(prev => prev.filter(p => p.id !== poId));

    logException({
      id: `EX-INBOUND-RECV-${Date.now()}`,
      type: 'INBOUND_DELIVERY',
      title: '🚚 Inbound Supplier Stock Received',
      severity: 'info',
      timestamp: new Date().toISOString(),
      sku: po.sku,
      message: `Inbound PO #${poId} from ${po.supplier} docked ${po.quantity} units of ${po.skuName} to Bin ${po.targetBin} (${activeLocation.city} Hub).`
    });

    addToast({
      title: `PO #${poId} Received`,
      message: `Docked ${po.quantity} units into Bin ${po.targetBin} (${activeLocation.city}).`,
      type: 'success'
    });

    setTimeout(() => allocateAllPendingOrders(), 600);
  }, [purchaseOrders, setBins, setPurchaseOrders, logException, addToast, allocateAllPendingOrders, activeLocation]);

  const runRushHourSimulation = useCallback(() => {
    const batch = generateRushHourBatch(16, selectedWarehouseId);
    setOrders(prev => [...batch, ...prev]);

    addToast({
      title: `⚡ Surge Injected (${activeLocation.city})`,
      message: `16+ grocery & snack orders queued across ${activeLocation.surroundingAreas.slice(0, 3).join(', ')}.`,
      type: 'warning'
    });

    setTimeout(() => allocateAllPendingOrders(), 1200);
  }, [selectedWarehouseId, activeLocation, setOrders, addToast, allocateAllPendingOrders]);

  const injectScenario = useCallback((scenarioType) => {
    if (scenarioType === 'VIP_CONFLICT') {
      const vipOrder = {
        id: `ORD-${selectedWarehouseId.slice(0, 3)}-VIP-${Math.floor(100 + Math.random() * 900)}`,
        customer: selectedWarehouseId === 'VIJAYAWADA' ? 'Amaravati Express Grocers & Organic Mart' : 'Kakinada Super-Mart & Gourmet Foods',
        tier: 'VIP',
        priority: ORDER_PRIORITY.VIP,
        status: ORDER_STATUS.CREATED,
        createdAt: new Date().toISOString(),
        assignedPicker: null,
        items: [
          { sku: 'SKU-GR-104', name: 'Fortune Sunlite Refined Sunflower Oil Pouch 1L', quantity: 14, allocated: false, binId: null, picked: false }
        ],
        preempted: false,
        shippingMethod: '10-Minute Rapid Express',
        destination: selectedWarehouseId === 'VIJAYAWADA' ? 'Mangalagiri AIIMS Highway Road, Vijayawada' : 'Bhanugudi Junction, Medical Complex, Kakinada'
      };

      setOrders(prev => [vipOrder, ...prev]);

      addToast({
        title: '⚡ VIP Rush Grocery Order Injected',
        message: `Incoming Urgent VIP Order #${vipOrder.id} requesting scarce inventory...`,
        type: 'warning'
      });

      setTimeout(() => {
        evaluateAndAllocateOrder({
          order: vipOrder,
          bins,
          allOrders: [vipOrder, ...orders],
          onException: logException,
          onTriggerReorder: triggerAutomatedReorder
        });
        allocateAllPendingOrders();
      }, 800);
    } else if (scenarioType === 'STOCK_DAMAGE') {
      const targetBinId = 'B-02-B2';
      reportDamage(targetBinId, 8);
      addToast({
        title: '💥 Shelf Impact & Snack Damage',
        message: `Damaged 8 units in Bin ${targetBinId}. Quarantining stock...`,
        type: 'warning'
      });
    } else if (scenarioType === 'SAFETY_STOCK_BREACH') {
      const targetBinId = 'A-01-A1';
      setBins(prev => ({
        ...prev,
        [targetBinId]: {
          ...prev[targetBinId],
          quantity: 3
        }
      }));
      const sku = bins[targetBinId]?.sku;
      const skuInfo = SKU_MAP.get(sku);
      if (skuInfo) {
        triggerAutomatedReorder(skuInfo, 3);
      }
    } else if (scenarioType === 'MULTI_ORDER_WAVE') {
      const unallocatedOrders = orders.filter(o => o.status === ORDER_STATUS.ALLOCATED).slice(0, 3);
      if (unallocatedOrders.length > 0) {
        startWavePick(unallocatedOrders[0].id);
      } else {
        allocateAllPendingOrders();
      }
    } else if (scenarioType === 'RESTOCK_ALL') {
      setBins(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id].quantity < 20 || next[id].damaged > 0) {
            next[id] = { ...next[id], quantity: 50, damaged: 0 };
          }
        });
        return next;
      });
      addToast({
        title: `🚚 Full Restock Completed (${activeLocation.city})`,
        message: `All grocery, snack & household bins replenished at ${activeLocation.name}.`,
        type: 'success'
      });
    } else if (scenarioType === 'VIP_5MIN_TIMEOUT') {
      const agedVipOrder = {
        id: `ORD-${selectedWarehouseId.slice(0, 3)}-${Math.floor(2070 + Math.random() * 20)}`,
        customer: selectedWarehouseId === 'VIJAYAWADA' ? 'Benz Circle Mega Hypermarket & Bakery' : 'Varma Grand Family Supermarket',
        tier: 'VIP',
        priority: ORDER_PRIORITY.VIP,
        status: ORDER_STATUS.ALLOCATED,
        createdAt: new Date(Date.now() - 6.5 * 60000).toISOString(),
        assignedPicker: 'Sai Varma (PK-04)',
        items: [
          { sku: 'SKU-GR-101', name: 'Aashirvaad Superior MP Sharbati Whole Wheat Atta 5kg', quantity: 4, allocated: true, binId: 'A-01-A1', picked: false },
          { sku: 'SKU-SB-205', name: 'Cadbury Dairy Milk Silk Roasted Almond 143g', quantity: 6, allocated: true, binId: 'B-01-B2', picked: false }
        ],
        preempted: false,
        shippingMethod: '10-Minute Rapid Express Delivery',
        destination: selectedWarehouseId === 'VIJAYAWADA' ? 'Benz Circle Plaza, MG Road, Vijayawada' : 'Sarpavaram Junction, ADB Bypass, Kakinada'
      };

      setOrders(prev => [agedVipOrder, ...prev]);

      addToast({
        title: '⚡ VIP Order Aging Detected (>6m)',
        message: `Order #${agedVipOrder.id} exceeded 5-min SLA. Autonomous packing & dispatch watchdog executing...`,
        type: 'warning'
      });

      setTimeout(() => {
        autoPackAndShipVipOrder(agedVipOrder.id, 'VIP Order reached 6.5m aging (SLA >5m breached)');
      }, 1200);
    }
  }, [selectedWarehouseId, activeLocation, bins, orders, logException, triggerAutomatedReorder, allocateAllPendingOrders, reportDamage, startWavePick, addToast, autoPackAndShipVipOrder, setOrders, setBins]);

  // Periodic Watchdog: Checks every 4 seconds for any VIP orders exceeding 5 minutes SLA
  useEffect(() => {
    const watchdogTimer = setInterval(() => {
      checkAndAutoShipAgedVipOrders();
    }, 4000);

    return () => clearInterval(watchdogTimer);
  }, [checkAndAutoShipAgedVipOrders]);

  // Live Continuous Traffic Simulation Loop
  useEffect(() => {
    if (!simulationActive) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }

    const intervalMs = Math.max(3000, 10000 / simulationSpeed);

    simTimerRef.current = setInterval(() => {
      const newOrder = generateRandomOrder(null, selectedWarehouseId);

      setOrders(prev => [newOrder, ...prev.slice(0, 40)]);

      setTimeout(() => {
        evaluateAndAllocateOrder({
          order: newOrder,
          bins,
          allOrders: [newOrder, ...orders],
          onException: logException,
          onTriggerReorder: triggerAutomatedReorder
        });
      }, 500);

      setPurchaseOrders(prev => prev.map(po => {
        if (po.status === 'IN_TRANSIT') {
          const nextEta = po.etaSeconds - (10 * simulationSpeed);
          if (nextEta <= 0) {
            setTimeout(() => receivePurchaseOrder(po.id), 200);
            return { ...po, status: 'DELIVERED', etaSeconds: 0 };
          }
          return { ...po, etaSeconds: nextEta };
        }
        return po;
      }));

    }, intervalMs);

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [simulationActive, simulationSpeed, selectedWarehouseId, bins, orders, setOrders, setPurchaseOrders, logException, triggerAutomatedReorder, receivePurchaseOrder]);

  // Compute Live Metrics
  const totalBinsCount = Object.keys(bins).length;
  const lowStockBinsCount = Object.values(bins).filter(b => {
    const skuInfo = SKU_MAP.get(b.sku);
    const min = skuInfo ? skuInfo.safetyStock : 15;
    return b.quantity <= min;
  }).length;
  const damagedBinsCount = Object.values(bins).filter(b => b.damaged > 0).length;
  const activeWavesCount = orders.filter(o => o.status === ORDER_STATUS.PICKING || o.status === ORDER_STATUS.ALLOCATED).length;
  const preemptionsCount = exceptions.filter(e => e.type === 'VIP_PREEMPTION').length;
  const totalPreemptedOrders = orders.filter(o => o.preempted).length;

  const value = {
    selectedWarehouseId,
    activeLocation,
    warehouseLocations: WAREHOUSE_LOCATIONS,
    switchWarehouse,
    bins,
    setBins,
    catalog,
    orders,
    setOrders,
    selectedZone,
    setSelectedZone,
    selectedBin,
    setSelectedBin,
    mapFilter,
    setMapFilter,
    exceptions,
    purchaseOrders,
    activePicker,
    setActivePicker,
    userProfile,
    isAuthenticated,
    setIsAuthenticated,
    loginUser,
    logoutUser,
    activeWave,
    role,
    setRole,
    viewMode,
    setViewMode,
    simulationActive,
    setSimulationActive,
    simulationSpeed,
    setSimulationSpeed,
    toasts,
    addToast,
    removeToast,
    allocateOrder,
    allocateAllPendingOrders,
    startWavePick,
    confirmPickerStep,
    reroutePickerForDamagedItem,
    verifyQualityCheck,
    dispatchOrder,
    restockBin,
    reportDamage,
    transferBinStock,
    receivePurchaseOrder,
    injectScenario,
    runRushHourSimulation,
    autoPackAndShipVipOrder,
    checkAndAutoShipAgedVipOrders,
    metrics: {
      totalBinsCount,
      lowStockBinsCount,
      damagedBinsCount,
      activeWavesCount,
      preemptionsCount,
      totalPreemptedOrders,
      fulfillmentSla: activeLocation.slaTarget || '99.8%',
      distanceSavedMeters: selectedWarehouseId === 'VIJAYAWADA' ? 520 : 412
    }
  };

  return (
    <WmsContext.Provider value={value}>
      {children}
    </WmsContext.Provider>
  );
}

export function useWms() {
  const context = useContext(WmsContext);
  if (!context) {
    throw new Error('useWms must be used within a WmsProvider');
  }
  return context;
}
