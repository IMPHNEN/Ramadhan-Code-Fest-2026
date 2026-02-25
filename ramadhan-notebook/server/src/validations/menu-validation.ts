import { z } from 'zod';

export const menuSchema = z.object({
  day: z
    .number()
    .min(1, 'Menu harus diawali dengan hari pertama Ramadhan')
    .max(30, 'Menu tidak boleh lebih dari 30 hari'),
  sahur: z.array(z.string().min(1, 'Harus berupa resep yang valid')).optional(),
  buka: z.array(z.string().min(1, 'Harus berupa resep yang valid')).optional(),
});

export type MenuInput = z.infer<typeof menuSchema>;
