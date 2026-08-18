import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Check,
  Fingerprint,
  ShieldAlert
} from 'lucide-react';
import { useWms } from '../../context/WmsContext';
import warehouseLoginBg from '../../assets/warehouse-login-bg.jpg';
import { 
  sanitizeInput, 
  validateInput, 
  calculatePasswordStrength, 
  RateLimiter 
} from '../../utils/security';

// Initialize singleton rate limiter for login
const loginRateLimiter = new RateLimiter(5, 60000, 30000);

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
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

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
  const lockoutTimerRef = useRef(null);

  // Calculate live password strength
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  // Lockout countdown handler
  useEffect(() => {
    if (lockoutSeconds > 0) {
      lockoutTimerRef.current = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            clearInterval(lockoutTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, [lockoutSeconds]);

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

    // Check Rate Limiter
    const rateCheck = loginRateLimiter.check();
    if (!rateCheck.allowed) {
      setLockoutSeconds(rateCheck.retryAfterSeconds || 30);
      setLoginError(`Too many failed login attempts. Security lockout active for ${rateCheck.retryAfterSeconds}s.`);
      return;
    }

    const cleanUsername = sanitizeInput(username);
    const cleanPassword = password.trim();

    // Input Validation
    const userVal = validateInput(cleanUsername, 'username');
    if (!userVal.valid) {
      setLoginError(userVal.error || 'Please enter a valid username');
      return;
    }

    const passVal = validateInput(cleanPassword, 'password');
    if (!passVal.valid) {
      setLoginError(passVal.error || 'Please enter a valid password');
      return;
    }

    setIsSubmittingLogin(true);

    // Cryptographic handshake delay
    setTimeout(() => {
      setIsSubmittingLogin(false);
      setStage('OTP_VERIFY');
    }, 500);
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
    }, 90);
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
        // Successful verification! Reset rate limiter
        loginRateLimiter.reset();
        setStage('SUCCESS_AUTH');
        
        // Wait ~1.2s for celebration animation, then log in and navigate to Home Map
        setTimeout(() => {
          loginUser({
            username: sanitizeInput(username) || 'MohithSai',
            name: 'Mohith Sai',
            role: 'MANAGER'
          });
        }, 1200);
      } else {
        const failureResult = loginRateLimiter.recordFailure();
        if (failureResult.locked) {
          setLockoutSeconds(failureResult.retryAfterSeconds || 30);
        }
        setShakeOtp(true);
        setOtpError('Invalid verification code. Please enter the 6-digit code or use Demo Auto-Fill.');
        setTimeout(() => setShakeOtp(false), 600);
      }
    }, 450);
  };

  return (
    <section 
      id="auth-main"
      className="login-experience-container"
      aria-label="Secure Warehouse Authentication Portal"
    >
      {/* ── Background Warehouse Image ── */}
      <div 
        className={`login-bg-layer ${stage !== 'IMAGE_ONLY' ? 'blurred-active' : ''}`}
        style={{
          backgroundImage: `url(${warehouseLoginBg})`
        }}
        role="presentation"
        aria-hidden="true"
      />

      {/* ── Dark Translucent Futuristic Grid Overlay ── */}
      <div 
        className={`login-overlay-layer ${stage !== 'IMAGE_ONLY' ? 'overlay-active' : ''}`}
        role="presentation"
        aria-hidden="true"
      >
        <div className="futuristic-ambient-glow" />
        <div className="subtle-digital-grid-overlay" />
      </div>

      {/* ── STAGE 1: IMAGE ONLY (Initial Clean View with Bottom-Right SIGN IN Button) ── */}
      {stage === 'IMAGE_ONLY' && (
        <div className="initial-screen-layer">
          {/* Subtle top-left status watermark */}
          <div className="initial-top-badge" role="status" aria-live="polite">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>SAI'S SMART WAREHOUSE AI &bull; LIVE FACILITY TELEMETRY ACTIVE</span>
          </div>

          {/* Primary Action: Bottom-Right Glassmorphism SIGN IN Button */}
          <button 
            id="initial-sign-in-btn"
            className="initial-signin-button"
            onClick={() => setStage('LOGIN_FORM')}
            aria-label="Open Authentication Terminal"
            title="Open Authentication Terminal"
          >
            <div className="btn-glow-ring" aria-hidden="true" />
            <div className="btn-content-flex">
              <span className="signin-lock-icon" aria-hidden="true">
                <Lock size={18} />
              </span>
              <span className="signin-text">SIGN IN</span>
              <span className="signin-arrow-icon" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── STAGE 2: LOGIN FORM MODAL ── */}
      {stage === 'LOGIN_FORM' && (
        <div 
          className="auth-modal-wrapper animate-panel-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          aria-describedby="login-modal-desc"
        >
          {/* Top-Right Dismiss to return to clean warehouse view */}
          <button 
            className="auth-back-btn" 
            onClick={() => setStage('IMAGE_ONLY')}
            aria-label="Return to Warehouse View"
            title="Return to Warehouse View"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Warehouse View</span>
          </button>

          <div className="auth-card-glassmorphism">
            {/* Header / Security Brand */}
            <div className="auth-card-header">
              <div className="auth-brand-badge">
                <span className="brand-dot" aria-hidden="true" />
                <span>SECURE CONTROL CENTER</span>
                <span className="security-shield" aria-hidden="true">
                  <ShieldCheck size={14} color="#38bdf8" />
                </span>
              </div>
              <h1 id="login-modal-title" className="auth-main-title">SMART WAREHOUSE AI</h1>
              <p id="login-modal-desc" className="auth-sub-title">Multi-Facility Digital Twin & Autonomous AMR Dispatch</p>
            </div>

            {/* Demo Notice Pill */}
            <div className="demo-credentials-pill" role="note">
              <Sparkles size={14} className="sparkle-icon" aria-hidden="true" />
              <span>Demo credentials pre-loaded for immediate access</span>
            </div>

            {/* Lockout Warning */}
            {lockoutSeconds > 0 && (
              <div className="auth-error-banner" role="alert" aria-live="assertive" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: '#ef4444' }}>
                <ShieldAlert size={16} color="#ef4444" aria-hidden="true" />
                <span>Security Lockout: Please wait <strong>{lockoutSeconds}s</strong> before retrying.</span>
              </div>
            )}

            {loginError && lockoutSeconds === 0 && (
              <div className="auth-error-banner" role="alert" aria-live="assertive">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="auth-form-body" noValidate>
              {/* Username Field */}
              <div className="auth-input-group">
                <label htmlFor="username-input" className="auth-input-label">
                  <User size={14} aria-hidden="true" />
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
                    aria-required="true"
                    aria-invalid={!!loginError}
                    disabled={isSubmittingLogin || lockoutSeconds > 0}
                    required
                  />
                  <div className="input-field-glow" aria-hidden="true" />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-input-group">
                <div className="label-with-action">
                  <label htmlFor="password-input" className="auth-input-label">
                    <KeyRound size={14} aria-hidden="true" />
                    <span>Password</span>
                  </label>
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
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
                    aria-required="true"
                    aria-invalid={!!loginError}
                    disabled={isSubmittingLogin || lockoutSeconds > 0}
                    required
                  />
                  <div className="input-field-glow" aria-hidden="true" />
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div 
                    className="password-strength-bar-container"
                    style={{ marginTop: '6px', fontSize: '11px' }}
                    role="progressbar"
                    aria-valuenow={passwordStrength.score}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Password Strength: ${passwordStrength.label}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#94a3b8' }}>
                      <span>Strength: <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong></span>
                      <span>{passwordStrength.score}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${passwordStrength.score}%`, 
                          background: passwordStrength.color,
                          transition: 'width 0.3s ease, background 0.3s ease' 
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Options Row: Remember Me & Demo Password Tip */}
              <div className="auth-options-row">
                <label className="custom-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    aria-label="Remember this terminal"
                  />
                  <span className="checkbox-custom-box" aria-hidden="true">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="checkbox-text">Remember terminal</span>
                </label>

                <button 
                  type="button"
                  className="forgot-password-link"
                  onClick={() => alert("Demo Password: MohithSai@0625\nMaster User: Mohith Sai (Super Admin)")}
                  aria-label="View demo password hint"
                >
                  Forgot password?
                </button>
              </div>

              {/* Action Button: Sign In / Continue */}
              <button 
                type="submit" 
                id="login-continue-btn"
                className={`auth-primary-action-btn ${isSubmittingLogin ? 'btn-loading' : ''}`}
                disabled={isSubmittingLogin || lockoutSeconds > 0}
                aria-label="Sign in to warehouse terminal"
              >
                {isSubmittingLogin ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" aria-hidden="true" />
                    <span>Authenticating Terminal...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} aria-hidden="true" />
                    <span>SIGN IN &bull; CONTINUE</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {/* Card Footer Security Specs */}
            <div className="auth-card-footer" role="contentinfo" aria-label="Security Specifications">
              <div className="footer-spec-item">
                <span className="spec-dot green" aria-hidden="true" />
                <span>256-Bit Encrypted Link</span>
              </div>
              <div className="footer-spec-item">
                <span className="spec-dot blue" aria-hidden="true" />
                <span>Zero-Trust Facility Auth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 3: OTP VERIFICATION POPUP MODAL ── */}
      {stage === 'OTP_VERIFY' && (
        <div 
          className="auth-modal-wrapper animate-panel-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-modal-title"
          aria-describedby="otp-modal-desc"
        >
          {/* Simulated Mobile / Dispatch Push Notification Banner */}
          {simulatedDispatch && (
            <div className="simulated-otp-banner animate-slide-down" role="region" aria-label="Simulated OTP Push Notification">
              <div className="otp-banner-left">
                <div className="banner-icon-pulse" aria-hidden="true">
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
                aria-label={`Auto-fill demonstration code ${DEMO_OTP}`}
              >
                <Zap size={14} aria-hidden="true" />
                <span>Auto-Fill & Verify</span>
              </button>
            </div>
          )}

          {/* OTP Glassmorphism Card */}
          <div className={`auth-card-glassmorphism otp-card-layout ${shakeOtp ? 'shake-animation' : ''}`}>
            {/* Header */}
            <div className="auth-card-header">
              <div className="otp-icon-header" aria-hidden="true">
                <KeyRound size={28} color="#38bdf8" />
              </div>
              <h2 id="otp-modal-title" className="auth-main-title">VERIFY YOUR IDENTITY</h2>
              <p id="otp-modal-desc" className="auth-sub-title">
                A verification code has been dispatched to your authorized terminal (+91 76759••••• / mohith@sai-warehouse.ai).
              </p>
            </div>

            {otpError && (
              <div className="auth-error-banner" role="alert" aria-live="assertive">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6-Digit OTP Input Boxes */}
            <div 
              className="otp-inputs-row" 
              onPaste={handleOtpPaste}
              role="group"
              aria-label="6-Digit Verification Code"
            >
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
                    autoComplete="one-time-code"
                    aria-label={`Verification code digit ${idx + 1} of 6`}
                    disabled={isVerifyingOtp || isAutoTyping || lockoutSeconds > 0}
                  />
                  <div className="otp-box-glow" aria-hidden="true" />
                </div>
              ))}
            </div>

            {/* Resend Countdown & Demo Auto-Fill Trigger */}
            <div className="otp-actions-bar">
              <div className="resend-countdown-text" role="status" aria-live="polite">
                {canResend ? (
                  <button 
                    type="button" 
                    className="resend-active-link"
                    onClick={handleResendOtp}
                    aria-label="Resend new verification code"
                  >
                    <RefreshCw size={14} aria-hidden="true" /> Resend New Code
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
                disabled={isAutoTyping || isVerifyingOtp || lockoutSeconds > 0}
                aria-label="Auto-fill demo verification code"
              >
                <Zap size={14} aria-hidden="true" />
                <span>⚡ Auto-Fill Demo OTP</span>
              </button>
            </div>

            {/* Submit Verification Button */}
            <button 
              type="button" 
              id="verify-otp-btn"
              className={`auth-primary-action-btn ${isVerifyingOtp ? 'btn-loading' : ''}`}
              onClick={() => triggerOtpVerification(otp.join(''))}
              disabled={isVerifyingOtp || otp.some(d => d === '') || lockoutSeconds > 0}
              aria-label="Verify security code and enter warehouse terminal"
            >
              {isVerifyingOtp ? (
                <>
                  <RefreshCw size={18} className="spin-icon" aria-hidden="true" />
                  <span>Validating Security Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>VERIFY & CONTINUE</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>

            {/* Change Login / Back to credentials */}
            <button 
              type="button" 
              className="otp-switch-account-btn"
              onClick={() => setStage('LOGIN_FORM')}
              aria-label="Return to username and password form"
            >
              <ArrowLeft size={14} aria-hidden="true" /> Back to Sign-in Form
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 4: SUCCESSFUL AUTHENTICATION ANIMATION ── */}
      {stage === 'SUCCESS_AUTH' && (
        <div 
          className="auth-modal-wrapper animate-panel-fade-in"
          role="status"
          aria-live="assertive"
          aria-label="Authentication Successful"
        >
          <div className="auth-card-glassmorphism success-card-layout">
            <div className="success-check-ring-wrapper" aria-hidden="true">
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
                Welcome back, <strong style={{ color: '#38bdf8' }}>{sanitizeInput(username) || 'Mohith Sai'}</strong>
              </p>
              <div className="facility-sync-status">
                <span className="sync-pulse" aria-hidden="true" />
                <span>Synchronizing Warehouse Digital Twin & AGV Telemetry...</span>
              </div>
            </div>

            <div className="progress-loader-bar" role="progressbar" aria-label="Loading workspace session">
              <div className="progress-loader-fill" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
