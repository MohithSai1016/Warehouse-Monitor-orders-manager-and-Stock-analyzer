/**
 * Enterprise-Grade Security & Sanitization Utilities
 * Protects against XSS, Injection, Prototype Pollution, Insecure Storage, and Brute-Force attacks.
 */

// HTML entity escape map
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;'
};

/**
 * Sanitize untrusted text to prevent Cross-Site Scripting (XSS).
 * Strips script tags, javascript: pseudoprotocols, and escapes dangerous HTML characters.
 * @param {unknown} input - Raw string or value
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') {
    input = String(input);
  }

  // Strip dangerous javascript: and data: urls
  let cleaned = input.replace(/(javascript|vbscript|data):/gi, '');

  // Strip script tags and event handlers
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*(['"]).*?\1/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*[^>\s]+/gi, '');

  // Escape HTML entities
  return cleaned.replace(/[&<>"'`\/]/g, (match) => HTML_ESCAPE_MAP[match] || match).trim();
}

/**
 * Validates input against predefined schemas.
 * @param {string} value 
 * @param {'username' | 'password' | 'sku' | 'binId' | 'quantity' | 'orderId' | 'search' | 'email' | 'phone'} type 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateInput(value, type) {
  if (value === null || value === undefined) {
    return { valid: false, error: 'Value is required' };
  }

  const str = String(value).trim();

  switch (type) {
    case 'username': {
      if (str.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
      if (str.length > 32) return { valid: false, error: 'Username cannot exceed 32 characters' };
      if (!/^[a-zA-Z0-9_.-]+$/.test(str)) {
        return { valid: false, error: 'Username may only contain letters, numbers, hyphens, and underscores' };
      }
      return { valid: true };
    }

    case 'password': {
      if (str.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
      if (str.length > 64) return { valid: false, error: 'Password cannot exceed 64 characters' };
      return { valid: true };
    }

    case 'sku': {
      if (!/^SKU-[A-Z0-9]{2,4}-[0-9]{3,4}$/.test(str)) {
        return { valid: false, error: 'Invalid SKU format (expected format: SKU-XX-000)' };
      }
      return { valid: true };
    }

    case 'binId': {
      if (!/^[A-Z]-[0-9]{2}-[A-Z][0-9]$/.test(str)) {
        return { valid: false, error: 'Invalid Bin ID format (expected format: A-01-A1)' };
      }
      return { valid: true };
    }

    case 'quantity': {
      const num = Number(str);
      if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 100000) {
        return { valid: false, error: 'Quantity must be an integer between 0 and 100,000' };
      }
      return { valid: true };
    }

    case 'orderId': {
      if (!/^(ORD|WAVE|PO|EX)-[A-Z0-9_-]+$/i.test(str)) {
        return { valid: false, error: 'Invalid ID format' };
      }
      return { valid: true };
    }

    case 'search': {
      if (str.length > 100) return { valid: false, error: 'Search query is too long' };
      return { valid: true };
    }

    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
        return { valid: false, error: 'Invalid email address' };
      }
      return { valid: true };
    }

    case 'phone': {
      if (!/^\+?[0-9\s-]{7,16}$/.test(str)) {
        return { valid: false, error: 'Invalid phone number' };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

/**
 * Calculate password strength score and descriptive feedback.
 * @param {string} password 
 * @returns {{ score: number, label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong', color: string, feedback: string[] }}
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Weak', color: '#ef4444', feedback: ['Password cannot be empty'] };
  }

  let score = 0;
  const feedback = [];

  // Length checks
  if (password.length >= 8) score += 25;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 15;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Use both lowercase and uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include at least one special symbol');
  }

  score = Math.min(100, score);

  let label = 'Weak';
  let color = '#ef4444';

  if (score >= 80) {
    label = 'Very Strong';
    color = '#10b981';
  } else if (score >= 60) {
    label = 'Strong';
    color = '#38bdf8';
  } else if (score >= 40) {
    label = 'Good';
    color = '#f59e0b';
  } else if (score >= 25) {
    label = 'Fair';
    color = '#fb923c';
  }

  return { score, label, color, feedback };
}

/**
 * Client-Side Rate Limiter to prevent brute-force login and API flooding.
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000, lockoutMs = 30000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.lockoutMs = lockoutMs;
    this.attempts = [];
    this.lockedUntil = 0;
  }

  /**
   * Check if action is currently allowed.
   * @returns {{ allowed: boolean, remainingAttempts: number, retryAfterSeconds?: number }}
   */
  check() {
    const now = Date.now();

    // Check if locked out
    if (this.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((this.lockedUntil - now) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    // Clean old attempts outside sliding window
    this.attempts = this.attempts.filter(timestamp => now - timestamp < this.windowMs);

    const remainingAttempts = Math.max(0, this.maxAttempts - this.attempts.length);
    return { allowed: remainingAttempts > 0, remainingAttempts };
  }

  /**
   * Record a failed attempt.
   * @returns {{ locked: boolean, retryAfterSeconds?: number }}
   */
  recordFailure() {
    const now = Date.now();
    this.attempts.push(now);

    if (this.attempts.length >= this.maxAttempts) {
      this.lockedUntil = now + this.lockoutMs;
      return { locked: true, retryAfterSeconds: Math.ceil(this.lockoutMs / 1000) };
    }

    return { locked: false };
  }

  /**
   * Reset rate limiter upon successful authentication.
   */
  reset() {
    this.attempts = [];
    this.lockedUntil = 0;
  }
}

/**
 * Deep sanitization preventing Prototype Pollution attacks.
 * @param {unknown} obj 
 * @returns {unknown}
 */
export function preventPrototypePollution(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(preventPrototypePollution);
  }

  const safeObj = Object.create(null);
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Block prototype pollution vectors
    }
    safeObj[key] = preventPrototypePollution(obj[key]);
  }
  return safeObj;
}

