import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { ZONES } from '../../data/initialWarehouse';
import { SKU_MAP } from '../../data/catalog';
import { 
  Search, 
  Filter, 
  Layers, 
  Table as TableIcon, 
  Grid as GridIcon, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Zap,
  Box
} from 'lucide-react';

export function WarehouseMap() {
  const { 
    bins, 
    selectedZone, 
    setSelectedZone, 
    selectedBin, 
    setSelectedBin, 
    mapFilter, 
    setMapFilter,
    activeWave,
    restockBin,
    reportDamage
  } = useWms();

  const [searchQuery, setSearchQuery] = useState('');
  const [tableLayoutMode, setTableLayoutMode] = useState('MATRIX'); // 'MATRIX' (Rack x Shelf Table) or 'LIST' (Data Table)

  const currentZoneObj = ZONES.find(z => z.id === selectedZone) || ZONES[0];

  // Get all bins for the selected zone
  const zoneBins = Object.values(bins).filter(b => b.zone === selectedZone);

  // Active pick wave bin IDs
  const activePickBinIds = new Set(
    (activeWave?.route?.instructions || [])
      .filter(ins => ins.type === 'PICK')
      .map(ins => ins.binId)
  );

  // Apply filters & search
  const filteredBins = zoneBins.filter(bin => {
    const skuInfo = SKU_MAP.get(bin.sku);
    const minSafety = skuInfo ? skuInfo.safetyStock : 15;
    const isLow = bin.quantity <= minSafety;
    const isDamaged = bin.damaged > 0 || bin.quantity === 0;
    const isActivePick = activePickBinIds.has(bin.id);

    if (mapFilter === 'LOW' && !isLow) return false;
    if (mapFilter === 'DAMAGED' && !isDamaged) return false;
    if (mapFilter === 'ACTIVE_PICK' && !isActivePick) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return bin.id.toLowerCase().includes(q) || 
             bin.sku.toLowerCase().includes(q) || 
             bin.skuName.toLowerCase().includes(q);
    }

    return true;
  });

  // Calculate zone capacity stats
  const totalZoneCapacity = zoneBins.reduce((sum, b) => sum + b.capacity, 0);
  const currentZoneQty = zoneBins.reduce((sum, b) => sum + b.quantity, 0);
  const utilizationPct = totalZoneCapacity > 0 ? Math.round((currentZoneQty / totalZoneCapacity) * 100) : 0;
  const lowCount = zoneBins.filter(b => b.quantity <= (SKU_MAP.get(b.sku)?.safetyStock || 15)).length;
  const damagedCount = zoneBins.filter(b => b.damaged > 0).length;

  const aisles = ['01', '02', '03', '04'];
  const racks = ['A', 'B', 'C', 'D'];
  const shelves = [1, 2, 3, 4];

  return (
    <div className="panel warehouse-map-panel">
      {/* Zone Separation Navigation Tabs */}
      <div className="zone-tabs-bar">
        {ZONES.map(z => {
          const zBins = Object.values(bins).filter(b => b.zone === z.id);
          const zQty = zBins.reduce((acc, b) => acc + b.quantity, 0);
          const isCurrent = selectedZone === z.id;

          return (
            <button
              key={z.id}
              className={`zone-tab-pill ${isCurrent ? 'active' : ''}`}
              onClick={() => setSelectedZone(z.id)}
            >
              <span className="zone-pill-indicator"></span>
              <div className="zone-tab-text">
                <strong>{z.name.split(':')[0]}</strong>
                <small>{z.category.split('&')[0]} ({zQty} units)</small>
              </div>
            </button>
          );
        })}
      </div>

      {/* Map & Table Header Controls */}
      <div className="panel-head">
        <div>
          <h2>
            {currentZoneObj.name}
            <span>{currentZoneObj.category} &bull; {currentZoneQty} Items Stored</span>
          </h2>
        </div>

        <div className="map-controls">
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search Bin or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter"
              style={{ paddingLeft: '24px', width: '150px' }}
            />
            <Search size={11} style={{ position: 'absolute', left: '8px', top: '10px', color: '#7a869e' }} />
          </div>

          {/* View Mode Toggle: Matrix Table vs Data Table */}
          <div className="filter-group">
            <button
              className={`filter-btn ${tableLayoutMode === 'MATRIX' ? 'active' : ''}`}
              onClick={() => setTableLayoutMode('MATRIX')}
              title="Aisle Rack x Shelf Matrix Table View"
            >
              <GridIcon size={11} style={{ marginRight: '4px' }} />
              Matrix Table
            </button>
            <button
              className={`filter-btn ${tableLayoutMode === 'LIST' ? 'active' : ''}`}
              onClick={() => setTableLayoutMode('LIST')}
              title="Zone Inventory Data List View"
            >
              <TableIcon size={11} style={{ marginRight: '4px' }} />
              Item Table
            </button>
          </div>

          {/* Filter Toggles */}
          <div className="filter-group">
            <button
              className={`filter-btn ${mapFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setMapFilter('ALL')}
            >
              All ({zoneBins.length})
            </button>
            <button
              className={`filter-btn ${mapFilter === 'LOW' ? 'active' : ''}`}
              onClick={() => setMapFilter('LOW')}
            >
              Low ({lowCount})
            </button>
            <button
              className={`filter-btn ${mapFilter === 'DAMAGED' ? 'active' : ''}`}
              onClick={() => setMapFilter('DAMAGED')}
            >
              Damaged ({damagedCount})
            </button>
            <button
              className={`filter-btn ${mapFilter === 'ACTIVE_PICK' ? 'active' : ''}`}
              onClick={() => setMapFilter('ACTIVE_PICK')}
            >
              Pick Target
            </button>
          </div>

          {/* Legend */}
          <div className="legend">
            <span><i className="opt"></i> Healthy</span>
            <span><i className="low"></i> Low Stock</span>
            <span><i className="out"></i> Damaged</span>
            <span><i className="pick"></i> Pick Wave</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Matrix Table or Inventory Table */}
      <div className="warehouse">
        {tableLayoutMode === 'MATRIX' ? (
          /* =================================================================
             MODE 1: Aisle-by-Aisle Rack x Shelf Matrix Tables
             ================================================================= */
          <div className="aisle-tables-container">
            {aisles.map(aisleNum => {
              const aisleBins = zoneBins.filter(b => b.aisle === aisleNum);
              const aisleQty = aisleBins.reduce((sum, b) => sum + b.quantity, 0);

              return (
                <div key={aisleNum} className="aisle-matrix-card">
                  <div className="aisle-matrix-header">
                    <div>
                      <b>AISLE {aisleNum}</b>
                      <span>&bull; {aisleQty} Total Units &bull; 16 Bins</span>
                    </div>
                    <small>Zone {selectedZone.replace('ZONE_', '')}</small>
                  </div>

                  <table className="aisle-grid-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>RACK \ SHELF</th>
                        <th>LEVEL 1 (BOTTOM)</th>
                        <th>LEVEL 2 (MID-LOW)</th>
                        <th>LEVEL 3 (MID-HIGH)</th>
                        <th>LEVEL 4 (TOP SHELF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {racks.map(rack => (
                        <tr key={rack}>
                          <td className="rack-label-cell">
                            <b>RACK {rack}</b>
                          </td>
                          {shelves.map(shelf => {
                            const binId = `${selectedZone.replace('ZONE_', '')}-${aisleNum}-${rack}${shelf}`;
                            const bin = bins[binId];
                            if (!bin) return <td key={shelf}>-</td>;

                            const skuInfo = SKU_MAP.get(bin.sku);
                            const minSafety = skuInfo ? skuInfo.safetyStock : 15;
                            const isLow = bin.quantity <= minSafety && bin.damaged === 0;
                            const isDamaged = bin.damaged > 0 || bin.quantity === 0;
                            const isActivePick = activePickBinIds.has(bin.id);
                            const isSelected = selectedBin?.id === bin.id;
                            const isMatched = filteredBins.some(b => b.id === bin.id);

                            let statusClass = 'opt-cell';
                            if (isActivePick) statusClass = 'picking-cell';
                            else if (isDamaged) statusClass = 'damaged-cell';
                            else if (isLow) statusClass = 'low-cell';

                            return (
                              <td 
                                key={shelf}
                                className={`bin-table-cell ${statusClass} ${isSelected ? 'selected' : ''}`}
                                style={{ opacity: isMatched ? 1 : 0.2 }}
                                onClick={() => setSelectedBin(bin)}
                              >
                                <div className="cell-top">
                                  <b className="cell-id">{bin.id}</b>
                                  <span className="cell-stock">{bin.quantity}u</span>
                                </div>
                                <div className="cell-sku-name" title={bin.skuName}>
                                  {bin.skuName}
                                </div>
                                <div className="cell-footer">
                                  <code>{bin.sku}</code>
                                  {bin.damaged > 0 && <span className="cell-dmg-tag">+{bin.damaged} dmg</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ) : (
          /* =================================================================
             MODE 2: Zone Inventory List Data Table
             ================================================================= */
          <div className="table-panel zone-data-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>BIN LOCATION</th>
                  <th>SKU & BARCODE</th>
                  <th>PRODUCT NAME & SPEC</th>
                  <th>CATEGORY</th>
                  <th>ON HAND</th>
                  <th>RESERVED</th>
                  <th>AVAILABLE</th>
                  <th>SAFETY MIN</th>
                  <th>HEALTH STATUS</th>
                  <th>QUICK ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredBins.map(bin => {
                  const skuInfo = SKU_MAP.get(bin.sku);
                  const minSafety = skuInfo ? skuInfo.safetyStock : 15;
                  const available = Math.max(0, bin.quantity - bin.reserved - (bin.damaged || 0));
                  const isLow = bin.quantity <= minSafety && bin.damaged === 0;
                  const isDamaged = bin.damaged > 0 || bin.quantity === 0;
                  const isActivePick = activePickBinIds.has(bin.id);

                  return (
                    <tr 
                      key={bin.id}
                      onClick={() => setSelectedBin(bin)}
                      style={{ cursor: 'pointer', background: selectedBin?.id === bin.id ? '#1b233a' : 'transparent' }}
                    >
                      <td>
                        <b style={{ color: '#8fa0ff' }}>{bin.id}</b>
                        <small>Aisle {bin.aisle} &bull; Rack {bin.rack}{bin.shelf}</small>
                      </td>
                      <td>
                        <b>{bin.sku}</b>
                        <small style={{ fontFamily: 'DM Mono' }}>{skuInfo?.barcode}</small>
                      </td>
                      <td>
                        <b>{bin.skuName}</b>
                        <small>Lot: {bin.batchNumber || 'LOT-2026-9042'}</small>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', color: '#c0cbdf' }}>{bin.category}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '14px' }}>{bin.quantity}u</strong>
                      </td>
                      <td>
                        <span style={{ color: '#f0b44c' }}>{bin.reserved}u</span>
                      </td>
                      <td>
                        <span style={{ color: '#36c999', fontWeight: 'bold' }}>{available}u</span>
                      </td>
                      <td>
                        <span style={{ color: '#8e9bb3' }}>{minSafety}u</span>
                      </td>
                      <td>
                        {isActivePick ? (
                          <span className="priority" style={{ background: '#392868', color: '#c5adff' }}>
                            <Zap size={9} /> In Wave Pick
                          </span>
                        ) : isDamaged ? (
                          <span className="priority" style={{ background: '#451e24', color: '#ff9da4' }}>
                            <AlertTriangle size={9} /> Damaged
                          </span>
                        ) : isLow ? (
                          <span className="priority" style={{ background: '#422e17', color: '#ffd086' }}>
                            <ShieldAlert size={9} /> Low Stock
                          </span>
                        ) : (
                          <span className="priority" style={{ background: '#143828', color: '#74f2bb' }}>
                            <CheckCircle2 size={9} /> Optimal
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="action-btn primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBin(bin);
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Map Footer */}
      <div className="map-footer">
        <div>
          <span>ZONE UTILIZATION: <b>{utilizationPct}%</b> ({currentZoneQty} / {totalZoneCapacity} units)</span>
        </div>
        <div>
          <span>STORAGE CAPACITY: <b>{totalZoneCapacity} Units Maximum</b></span>
        </div>
      </div>
    </div>
  );
}
