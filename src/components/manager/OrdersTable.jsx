import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { 
  Zap, 
  CheckCircle2, 
  Play, 
  Send, 
  Split, 
  Filter, 
  Smartphone, 
  Package, 
  Clock, 
  Search,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export function OrdersTable() {
  const { 
    orders, 
    allocateOrder, 
    startWavePick, 
    verifyQualityCheck,
    dispatchOrder, 
    allocateAllPendingOrders,
    checkAndAutoShipAgedVipOrders 
  } = useWms();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter(ord => {
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return ord.id.toLowerCase().includes(q) || 
             ord.customer.toLowerCase().includes(q) ||
             ord.items.some(it => it.sku.toLowerCase().includes(q) || it.name.toLowerCase().includes(q));
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ALLOCATED':
        return <span className="stage"><i style={{ background: '#36c999' }}></i> Allocated</span>;
      case 'PICKING':
        return <span className="stage picking"><i></i> Picking</span>;
      case 'PACKED':
        return <span className="stage packed"><i></i> Packed</span>;
      case 'QUALITY_CHECK':
        return <span className="stage" style={{ color: '#88dcff' }}><i style={{ background: '#88dcff' }}></i> Quality Check</span>;
      case 'DISPATCHED':
        return <span className="stage dispatched"><i></i> Dispatched</span>;
      case 'SPLIT_HELD':
        return <span className="stage split"><i></i> Split / Held</span>;
      default:
        return <span className="stage"><i style={{ background: '#7887ff' }}></i> Created</span>;
    }
  };

  return (
    <div className="panel" style={{ width: '100%' }}>
      {/* Table Header & Controls */}
      <div className="panel-head">
        <div>
          <h2>
            Orders & Wave Dispatch Matrix
            <span>{orders.length} Total Orders Recorded</span>
          </h2>
        </div>

        <div className="table-controls">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search Order # or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter"
              style={{ paddingLeft: '24px', width: '160px' }}
            />
            <Search size={11} style={{ position: 'absolute', left: '8px', top: '10px', color: '#7a869e' }} />
          </div>

          <select
            className="filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created (Pending Alloc)</option>
            <option value="ALLOCATED">Allocated (Ready to Pick)</option>
            <option value="PICKING">In Pick Wave</option>
            <option value="PACKED">Packed (Awaiting QC)</option>
            <option value="QUALITY_CHECK">Quality Checked (Ready to Ship)</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="SPLIT_HELD">Split-Fulfillment Held</option>
          </select>

          <button 
            className="rush" 
            style={{ background: '#7c3aed', color: '#fff' }}
            onClick={checkAndAutoShipAgedVipOrders}
            title="Auto-pack and ship all VIP orders exceeding the 5-minute threshold"
          >
            <Send size={13} />
            Auto-Ship Aged VIPs
          </button>

          <button className="rush" onClick={allocateAllPendingOrders}>
            <Zap size={13} />
            Auto-Allocate All
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>ORDER ID &amp; SLA</th>
              <th>CUSTOMER &amp; SHIPPING</th>
              <th>PRIORITY TIER</th>
              <th>REQUESTED ITEMS</th>
              <th>STATUS</th>
              <th>DECISION ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#7b87a0' }}>
                  No orders matching the current filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
                const orderAgeMin = (orderAgeMs / 60000).toFixed(1);
                const isVip = order.tier === 'VIP' || order.priority?.label === 'VIP Priority';
                const isOver5Min = orderAgeMs >= 5 * 60 * 1000;

                return (
                  <tr key={order.id} style={isVip && isOver5Min && order.status !== 'DISPATCHED' ? { background: 'rgba(239, 68, 68, 0.08)' } : {}}>
                    <td>
                      <b>#{order.id}</b>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <small>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        {isVip && (
                          <span 
                            style={{
                              fontSize: '9px',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: isOver5Min ? '#7f1d1d' : '#312e81',
                              color: isOver5Min ? '#fca5a5' : '#c7d2fe',
                              fontWeight: 'bold'
                            }}
                          >
                            ⏱️ {orderAgeMin}m {isOver5Min ? '(SLA BREACH)' : '(SLA: 5m)'}
                          </span>
                        )}
                      </div>
                      {order.autoShipped && (
                        <div style={{ marginTop: '3px' }}>
                          <span style={{ background: '#581c87', color: '#f3e8ff', fontSize: '8.5px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px' }}>
                            🚀 AUTO-SHIPPED (&gt;5m)
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      <b>{order.customer}</b>
                      <small>{order.shippingMethod} &bull; {order.destination}</small>
                    </td>

                    <td>
                      <span className={`priority ${order.priority.badgeClass || ''}`}>
                        {order.tier === 'VIP' && <Zap size={10} />}
                        {order.priority.label}
                      </span>
                      {order.preempted && (
                        <small style={{ color: '#f06870', fontWeight: 'bold', marginTop: '2px' }}>
                          ⚡ Preempted by VIP
                        </small>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'grid', gap: '2px' }}>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} style={{ fontSize: '10px' }}>
                            <b>{item.quantity}x</b> {item.name}
                            {item.binId && <code style={{ marginLeft: '4px', fontSize: '9px' }}>@{item.binId}</code>}
                            {item.splitBatch && <span style={{ color: '#f0b44c', marginLeft: '4px' }}>[{item.splitBatch}]</span>}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <small style={{ color: '#8895ae' }}>+{order.items.length - 2} more items ({totalItemsCount} total units)</small>
                        )}
                      </div>
                    </td>

                    <td>
                      {getStatusBadge(order.status)}
                      {order.assignedPicker && (
                        <small style={{ color: '#8ea1c8' }}>Picker: {order.assignedPicker.split(' ')[0]}</small>
                      )}
                    </td>

                    <td>
                      <div className="table-actions">
                        {(order.status === 'CREATED' || order.status === 'SPLIT_HELD') && (
                          <button
                            className="action-btn primary"
                            onClick={() => allocateOrder(order.id)}
                            title="Run priority allocation algorithm"
                          >
                            <Zap size={11} />
                            Allocate
                          </button>
                        )}

                        {order.status === 'ALLOCATED' && (
                          <button
                            className="action-btn primary"
                            onClick={() => startWavePick(order.id)}
                            title="Generate TSP Pick Route and launch floor picker terminal"
                          >
                            <Smartphone size={11} />
                            Start Pick
                          </button>
                        )}

                        {order.status === 'PICKING' && (
                          <button
                            className="action-btn"
                            onClick={() => startWavePick(order.id)}
                            title="Resume handheld pick route"
                          >
                            <Play size={11} />
                            Resume Wave
                          </button>
                        )}

                        {order.status === 'PACKED' && (
                          <button
                            className="action-btn primary"
                            style={{ background: '#1e3850', borderColor: '#48a8e8', color: '#bce4ff' }}
                            onClick={() => verifyQualityCheck(order.id)}
                            title="Execute barcode, optical, and weight QC validation"
                          >
                            <ShieldCheck size={11} />
                            QC Check
                          </button>
                        )}

                        {order.status === 'QUALITY_CHECK' && (
                          <button
                            className="action-btn primary"
                            style={{ background: '#1c4a3a', borderColor: '#36c999', color: '#a4f5d6' }}
                            onClick={() => dispatchOrder(order.id)}
                            title="Print shipping label & manifest and dispatch shipment"
                          >
                            <Send size={11} />
                            Dispatch
                          </button>
                        )}

                        {order.status === 'DISPATCHED' && (
                          <span style={{ fontSize: '10px', color: '#40d6a0', fontWeight: 'bold' }}>
                            ✓ In Courier Transit
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
