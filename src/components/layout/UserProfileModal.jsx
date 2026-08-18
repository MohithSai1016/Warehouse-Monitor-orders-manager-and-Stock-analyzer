import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Copy, 
  Sparkles,
  Building2,
  Lock,
  LogOut
} from 'lucide-react';

export function UserProfileModal({ isOpen, onClose, userProfile, logoutUser, addToast }) {
  const modalRef = useRef(null);

  // Close on Escape key and trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Focus trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      if (addToast) {
        addToast({
          title: `Copied ${label}`,
          message: `${text} copied to clipboard.`,
          type: 'success'
        });
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  return (
    <div 
      className="profile-modal-overlay"
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: '16px'
      }}
    >
      <div 
        ref={modalRef}
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        aria-describedby="profile-modal-role"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(180deg, #111827 0%, #0b0f19 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Banner Gradient */}
        <div 
          style={{
            height: '90px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #7c3aed 100%)',
            position: 'relative',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span 
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                padding: '3px 8px',
                borderRadius: '20px',
                background: 'rgba(0, 0, 0, 0.4)',
                color: '#e0f2fe',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={11} color="#38bdf8" aria-hidden="true" />
              SYSTEM OWNER &amp; ARCHITECT
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close profile modal"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.15s'
            }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* User Avatar Badge (Overlapping Banner) */}
        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: '-42px',
              marginBottom: '14px'
            }}
          >
            <div 
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                border: '4px solid #111827',
                display: 'grid',
                placeItems: 'center',
                fontSize: '24px',
                fontWeight: '800',
                color: '#ffffff',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
              }}
              aria-hidden="true"
            >
              MS
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={12} aria-hidden="true" />
                VERIFIED OWNER
              </span>
            </div>
          </div>

          {/* User Header Details */}
          <div style={{ marginBottom: '18px' }}>
            <h2 id="profile-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              {userProfile.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Briefcase size={13} color="#38bdf8" aria-hidden="true" />
              <span id="profile-modal-role" style={{ fontSize: '13px', fontWeight: '600', color: '#38bdf8' }}>
                {userProfile.role}
              </span>
            </div>
          </div>

          {/* Detailed Info Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '18px' }}>
            {/* Mobile Number */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#0a0f1d',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', display: 'grid', placeItems: 'center' }}>
                  <Phone size={15} color="#38bdf8" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Mobile Number</div>
                  <a href={`tel:${userProfile.phone}`} aria-label={`Phone number: +91 ${userProfile.phone}`} style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '700', textDecoration: 'none' }}>
                    +91 {userProfile.phone}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userProfile.phone, 'Mobile Number')}
                aria-label="Copy phone number"
                title="Copy phone number"
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '5px',
                  padding: '5px 7px',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                <Copy size={13} aria-hidden="true" />
              </button>
            </div>

            {/* Email Address */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#0a0f1d',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(129, 140, 248, 0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Mail size={15} color="#818cf8" aria-hidden="true" />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</div>
                  <a 
                    href={`mailto:${userProfile.email}`} 
                    aria-label={`Email address: ${userProfile.email}`}
                    style={{ 
                      fontSize: '12.5px', 
                      color: '#f1f5f9', 
                      fontWeight: '700', 
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block'
                    }}
                  >
                    {userProfile.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userProfile.email, 'Email Address')}
                aria-label="Copy email address"
                title="Copy email address"
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '5px',
                  padding: '5px 7px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  flexShrink: 0
                }}
              >
                <Copy size={13} aria-hidden="true" />
              </button>
            </div>

            {/* Hub Locations */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#0a0f1d',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center' }}>
                  <Building2 size={15} color="#34d399" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Facilities Managed</div>
                  <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: '700' }}>
                    Kakinada Port Hub &bull; Vijayawada Auto Nagar Hub
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          {logoutUser && (
            <button
              onClick={() => {
                onClose();
                logoutUser();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              aria-label="Lock console and sign out"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>LOCK TERMINAL &bull; SIGN OUT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
