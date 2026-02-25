
import { describe, it, expect } from 'vitest';
import { formatNumber } from './utils';

describe('formatNumber', () => {
  it('should return the number as a string for numbers less than 1000', () => {
    expect(formatNumber(123)).toBe('123');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(0)).toBe('0');
  });

  it('should format numbers in thousands with a "K" suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(12345)).toBe('12.3K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('should format numbers in millions with an "M" suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(12345678)).toBe('12.3M');
  });
});
