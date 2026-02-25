-- supabase/seed.sql

-- Pastikan extension ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat tipe ENUM untuk status insiden kalau belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE public.incident_status AS ENUM (
            'resolved',
            'ongoing',
            'monitoring'
        );
    END IF;
END$$;

-- Buat tipe ENUM untuk level peringatan kalau belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_level') THEN
        CREATE TYPE public.alert_level AS ENUM (
            'Rendah',
            'Sedang',
            'Tinggi'
        );
    END IF;
END$$;

-- Buat tabel historical_incidents kalau belum ada
CREATE TABLE IF NOT EXISTS public.historical_incidents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL,
    location text NOT NULL,
    date timestamptz NOT NULL,
    description text,
    severity smallint NOT NULL CHECK (severity >= 1 AND severity <= 10),
    impact_areas text[],
    duration_hours integer,
    reported_losses bigint,
    casualties integer,
    evacuees integer,
    damage_level text,
    response_time_minutes integer,
    status public.incident_status NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Buat tabel alerts kalau belum ada
CREATE TABLE IF NOT EXISTS public.alerts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    level public.alert_level NOT NULL,
    location text NOT NULL,
    reason text NOT NULL,
    details text,
    affected_areas text[],
    estimated_population integer,
    severity smallint CHECK (severity >= 1 AND severity <= 10),
    created_at timestamptz DEFAULT now() NOT NULL
);


-- Hapus data lama biar tidak double
TRUNCATE TABLE public.historical_incidents, public.alerts RESTART IDENTITY CASCADE;

-- Masukkan data awal untuk historical_incidents
INSERT INTO public.historical_incidents (type, location, date, description, severity, impact_areas, duration_hours, reported_losses, casualties, evacuees, damage_level, response_time_minutes, status)
VALUES
('Banjir','Sungai Ciliwung, Jakarta','2024-01-15T08:00:00Z','Banjir parah di bantaran Sungai Ciliwung akibat hujan deras dan luapan waduk. Ketinggian air mencapai 2 meter di beberapa titik.',9,ARRAY['Kampung Melayu','Cawang','Rawajati'],48,5000000000,2,1250,'Parah',45,'resolved'),
('Gempa Bumi','Malang, Jawa Timur','2023-11-20T14:30:00Z','Gempa bumi berkekuatan M 6.5 dirasakan kuat di Malang dan sekitarnya. Menyebabkan kerusakan ringan pada beberapa bangunan.',7,ARRAY['Pusat Kota Malang','Kepanjen'],NULL,1000000000,0,450,'Ringan',30,'resolved'),
('Tanah Longsor','Puncak, Bogor','2024-03-01T06:00:00Z','Longsor menutup akses jalan utama Puncak setelah hujan semalaman. Tidak ada korban jiwa, namun lalu lintas terganggu.',6,ARRAY['Cisarua','Megamendung'],72,500000000,0,120,'Sedang',60,'resolved');

-- Masukkan data awal untuk alerts
INSERT INTO public.alerts (level, location, reason, severity, affected_areas, estimated_population)
VALUES
('Tinggi', 'Bendung Katulampa', 'TMA (Tinggi Muka Air) terpantau 210 cm (Siaga 1), tren naik.', 9, ARRAY['Rawajati', 'Cawang', 'Bidara Cina'], 14850),
('Sedang', 'Pintu Air Manggarai', 'Ketinggian air 850 cm (Siaga 3), debit air meningkat dari arah Depok.', 7, ARRAY['Bukit Duri', 'Kampung Melayu', 'Grogol'], 8230),
('Rendah', 'Pos Angke Hulu', 'TMA 150 cm (Siaga 4), kondisi saat ini masih terpantau normal.', 4, ARRAY['Cengkareng', 'Kembangan', 'Pesing'], 2477),
('Sedang', 'Kali Sunter', 'Terjadi kenaikan debit air signifikan pasca hujan lokal di area hulu.', 6, ARRAY['Kelapa Gading Barat', 'Sunter Jaya'], 6150),
('Tinggi', 'Waduk Pluit', 'Pompa air diaktifkan untuk mengurangi volume air kiriman dari BKB.', 8, ARRAY['Penjaringan', 'Muara Angke', 'Kapuk Muara'], 11780),
('Rendah', 'Cipinang Hulu', 'Aliran deras namun masih dalam batas aman, tinggi air 130 cm.', 3, ARRAY['Makasar', 'Cipinang Melayu'], 1520),
('Tinggi', 'Kali Krukut', 'Luapan air mulai menggenangi Jalan Kemang Raya, lalu lintas terganggu.', 9, ARRAY['Kemang', 'Cipete Selatan', 'Pela Mampang'], 11240),
('Sedang', 'Pesanggrahan', 'Ketinggian air naik 50cm dalam 1 jam terakhir, warga diimbau waspada.', 7, ARRAY['Bintaro', 'Cipulir', 'Ulujami'], 7490),
('Tinggi', 'Jembatan Ciliwung Depok', 'Hujan deras di area hulu, debit Ciliwung naik tajam ke level Siaga 2.', 8, ARRAY['Pondok Cina', 'Margonda', 'Beji'], 9300),
('Rendah', 'Kali Bekasi', 'Status Siaga 4, TMA 310 cm. Kondisi masih aman terkendali.', 2, ARRAY['Bekasi Barat', 'Bekasi Timur'], 3100),
('Sedang', 'Sungai Cisadane, Tangerang', 'Cisadane meluap di beberapa titik, terutama di area dataran rendah.', 6, ARRAY['Cikokol', 'Karawaci', 'Batuceper'], 5650),
('Tinggi', 'Puncak, Bogor', 'Peringatan dini dari BMKG: potensi hujan badai dan longsor.', 9, ARRAY['Cisarua', 'Gadog', 'Ciawi'], 10500),
('Sedang', 'Kali Grogol', 'Ketinggian air waspada (Siaga 3), potensi genangan di underpass.', 7, ARRAY['Grogol', 'Petamburan', 'Jelambar'], 8450),
('Rendah', 'Kali Item', 'Aliran terpantau normal, tidak ada kenaikan signifikan. TMA 80 cm.', 3, ARRAY['Senen', 'Johar Baru', 'Kemayoran'], 2150),
('Tinggi', 'Banjir Kanal Barat', 'Pintu air Karet dibuka untuk mengalirkan debit ke laut. Siaga 2.', 8, ARRAY['Tanah Abang', 'Roxy', 'Petojo'], 13200);
