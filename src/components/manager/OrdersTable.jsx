import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { 
  Zap, 
  CheckCircle2, 
  Play, 
  Send, 
  Smartphone, 
  Search,
  ShieldCheck
} from 'lucide-react';
import { sanitizeInput } from '../../utils/security';

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

  const cleanSearch = sanitizeInput(search);

  const filteredOrders = orders.filter(ord => {
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
    if (cleanSearch.trim()) {
      const q = cleanSearch.toLowerCase();
      return ord.id.toLowerCase().includes(q) || 
             ord.customer.toLowerCase().includes(q) ||
             ord.items.some(it => it.sku.toLowerCase().includes(q) || it.name.toLowerCase().includes(q));
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ALLOCATED':
        return <span className="stage"><i style={{ background: '#36c999' }} aria-hidden="true"></i> Allocated</span>;
      case 'PICKING':
        return <span className="stage picking"><i aria-hidden="true"></i> Picking</span>;
      case 'PACKED':
        return <span className="stage packed"><i aria-hidden="true"></i> Packed</span>;
      case 'QUALITY_CHECK':
        return <span className="stage" style={{ color: '#88dcff' }}><i style={{ background: '#88dcff' }} aria-hidden="true"></i> Quality Check</span>;
      case 'DISPATCHED':
        return <span className="stage dispatched"><i aria-hidden="true"></i> Dispatched</span>;
      case 'SPLIT_HELD':
        return <span className="stage split"><i aria-hidden="true"></i> Split / Held</span>;
      default:
        return <span className="stage"><i style={{ background: '#7887ff' }} aria-hidden="true"></i> Created</span>;
    }
  };

  return (
    <div className="panel" style={{ width: '100%' }} role="region" aria-label="Customer Orders and Wave Allocation Matrix">
      {/* Table Header & Controls */}
      <div className="panel-head">
        <div>
          <h2>
            Orders & Wave Dispatch Matrix
            <span>{orders.length} Total Orders Recorded</span>
          </h2>
        </div>

        <div className="table-controls" role="search" aria-label="Filter and Search Orders">
          <div style={{ position: 'relative' }}>
            <label htmlFor="orders-search-input" className="sr-only">
              Search by Order ID, Customer, or SKU
            </label>
            <input
              id="orders-search-input"
              type="text"
              placeholder="Search Order # or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter"
              style={{ paddingLeft: '24px', width: '160px' }}
              aria-label="Search orders by identifier, customer, or SKU"
            />
            <Search size={11} style={{ position: 'absolute', left: '8px', top: '10px', color: '#7a869e' }} aria-hidden="true" />
          </div>

          <div>
            <label htmlFor="orders-status-filter" className="sr-only">
              Filter by Order Status
            </label>
            <select
              id="orders-status-filter"
              className="filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by order lifecycle status"
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
          </div>

          <button 
            className="rush" 
            style={{ background: '#7c3aed', color: '#fff' }}
            onClick={checkAndAutoShipAgedVipOrders}
            aria-label="Auto-pack and dispatch all VIP orders exceeding the 5-minute SLA threshold"
            title="Auto-pack and ship all VIP orders exceeding the 5-minute threshold"
          >
            <Send size={13} aria-hidden="true" />
            Auto-Ship Aged VIPs
          </button>

          <button 
            className="rush" 
            onClick={allocateAllPendingOrders}
            aria-label="Run priority allocation algorithm on all pending orders"
          >
            <Zap size={13} aria-hidden="true" />
            Auto-Allocate All
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-panel">
        <table aria-label="Customer Orders List">
          <caption className="sr-only">
            Active and archived warehouse orders with priority status and fulfillment actions
          </caption>
          <thead>
            <tr>
              <th scope="col">ORDER ID &amp; SLA</th>
              <th scope="col">CUSTOMER &amp; SHIPPING</th>
              <th scope="col">PRIORITY TIER</th>
              <th scope="col">REQUESTED ITEMS</th>
              <th scope="col">STATUS</th>
              <th scope="col">DECISION ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#7b87a0' }}>
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
                            role="status"
                            aria-label={`Order age: ${orderAgeMin} minutes. ${isOver5Min ? 'SLA Breached' : 'Within 5 minute SLA'}`}
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
                      <span className={`priority ${order.priority?.badgeClass || ''}`}>
                        {order.tier === 'VIP' && <Zap size={10} aria-hidden="true" />}
                        {order.priority?.label || 'Standard'}
                      </span>
                      {order.preempted && (
                        <small style={{ color: '#f06870', fontWeight: 'bold', marginTop: '2px', display: 'block' }}>
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
                        <small style={{ color: '#8ea1c8', display: 'block' }}>Picker: {order.assignedPicker.split(' ')[0]}</small>
                      )}
                    </td>

                    <td>
                      <div className="table-actions">
                        {(order.status === 'CREATED' || order.status === 'SPLIT_HELD') && (
                          <button
                            className="action-btn primary"
                            onClick={() => allocateOrder(order.id)}
                            aria-label={`Allocate inventory for order ${order.id}`}
                            title="Run priority allocation algorithm"
                          >
                            <Zap size={11} aria-hidden="true" />
                            Allocate
                          </button>
                        )}

                        {order.status === 'ALLOCATED' && (
                          <button
                            className="action-btn primary"
                            onClick={() => startWavePick(order.id)}
                            aria-label={`Start wave picking for order ${order.id}`}
                            title="Generate TSP Pick Route and launch floor picker terminal"
                          >
                            <Smartphone size={11} aria-hidden="true" />
                            Start Pick
                          </button>
                        )}

                        {order.status === 'PICKING' && (
                          <button
                            className="action-btn"
                            onClick={() => startWavePick(order.id)}
                            aria-label={`Resume wave picking for order ${order.id}`}
                            title="Resume handheld pick route"
                          >
                            <Play size={11} aria-hidden="true" />
                            Resume Wave
                          </button>
                        )}

                        {order.status === 'PACKED' && (
                          <button
                            className="action-btn primary"
                            style={{ background: '#1e3850', borderColor: '#48a8e8', color: '#bce4ff' }}
                            onClick={() => verifyQualityCheck(order.id)}
                            aria-label={`Verify Quality Control for order ${order.id}`}
                            title="Execute barcode, optical, and weight QC validation"
                          >
                            <ShieldCheck size={11} aria-hidden="true" />
                            QC Check
                          </button>
                        )}

                        {order.status === 'QUALITY_CHECK' && (
                          <button
                            className="action-btn primary"
                            style={{ background: '#1c4a3a', borderColor: '#36c999', color: '#a4f5d6' }}
                            onClick={() => dispatchOrder(order.id)}
                            aria-label={`Dispatch order ${order.id} to courier`}
                            title="Print shipping label & manifest and dispatch shipment"
                          >
                            <Send size={11} aria-hidden="true" />
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
