import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { CATEGORIES } from '../../data/catalog';
import { 
  Package, 
  Search, 
  PlusCircle, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Layers 
} from 'lucide-react';

export function InventoryCatalog() {
  const { catalog, bins, addToast } = useWms();
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [search, setSearch] = useState('');

  // Calculate live aggregate stock for each SKU across all bins
  const skuStockMap = {};
  const skuBinMap = {};

  Object.values(bins).forEach(bin => {
    if (!skuStockMap[bin.sku]) {
      skuStockMap[bin.sku] = { total: 0, reserved: 0, damaged: 0 };
      skuBinMap[bin.sku] = [];
    }
    skuStockMap[bin.sku].total += bin.quantity;
    skuStockMap[bin.sku].reserved += (bin.reserved || 0);
    skuStockMap[bin.sku].damaged += (bin.damaged || 0);
    skuBinMap[bin.sku].push(bin.id);
  });

  const filteredCatalog = catalog.filter(item => {
    if (selectedCat !== 'ALL' && item.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.sku.toLowerCase().includes(q) || 
             item.name.toLowerCase().includes(q) || 
             item.barcode.includes(q);
    }
    return true;
  });

  const handleQuickReorder = (item) => {
    addToast({
      title: `PO Request Created: ${item.sku}`,
      message: `Purchase Order submitted for ${item.reorderQty} units to ${item.supplier || 'Supplier'}.`,
      type: 'success'
    });
  };

  return (
    <div className="panel" style={{ width: '100%' }}>
      {/* Header */}
      <div className="panel-head">
        <div>
          <h2>
            Quick-Commerce Product Catalog Directory
            <span>{catalog.length} Total Registered FMCG &amp; Daily Needs SKUs</span>
          </h2>
        </div>

        <div className="table-controls">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search SKU code, name, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter"
              style={{ paddingLeft: '24px', width: '220px' }}
            />
            <Search size={11} style={{ position: 'absolute', left: '8px', top: '10px', color: '#7a869e' }} />
          </div>

          <select
            className="filter"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="ALL">All Categories ({catalog.length})</option>
            {Object.values(CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>SKU &amp; BARCODE</th>
              <th>PRODUCT NAME &amp; SPEC</th>
              <th>CATEGORY &amp; ZONE</th>
              <th>TOTAL WAREHOUSE STOCK</th>
              <th>UNIT PRICE</th>
              <th>SUPPLIER REORDER</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatalog.map(item => {
              const stock = skuStockMap[item.sku] || { total: 0, reserved: 0, damaged: 0 };
              const available = Math.max(0, stock.total - stock.reserved - stock.damaged);
              const isBelowSafety = available <= item.safetyStock;
              const isBelowReorder = available <= item.reorderPoint;
              const binLocations = skuBinMap[item.sku] || [];

              return (
                <tr key={item.sku}>
                  <td>
                    <b>{item.sku}</b>
                    <small style={{ fontFamily: 'DM Mono' }}>{item.barcode}</small>
                  </td>

                  <td>
                    <b>{item.name}</b>
                    <small>{item.dimensions} &bull; {item.weightKg}kg &bull; {item.tempZone}</small>
                  </td>

                  <td>
                    <span style={{ fontSize: '11px', color: '#d0d8e8', fontWeight: '600' }}>
                      {item.category}
                    </span>
                    <small style={{ color: '#7a87a0' }}>
                      {binLocations.length > 0 ? `Bins: ${binLocations.join(', ')}` : 'Unassigned'}
                    </small>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: isBelowSafety ? '#f06870' : isBelowReorder ? '#f0b44c' : '#39c99b' }}>
                        {available}u
                      </strong>
                      <span style={{ fontSize: '10px', color: '#8894ab' }}>
                        ({stock.total} total &bull; {stock.reserved} res)
                      </span>
                    </div>

                    <div className="progress" style={{ height: '4px', marginTop: '4px', width: '130px' }}>
                      <i style={{ 
                        width: `${Math.min(100, (available / (item.reorderPoint * 1.5)) * 100)}%`,
                        background: isBelowSafety ? '#f06870' : isBelowReorder ? '#f0b44c' : '#7e8cff'
                      }}></i>
                    </div>
                  </td>

                  <td>
                    <b>₹{item.unitCost.toFixed(2)}</b>
                    <small>Valuation: ₹{(item.unitCost * stock.total).toFixed(2)}</small>
                  </td>

                  <td>
                    <button
                      className="action-btn primary"
                      onClick={() => handleQuickReorder(item)}
                      title={`Trigger PO for ${item.reorderQty} units from ${item.supplier}`}
                    >
                      <PlusCircle size={11} />
                      Order +{item.reorderQty}u
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
