import { menuSchema } from '../../src/validations/menu-validation';
import { expect, describe, it } from '@jest/globals';

describe('Menu Schema Validation', () => {
  it('should pass with valid data', () => {
    const validData = {
      day: 10,
      buka: ['65a67890abc12345def67890'],
      sahur: ['65a12345abc67890def12345'],
    };
    expect(() => menuSchema.parse(validData)).not.toThrow();
  });

  it('should fail if day is less than 1', () => {
    const invalidData = { day: 0, buka: ['65a67890abc12345def67890'] };
    expect(() => menuSchema.parse(invalidData)).toThrow(
      'Menu harus diawali dengan hari pertama Ramadhan',
    );
  });

  it('should fail if day is greater than 30', () => {
    const invalidData = { day: 31, buka: ['65a67890abc12345def67890'] };
    expect(() => menuSchema.parse(invalidData)).toThrow('Menu tidak boleh lebih dari 30 hari');
  });

  it('should fail if buka contains an empty string', () => {
    const invalidData = { day: 5, buka: [''] };
    expect(() => menuSchema.parse(invalidData)).toThrow('Harus berupa resep yang valid');
  });

  it('should fail if sahur contains an empty string', () => {
    const invalidData = { day: 5, sahur: [''] };
    expect(() => menuSchema.parse(invalidData)).toThrow('Harus berupa resep yang valid');
  });

  it('should pass if sahur or buka is missing', () => {
    const validData = { day: 5, sahur: ['65a12345abc67890def12345'] };
    expect(() => menuSchema.parse(validData)).not.toThrow();
  });

  it('should fail if sahur is not an array', () => {
    const invalidData = { day: 1, sahur: '65a12345abc67890def12345' };
    expect(() => menuSchema.parse(invalidData)).toThrow();
  });
});
