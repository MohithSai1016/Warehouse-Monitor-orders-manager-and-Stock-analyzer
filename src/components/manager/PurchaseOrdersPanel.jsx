import React from 'react';
import { useWms } from '../../context/WmsContext';
import { Truck, CheckCircle2, Clock, AlertTriangle, ShieldCheck, PlusCircle } from 'lucide-react';

export function PurchaseOrdersPanel() {
  const { purchaseOrders, receivePurchaseOrder, addToast } = useWms();

  return (
    <div className="panel" style={{ width: '100%' }}>
      <div className="panel-head">
        <div>
          <h2>
            Inbound Supply & Purchase Orders Pipeline
            <span>{purchaseOrders.length} Inbound Shipments En Route</span>
          </h2>
        </div>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>PO NUMBER</th>
              <th>SUPPLIER & ORIGIN</th>
              <th>SKU & REPLENISHMENT QTY</th>
              <th>TOTAL PO VALUE</th>
              <th>ESTIMATED ARRIVAL</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '35px', color: '#7e8aa2' }}>
                  No pending inbound purchase orders. All safety margins satisfied.
                </td>
              </tr>
            ) : (
              purchaseOrders.map(po => (
                <tr key={po.id}>
                  <td>
                    <b style={{ color: '#c5adff' }}>#{po.id}</b>
                    <small>{new Date(po.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </td>

                  <td>
                    <b>{po.supplier}</b>
                    <small>Direct Freight &bull; Dock 04</small>
                  </td>

                  <td>
                    <b>+{po.quantity} Units</b> &bull; {po.skuName}
                    <small style={{ fontFamily: 'DM Mono' }}>{po.sku} &bull; Target: {po.targetBin}</small>
                  </td>

                  <td>
                    <b>${po.totalCost?.toFixed(2) || '0.00'}</b>
                    <small>@ ${po.unitCost?.toFixed(2)}/unit</small>
                  </td>

                  <td>
                    {po.status === 'IN_TRANSIT' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#f0b44c', fontWeight: 'bold' }}>
                        <Clock size={12} className="pulse" />
                        ETA: {Math.max(0, po.etaSeconds)}s
                      </span>
                    ) : (
                      <span style={{ color: '#8895ad' }}>Scheduled Inbound</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="action-btn primary"
                      style={{ background: '#194236', borderColor: '#2ba880', color: '#97f5d4' }}
                      onClick={() => receivePurchaseOrder(po.id)}
                      title="Receive supplier delivery and auto-restock target warehouse bin"
                    >
                      <CheckCircle2 size={11} />
                      Receive & Restock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
