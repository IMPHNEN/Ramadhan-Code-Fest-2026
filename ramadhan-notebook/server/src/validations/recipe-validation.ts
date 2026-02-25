import { z } from 'zod';

export const recipeSchema = z.object({
  day: z.number(),
  name: z.string().min(1, 'Nama resep tidak boleh kosong'),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, 'Nama bahan tidak boleh kosong'),
      quantity: z.string().min(1, 'Jumlah tidak boleh kosong'),
      description: z.string().optional(),
    }),
  ),
  steps: z.array(
    z.object({
      step_number: z.number().min(1, 'Nomor langkah minimal harus dimulai dari 1'),
      instruction: z.string().min(1, 'Instruksi tidak boleh kosong'),
      description: z.string().optional(),
    }),
  ),
  category: z.enum(['Sahur', 'Buka'], {
    errorMap: () => ({ message: 'Kategori harus Sahur atau Buka puasa' }),
  }),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
