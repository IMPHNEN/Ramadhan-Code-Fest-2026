'use client'; // WAJIB: Menandakan ini adalah Client Component

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  MapPin,
  Camera,
  Send,
  AlertTriangle,
  Droplets,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js'; // Import tipe data untuk Supabase
import MapPicker from '@/components/map/MapPicker'; // Add this import
import dynamic from 'next/dynamic';

import { z } from 'zod'; // ADDED: Import Zod
import { FloodReportSchema } from '@/lib/schemas'; // ADDED: Import FloodReportSchema

const DynamicMapPicker = dynamic(
  () => import('@/components/map/MapPicker'),
  { ssr: false }
);
import { motion } from 'framer-motion'; // Import motion
import Image from 'next/image';

import { useLanguage } from '@/src/context/LanguageContext';

export default function LaporBanjirPage() {
  const { t } = useLanguage();
  // --- STATE MANAGEMENT ---
  const [location, setLocation] = useState<string>('');
  const [manualLocationInput, setManualLocationInput] = useState<string>(''); // New state for manual input
  const [latitude, setLatitude] = useState<number>(-6.2088); // Default: Jakarta
  const [longitude, setLongitude] = useState<number>(106.8456); // Default: Jakarta
  const [waterLevel, setWaterLevel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [selectedPhoto, setSelectedPhoto] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [errors, setErrors] = useState<z.ZodIssue[]>([]); // ADDED: State for Zod validation errors
  const [predictionResult, setPredictionResult] = useState<number | null>(null); // New state for ML prediction result
  const [predictionRiskLabel, setPredictionRiskLabel] = useState<string | null>(null); // New state for ML prediction risk label

  // ✅ PERBAIKAN: Inisialisasi Supabase hanya satu kali saat komponen pertama kali dimuat.
  const [supabase] = useState<SupabaseClient>(() =>
    createSupabaseBrowserClient(),
  );

  // Opsi tinggi air
  const waterLevelOptions = [
    {
      value: 'semata_kaki',
      label: 'Semata Kaki',
      color: 'text-green-400',
      height: '< 30cm',
    },
    {
      value: 'selutut',
      label: 'Selutut',
      color: 'text-yellow-400',
      height: '30-50cm',
    },
    {
      value: 'sepaha',
      label: 'Sepaha',
      color: 'text-orange-400',
      height: '50-80cm',
    },
    {
      value: 'sepusar',
      label: 'Sepusar',
      color: 'text-red-400',
      height: '80-120cm',
    },
    {
      value: 'lebih_dari_sepusar',
      label: 'Lebih dari Sepusar',
      color: 'text-red-600',
      height: '> 120cm',
    },
  ];

  // Fungsi untuk mencari lokasi berdasarkan input teks
  const handleSearchLocation = async () => {
    if (!manualLocationInput) return;

    setLoading(true);
    setMessage('');
    setMessageType('');
    setErrors([]); // Clear errors on new search

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocationInput)}&format=json&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lon));
        setLocation(display_name);
        setMessage(t('reportFlood.locationFound'));
        setMessageType('success');
      } else {
        setMessage(t('reportFlood.locationNotFound'));
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Error searching location:', error);
      setMessage(`Gagal mencari lokasi: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER UNGGAH FOTO ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optional: Add file size/type validation here if needed
      setSelectedPhoto({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  // --- FUNGSI SUBMIT ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');
    setErrors([]); // Clear previous errors
    setPredictionResult(null); // Clear previous prediction
    setPredictionRiskLabel(null); // Clear previous prediction label

    // Prepare data for Zod validation
    const formData = {
      location: location,
      latitude: latitude,
      longitude: longitude,
      water_level: waterLevel,
      description: description,
      reporter_name: reporterName,
      reporter_contact: reporterContact,
    };

    // Client-side validation with Zod
    const validationResult = FloodReportSchema.safeParse(formData);

    if (!validationResult.success) {
      setErrors(validationResult.error.issues);
      setMessage(t('reportFlood.validationError'));
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // 1. Siapkan data untuk prediksi ML dengan format yang BENAR
      const waterLevelMap: { [key: string]: number } = {
        'semata_kaki': 0,
        'selutut': 1,
        'sepaha': 2,
        'sepusar': 3,
        'lebih_dari_sepusar': 4,
      };
      const numericWaterLevel = waterLevelMap[validationResult.data.water_level];

      // BUAT PAYLOAD DENGAN KEY YANG JELAS, BUKAN 'features'
      const predictionPayload = {
        latitude: validationResult.data.latitude,
        longitude: validationResult.data.longitude,
        water_level: numericWaterLevel,
        // Menambahkan field yang hilang dengan nilai placeholder/derivasi
        curah_hujan_24h: 0, // Placeholder: Anda bisa menambahkan input form untuk ini
        kecepatan_angin: 0, // Placeholder: Anda bisa menambahkan input form untuk ini
        suhu: 28, // Placeholder: Suhu rata-rata, Anda bisa menambahkan input form
        kelembapan: 80, // Placeholder: Kelembapan rata-rata, Anda bisa menambahkan input form
        ketinggian_air_cm: numericWaterLevel * 30, // Derivasi sederhana dari water_level (0=0cm, 1=30cm, 2=60cm, dst.)
        tren_air_6h: 0, // Placeholder: 0=stabil, 1=naik, -1=turun. Anda bisa menambahkan input form
        mdpl: 0, // Placeholder: Meter di atas permukaan laut. Ini bisa didapatkan dari API geocoding
        jarak_sungai_m: 100, // Placeholder: Jarak ke sungai terdekat. Ini bisa didapatkan dari data geografis
        jumlah_banjir_5th: 0, // Placeholder: Jumlah kejadian banjir dalam 5 tahun terakhir di lokasi tersebut
      };

      // 2. Panggil API route Next.js Anda
      const predictionResponse = await fetch('/api/predict-flood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionPayload), // Kirim payload yang sudah benar
      });

      if (!predictionResponse.ok) {
        const errorData = await predictionResponse.json();
        let detailedErrorMessage = 'Error tidak diketahui';
        if (errorData && errorData.detail && Array.isArray(errorData.detail)) {
          detailedErrorMessage = errorData.detail.map((err: any) => {
            const field = err.loc && err.loc.length > 1 ? err.loc[1] : 'unknown field';
            return `${field}: ${err.msg}`;
          }).join('; ');
        } else if (errorData && errorData.message) {
          detailedErrorMessage = errorData.message;
        }
        setMessage(`Gagal mendapatkan prediksi ML: ${detailedErrorMessage}`);
        setMessageType('error');
        setLoading(false); // Stop loading on error
        return; // Exit the function
      }
      const predictionData = await predictionResponse.json();
      // console.log('Prediction data from API:', predictionData); // Log for debugging - REMOVED

      // 3. Tampilkan hasil dari endpoint /predict/flood-potential-xgb
      setPredictionResult(predictionData.probability); // Simpan probabilitas

      // Map API risk labels to more descriptive, user-friendly strings for display
      const riskLabelMap: { [key: string]: string } = {
        'HIGH': t('reportFlood.riskHigh'),
        'MED': t('reportFlood.riskMedium'),
        'LOW': t('reportFlood.riskLow'),
      };

      // Use the map to get the descriptive label, with a fallback to the original label
      const descriptiveRiskLabel = riskLabelMap[predictionData.risk_label] || predictionData.risk_label;

      // Set the descriptive label for display in the UI
      setPredictionRiskLabel(descriptiveRiskLabel);

      setMessage(t('reportFlood.success'));
      setMessageType('success');

      let photoUrl = '';

      // Proses unggah foto (kode Anda di sini sudah benar)
      if (selectedPhoto) {
        const file = selectedPhoto.file;
        const filePath = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('laporan-banjir')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Gagal mengunggah foto: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('laporan-banjir')
          .getPublicUrl(filePath);
        photoUrl = publicUrlData.publicUrl;
      }

      // Simpan data ke Supabase (kode Anda di sini sudah benar)
      const { error: insertError } = await supabase
        .from('laporan_banjir')
        .insert([{
          location: validationResult.data.location,
          latitude: validationResult.data.latitude,
          longitude: validationResult.data.longitude,
          water_level: validationResult.data.water_level,
          description: validationResult.data.description,
          photo_url: photoUrl,
          reporter_name: validationResult.data.reporter_name,
          reporter_contact: validationResult.data.reporter_contact,
          // TAMBAHAN: Simpan hasil prediksi ke database jika perlu
          prediction_risk: predictionData.risk_label,
          prediction_probability: predictionData.probability,
        }]);

      if (insertError) {
        throw insertError;
      }

      // Reset form (kode Anda di sini sudah benar)
      setLocation('');
      setManualLocationInput('');
      setLatitude(-6.2088);
      setLongitude(106.8456);
      setWaterLevel('');
      setDescription('');
      setReporterName('');
      setReporterContact('');
      setSelectedPhoto(null);
      setErrors([]);
    } catch (error: any) {
      console.error('Error submitting report:', error.message);
      setMessage(`Gagal mengirim laporan: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi waktu
  const getCurrentTime = () => {
    return new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to find error message for a field
  const getErrorMessage = (path: string) => {
    const error = errors.find(err => err.path[0] === path);
    return error ? error.message : null;
  };

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-2 sm:p-4 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('common.floodzy')}</h1>
            <p className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">{t('reportFlood.subtitle')}</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{t('reportFlood.title')}</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {t('reportFlood.formDesc')}
          </p>
        </motion.div>
      </motion.div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message Display (for general form errors) */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-4 rounded-lg border ${messageType === 'success' ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-red-900/30 border-red-600 text-red-400'}`}
                >
                  <div className="flex items-center gap-2">
                    {messageType === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <p className="font-medium">{message}</p>
                  </div>
                  {predictionResult !== null && predictionRiskLabel !== null && messageType === 'success' && (
                    <div className="mt-2 text-sm">
                      <p>{t('reportFlood.predictionRisk')}: <span className="font-bold">{predictionRiskLabel}</span></p>
                      <p>{t('reportFlood.predictionProb')}: <span className="font-bold">{(predictionResult * 100).toFixed(2)}%</span></p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Map Picker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  {t('reportFlood.location')} <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <DynamicMapPicker
                  currentPosition={[latitude, longitude]} // Pass current lat/lng
                  onPositionChange={({ lat, lng }) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    // Optionally, reverse geocode here to get location name from coordinates
                  }}
                  onLocationNameChange={setLocation}
                />
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={manualLocationInput}
                    onChange={(e) => setManualLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        handleSearchLocation();
                      }
                    }}
                    placeholder={t('reportFlood.locationPlaceholder')}
                    className={`w-full bg-slate-50 dark:bg-slate-700/80 border rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-12 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all ${getErrorMessage('location') ? 'border-red-500' : 'border-slate-300 dark:border-slate-500/50'}`}
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-200"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                {getErrorMessage('location') && (
                  <p className="text-red-400 text-xs mt-1">{getErrorMessage('location')}</p>
                )}
                {getErrorMessage('latitude') && (
                  <p className="text-red-400 text-xs mt-1">{getErrorMessage('latitude')}</p>
                )}
                {getErrorMessage('longitude') && (
                  <p className="text-red-400 text-xs mt-1">{getErrorMessage('longitude')}</p>
                )}
                <p className="text-xs text-slate-500">
                  {t('reportFlood.mapHint')}
                </p>
              </motion.div>

              {/* Water Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('reportFlood.waterLevel')} <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${getErrorMessage('water_level') ? 'border border-red-500 rounded-lg p-2' : ''}`}>
                  {waterLevelOptions.map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        name="waterLevel"
                        value={option.value}
                        checked={waterLevel === option.value}
                        onChange={(e) => setWaterLevel(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${waterLevel === option.value ? 'border-cyan-500 bg-cyan-100/50 dark:bg-cyan-400/20 dark:border-cyan-400' : 'border-slate-200 dark:border-slate-500/50 bg-slate-50 dark:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-400/70'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm sm:text-base font-medium ${waterLevel === option.value ? 'text-cyan-700 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}
                          >
                            {t(`reportFlood.waterLevelOptions.${option.value}`)}
                          </span>
                          <span className={`text-xs sm:text-sm ${option.color}`}>
                            {option.height}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {getErrorMessage('water_level') && (
                  <p className="text-red-400 text-xs mt-1">{getErrorMessage('water_level')}</p>
                )}
              </motion.div>

              {/* Photo Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  {t('reportFlood.photo')}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {selectedPhoto ? (
                      <div className="flex items-center gap-3">
                        <Image
                          src={selectedPhoto.preview}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="object-contain rounded-lg"
                        />
                        <div>
                          <p className="text-sm sm:text-base text-slate-900 dark:text-white font-medium">
                            {selectedPhoto.file.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {t('reportFlood.photoChange')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400">
                          {t('reportFlood.photoPlaceholder')}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                          {t('reportFlood.photoFormats')}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('reportFlood.descLabel')}
                </label>
                <textarea
                  placeholder={t('reportFlood.descPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full bg-slate-50 dark:bg-slate-700/50 border rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all resize-none ${getErrorMessage('description') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                />
                {getErrorMessage('description') && (
                  <p className="text-red-400 text-xs mt-1">{getErrorMessage('description')}</p>
                )}
              </motion.div>

              {/* Reporter Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" /> {t('reportFlood.reporterName')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('reportFlood.reporterName')}
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-700/50 border rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all ${getErrorMessage('reporter_name') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {getErrorMessage('reporter_name') && (
                    <p className="text-red-400 text-xs mt-1">{getErrorMessage('reporter_name')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-orange-500 dark:text-orange-400" /> {t('reportFlood.reporterContact')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('reportFlood.reporterContact')}
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-700/50 border rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all ${getErrorMessage('reporter_contact') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {getErrorMessage('reporter_contact') && (
                    <p className="text-red-400 text-xs mt-1">{getErrorMessage('reporter_contact')}</p>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                type="submit"
                disabled={loading} // Disable only on loading, validation handled by Zod
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-2.5 px-5 sm:py-3 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                    {t('reportFlood.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> {t('reportFlood.submitButton')}
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">{t('reportFlood.timeTitle')}</h3>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {getCurrentTime()}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('reportFlood.timeZone')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700 rounded-xl p-4"
          >
            <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-3">{t('reportFlood.guideTitle')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="flex items-start gap-2"
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                {t('reportFlood.guide1')}
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="flex items-start gap-2"
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                {t('reportFlood.guide2')}
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="flex items-start gap-2"
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                {t('reportFlood.guide3')}
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                className="flex items-start gap-2"
              >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                {t('reportFlood.guide4')}
              </motion.li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-xl p-4"
          >
            <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t('reportFlood.emergencyContact')}
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">BPBD Jakarta:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {' '}
                  164 / (021) 386 5090
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Damkar:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  113 / (021) 386 5555
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Polri:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {' '}
                  110 / (021) 721 8741{' '}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}