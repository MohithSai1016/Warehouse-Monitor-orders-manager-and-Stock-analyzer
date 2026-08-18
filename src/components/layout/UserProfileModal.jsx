import React from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Copy, 
  Sparkles,
  Building2
} from 'lucide-react';

export function UserProfileModal({ isOpen, onClose, userProfile, addToast }) {
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
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
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
              <Sparkles size={11} color="#38bdf8" />
              SYSTEM OWNER &amp; ARCHITECT
            </span>
          </div>

          <button
            onClick={onClose}
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
            <X size={15} />
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
                <CheckCircle2 size={12} />
                VERIFIED OWNER
              </span>
            </div>
          </div>

          {/* User Header Details */}
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              {userProfile.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Briefcase size={13} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#38bdf8' }}>
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
                  <Phone size={15} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Mobile Number</div>
                  <a href={`tel:${userProfile.phone}`} style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '700', textDecoration: 'none' }}>
                    +91 {userProfile.phone}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userProfile.phone, 'Mobile Number')}
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
                <Copy size={13} />
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
                  <Mail size={15} color="#818cf8" />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</div>
                  <a 
                    href={`mailto:${userProfile.email}`} 
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
                title="Copy email address"
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '5px',
                  padding: '5px 7px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}
              >
                <Copy size={13} />
              </button>
            </div>

            {/* Physical Native Address */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#0a0f1d',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.12)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <MapPin size={15} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Native Address</div>
                  <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: '600', lineHeight: 1.35 }}>
                    {userProfile.address}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    East Godavari District, Andhra Pradesh
                  </div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userProfile.address, 'Address')}
                title="Copy native address"
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
                <Copy size={13} />
              </button>
            </div>
          </div>

          {/* Facility Permissions Bar */}
          <div 
            style={{
              padding: '10px 12px',
              background: 'rgba(30, 41, 59, 0.45)',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="#38bdf8" />
              <span>Full Access: <b>Kakinada &amp; Vijayawada Hubs</b></span>
            </div>
            <span style={{ color: '#34d399', fontWeight: 'bold' }}>ID #OWN-01</span>
          </div>

          {/* Actions Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={() => {
                onClose();
                if (logoutUser) logoutUser();
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Lock / Sign Out
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
              }}
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
