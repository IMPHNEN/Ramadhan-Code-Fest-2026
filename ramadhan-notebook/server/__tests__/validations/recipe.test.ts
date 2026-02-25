import { recipeSchema } from '../../src/validations/recipe-validation';
import { expect, describe, it } from '@jest/globals';

describe('Recipe Schema Validation', () => {
  const validData = {
    _id: '65a12345abc67890def12345',
    day: 1,
    name: 'Nasi Goreng',
    ingredients: [
      { name: 'Beras', quantity: '1 cup' },
      { name: 'Garam', quantity: '1 sdt', description: 'Menambah rasa' },
    ],
    steps: [
      { step_number: 1, instruction: 'Masak nasi hingga matang.' },
      {
        step_number: 2,
        instruction: 'Tambahkan garam dan aduk rata.',
        description: 'Garam memperkuat cita rasa.',
      },
    ],
    category: 'Sahur',
  };

  it('should pass with valid data', () => {
    expect(() => recipeSchema.parse(validData)).not.toThrow();
  });

  it('should fail if name is empty', () => {
    const invalidData = { ...validData, name: '' };
    expect(() => recipeSchema.parse(invalidData)).toThrow('Nama resep tidak boleh kosong');
  });

  it('should fail if an ingredient has an empty name', () => {
    const invalidData = {
      ...validData,
      ingredients: [{ name: '', quantity: '1 sdt' }],
    };
    expect(() => recipeSchema.parse(invalidData)).toThrow('Nama bahan tidak boleh kosong');
  });

  it('should fail if a step has an invalid step_number', () => {
    const invalidData = {
      ...validData,
      steps: [{ step_number: 0, instruction: 'Masak nasi hingga matang.' }],
    };
    expect(() => recipeSchema.parse(invalidData)).toThrow(
      'Nomor langkah minimal harus dimulai dari 1',
    );
  });

  it('should fail if category is not Sahur or Buka puasa', () => {
    const invalidData = { ...validData, category: 'Dinner' };
    expect(() => recipeSchema.parse(invalidData)).toThrow('Kategori harus Sahur atau Buka puasa');
  });
});
