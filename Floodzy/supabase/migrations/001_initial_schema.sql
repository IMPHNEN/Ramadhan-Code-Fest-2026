-- Create Evacuation Locations Table
CREATE TABLE IF NOT EXISTS public.evacuation_locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    capacity_current INT NOT NULL DEFAULT 0,
    capacity_total INT NOT NULL DEFAULT 0,
    facilities TEXT[] DEFAULT '{}',
    contact_person TEXT,
    contact_phone TEXT,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Create Flood Reports Table
CREATE TABLE IF NOT EXISTS public.laporan_banjir (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    location TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    water_level INT,
    description TEXT,
    photo_url TEXT,
    reporter_name TEXT,
    reporter_contact TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Mock Data into Evacuation Locations
-- Insert Mock Data into Evacuation Locations
INSERT INTO public.evacuation_locations 
(name, address, latitude, longitude, capacity_current, capacity_total, facilities, contact_person, contact_phone, last_updated)
VALUES
('GOR Otista', 'Jl. Otto Iskandardinata No.121, Jatinegara, Jakarta Timur', -6.228, 106.869, 150, 200, '["Tenda","Dapur Umum","MCK","Pos Medis"]'::jsonb, 'Bapak Agus', '0812-3456-7890', now() - interval '1 hour'),
('SDN Kampung Melayu 01', 'Jl. Kebon Pala I No.25, Kampung Melayu, Jakarta Timur', -6.225, 106.855, 80, 100, '["Ruang Kelas","MCK","Air Bersih"]'::jsonb, 'Ibu Retno', '0812-1111-2222', now() - interval '3 hours'),
('Gedung Serbaguna Unesa', 'Jl. Lidah Wetan, Lakarsantri, Surabaya', -7.2892, 112.6742, 250, 300, '["Aula Besar","Dapur Umum","Pos Medis"]'::jsonb, 'Bapak Hartono', '0813-1234-5678', now() - interval '2 hours'),
('Balai RW 05 Rungkut', 'Jl. Rungkut Asri Tengah, Rungkut, Surabaya', -7.3298, 112.7851, 45, 50, '["Pendopo","MCK"]'::jsonb, 'Ketua RW 05', '0819-8765-4321', now() - interval '8 hours'),
('Sabuga ITB', 'Jl. Tamansari No.73, Bandung', -6.8915, 107.6105, 500, 750, '["Aula","Dapur Umum","Pos Medis","Area Bermain Anak"]'::jsonb, 'Manajemen Sabuga', '022-250-1234', now() - interval '4 hours'),
('Kantor Kecamatan Baleendah', 'Jl. Adipati Agung No. 25, Baleendah, Kab. Bandung', -7.0094, 107.6282, 120, 150, '["Ruang Rapat","MCK","Dapur Umum"]'::jsonb, 'BPBD Kab. Bandung', '022-592-8113', now() - interval '1 hour'),
('GOR Mini Dispora Sumut', 'Jl. Williem Iskandar, Medan', 3.6318, 98.7075, 180, 250, '["Lapangan Indoor","MCK","Pos Medis"]'::jsonb, 'Dispora Sumut', '061-123-4567', now() - interval '12 hours'),
('Asrama Haji Sudiang', 'Jl. Asrama Haji, Sudiang, Makassar', -5.0777, 119.5311, 400, 500, '["Kamar","Aula","Dapur Umum","MCK"]'::jsonb, 'UPT Asrama Haji', '0411-551-234', now() - interval '1 day'),
('Masjid Agung Jawa Tengah', 'Jl. Gajahraya, Sambirejo, Gayamsari, Semarang', -6.9859, 110.4451, 300, 400, '["Aula Masjid","MCK","Dapur Umum"]'::jsonb, 'Takmir Masjid', '024-672-5412', now() - interval '6 hours'),
('Gedung DPRD Provinsi Sumsel', 'Jl. Kapten A. Rivai, Lorok Pakjo, Palembang', -2.9715, 104.7451, 200, 250, '["Ruang Rapat Paripurna","MCK","Pos Medis"]'::jsonb, 'Sekretariat DPRD', '0711-352-123', now() - interval '10 hours'),
('SKB Mulawarman', 'Jl. Mulawarman, Teluk Dalam, Banjarmasin', -3.3186, 114.5893, 90, 120, '["Aula","MCK","Dapur Umum"]'::jsonb, 'BPBD Kota Banjarmasin', '0511-335-5113', now() - interval '5 hours'),
('Pontianak Convention Center', 'Jl. Sultan Syarif Abdurrahman, Pontianak', -0.0458, 109.3422, 350, 500, '["Exhibition Hall","MCK","Pos Medis"]'::jsonb, 'Manajemen PCC', '0561-765-432', now() - interval '18 hours'),
('GOR Lila Bhuana', 'Jl. Melati, Dangin Puri Kangin, Denpasar', -8.6548, 115.2217, 150, 200, '["Lapangan Indoor","MCK"]'::jsonb, 'Disdikpora Denpasar', '0361-222-333', now() - interval '2 days'),
('Jogja Expo Center (JEC)', 'Jl. Raya Janti, Banguntapan, Bantul', -7.7971, 110.4080, 800, 1000, '["Hall Pameran","Dapur Umum","Pos Medis","MCK"]'::jsonb, 'Manajemen JEC', '0274-454-123', now() - interval '1 hour'),
('Gedung Olahraga Remaja', 'Jl. Jenderal Sudirman, Simpang Tiga, Pekanbaru', 0.4761, 101.4533, 220, 300, '["GOR","MCK","Dapur Lapangan"]'::jsonb, 'BPBD Riau', '0761-123-911', now() - interval '9 hours'),
('Balai Diklat Keagamaan Manado', 'Jl. A.A. Maramis, Kairagi Weru, Manado', 1.5089, 124.8812, 100, 150, '["Asrama","Aula","MCK"]'::jsonb, 'Kementerian Agama', '0431-811-234', now() - interval '3 days'),
('GOR Flobamora Oepoi', 'Jl. W. J. Lalamentik, Oebufu, Kupang', -10.1644, 123.6113, 180, 200, '["GOR","MCK","Posko Bantuan"]'::jsonb, 'BPBD NTT', '0380-833-111', now() - interval '7 hours'),
('Stadion Mandala', 'Jl. Raya Mandala, Dok V, Jayapura', -2.5378, 140.7133, 500, 600, '["Tribun","MCK","Dapur Umum","Pos Medis"]'::jsonb, 'Dispora Papua', '0967-533-777', now() - interval '15 hours'),
('LPMP Provinsi Maluku', 'Jl. Tihu, Wailela, Teluk Ambon', -3.6572, 128.1781, 130, 150, '["Wisma","Aula","MCK"]'::jsonb, 'LPMP Maluku', '0911-361-888', now() - interval '2 hours'),
('Islamic Center NTB', 'Jl. Udayana, Gomong, Selaparang, Mataram', -8.5823, 116.1045, 600, 800, '["Aula Masjid","MCK","Dapur Umum","Pos Medis"]'::jsonb, 'Pengurus Islamic Center', '0370-617-0123', now() - interval '4 hours'),
('GOR H. Agus Salim', 'Jl. Rasuna Said, Rimbo Kaluang, Padang', -0.9278, 100.3525, 280, 400, '["GOR","MCK","Dapur Umum","Pos Medis"]'::jsonb, 'BPBD Kota Padang', '0751-123-456', now() - interval '6 hours'),
('GOR Segiri', 'Jl. Kesuma Bangsa, Bugis, Samarinda', -0.4983, 117.1444, 190, 250, '["GOR","MCK","Posko Bantuan"]'::jsonb, 'Dispora Samarinda', '0541-741-234', now() - interval '22 hours'),
('Gedung Juang 45', 'Jl. Jenderal Sudirman No.1, Sumurpecung, Serang', -6.1186, 106.1549, 75, 100, '["Aula","MCK"]'::jsonb, 'Dinsos Serang', '0254-200-123', now() - interval '3 hours'),
('Aula Kantor Gubernur Sultra', 'Jl. Halu Oleo, Mokoau, Kendari', -3.9931, 122.5167, 200, 250, '["Aula","MCK","Dapur Umum"]'::jsonb, 'Biro Umum Setda Sultra', '0401-312-888', now() - interval '1 day'),
('Gedung Olahraga Siranindi', 'Jl. Moh. Hatta, Lolu Utara, Palu', -0.9007, 119.8756, 150, 200, '["GOR","MCK","Pos Medis"]'::jsonb, 'BPBD Kota Palu', '0451-421-112', now() - interval '5 hours'),
('Museum Tsunami Aceh', 'Jl. Sultan Iskandar Muda, Sukaramai, Banda Aceh', 5.5483, 95.3142, 300, 400, '["Area Pameran","MCK","Pos Medis"]'::jsonb, 'Manajemen Museum', '0651-35-111', now() - interval '1 hour'),
('Pusat Pemerintahan Kota Tangerang', 'Jl. Satria Sudirman No. 1, Sukaasih, Tangerang', -6.1783, 106.6319, 250, 300, '["Aula","MCK","Dapur Umum"]'::jsonb, 'BPBD Kota Tangerang', '021-557-91-113', now() - interval '2 hours'),
('Stadion Patriot Candrabhaga', 'Jl. Guntur, Kayuringin Jaya, Bekasi', -6.2431, 106.9945, 1000, 1500, '["Tribun","MCK","Dapur Umum","Pos Medis"]'::jsonb, 'Dispora Bekasi', '021-889-54-321', now() - interval '2 days'),
('Balai Kota Depok', 'Jl. Margonda Raya No.54, Depok', -6.3933, 106.8245, 150, 200, '["Aula","MCK","Pos Medis"]'::jsonb, 'BPBD Kota Depok', '021-777-55-113', now() - interval '8 hours'),
('GOR Pajajaran', 'Jl. Pemuda No.4, Tanah Sareal, Bogor', -6.5826, 106.7912, 300, 400, '["GOR","MCK","Dapur Umum"]'::jsonb, 'Dispora Bogor', '0251-833-12-34', now() - interval '12 hours'),
('Alun-Alun Kota Cilegon', 'Jl. Jenderal Sudirman, Ramanuju, Cilegon', -6.0181, 106.0582, 50, 100, '["Tenda Lapangan","MCK Mobile"]'::jsonb, 'BPBD Cilegon', '0254-39-111-3', now() - interval '2 hours'),
('Gedung Serbaguna Pemda Karawang', 'Jl. Ahmad Yani No.1, Karawang', -6.3025, 107.3063, 200, 250, '["Aula","MCK","Dapur Umum"]'::jsonb, 'BPBD Karawang', '0267-40-111-3', now() - interval '6 hours'),
('Bale Yudistira', 'Jl. K.K Singawinata, Nagri Kaler, Purwakarta', -6.5517, 107.4439, 100, 150, '["Pendopo","MCK"]'::jsonb, 'BPBD Purwakarta', '0264-20-111-3', now() - interval '1 hour'),
('GOR Dharma Ayu', 'Jl. Olahraga, Karanganyar, Indramayu', -6.3333, 108.3264, 150, 200, '["GOR","MCK","Dapur Umum"]'::jsonb, 'BPBD Indramayu', '0234-27-111-3', now() - interval '1 day'),
('Stadion Bima', 'Jl. Brigjen Dharsono, Sunyaragi, Cirebon', -6.7333, 108.5333, 400, 500, '["Tribun","MCK","Dapur Umum","Pos Medis"]'::jsonb, 'BPBD Kota Cirebon', '0231-48-111-3', now() - interval '3 hours')
ON CONFLICT DO NOTHING;

