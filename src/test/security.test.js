import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  sanitizeInput, 
  validateInput, 
  calculatePasswordStrength, 
  RateLimiter, 
  preventPrototypePollution, 
  generateSecureToken, 
  SafeStorage, 
  checkPermission,
  ROLE_PERMISSIONS,
  auditLogger 
} from '../utils/security';

describe('Security Utilities & Protections', () => {
  describe('sanitizeInput()', () => {
    it('should strip malicious script tags', () => {
      const dirty = '<script>alert("xss")</script>Hello World';
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toBe('Hello World');
    });

    it('should strip inline event handlers', () => {
      const dirty = '<img src="x" onerror="alert(1)">';
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
    });

    it('should strip javascript: pseudoprotocols', () => {
      const dirty = 'javascript:void(0);';
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain('javascript:');
    });

    it('should escape HTML entities properly', () => {
      const input = '<div class="test">Fish & Chips</div>';
      const clean = sanitizeInput(input);
      expect(clean).toContain('&lt;');
      expect(clean).toContain('&gt;');
      expect(clean).toContain('&amp;');
      expect(clean).toContain('&quot;');
    });

    it('should handle null, undefined, and numbers safely', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(12345)).toBe('12345');
    });
  });

  describe('validateInput()', () => {
    it('should validate usernames correctly', () => {
      expect(validateInput('MohithSai', 'username').valid).toBe(true);
      expect(validateInput('admin_01', 'username').valid).toBe(true);
      expect(validateInput('a', 'username').valid).toBe(false);
      expect(validateInput('user with spaces', 'username').valid).toBe(false);
      expect(validateInput('user<script>', 'username').valid).toBe(false);
    });

    it('should validate passwords correctly', () => {
      expect(validateInput('MohithSai@0625', 'password').valid).toBe(true);
      expect(validateInput('123', 'password').valid).toBe(false);
    });

    it('should validate SKU formats', () => {
      expect(validateInput('SKU-GR-101', 'sku').valid).toBe(true);
      expect(validateInput('SKU-AP-9999', 'sku').valid).toBe(true);
      expect(validateInput('INVALID_SKU', 'sku').valid).toBe(false);
    });

    it('should validate Bin IDs', () => {
      expect(validateInput('A-01-A1', 'binId').valid).toBe(true);
      expect(validateInput('C-04-B2', 'binId').valid).toBe(true);
      expect(validateInput('A-999-Z', 'binId').valid).toBe(false);
    });

    it('should validate numeric quantities', () => {
      expect(validateInput(25, 'quantity').valid).toBe(true);
      expect(validateInput('50', 'quantity').valid).toBe(true);
      expect(validateInput(-5, 'quantity').valid).toBe(false);
      expect(validateInput('abc', 'quantity').valid).toBe(false);
    });

    it('should validate email addresses', () => {
      expect(validateInput('mohith@sai-warehouse.ai', 'email').valid).toBe(true);
      expect(validateInput('invalid-email', 'email').valid).toBe(false);
    });
  });

  describe('calculatePasswordStrength()', () => {
    it('should rate weak passwords with low score', () => {
      const res = calculatePasswordStrength('123');
      expect(res.score).toBeLessThan(40);
      expect(res.label).toBe('Weak');
      expect(res.feedback.length).toBeGreaterThan(0);
    });

    it('should rate complex passwords as Strong or Very Strong', () => {
      const res = calculatePasswordStrength('MohithSai@0625!Secure');
      expect(res.score).toBeGreaterThanOrEqual(80);
      expect(res.label).toBe('Very Strong');
    });
  });

  describe('RateLimiter', () => {
    it('should allow attempts up to max threshold and lockout afterwards', () => {
      const limiter = new RateLimiter(3, 10000, 5000);
      
      expect(limiter.check().allowed).toBe(true);
      limiter.recordFailure();
      
      expect(limiter.check().allowed).toBe(true);
      limiter.recordFailure();

      expect(limiter.check().allowed).toBe(true);
      const lockRes = limiter.recordFailure();

      expect(lockRes.locked).toBe(true);
      expect(limiter.check().allowed).toBe(false);
      expect(limiter.check().remainingAttempts).toBe(0);

      limiter.reset();
      expect(limiter.check().allowed).toBe(true);
    });
  });

  describe('preventPrototypePollution()', () => {
    it('should eliminate __proto__ and constructor injection vectors', () => {
      const malicious = JSON.parse('{"__proto__": {"isAdmin": true}, "validKey": 42}');
      const cleaned = preventPrototypePollution(malicious);
      
      expect(cleaned.validKey).toBe(42);
      expect(Object.prototype.isAdmin).toBeUndefined();
    });
  });

  describe('generateSecureToken()', () => {
    it('should generate a secure random hex string of requested length', () => {
      const token1 = generateSecureToken(16);
      const token2 = generateSecureToken(16);
      expect(token1.length).toBe(16);
      expect(token2.length).toBe(16);
      expect(token1).not.toBe(token2);
    });
  });

  describe('SafeStorage', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('should set and get items securely', () => {
      SafeStorage.set('test_key', { role: 'MANAGER', name: 'Mohith' });
      const retrieved = SafeStorage.get('test_key');
      expect(retrieved).toEqual({ role: 'MANAGER', name: 'Mohith' });
    });

    it('should return default value for missing or expired keys', () => {
      expect(SafeStorage.get('non_existent', 'fallback')).toBe('fallback');
      
      // Set expired item
      SafeStorage.set('expired_key', 'val', -1000);
      expect(SafeStorage.get('expired_key', 'fallback')).toBe('fallback');
    });

    it('should remove items cleanly', () => {
      SafeStorage.set('key_to_delete', 'value');
      SafeStorage.remove('key_to_delete');
      expect(SafeStorage.get('key_to_delete')).toBeNull();
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should verify MANAGER permissions', () => {
      expect(checkPermission('MANAGER', 'ALLOCATE_ORDERS')).toBe(true);
      expect(checkPermission('MANAGER', 'DISPATCH_AGV')).toBe(true);
      expect(checkPermission('MANAGER', 'QUARANTINE_STOCK')).toBe(true);
    });

    it('should deny unauthorized actions for PICKER', () => {
      expect(checkPermission('PICKER', 'CONFIRM_PICK')).toBe(true);
      expect(checkPermission('PICKER', 'APPROVE_PURCHASE_ORDER')).toBe(false);
      expect(checkPermission('PICKER', 'ALLOCATE_ORDERS')).toBe(false);
    });
  });

  describe('AuditLogger', () => {
    it('should record and retrieve security audit logs', () => {
      auditLogger.log('AUTH_LOGIN_SUCCESS', { user: 'MohithSai' }, 'MohithSai');
      const logs = auditLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].event).toBe('AUTH_LOGIN_SUCCESS');
      expect(logs[0].user).toBe('MohithSai');
    });
  });
});
