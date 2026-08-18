import React, { useState } from 'react';
import { useWms } from '../../context/WmsContext';
import { ZONES } from '../../data/initialWarehouse';
import { UserProfileModal } from './UserProfileModal';
import { 
  MapPin, 
  ClipboardList, 
  Package, 
  Truck, 
  BarChart3, 
  Smartphone, 
  ChevronRight, 
  Bot,
  Building2,
  Navigation
} from 'lucide-react';

export function Sidebar() {
  const { 
    selectedWarehouseId,
    warehouseLocations,
    switchWarehouse,
    selectedZone, 
    setSelectedZone, 
    viewMode, 
    setViewMode, 
    setRole,
    orders, 
    purchaseOrders,
    userProfile,
    logoutUser,
    addToast,
    metrics
  } = useWms();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status !== 'DISPATCHED').length;
  const pendingPOCount = purchaseOrders.length;

  return (
    <aside role="complementary" aria-label="Warehouse Facilities and Navigation Panel">
      {/* Brand: Sai's Warehouse */}
      <div className="brand">
        <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }} aria-hidden="true">
          <Building2 size={20} color="#fff" />
        </div>
        <div className="brand-title">
          <span>Sai's<span> Warehouse</span></span>
          <small>AUTONOMOUS LOGISTICS &bull; AP</small>
        </div>
      </div>

      {/* Warehouse Locations Switcher (Kakinada & Vijayawada) */}
      <div className="facility-section-title" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Navigation size={11} color="#38bdf8" aria-hidden="true" />
        ACTIVE WAREHOUSE HUB
      </div>
      <div className="facility-switch-grid" role="group" aria-label="Warehouse Location Switcher" style={{ display: 'grid', gap: '6px', marginBottom: '14px' }}>
        {warehouseLocations.map(loc => {
          const isActive = selectedWarehouseId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => switchWarehouse(loc.id)}
              aria-pressed={isActive}
              aria-label={`Switch active facility to ${loc.name}, ${loc.city}`}
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
      <div className="facility-list" role="tablist" aria-label="Warehouse Storage Zones">
        {ZONES.map(zone => (
          <button
            key={zone.id}
            role="tab"
            aria-selected={selectedZone === zone.id}
            aria-label={`Zone ${zone.name.split(':')[0]}: ${zone.category}`}
            className={`facility ${selectedZone === zone.id ? 'active-zone' : ''}`}
            onClick={() => {
              setSelectedZone(zone.id);
              setViewMode('MAP');
              setRole('MANAGER');
            }}
          >
            <span className="pulse" aria-hidden="true"></span>
            {zone.name.split(':')[0]}
            <small>{zone.category}</small>
          </button>
        ))}
      </div>

      {/* Navigation Links */}
      <nav role="navigation" aria-label="Main Views Navigation">
        <button
          className={viewMode === 'MAP' ? 'active' : ''}
          aria-current={viewMode === 'MAP' ? 'page' : undefined}
          aria-label="View Interactive 2D Warehouse Map"
          onClick={() => {
            setViewMode('MAP');
            setRole('MANAGER');
          }}
        >
          <MapPin size={15} aria-hidden="true" />
          <span>Interactive 2D Map</span>
        </button>

        {/* AGV / AMR Robotics Simulation */}
        <button
          className={viewMode === 'AGV_SIMULATION' ? 'active' : ''}
          aria-current={viewMode === 'AGV_SIMULATION' ? 'page' : undefined}
          aria-label="View Autonomous Mobile Robots (AGV) 3D Fleet Simulation"
          style={viewMode === 'AGV_SIMULATION' ? { background: '#1e2640', color: '#60a5fa' } : {}}
          onClick={() => {
            setViewMode('AGV_SIMULATION');
            setRole('MANAGER');
          }}
        >
          <Bot size={15} color="#38bdf8" aria-hidden="true" />
          <span>AGV / AMR Fleet Sim</span>
          <b style={{ background: '#2563eb', color: '#fff' }}>ROBOTS</b>
        </button>

        <button
          className={viewMode === 'ORDERS' ? 'active' : ''}
          aria-current={viewMode === 'ORDERS' ? 'page' : undefined}
          aria-label={`View Orders and Wave Dispatch. ${activeOrdersCount} active orders`}
          onClick={() => {
            setViewMode('ORDERS');
            setRole('MANAGER');
          }}
        >
          <ClipboardList size={15} aria-hidden="true" />
          <span>Orders & Waves</span>
          <b>{activeOrdersCount}</b>
        </button>

        <button
          className={viewMode === 'INVENTORY' ? 'active' : ''}
          aria-current={viewMode === 'INVENTORY' ? 'page' : undefined}
          aria-label="View Quick-Store SKU Inventory Catalog"
          onClick={() => {
            setViewMode('INVENTORY');
            setRole('MANAGER');
          }}
        >
          <Package size={15} aria-hidden="true" />
          <span>Quick-Store Catalog</span>
        </button>

        <button
          className={viewMode === 'REORDERS' ? 'active' : ''}
          aria-current={viewMode === 'REORDERS' ? 'page' : undefined}
          aria-label={`View Inbound Supply Purchase Orders. ${pendingPOCount} pending purchase orders`}
          onClick={() => {
            setViewMode('REORDERS');
            setRole('MANAGER');
          }}
        >
          <Truck size={15} aria-hidden="true" />
          <span>Inbound Supply POs</span>
          {pendingPOCount > 0 && <b style={{ background: '#f0b44c', color: '#111' }}>{pendingPOCount}</b>}
        </button>

        <button
          className={viewMode === 'ANALYTICS' ? 'active' : ''}
          aria-current={viewMode === 'ANALYTICS' ? 'page' : undefined}
          aria-label="View Real-Time Warehouse Analytics and Charts"
          onClick={() => {
            setViewMode('ANALYTICS');
            setRole('MANAGER');
          }}
        >
          <BarChart3 size={15} aria-hidden="true" />
          <span>Real-Time Analytics</span>
        </button>

        <button
          className={viewMode === 'PICKER' ? 'active' : ''}
          aria-current={viewMode === 'PICKER' ? 'page' : undefined}
          aria-label="Switch to Floor Picker Terminal View"
          onClick={() => {
            setViewMode('PICKER');
            setRole('PICKER');
          }}
        >
          <Smartphone size={15} aria-hidden="true" />
          <span>Floor Picker Terminal</span>
          <b style={{ background: '#32d49b', color: '#111' }}>LIVE</b>
        </button>
      </nav>

      {/* Sidebar Footer Metrics */}
      <div className="sidebar-bottom">
        <div className="health" role="status" aria-label="System Health Status">
          <div>
            <span>SYSTEM HEALTH</span>
            <span>AUTO-DECISION</span>
          </div>
          <strong>{metrics.fulfillmentSla}</strong>
          <small>Fulfillment SLA &bull; 0 Stockout Bottlenecks</small>
        </div>

        <button 
          type="button"
          className="operator profile-container"
          onClick={() => setIsProfileModalOpen(true)}
          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease' }}
          aria-label="Open user profile settings and system credentials"
        >
          <div className="worker-avatar profile-avatar" aria-hidden="true">
            {userProfile?.avatar || 'MS'}
          </div>
          <div className="profile-info">
            <span className="profile-name">{userProfile?.name || 'Mohith Sai'}</span>
            <span className="profile-meta">{userProfile?.role || 'Webdesigner & Owner'}</span>
          </div>
          <ChevronRight size={14} className="profile-chevron" aria-hidden="true" />
        </button>
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
