import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WmsProvider, useWms } from '../context/WmsContext';

function TestConsumerComponent({ onState }) {
  const wms = useWms();
  React.useEffect(() => {
    if (onState) onState(wms);
  }, [wms, onState]);

  return (
    <div>
      <span data-testid="auth-status">{wms.isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'}</span>
      <span data-testid="active-hub">{wms.selectedWarehouseId}</span>
      <span data-testid="orders-count">{wms.orders.length}</span>
      <span data-testid="view-mode">{wms.viewMode}</span>
      <span data-testid="user-role">{wms.role}</span>
      <button onClick={() => wms.switchWarehouse('VIJAYAWADA')}>Switch to VJA</button>
      <button onClick={() => wms.loginUser({ username: 'MohithSai', name: 'Mohith Sai', role: 'MANAGER' })}>Login</button>
      <button onClick={() => wms.logoutUser()}>Logout</button>
      <button onClick={() => wms.allocateAllPendingOrders()}>Allocate All</button>
      <button onClick={() => wms.runRushHourSimulation()}>Rush Hour</button>
      <button onClick={() => wms.addToast({ title: 'Test', message: 'Hello Toast', type: 'success' })}>Add Toast</button>
    </div>
  );
}

describe('WmsContext & State Management Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with KAKINADA as default warehouse location', () => {
    render(
      <WmsProvider>
        <TestConsumerComponent />
      </WmsProvider>
    );

    expect(screen.getByTestId('active-hub').textContent).toBe('KAKINADA');
    expect(Number(screen.getByTestId('orders-count').textContent)).toBeGreaterThan(0);
  });

  it('should switch warehouse facility between Kakinada and Vijayawada hubs', () => {
    render(
      <WmsProvider>
        <TestConsumerComponent />
      </WmsProvider>
    );

    expect(screen.getByTestId('active-hub').textContent).toBe('KAKINADA');
    
    act(() => {
      screen.getByText('Switch to VJA').click();
    });

    expect(screen.getByTestId('active-hub').textContent).toBe('VIJAYAWADA');
  });

  it('should handle login and logout user flow', () => {
    render(
      <WmsProvider>
        <TestConsumerComponent />
      </WmsProvider>
    );

    // Initial state: logged out or default
    act(() => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_IN');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_OUT');
  });

  it('should allocate pending orders when running decision engine', () => {
    let capturedState;
    render(
      <WmsProvider>
        <TestConsumerComponent onState={(st) => { capturedState = st; }} />
      </WmsProvider>
    );

    act(() => {
      screen.getByText('Allocate All').click();
    });

    const allocatedOrders = capturedState.orders.filter(o => o.status === 'ALLOCATED' || o.status === 'PICKING');
    expect(allocatedOrders.length).toBeGreaterThan(0);
  });

  it('should inject batch orders during Rush Hour simulation', () => {
    let capturedState;
    render(
      <WmsProvider>
        <TestConsumerComponent onState={(st) => { capturedState = st; }} />
      </WmsProvider>
    );

    const initialCount = capturedState.orders.length;

    act(() => {
      screen.getByText('Rush Hour').click();
    });

    expect(capturedState.orders.length).toBeGreaterThan(initialCount);
  });

  it('should manage toast notifications seamlessly', () => {
    let capturedState;
    render(
      <WmsProvider>
        <TestConsumerComponent onState={(st) => { capturedState = st; }} />
      </WmsProvider>
    );

    act(() => {
      screen.getByText('Add Toast').click();
    });

    expect(capturedState.toasts.length).toBeGreaterThan(0);
    expect(capturedState.toasts[0].title).toBe('Test');
  });
});
