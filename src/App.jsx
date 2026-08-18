import React from 'react';
import { WmsProvider, useWms } from './context/WmsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ScenarioBar } from './components/layout/ScenarioBar';
import { MetricsGrid } from './components/manager/MetricsGrid';
import { WarehouseMap } from './components/manager/WarehouseMap';
import { BinDetailModal } from './components/manager/BinDetailModal';
import { ExceptionStream } from './components/manager/ExceptionStream';
import { OrdersTable } from './components/manager/OrdersTable';
import { InventoryCatalog } from './components/manager/InventoryCatalog';
import { PurchaseOrdersPanel } from './components/manager/PurchaseOrdersPanel';
import { AnalyticsView } from './components/manager/AnalyticsView';
import { PickerConsole } from './components/picker/PickerConsole';
import { AgvSimulationView } from './components/agv/AgvSimulationView';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginScreen } from './components/auth/LoginScreen';

function MainLayout() {
  const { isAuthenticated, viewMode, role, selectedBin } = useWms();

  // If not authenticated, display the futuristic Smart Warehouse AI Login experience
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app animate-app-fade-in">
      <Sidebar />

      <main>
        <Header />
        <ScenarioBar />

        {/* Show KPI Metrics Grid on Manager Views (except AGV view which has its own live bar) */}
        {role === 'MANAGER' && viewMode !== 'PICKER' && viewMode !== 'AGV_SIMULATION' && (
          <MetricsGrid />
        )}

        {/* Dynamic View Mode Router */}
        <div className="content-grid">
          {viewMode === 'MAP' && (
            <>
              <div className={`map-layout ${selectedBin ? 'with-sidebar' : 'full-width'}`}>
                <WarehouseMap />
                {selectedBin && <BinDetailModal />}
              </div>
              <ExceptionStream />
            </>
          )}

          {viewMode === 'AGV_SIMULATION' && (
            <AgvSimulationView />
          )}

          {viewMode === 'ORDERS' && (
            <>
              <OrdersTable />
              <ExceptionStream />
            </>
          )}

          {viewMode === 'INVENTORY' && (
            <InventoryCatalog />
          )}

          {viewMode === 'REORDERS' && (
            <PurchaseOrdersPanel />
          )}

          {viewMode === 'ANALYTICS' && (
            <AnalyticsView />
          )}

          {viewMode === 'PICKER' && (
            <PickerConsole />
          )}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <WmsProvider>
      <MainLayout />
    </WmsProvider>
  );
}
