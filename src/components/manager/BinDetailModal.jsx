import React, { useState, useEffect } from 'react';
import { useWms } from '../../context/WmsContext';
import { SKU_MAP } from '../../data/catalog';
import { 
  Box, 
  X, 
  PlusCircle, 
  AlertTriangle, 
  ArrowRightLeft
} from 'lucide-react';
import { sanitizeInput, validateInput } from '../../utils/security';

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
  const [transferError, setTransferError] = useState('');

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

  // If no bin is selected, return null
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
    setTransferError('');
    const cleanTarget = sanitizeInput(transferTargetId).toUpperCase().trim();
    
    if (!cleanTarget) {
      setTransferError('Please enter a destination bin ID');
      return;
    }

    const binValidation = validateInput(cleanTarget, 'binId');
    if (!binValidation.valid) {
      setTransferError(binValidation.error || 'Invalid Bin ID format');
      return;
    }

    if (transferQty <= 0 || transferQty > availableStock) {
      setTransferError(`Quantity must be between 1 and ${availableStock}`);
      return;
    }

    transferBinStock(liveBin.id, cleanTarget, transferQty);
    setIsTransferring(false);
    setTransferTargetId('');
  };

  let iconClass = '';
  if (liveBin.category?.includes('Apparel')) iconClass = 'apparel';
  else if (liveBin.category?.includes('Fragile')) iconClass = 'fragile';
  else if (liveBin.category?.includes('Cold')) iconClass = 'cold';
  else if (liveBin.category?.includes('Hardware')) iconClass = 'hardware';

  return (
    <div 
      className="panel detail-panel modal-popup-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bin-detail-title"
      aria-describedby="bin-detail-desc"
    >
      {/* Header */}
      <div className="detail-top">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className={`product-icon ${iconClass}`} aria-hidden="true">
            <Box size={20} />
          </div>
          <div>
            <h2 id="bin-detail-title" style={{ fontSize: '15px' }}>Bin {liveBin.id}</h2>
            <code>{liveBin.sku}</code>
          </div>
        </div>
        <button 
          onClick={() => setSelectedBin(null)} 
          title="Close details (Esc)" 
          aria-label="Close bin details"
          className="close-btn"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      {/* SKU Name & Category */}
      <div className="detail-title-section" id="bin-detail-desc">
        <b className="sku-main-name">{liveBin.skuName}</b>
        <span className="sku-meta-tag">{liveBin.category} &bull; {liveBin.zoneName?.split(':')[0]}</span>
      </div>

      {/* Stock Quantity Display */}
      <div className="qty-card" role="region" aria-label="Bin Stock Summary">
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
        <div 
          className="progress"
          role="progressbar"
          aria-valuenow={capacityPct}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Bin Capacity Usage ${capacityPct}%`}
        >
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
          <dd style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px' }}>{skuInfo?.barcode || '89012400101'}</dd>
        </div>
        <div>
          <dt>Unit Cost / Valuation</dt>
          <dd>${skuInfo?.unitCost?.toFixed(2) || '0.00'} (${((skuInfo?.unitCost || 0) * liveBin.quantity).toFixed(2)})</dd>
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
        <div className="transfer-box" role="form" aria-label="Transfer Stock to Another Bin">
          <small id="transfer-label">TRANSFER TO DESTINATION BIN:</small>
          {transferError && (
            <div style={{ color: '#f87171', fontSize: '11px', margin: '4px 0' }} role="alert">
              {transferError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', margin: '6px 0' }}>
            <label htmlFor="transfer-target-input" className="sr-only">Destination Bin ID</label>
            <input
              id="transfer-target-input"
              type="text"
              placeholder="e.g. A-02-B1"
              value={transferTargetId}
              onChange={(e) => setTransferTargetId(e.target.value.toUpperCase())}
              className="filter"
              style={{ flex: 1 }}
              aria-label="Destination Bin Identifier"
            />
            <label htmlFor="transfer-qty-input" className="sr-only">Transfer Quantity</label>
            <input
              id="transfer-qty-input"
              type="number"
              min="1"
              max={availableStock}
              value={transferQty}
              onChange={(e) => setTransferQty(+e.target.value)}
              className="filter"
              style={{ width: '55px' }}
              aria-label="Units to transfer"
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="outline-btn success" onClick={handleTransfer} aria-label="Confirm stock transfer">Confirm</button>
            <button className="outline-btn" onClick={() => setIsTransferring(false)} aria-label="Cancel stock transfer">Cancel</button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="btn-group" role="group" aria-label="Bin Stock Actions">
        <button 
          className="outline-btn success"
          onClick={() => restockBin(liveBin.id, 25)}
          aria-label={`Replenish 25 units into bin ${liveBin.id}`}
        >
          <PlusCircle size={13} aria-hidden="true" />
          Replenish (+25 Units)
        </button>

        <button 
          className="outline-btn danger"
          onClick={() => reportDamage(liveBin.id, 4)}
          aria-label={`Report 4 damaged units in bin ${liveBin.id} and move to quarantine`}
        >
          <AlertTriangle size={13} aria-hidden="true" />
          Report Damaged Units (-4)
        </button>

        {!isTransferring && (
          <button 
            className="outline-btn"
            onClick={() => setIsTransferring(true)}
            aria-label={`Open transfer dialog for bin ${liveBin.id}`}
          >
            <ArrowRightLeft size={13} aria-hidden="true" />
            Transfer to Another Bin
          </button>
        )}
      </div>
    </div>
  );
}
