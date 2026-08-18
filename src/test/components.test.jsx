import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WmsProvider } from '../context/WmsContext';
import { LoginScreen } from '../components/auth/LoginScreen';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { OrdersTable } from '../components/manager/OrdersTable';
import { MetricsGrid } from '../components/manager/MetricsGrid';
import { InventoryCatalog } from '../components/manager/InventoryCatalog';
import { PickerConsole } from '../components/picker/PickerConsole';

describe('UI Component Unit & Interaction Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('<LoginScreen />', () => {
    it('should render initial sign-in button and open login form upon clicking', () => {
      render(
        <WmsProvider>
          <LoginScreen />
        </WmsProvider>
      );

      const signinBtn = screen.getByRole('button', { name: /open authentication terminal/i });
      expect(signinBtn).toBeInTheDocument();

      fireEvent.click(signinBtn);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    });

    it('should validate inputs and transition to OTP verification stage', () => {
      vi.useFakeTimers();

      render(
        <WmsProvider>
          <LoginScreen />
        </WmsProvider>
      );

      // Open form
      const signinBtn = screen.getByRole('button', { name: /open authentication terminal/i });
      fireEvent.click(signinBtn);

      // Submit preloaded credentials
      const submitBtn = screen.getByRole('button', { name: /sign in to warehouse terminal/i });
      fireEvent.click(submitBtn);

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText(/VERIFY YOUR IDENTITY/i)).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('<Header />', () => {
    it('should render facility switcher and simulation action controls', () => {
      render(
        <WmsProvider>
          <Header />
        </WmsProvider>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /run rush hour simulation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /run autonomous decision engine/i })).toBeInTheDocument();
    });
  });

  describe('<Sidebar />', () => {
    it('should render facility zone tabs and navigation options', () => {
      render(
        <WmsProvider>
          <Sidebar />
        </WmsProvider>
      );

      expect(screen.getByRole('navigation', { name: /main views navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view interactive 2d warehouse map/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view autonomous mobile robots/i })).toBeInTheDocument();
    });
  });

  describe('<OrdersTable />', () => {
    it('should render orders table with headers and filter controls', () => {
      render(
        <WmsProvider>
          <OrdersTable />
        </WmsProvider>
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search order/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by order lifecycle status/i)).toBeInTheDocument();
    });

    it('should filter orders when searching by customer name', () => {
      render(
        <WmsProvider>
          <OrdersTable />
        </WmsProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search order/i);
      fireEvent.change(searchInput, { target: { value: 'Supermarket' } });

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe('<MetricsGrid />', () => {
    it('should display fulfillment SLA and warehouse KPIs', () => {
      render(
        <WmsProvider>
          <MetricsGrid />
        </WmsProvider>
      );

      expect(screen.getByText(/sla compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/active pick waves/i)).toBeInTheDocument();
    });
  });

  describe('<InventoryCatalog />', () => {
    it('should render catalog categories and items', () => {
      render(
        <WmsProvider>
          <InventoryCatalog />
        </WmsProvider>
      );

      expect(screen.getByText(/quick-commerce product catalog directory/i)).toBeInTheDocument();
    });
  });

  describe('<PickerConsole />', () => {
    it('should display pick wave navigation console with active route', () => {
      render(
        <WmsProvider>
          <PickerConsole />
        </WmsProvider>
      );

      expect(screen.getByRole('region', { name: /pick wave navigation guide/i })).toBeInTheDocument();
      expect(screen.getByText(/TSP ROUTE/i)).toBeInTheDocument();
      expect(screen.getByText(/scan bin \/ sku barcode/i)).toBeInTheDocument();
    });
  });
});
