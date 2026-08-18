import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WmsProvider } from '../context/WmsContext';
import App from '../App';
import { UserProfileModal } from '../components/layout/UserProfileModal';
import { BinDetailModal } from '../components/manager/BinDetailModal';

describe('Accessibility (a11y) Full Compliance Suite', () => {
  it('should render skip to content link at the top of the app', () => {
    render(
      <WmsProvider>
        <App />
      </WmsProvider>
    );

    const skipLinks = document.querySelectorAll('.skip-to-content');
    expect(skipLinks.length).toBeGreaterThan(0);
    expect(skipLinks[0].getAttribute('href')).toMatch(/^#/);
  });

  it('should render proper semantic landmarks in main layout', () => {
    // Render authenticated app
    window.localStorage.setItem('nexus_wms_auth_user', JSON.stringify({
      data: { username: 'MohithSai', name: 'Mohith Sai', role: 'MANAGER' },
      timestamp: Date.now(),
      expiresAt: Date.now() + 86400000
    }));

    render(
      <WmsProvider>
        <App />
      </WmsProvider>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /main views navigation/i })).toBeInTheDocument();
  });

  it('should enforce role="dialog" and aria-modal on UserProfileModal', () => {
    const mockOnClose = vi.fn();
    const userProfile = {
      name: 'Mohith Sai',
      role: 'Webdesigner & Owner',
      phone: '7675912345',
      email: 'mohith@sai-warehouse.ai'
    };

    render(
      <UserProfileModal 
        isOpen={true} 
        onClose={mockOnClose} 
        userProfile={userProfile} 
        logoutUser={vi.fn()} 
        addToast={vi.fn()} 
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');

    // Test close on Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should enforce accessible names on icon buttons', () => {
    window.localStorage.setItem('nexus_wms_auth_user', JSON.stringify({
      data: { username: 'MohithSai', name: 'Mohith Sai', role: 'MANAGER' },
      timestamp: Date.now(),
      expiresAt: Date.now() + 86400000
    }));

    render(
      <WmsProvider>
        <App />
      </WmsProvider>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const name = button.getAttribute('aria-label') || button.textContent?.trim() || button.getAttribute('title');
      expect(name).toBeTruthy();
    });
  });
});