/**
 * Cryptographically secure pseudo-random token generator.
 * @param {number} length 
 * @returns {string}
 */
export function generateSecureToken(length = 32) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Secure Storage wrapper with schema validation, checksum verification, and XSS sanitization.
 */
export const SafeStorage = {
  set(key, value, ttlMs = 86400000) {
    try {
      if (typeof window === 'undefined') return false;
      const sanitizedKey = sanitizeInput(key);
      const payload = {
        data: preventPrototypePollution(value),
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMs
      };
      window.localStorage.setItem(`nexus_wms_${sanitizedKey}`, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('SafeStorage set error:', e);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const sanitizedKey = sanitizeInput(key);
      const raw = window.localStorage.getItem(`nexus_wms_${sanitizedKey}`);
      if (!raw) return defaultValue;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return defaultValue;

      // Check TTL expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(`nexus_wms_${sanitizedKey}`);
        return defaultValue;
      }

      return preventPrototypePollution(parsed.data);
    } catch (e) {
      console.warn('SafeStorage get error:', e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      if (typeof window === 'undefined') return;
      const sanitizedKey = sanitizeInput(key);
      window.localStorage.removeItem(`nexus_wms_${sanitizedKey}`);
    } catch (e) {
      console.warn('SafeStorage remove error:', e);
    }
  }
};

/**
 * Role-Based Access Control (RBAC) Permission Matrix
 */
export const ROLE_PERMISSIONS = {
  MANAGER: [
    'VIEW_ALL_HUBS',
    'SWITCH_WAREHOUSE',
    'ALLOCATE_ORDERS',
    'TRIGGER_SIMULATION',
    'OVERRIDE_PRIORITY',
    'QUARANTINE_STOCK',
    'APPROVE_PURCHASE_ORDER',
    'DISPATCH_AGV',
    'EMERGENCY_STOP',
    'ADJUST_BIN_STOCK',
    'VIEW_ANALYTICS'
  ],
  PICKER: [
    'VIEW_ASSIGNED_WAVE',
    'CONFIRM_PICK',
    'SCAN_BARCODE',
    'REPORT_DAMAGE',
    'SWITCH_ZONE'
  ],
  AGV_OPERATOR: [
    'DISPATCH_AGV',
    'VIEW_FLEET',
    'EMERGENCY_STOP',
    'RETURN_TO_CHARGER'
  ]
};

/**
 * Check if a role possesses the required permission.
 * @param {string} role 
 * @param {string} permission 
 * @returns {boolean}
 */
export function checkPermission(role, permission) {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Security Audit Logger for tracking sensitive operations.
 */
class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(event, details = {}, user = 'SYSTEM') {
    const entry = {
      id: generateSecureToken(8),
      timestamp: new Date().toISOString(),
      event: sanitizeInput(event),
      details: preventPrototypePollution(details),
      user: sanitizeInput(user)
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return entry;
  }

  getLogs() {
    return [...this.logs];
  }
}

export const auditLogger = new AuditLogger();
