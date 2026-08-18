import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { SKU_MAP } from '../../data/catalog';
import { 
  CheckCircle2, 
  MapPin, 
  Box, 
  AlertTriangle, 
  PackageCheck, 
  ArrowRight, 
  Smartphone, 
  Camera, 
  ShieldCheck 
} from 'lucide-react';

export function PickerConsole() {
  const { 
    activeWave, 
    confirmPickerStep, 
    activePicker, 
    reroutePickerForDamagedItem,
    verifyQualityCheck,
    dispatchOrder, 
    setViewMode,
    setRole,
    orders 
  } = useWms();

  const [isScanning, setIsScanning] = useState(false);

  if (!activeWave || !activeWave.route || activeWave.route.instructions.length === 0) {
    return (
      <div className="panel" style={{ padding: '50px 20px', textAlign: 'center' }} role="status" aria-label="No Active Wave">
        <Smartphone size={44} style={{ color: '#6877a0', margin: '0 auto 14px' }} aria-hidden="true" />
        <h2>No Active Wave Pick Selected</h2>
        <p style={{ color: '#8894ab', maxWidth: '420px', margin: '8px auto 20px', fontSize: '12px' }}>
          Select an allocated order from the Orders Matrix or launch a demo wave to begin step-by-step guided warehouse picking.
        </p>
        <button 
          className="rush" 
          style={{ margin: '0 auto' }}
          onClick={() => { setViewMode('ORDERS'); setRole('MANAGER'); }}
          aria-label="View allocated orders to start picking"
        >
          View Allocated Orders
        </button>
      </div>
    );
  }

  const instructions = activeWave.route.instructions;
  const currentStepIdx = Math.min(activeWave.currentStepIndex, instructions.length - 1);
  const currentStep = instructions[currentStepIdx] || instructions[0];
  const isFinished = activeWave.isCompleted || currentStepIdx >= instructions.length - 1;
  const currentSkuInfo = currentStep.sku ? SKU_MAP.get(currentStep.sku) : null;
  const isScanned = !!activeWave.pickedItems[currentStep.binId];

  // Look up current order in state
  const currentOrderObj = orders.find(o => o.id === activeWave.orderId);
  const orderStatus = currentOrderObj?.status || (isFinished ? 'PACKED' : 'PICKING');

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Beep sound simulation
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    setTimeout(() => {
      setIsScanning(false);
      confirmPickerStep(currentStepIdx);
    }, 450);
  };

  const handleReportDamageAtShelf = () => {
    if (currentStep.binId && currentStep.binId !== 'DEPOT') {
      reroutePickerForDamagedItem(currentStepIdx);
    }
  };

  return (
    <section className="picker-wrap" aria-label="Floor Picker Handheld Terminal">
      {/* Return to 2D Map Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button
          onClick={() => {
            setRole('MANAGER');
            setViewMode('MAP');
          }}
          aria-label="Exit handheld terminal and return to 2D Warehouse Map"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#38bdf8',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <MapPin size={14} color="#38bdf8" aria-hidden="true" />
          <span>&larr; Exit to 2D Warehouse Map</span>
        </button>

        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          Logged in as: <strong style={{ color: '#e2e8f0' }}>{activePicker?.name || 'Mohith Sai'}</strong>
        </span>
      </div>

      {/* Main Handheld Card */}
      <div className="picker-card" role="region" aria-label="Pick Wave Navigation Guide">
        {/* Left Side: Route Minimap */}
        <div className="picker-map" aria-label="TSP Pick Route Progress">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: "700 10px 'DM Mono', monospace", color: '#8897c2' }}>
              TSP ROUTE #{activeWave.id}
            </span>
            <span style={{ font: "700 10px 'DM Mono', monospace", color: '#32d49b' }}>
              {activeWave.route.totalDistanceMeters}m Total
            </span>
          </div>

          {/* Route path graphic */}
          <div className="route-line" aria-hidden="true"></div>
          <div className="route-dots" role="list" aria-label="Route waypoints">
            {instructions.map((step, idx) => {
              const isDone = idx < currentStepIdx || (idx === currentStepIdx && isScanned);
              const isCurrent = idx === currentStepIdx && !isDone;
              return (
                <i
                  key={idx}
                  role="listitem"
                  className={`${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  aria-label={`Step ${step.step}: ${step.title}. ${isDone ? 'Completed' : isCurrent ? 'Current' : 'Pending'}`}
                  title={`${step.step}. ${step.title}`}
                >
                  {step.step}
                </i>
              );
            })}
          </div>

          <p>
            {activeWave.route.distanceSavedMeters > 0 
              ? `⚡ Shaved ${activeWave.route.distanceSavedMeters}m (${activeWave.route.savingsPercentage}%) off walking distance.`
              : 'Shortest path navigation enabled.'}
          </p>
        </div>

        {/* Right Side: Step-by-Step Pick Console */}
        <div className="picker-body">
          {isFinished ? (
            /* Finished Wave View & QC / Dispatch Pipeline */
            <div style={{ textAlign: 'center', padding: '10px 0' }} role="status" aria-label="Wave Completed">
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: '#1b4a3a', 
                color: '#32d49b', 
                borderRadius: '50%', 
                display: 'grid', 
                placeItems: 'center', 
                margin: '0 auto 12px' 
              }}>
                <CheckCircle2 size={30} aria-hidden="true" />
              </div>
              <span className="step-tag" style={{ color: '#32d49b', background: '#14382c' }}>
                WAVE COMPLETED &bull; {orderStatus}
              </span>
              <h2>All Items Picked & Cartonized</h2>
              <p>
                Order #{activeWave.orderId} items are staged at Dispatch Conveyor Bay.
              </p>

              {/* Quality Check & Dispatch Actions */}
              <div style={{ display: 'grid', gap: '8px', marginTop: '20px' }}>
                {orderStatus !== 'QUALITY_CHECK' && orderStatus !== 'DISPATCHED' ? (
                  <button
                    className="next-btn"
                    style={{ background: '#7988ff', color: '#ffffff' }}
                    onClick={() => {
                      verifyQualityCheck(activeWave.orderId);
                    }}
                    aria-label={`Verify Quality Control for order ${activeWave.orderId}`}
                  >
                    <ShieldCheck size={14} aria-hidden="true" />
                    Execute Optical & Weight Quality Check (QC)
                  </button>
                ) : (
                  <div style={{
                    padding: '8px',
                    background: '#14382c',
                    border: '1px solid #32d49b',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#7ef2c7',
                    fontWeight: 'bold'
                  }} role="status">
                    ✓ Quality Check Passed & Sealed
                  </div>
                )}

                <button
                  className="next-btn"
                  style={{ background: '#32d49b', color: '#0c1a14' }}
                  onClick={() => {
                    dispatchOrder(activeWave.orderId);
                    setViewMode('ORDERS');
                    setRole('MANAGER');
                  }}
                  aria-label={`Print manifest and dispatch order ${activeWave.orderId}`}
                >
                  <PackageCheck size={14} aria-hidden="true" />
                  Print Courier Manifest & Final Dispatch
                </button>

                <button
                  className="outline-btn"
                  onClick={() => {
                    setViewMode('MAP');
                    setRole('MANAGER');
                  }}
                  aria-label="Return to Warehouse Command Map"
                >
                  Return to Warehouse Command Map
                </button>
              </div>
            </div>
          ) : (
            /* Active Step View */
            <div role="region" aria-label={`Current Pick Step ${currentStep.step}`}>
              <span className="step-tag">
                STEP {currentStep.step} OF {instructions.length} &bull; {currentStep.type}
              </span>

              <h2>{currentStep.title}</h2>
              <p>{currentStep.detail}</p>

              {/* Task Info Box */}
              {currentStep.binId !== 'DEPOT' && (
                <div className="pick-task">
                  <Box size={24} aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <small>TARGET BIN & BARCODE</small>
                    <b>{currentStep.binId} &bull; EAN: {currentSkuInfo?.barcode || '89012400101'}</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <small>PICK QTY</small>
                    <b style={{ fontSize: '16px', color: '#7988ff' }}>{currentStep.pickQty || 1} Units</b>
                  </div>
                </div>
              )}

              {/* Barcode Scanner Button */}
              <button
                className={`scan-btn ${isScanning ? 'scanned' : ''}`}
                onClick={handleSimulateScan}
                disabled={isScanning}
                aria-label={`Scan barcode for SKU in bin ${currentStep.binId}`}
              >
                <Camera size={14} aria-hidden="true" />
                <span>{isScanning ? 'Verifying Optical Barcode...' : 'Scan Bin / SKU Barcode'}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  className="next-btn"
                  onClick={() => confirmPickerStep(currentStepIdx)}
                  aria-label={`Confirm pick for step ${currentStep.step}`}
                >
                  <span>Confirm Step</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>

                {currentStep.binId !== 'DEPOT' && (
                  <button
                    className="outline-btn danger"
                    style={{ width: 'auto', padding: '0 12px' }}
                    onClick={handleReportDamageAtShelf}
                    aria-label={`Report damaged unit at bin ${currentStep.binId} and trigger automatic rerouting`}
                    title="Report defective item -> Autonomous Decision Engine will reroute to nearest alternative bin"
                  >
                    <AlertTriangle size={13} aria-hidden="true" />
                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>Damaged (Auto-Reroute)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operator Info Card */}
      <div className="worker-info" role="region" aria-label="Picker Shift Summary">
        <div className="worker-avatar" aria-hidden="true">
          {activePicker?.name?.split(' ').map(n => n[0]).join('') || 'MS'}
        </div>
        <h3>{activePicker?.name || 'Mohith Sai'}</h3>
        <p>Assigned to {activePicker?.zone} &bull; ID #{activePicker?.id}</p>

        <hr />

        <div>
          <span>Shift Accuracy</span>
          <b style={{ color: '#32d49b' }}>{activePicker?.accuracy}</b>
        </div>
        <div>
          <span>Picks Completed</span>
          <b>{activePicker?.shiftPicks} Items</b>
        </div>
        <div>
          <span>Active Wave</span>
          <b>{activeWave.id}</b>
        </div>
        <div>
          <span>Order Tier</span>
          <b style={{ color: activeWave.priority?.color || '#fff' }}>{activeWave.priority?.label || 'Standard'}</b>
        </div>
      </div>
    </section>
  );
}
