import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { ZONES } from '../../data/initialWarehouse';
import { UserProfileModal } from './UserProfileModal';
import { 
  Box, 
  MapPin, 
  ClipboardList, 
  Package, 
  Truck, 
  BarChart3, 
  Smartphone, 
  ChevronRight, 
  Sparkles,
  Layers,
  Bot,
  Building2,
  Navigation
} from 'lucide-react';

export function Sidebar() {
  const { 
    selectedWarehouseId,
    activeLocation,
    warehouseLocations,
    switchWarehouse,
    selectedZone, 
    setSelectedZone, 
    viewMode, 
    setViewMode, 
    setRole,
    orders, 
    purchaseOrders,
    exceptions,
    activePicker,
    userProfile,
    logoutUser,
    addToast,
    metrics
  } = useWms();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status !== 'DISPATCHED').length;
  const pendingPOCount = purchaseOrders.length;
  const exceptionsCount = exceptions.length;

  return (
    <aside>
      {/* Brand: Sai's Warehouse */}
      <div className="brand">
        <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
          <Building2 size={20} color="#fff" />
        </div>
        <div className="brand-title">
          <span>Sai's<span> Warehouse</span></span>
          <small>AUTONOMOUS LOGISTICS &bull; AP</small>
        </div>
      </div>

      {/* Warehouse Locations Switcher (Kakinada & Vijayawada) */}
      <div className="facility-section-title" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Navigation size={11} color="#38bdf8" />
        ACTIVE WAREHOUSE HUB
      </div>
      <div style={{ display: 'grid', gap: '6px', marginBottom: '14px' }}>
        {warehouseLocations.map(loc => {
          const isActive = selectedWarehouseId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => switchWarehouse(loc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                border: isActive ? '1.5px solid #38bdf8' : '1px solid #28334e',
                background: isActive ? '#172554' : '#111827',
                color: isActive ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: isActive ? '#38bdf8' : '#e2e8f0' }}>
                  {loc.city} Hub
                </div>
                <div style={{ fontSize: '9px', color: isActive ? '#93c5fd' : '#64748b' }}>
                  {loc.district}
                </div>
              </div>
              <span 
                style={{
                  fontSize: '8.5px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: isActive ? '#2563eb' : '#1e293b',
                  color: isActive ? '#fff' : '#64748b',
                  fontWeight: 'bold'
                }}
              >
                {isActive ? 'ACTIVE' : 'SWITCH'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Facility Zone Selectors */}
      <div className="facility-section-title">PHYSICAL FACILITY ZONES</div>
      <div className="facility-list">
        {ZONES.map(zone => (
          <button
            key={zone.id}
            className={`facility ${selectedZone === zone.id ? 'active-zone' : ''}`}
            onClick={() => {
              setSelectedZone(zone.id);
              setViewMode('MAP');
              setRole('MANAGER');
            }}
          >
            <span className="pulse"></span>
            {zone.name.split(':')[0]}
            <small>{zone.category}</small>
          </button>
        ))}
      </div>

      {/* Navigation Links */}
      <nav>
        <button
          className={viewMode === 'MAP' ? 'active' : ''}
          onClick={() => {
            setViewMode('MAP');
            setRole('MANAGER');
          }}
        >
          <MapPin size={15} />
          <span>Interactive 2D Map</span>
        </button>

        {/* NEW: AGV / AMR Robotics Simulation */}
        <button
          className={viewMode === 'AGV_SIMULATION' ? 'active' : ''}
          style={viewMode === 'AGV_SIMULATION' ? { background: '#1e2640', color: '#60a5fa' } : {}}
          onClick={() => {
            setViewMode('AGV_SIMULATION');
            setRole('MANAGER');
          }}
        >
          <Bot size={15} color="#38bdf8" />
          <span>AGV / AMR Fleet Sim</span>
          <b style={{ background: '#2563eb', color: '#fff' }}>ROBOTS</b>
        </button>

        <button
          className={viewMode === 'ORDERS' ? 'active' : ''}
          onClick={() => {
            setViewMode('ORDERS');
            setRole('MANAGER');
          }}
        >
          <ClipboardList size={15} />
          <span>Orders & Waves</span>
          <b>{activeOrdersCount}</b>
        </button>

        <button
          className={viewMode === 'INVENTORY' ? 'active' : ''}
          onClick={() => {
            setViewMode('INVENTORY');
            setRole('MANAGER');
          }}
        >
          <Package size={15} />
          <span>Quick-Store Catalog</span>
        </button>

        <button
          className={viewMode === 'REORDERS' ? 'active' : ''}
          onClick={() => {
            setViewMode('REORDERS');
            setRole('MANAGER');
          }}
        >
          <Truck size={15} />
          <span>Inbound Supply POs</span>
          {pendingPOCount > 0 && <b style={{ background: '#f0b44c', color: '#111' }}>{pendingPOCount}</b>}
        </button>

        <button
          className={viewMode === 'ANALYTICS' ? 'active' : ''}
          onClick={() => {
            setViewMode('ANALYTICS');
            setRole('MANAGER');
          }}
        >
          <BarChart3 size={15} />
          <span>Real-Time Analytics</span>
        </button>

        <button
          className={viewMode === 'PICKER' ? 'active' : ''}
          onClick={() => {
            setViewMode('PICKER');
            setRole('PICKER');
          }}
        >
          <Smartphone size={15} />
          <span>Floor Picker Terminal</span>
          <b style={{ background: '#32d49b', color: '#111' }}>LIVE</b>
        </button>
      </nav>

      {/* Sidebar Footer Metrics */}
      <div className="sidebar-bottom">
        <div className="health">
          <div>
            <span>SYSTEM HEALTH</span>
            <span>AUTO-DECISION</span>
          </div>
          <strong>{metrics.fulfillmentSla}</strong>
          <small>Fulfillment SLA &bull; 0 Stockout Bottlenecks</small>
        </div>

        <div 
          className="operator profile-container"
          onClick={() => setIsProfileModalOpen(true)}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view full user profile &amp; contact details"
        >
          <div className="worker-avatar profile-avatar">
            {userProfile?.avatar || 'MS'}
          </div>
          <div className="profile-info">
            <span className="profile-name">{userProfile?.name || 'Mohith Sai'}</span>
            <span className="profile-meta">{userProfile?.role || 'Webdesigner & Owner'}</span>
          </div>
          <ChevronRight size={14} className="profile-chevron" />
        </div>
      </div>

      {/* Interactive User Profile Details Popup Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        logoutUser={logoutUser}
        addToast={addToast}
      />
    </aside>
  );
}
