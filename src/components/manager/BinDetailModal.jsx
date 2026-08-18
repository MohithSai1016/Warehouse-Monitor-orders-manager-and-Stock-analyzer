import React, { useState, useEffect } from 'react';
import { useWms } from '../../context/WmsContext';
import { SKU_MAP } from '../../data/catalog';
import { 
  Box, 
  X, 
  PlusCircle, 
  AlertTriangle, 
  ArrowRightLeft, 
  ShieldAlert, 
  Barcode, 
  Layers,
  MapPin,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Package
} from 'lucide-react';

export function BinDetailModal() {
  const { 
    selectedBin, 
    setSelectedBin, 
    bins, 
    restockBin, 
    reportDamage, 
    transferBinStock 
  } = useWms();

  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferQty, setTransferQty] = useState(5);
  const [isTransferring, setIsTransferring] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedBin(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedBin]);

  // If no bin is selected, return null so it completely disappears!
  if (!selectedBin) {
    return null;
  }

  // Live bin data
  const liveBin = bins[selectedBin.id] || selectedBin;
  const skuInfo = SKU_MAP.get(liveBin.sku);
  const availableStock = Math.max(0, liveBin.quantity - liveBin.reserved - (liveBin.damaged || 0));
  const capacityPct = Math.round((liveBin.quantity / liveBin.capacity) * 100);
  const isSafetyRisk = skuInfo && liveBin.quantity <= skuInfo.safetyStock;

  const handleTransfer = () => {
    if (!transferTargetId.trim()) return;
    transferBinStock(liveBin.id, transferTargetId.trim(), transferQty);
    setIsTransferring(false);
    setTransferTargetId('');
  };

  let iconClass = '';
  if (liveBin.category?.includes('Apparel')) iconClass = 'apparel';
  else if (liveBin.category?.includes('Fragile')) iconClass = 'fragile';
  else if (liveBin.category?.includes('Cold')) iconClass = 'cold';
  else if (liveBin.category?.includes('Hardware')) iconClass = 'hardware';

  return (
    <div className="panel detail-panel modal-popup-panel">
      {/* Header */}
      <div className="detail-top">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className={`product-icon ${iconClass}`}>
            <Box size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px' }}>{liveBin.id}</h2>
            <code>{liveBin.sku}</code>
          </div>
        </div>
        <button 
          onClick={() => setSelectedBin(null)} 
          title="Close (Esc)" 
          className="close-btn"
        >
          <X size={15} />
        </button>
      </div>

      {/* SKU Name & Category */}
      <div className="detail-title-section">
        <b className="sku-main-name">{liveBin.skuName}</b>
        <span className="sku-meta-tag">{liveBin.category} &bull; {liveBin.zoneName?.split(':')[0]}</span>
      </div>

      {/* Stock Quantity Display */}
      <div className="qty-card">
        <div className="qty-number-block">
          <strong>{liveBin.quantity}</strong>
          <small>UNITS IN BIN</small>
        </div>
        <div className="qty-breakdown">
          <div><b style={{ color: '#42c697' }}>{availableStock}</b> available</div>
          <div><b style={{ color: '#f0b44c' }}>{liveBin.reserved}</b> reserved</div>
          {liveBin.damaged > 0 && <div><b style={{ color: '#e15b62' }}>{liveBin.damaged}</b> damaged</div>}
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="progress-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#8b96ab', marginBottom: '4px' }}>
          <span>Capacity Usage</span>
          <span>{liveBin.quantity} / {liveBin.capacity} ({capacityPct}%)</span>
        </div>
        <div className="progress">
          <i style={{ 
            width: `${Math.min(100, capacityPct)}%`,
            background: isSafetyRisk ? '#e9af47' : liveBin.damaged > 0 ? '#e15b62' : '#7e8cff'
          }}></i>
        </div>
      </div>

      {/* Metadata Table */}
      <dl className="detail-dl">
        <div>
          <dt>Aisle / Rack / Shelf</dt>
          <dd>Aisle {liveBin.aisle} &bull; Rack {liveBin.rack} &bull; Level {liveBin.shelf}</dd>
        </div>
        <div>
          <dt>Batch Lot Number</dt>
          <dd>{liveBin.batchNumber || 'LOT-2026-9042'}</dd>
        </div>
        <div>
          <dt>Barcode / EAN</dt>
          <dd style={{ fontFamily: 'DM Mono', fontSize: '10px' }}>{skuInfo?.barcode || '89012400101'}</dd>
        </div>
        <div>
          <dt>Unit Cost / Valuation</dt>
          <dd>${skuInfo?.unitCost.toFixed(2) || '0.00'} (${((skuInfo?.unitCost || 0) * liveBin.quantity).toFixed(2)})</dd>
        </div>
        <div>
          <dt>Safety Stock Buffer</dt>
          <dd style={{ color: isSafetyRisk ? '#f0b44c' : '#a2b0cb' }}>
            Min: {skuInfo?.safetyStock || 15}u &bull; Reorder: {skuInfo?.reorderPoint || 30}u
          </dd>
        </div>
      </dl>

      {/* Transfer Stock Form */}
      {isTransferring && (
        <div className="transfer-box">
          <small>TRANSFER TO DESTINATION BIN:</small>
          <div style={{ display: 'flex', gap: '6px', margin: '6px 0' }}>
            <input
              type="text"
              placeholder="e.g. A-02-B1"
              value={transferTargetId}
              onChange={(e) => setTransferTargetId(e.target.value.toUpperCase())}
              className="filter"
              style={{ flex: 1 }}
            />
            <input
              type="number"
              min="1"
              max={availableStock}
              value={transferQty}
              onChange={(e) => setTransferQty(+e.target.value)}
              className="filter"
              style={{ width: '55px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="outline-btn success" onClick={handleTransfer}>Confirm</button>
            <button className="outline-btn" onClick={() => setIsTransferring(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="btn-group">
        <button 
          className="outline-btn success"
          onClick={() => restockBin(liveBin.id, 25)}
        >
          <PlusCircle size={13} />
          Replenish (+25 Units)
        </button>

        <button 
          className="outline-btn danger"
          onClick={() => reportDamage(liveBin.id, 4)}
        >
          <AlertTriangle size={13} />
          Report Damaged Units (-4)
        </button>

        {!isTransferring && (
          <button 
            className="outline-btn"
            onClick={() => setIsTransferring(true)}
          >
            <ArrowRightLeft size={13} />
            Transfer to Another Bin
          </button>
        )}
      </div>
    </div>
  );
}
