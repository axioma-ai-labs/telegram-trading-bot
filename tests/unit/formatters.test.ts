import { calculateSellAmount, formatInterval } from '@/utils/formatters';

describe('formatInterval', () => {
  describe('seconds (below 1 hour)', () => {
    it('should format seconds', () => {
      expect(formatInterval(1)).toBe('1 seconds');
      expect(formatInterval(30)).toBe('30 seconds');
      expect(formatInterval(60)).toBe('60 seconds');
      expect(formatInterval(300)).toBe('300 seconds');
      expect(formatInterval(1800)).toBe('1800 seconds');
      expect(formatInterval(3599)).toBe('3599 seconds');
    });
  });

  describe('hours (1 hour to 1 day)', () => {
    it('should format hours', () => {
      expect(formatInterval(3600)).toBe('1 hours');
      expect(formatInterval(7200)).toBe('2 hours');
      expect(formatInterval(43200)).toBe('12 hours');
    });
  });

  describe('days (1 day to 1 week)', () => {
    it('should format days', () => {
      expect(formatInterval(86400)).toBe('1 days');
      expect(formatInterval(172800)).toBe('2 days');
    });
  });

  describe('weeks (1 week to 1 month)', () => {
    it('should format weeks', () => {
      expect(formatInterval(604800)).toBe('1 weeks');
      expect(formatInterval(1209600)).toBe('2 weeks');
    });
  });

  describe('months (above 1 month)', () => {
    it('should format months', () => {
      expect(formatInterval(2592000)).toBe('1 months');
      expect(formatInterval(5184000)).toBe('2 months');
    });
  });

  describe('edge cases', () => {
    it('should handle 0', () => {
      expect(formatInterval(0)).toBe('0 seconds');
    });
  });
});

describe('calculateSellAmount', () => {
  const balance = 100;
  const tokenSymbol = 'TOKEN';

  describe('percentage amounts', () => {
    it('should calculate 25%', () => {
      const result = calculateSellAmount('25%', balance, tokenSymbol);
      expect(result.success).toBe(true);
      expect(result.sellAmount).toBe(25);
    });

    it('should calculate 50%', () => {
      const result = calculateSellAmount('50%', balance, tokenSymbol);
      expect(result.success).toBe(true);
      expect(result.sellAmount).toBe(50);
    });

    it('should calculate 75%', () => {
      const result = calculateSellAmount('75%', balance, tokenSymbol);
      expect(result.success).toBe(true);
      expect(result.sellAmount).toBe(75);
    });

    it('should calculate 100%', () => {
      const result = calculateSellAmount('100%', balance, tokenSymbol);
      expect(result.success).toBe(true);
      expect(result.sellAmount).toBe(100);
    });
  });

  describe('custom amounts', () => {
    it('should handle valid custom amount', () => {
      const result = calculateSellAmount('50', balance, tokenSymbol);
      expect(result.success).toBe(true);
      expect(result.sellAmount).toBe(50);
    });

    it('should handle custom amount with decimals', () => {
      const result = calculateSellAmount('25.5', balance, tokenSymbol);
      expect(result.success).toBe(true);
      expect(result.sellAmount).toBe(25.5);
    });
  });

  describe('error cases', () => {
    it('should fail for amount exceeding balance', () => {
      const result = calculateSellAmount('150', balance, tokenSymbol);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail for zero amount', () => {
      const result = calculateSellAmount('0', balance, tokenSymbol);
      expect(result.success).toBe(false);
    });

    it('should fail for negative amount', () => {
      const result = calculateSellAmount('-10', balance, tokenSymbol);
      expect(result.success).toBe(false);
    });

    it('should fail for non-numeric input', () => {
      const result = calculateSellAmount('abc', balance, tokenSymbol);
      expect(result.success).toBe(false);
    });
  });

  describe('custom keyword', () => {
    it('should return isCustomAmountRequest for "custom" input', () => {
      const result = calculateSellAmount('custom', balance, tokenSymbol);
      expect(result.isCustomAmountRequest).toBe(true);
    });
  });
});
