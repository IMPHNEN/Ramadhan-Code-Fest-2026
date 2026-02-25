import { z } from 'zod';

export const FloodReportSchema = z.object({
  location: z.string().min(1, { message: "Lokasi kejadian wajib diisi." }),
  latitude: z.number().min(-90).max(90, { message: "Latitude tidak valid." }),
  longitude: z.number().min(-180).max(180, { message: "Longitude tidak valid." }),
  water_level: z.enum([
    'semata_kaki',
    'selutut',
    'sepaha',
    'sepusar',
    'lebih_dari_sepusar',
  ], { message: "Tinggi air wajib dipilih." }),
  description: z.string().max(500, { message: "Deskripsi tidak boleh lebih dari 500 karakter." }).optional(),
  reporter_name: z.string().max(100, { message: "Nama pelapor tidak boleh lebih dari 100 karakter." }).optional(),
  reporter_contact: z.string().max(100, { message: "Kontak pelapor tidak boleh lebih dari 100 karakter." }).optional().refine((val) => {
    if (!val) return true; // Optional, so no validation if empty
    // Basic email or phone number validation (can be improved)
    const isEmail = val.includes('@');
    if (isEmail) {
      return z.string().email({ message: "Format email tidak valid." }).safeParse(val).success;
    }
    // Simple phone number check (digits and optional +)
    return /^\+?[0-9\s\-()]{7,20}$/.test(val);
  }, { message: "Format kontak tidak valid (email atau nomor telepon)." }),
  // photo_url will be handled separately as it's a file upload, not directly in form data
});

export type FloodReportInput = z.infer<typeof FloodReportSchema>;
