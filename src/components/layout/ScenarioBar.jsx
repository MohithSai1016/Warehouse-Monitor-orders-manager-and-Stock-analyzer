import React from 'react';
import { useWms } from '../../context/WmsContext';
import { Zap, AlertTriangle, ShieldAlert, Layers, Truck, Play, Flame } from 'lucide-react';

export function ScenarioBar() {
  const { injectScenario, runRushHourSimulation } = useWms();

  return (
    <div className="scenario-bar">
      <span>
        <Play size={12} className="purple" />
        DEMO SCENARIOS:
      </span>
      <button 
        className="scenario-pill"
        style={{ background: '#451e12', borderColor: '#ea580c', color: '#ffb088', fontWeight: 'bold' }}
        onClick={runRushHourSimulation}
        title="Inject 16+ mixed-priority orders, trigger cascade allocations, priority preemptions and dynamic waves"
      >
        <Flame size={12} color="#f97316" />
        ⚡ Rush Hour (16 Orders)
      </button>
      <button 
        className="scenario-pill"
        style={{ background: '#3b1d4a', borderColor: '#c084fc', color: '#f3e8ff', fontWeight: 'bold' }}
        onClick={() => injectScenario('VIP_5MIN_TIMEOUT')}
        title="Simulate VIP order exceeding 5-min threshold and trigger autonomous auto-packing and courier shipping"
      >
        <Zap size={12} color="#c084fc" />
        🚨 VIP &gt;5m Auto-Ship
      </button>
      <button 
        className="scenario-pill"
        onClick={() => injectScenario('VIP_CONFLICT')}
        title="Inject an urgent VIP order that preempts stock from lower priority orders"
      >
        <Zap size={12} color="#c5adff" />
        VIP Rush Preemption
      </button>
      <button 
        className="scenario-pill danger"
        onClick={() => injectScenario('STOCK_DAMAGE')}
        title="Simulate sudden damaged stock on a shelf and auto-quarantine"
      >
        <AlertTriangle size={12} color="#e15b62" />
        Zone B Rack Damage
      </button>
      <button 
        className="scenario-pill warn"
        onClick={() => injectScenario('SAFETY_STOCK_BREACH')}
        title="Drop a fast-mover SKU below safety stock to trigger automated PO"
      >
        <ShieldAlert size={12} color="#e9af47" />
        Safety Stock Breach PO
      </button>
      <button 
        className="scenario-pill"
        onClick={() => injectScenario('MULTI_ORDER_WAVE')}
        title="Launch multi-item wave pick with TSP shortest-path calculation"
      >
        <Layers size={12} color="#7988ff" />
        Launch Wave Pick (TSP)
      </button>
      <button 
        className="scenario-pill"
        onClick={() => injectScenario('RESTOCK_ALL')}
        title="Receive inbound supplier fleet and replenish all bins"
      >
        <Truck size={12} color="#36c999" />
        Restock Depleted Bins
      </button>
    </div>
  );
}
