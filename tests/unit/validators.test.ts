import {
  isValidAmount,
  isValidDcaAmount,
  isValidDcaInterval,
  isValidPrivateKey,
} from '@/utils/validators';

describe('isValidPrivateKey', () => {
  it('should return true for valid 64 hex character private key', () => {
    expect(
      isValidPrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
    ).toBe(true);
  });

  it('should return true for valid private key with 0x prefix', () => {
    expect(
      isValidPrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
    ).toBe(true);
  });

  it('should return false for private key that is too short', () => {
    expect(isValidPrivateKey('1234567890abcdef')).toBe(false);
  });

  it('should return false for private key that is too long', () => {
    expect(
      isValidPrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234')
    ).toBe(false);
  });

  it('should return false for private key with invalid characters', () => {
    expect(
      isValidPrivateKey('ghijklmnopqrstuv1234567890abcdef1234567890abcdef1234567890abcdef')
    ).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidPrivateKey('')).toBe(false);
  });
});

describe('isValidDcaInterval', () => {
  it('should return true for valid intervals', () => {
    expect(isValidDcaInterval(1)).toBe(true);
    expect(isValidDcaInterval(3600)).toBe(true);
    expect(isValidDcaInterval(10000)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isValidDcaInterval(0)).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isValidDcaInterval(-1)).toBe(false);
  });

  it('should return false for intervals greater than 10000', () => {
    expect(isValidDcaInterval(10001)).toBe(false);
  });
});

describe('isValidDcaAmount', () => {
  it('should return true for valid amounts', () => {
    expect(isValidDcaAmount(0.1)).toBe(true);
    expect(isValidDcaAmount(100)).toBe(true);
    expect(isValidDcaAmount(10000)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isValidDcaAmount(0)).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isValidDcaAmount(-1)).toBe(false);
  });

  it('should return false for amounts greater than 10000', () => {
    expect(isValidDcaAmount(10001)).toBe(false);
  });
});

describe('isValidAmount', () => {
  describe('valid amounts', () => {
    it('should return true for positive numbers', () => {
      expect(isValidAmount(0.1)).toBe(true);
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(1000000)).toBe(true);
    });

    it('should return true for valid string numbers', () => {
      expect(isValidAmount('0.1')).toBe(true);
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('  50  ')).toBe(true); // with whitespace
    });
  });

  describe('invalid amounts', () => {
    it('should return false for zero', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount('0')).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isValidAmount(-1)).toBe(false);
      expect(isValidAmount('-5')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isValidAmount(null)).toBe(false);
      expect(isValidAmount(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidAmount('')).toBe(false);
    });

    it('should return false for non-numeric strings', () => {
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('$100')).toBe(false);
    });

    it('should return false for Infinity', () => {
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(-Infinity)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidAmount(NaN)).toBe(false);
    });

    it('should return false for amounts exceeding 1 billion', () => {
      expect(isValidAmount(1000000001)).toBe(false);
      expect(isValidAmount('2000000000')).toBe(false);
    });
  });
});
