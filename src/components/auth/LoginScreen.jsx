import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap,
  Radio,
  Cpu,
  Layers,
  Check,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { useWms } from '../../context/WmsContext';
import warehouseLoginBg from '../../assets/warehouse-login-bg.jpg';

export function LoginScreen() {
  const { loginUser } = useWms();

  // Screen Stages: 'IMAGE_ONLY' | 'LOGIN_FORM' | 'OTP_VERIFY' | 'SUCCESS_AUTH'
  const [stage, setStage] = useState('IMAGE_ONLY');

  // Login form state
  const [username, setUsername] = useState('MohithSai');
  const [password, setPassword] = useState('MohithSai@0625');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // OTP state
  const DEMO_OTP = '849261';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [shakeOtp, setShakeOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [simulatedDispatch, setSimulatedDispatch] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);

  const otpInputsRef = useRef([]);
  const timerRef = useRef(null);

  // Focus first OTP input when entering OTP stage
  useEffect(() => {
    if (stage === 'OTP_VERIFY') {
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setResendTimer(30);
      setCanResend(false);
      setSimulatedDispatch(true);

      // Focus first input box
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 350);

      // Start countdown
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Handle Login submission
  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!username.trim()) {
      setLoginError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setLoginError('Please enter your password');
      return;
    }

    setIsSubmittingLogin(true);

    // Realistic cryptographic handshake delay
    setTimeout(() => {
      setIsSubmittingLogin(false);
      // Demo validation (Accept demo credentials or any valid input)
      setStage('OTP_VERIFY');
    }, 600);
  };

  // Handle individual OTP input changes
  const handleOtpChange = (index, value) => {
    if (isAutoTyping) return;
    const cleanVal = value.replace(/\D/g, '').slice(-1); // Only single numeric digit
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);
    setOtpError('');

    if (cleanVal && index < 5) {
      // Auto move to next input
      if (otpInputsRef.current[index + 1]) {
        otpInputsRef.current[index + 1].focus();
      }
    }

    // Auto verify if all 6 digits entered
    if (cleanVal && index === 5 && newOtp.every(d => d !== '')) {
      triggerOtpVerification(newOtp.join(''));
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous box if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        if (otpInputsRef.current[index - 1]) {
          otpInputsRef.current[index - 1].focus();
        }
      }
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setOtpError('');

    const lastFilledIdx = Math.min(pasted.length, 5);
    if (otpInputsRef.current[lastFilledIdx]) {
      otpInputsRef.current[lastFilledIdx].focus();
    }

    if (pasted.length === 6) {
      triggerOtpVerification(pasted);
    }
  };

  // Auto-Fill Demonstration Function
  const handleAutoFillOtp = () => {
    setIsAutoTyping(true);
    setOtpError('');
    const code = DEMO_OTP;
    const currentArray = ['', '', '', '', '', ''];
    setOtp(currentArray);

    let charIdx = 0;
    const typeInterval = setInterval(() => {
      if (charIdx < 6) {
        currentArray[charIdx] = code[charIdx];
        setOtp([...currentArray]);
        if (otpInputsRef.current[charIdx]) {
          otpInputsRef.current[charIdx].focus();
        }
        charIdx++;
      } else {
        clearInterval(typeInterval);
        setIsAutoTyping(false);
        setTimeout(() => {
          triggerOtpVerification(code);
        }, 300);
      }
    }, 110);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setCanResend(false);
    setResendTimer(30);
    setSimulatedDispatch(true);

    if (otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Trigger OTP Verification
  const triggerOtpVerification = (enteredCode) => {
    setIsVerifyingOtp(true);
    setOtpError('');

    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (enteredCode === DEMO_OTP || enteredCode.length === 6) {
        // Successful verification!
        setStage('SUCCESS_AUTH');
        
        // Wait ~1.2s for celebration animation, then log in and navigate to Home Map
        setTimeout(() => {
          loginUser({
            username: username || 'MohithSai',
            name: 'Mohith Sai',
            role: 'MANAGER'
          });
        }, 1200);
      } else {
        setShakeOtp(true);
        setOtpError('Invalid verification code. Please enter the 6-digit code or use Demo Auto-Fill.');
        setTimeout(() => setShakeOtp(false), 600);
      }
    }, 550);
  };

  return (
    <div className="login-experience-container">
      {/* ── Background Warehouse Image ── */}
      <div 
        className={`login-bg-layer ${stage !== 'IMAGE_ONLY' ? 'blurred-active' : ''}`}
        style={{
          backgroundImage: `url(${warehouseLoginBg})`
        }}
      />

      {/* ── Dark Translucent Futuristic Grid Overlay ── */}
      <div className={`login-overlay-layer ${stage !== 'IMAGE_ONLY' ? 'overlay-active' : ''}`}>
        <div className="futuristic-ambient-glow" />
        <div className="subtle-digital-grid-overlay" />
      </div>

      {/* ── STAGE 1: IMAGE ONLY (Initial Clean View with Bottom-Right SIGN IN Button) ── */}
      {stage === 'IMAGE_ONLY' && (
        <div className="initial-screen-layer">
          {/* Subtle top-left status watermark */}
          <div className="initial-top-badge">
            <span className="live-pulse-dot" />
            <span>SAI'S SMART WAREHOUSE AI &bull; LIVE FACILITY TELEMETRY ACTIVE</span>
          </div>

          {/* Primary Action: Bottom-Right Glassmorphism SIGN IN Button */}
          <button 
            id="initial-sign-in-btn"
            className="initial-signin-button"
            onClick={() => setStage('LOGIN_FORM')}
            title="Open Authentication Terminal"
          >
            <div className="btn-glow-ring" />
            <div className="btn-content-flex">
              <span className="signin-lock-icon">
                <Lock size={18} />
              </span>
              <span className="signin-text">SIGN IN</span>
              <span className="signin-arrow-icon">
                <ArrowRight size={18} />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── STAGE 2: LOGIN FORM MODAL ── */}
      {stage === 'LOGIN_FORM' && (
        <div className="auth-modal-wrapper animate-panel-fade-in">
          {/* Top-Right Dismiss to return to clean warehouse view */}
          <button 
            className="auth-back-btn" 
            onClick={() => setStage('IMAGE_ONLY')}
            title="Return to Warehouse View"
          >
            <ArrowLeft size={16} />
            <span>Warehouse View</span>
          </button>

          <div className="auth-card-glassmorphism">
            {/* Header / Security Brand */}
            <div className="auth-card-header">
              <div className="auth-brand-badge">
                <span className="brand-dot" />
                <span>SECURE CONTROL CENTER</span>
                <span className="security-shield">
                  <ShieldCheck size={14} color="#38bdf8" />
                </span>
              </div>
              <h1 className="auth-main-title">SMART WAREHOUSE AI</h1>
              <p className="auth-sub-title">Multi-Facility Digital Twin & Autonomous AMR Dispatch</p>
            </div>

            {/* Demo Notice Pill */}
            <div className="demo-credentials-pill">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Demo credentials pre-loaded for immediate access</span>
            </div>

            {loginError && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="auth-form-body">
              {/* Username Field */}
              <div className="auth-input-group">
                <label className="auth-input-label">
                  <User size={14} />
                  <span>Username</span>
                </label>
                <div className="input-field-wrapper">
                  <input 
                    type="text"
                    id="username-input"
                    className="auth-text-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                  />
                  <div className="input-field-glow" />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-input-group">
                <div className="label-with-action">
                  <label className="auth-input-label">
                    <KeyRound size={14} />
                    <span>Password</span>
                  </label>
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="input-field-wrapper">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="password-input"
                    className="auth-text-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <div className="input-field-glow" />
                </div>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="auth-options-row">
                <label className="custom-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-custom-box">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="checkbox-text">Remember terminal</span>
                </label>

                <button 
                  type="button"
                  className="forgot-password-link"
                  onClick={() => alert("Demo Password: MohithSai@0625\nMaster User: Mohith Sai (Super Admin)")}
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Button: Sign In / Continue */}
              <button 
                type="submit" 
                id="login-continue-btn"
                className={`auth-primary-action-btn ${isSubmittingLogin ? 'btn-loading' : ''}`}
                disabled={isSubmittingLogin}
              >
                {isSubmittingLogin ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" />
                    <span>Authenticating Terminal...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} />
                    <span>SIGN IN &bull; CONTINUE</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Card Footer Security Specs */}
            <div className="auth-card-footer">
              <div className="footer-spec-item">
                <span className="spec-dot green" />
                <span>256-Bit Encrypted Link</span>
              </div>
              <div className="footer-spec-item">
                <span className="spec-dot blue" />
                <span>Zero-Trust Facility Auth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 3: OTP VERIFICATION POPUP MODAL ── */}
      {stage === 'OTP_VERIFY' && (
        <div className="auth-modal-wrapper animate-panel-fade-in">
          {/* Simulated Mobile / Dispatch Push Notification Banner */}
          {simulatedDispatch && (
            <div className="simulated-otp-banner animate-slide-down">
              <div className="otp-banner-left">
                <div className="banner-icon-pulse">
                  <Radio size={16} color="#38bdf8" />
                </div>
                <div>
                  <div className="banner-title">
                    <span>SECURITY DISPATCH</span>
                    <span className="demo-tag">DEMO SIMULATOR</span>
                  </div>
                  <div className="banner-desc">
                    Your 6-digit verification code is: <strong className="highlight-code">{DEMO_OTP}</strong>
                  </div>
                </div>
              </div>
              <button 
                className="banner-autofill-btn"
                onClick={handleAutoFillOtp}
                title="Automatically populate and verify"
              >
                <Zap size={14} />
                <span>Auto-Fill & Verify</span>
              </button>
            </div>
          )}

          {/* OTP Glassmorphism Card */}
          <div className={`auth-card-glassmorphism otp-card-layout ${shakeOtp ? 'shake-animation' : ''}`}>
            {/* Header */}
            <div className="auth-card-header">
              <div className="otp-icon-header">
                <KeyRound size={28} color="#38bdf8" />
              </div>
              <h2 className="auth-main-title">VERIFY YOUR IDENTITY</h2>
              <p className="auth-sub-title">
                A verification code has been dispatched to your authorized terminal (+91 76759••••• / mohith@sai-warehouse.ai).
              </p>
            </div>

            {otpError && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6-Digit OTP Input Boxes */}
            <div className="otp-inputs-row" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <div key={idx} className="otp-box-wrapper">
                  <input 
                    ref={el => otpInputsRef.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`otp-single-box ${digit ? 'filled' : ''} ${otpError ? 'error-border' : ''}`}
                    autoComplete="off"
                    disabled={isVerifyingOtp || isAutoTyping}
                  />
                  <div className="otp-box-glow" />
                </div>
              ))}
            </div>

            {/* Resend Countdown & Demo Auto-Fill Trigger */}
            <div className="otp-actions-bar">
              <div className="resend-countdown-text">
                {canResend ? (
                  <button 
                    type="button" 
                    className="resend-active-link"
                    onClick={handleResendOtp}
                  >
                    <RefreshCw size={14} /> Resend New Code
                  </button>
                ) : (
                  <span>
                    Resend code in <strong className="timer-number">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                  </span>
                )}
              </div>

              <button 
                type="button"
                className="otp-autofill-action-btn"
                onClick={handleAutoFillOtp}
                disabled={isAutoTyping || isVerifyingOtp}
              >
                <Zap size={14} />
                <span>⚡ Auto-Fill Demo OTP</span>
              </button>
            </div>

            {/* Submit Verification Button */}
            <button 
              type="button"
              id="verify-otp-btn"
              className={`auth-primary-action-btn ${isVerifyingOtp ? 'btn-loading' : ''}`}
              onClick={() => triggerOtpVerification(otp.join(''))}
              disabled={isVerifyingOtp || otp.some(d => d === '')}
            >
              {isVerifyingOtp ? (
                <>
                  <RefreshCw size={18} className="spin-icon" />
                  <span>Validating Security Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>VERIFY & CONTINUE</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Change Login / Back to credentials */}
            <button 
              type="button" 
              className="otp-switch-account-btn"
              onClick={() => setStage('LOGIN_FORM')}
            >
              <ArrowLeft size={14} /> Back to Sign-in Form
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 4: SUCCESSFUL AUTHENTICATION ANIMATION ── */}
      {stage === 'SUCCESS_AUTH' && (
        <div className="auth-modal-wrapper animate-panel-fade-in">
          <div className="auth-card-glassmorphism success-card-layout">
            <div className="success-check-ring-wrapper">
              <div className="success-radar-ring" />
              <div className="success-radar-ring outer" />
              <div className="success-check-icon">
                <CheckCircle2 size={64} color="#34d399" strokeWidth={2.5} />
              </div>
            </div>

            <div className="success-text-content">
              <div className="success-badge">ACCESS GRANTED</div>
              <h2 className="success-main-title">Authentication Successful</h2>
              <p className="success-welcome-text">
                Welcome back, <strong style={{ color: '#38bdf8' }}>Mohith Sai</strong>
              </p>
              <div className="facility-sync-status">
                <span className="sync-pulse" />
                <span>Synchronizing Warehouse Digital Twin & AGV Telemetry...</span>
              </div>
            </div>

            <div className="progress-loader-bar">
              <div className="progress-loader-fill" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
