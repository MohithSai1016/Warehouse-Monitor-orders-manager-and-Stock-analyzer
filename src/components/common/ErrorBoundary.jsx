import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            background: 'linear-gradient(135deg, #0b0f19 0%, #0f172a 100%)',
            color: '#f8fafc',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            textAlign: 'center'
          }}
        >
          <div 
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '2.5rem',
              maxWidth: '560px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: '#ef4444'
              }}
            >
              <AlertTriangle size={32} aria-hidden="true" />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Operational Interruption Detected
            </h1>
            
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              The autonomous warehouse operations console encountered an unexpected state. Our safety isolation system has secured the active session.
            </p>

            {this.state.error && (
              <div 
                style={{
                  background: '#090d16',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  fontSize: '0.8rem',
                  fontFamily: 'DM Mono, monospace',
                  color: '#fb7185',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  overflowX: 'auto',
                  maxHeight: '120px'
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Restart Terminal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
