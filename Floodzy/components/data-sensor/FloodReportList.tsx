'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import Image from 'next/image';

const classifyWaterLevel = (waterLevel: number): string => {
  if (waterLevel <= 10) {
    return 'Semata kaki';
  } else if (waterLevel <= 40) {
    return 'Selutut';
  } else if (waterLevel <= 70) {
    return 'Sepaha';
  } else if (waterLevel <= 100) {
    return 'Sepusar';
  } else {
    return 'Lebih dari sepusar';
  }
};

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const classifyWaterLevelString = (waterLevelString: string): string => {
  switch (waterLevelString) {
    case 'semata_kaki':
      return 'Semata kaki';
    case 'selutut':
      return 'Selutut';
    case 'sepaha':
      return 'Sepaha';
    case 'sepusar':
      return 'Sepusar';
    case 'lebih_dari_sepusar':
      return 'Lebih dari sepusar';
    default:
      return 'Tidak diketahui';
  }
};

interface FloodReport {
  id: string;
  reporter_name: string | null;
  location: string;
  water_level: string;
  created_at: string;
  description: string | null;
  photo_url: string | null;
}

const FloodReportList: React.FC = () => {
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('laporan_banjir')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10); // Ambil 10 laporan terbaru

        if (error) {
          throw error;
        }

        setReports(data as FloodReport[]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8"><CardContent>Memuat laporan...</CardContent></Card>;
  }

  if (error) {
    return <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8"><CardContent>Error: {error}</CardContent></Card>;
  }

  const filteredReports = reports.filter(report => {
    if (filter === 'all') {
      return true;
    }
    return classifyWaterLevelString(report.water_level) === filter;
  });

  return (
    <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Laporan Banjir Terbaru</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Ketinggian Air" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ketinggian</SelectItem>
            <SelectItem value="Semata kaki">Semata kaki</SelectItem>
            <SelectItem value="Selutut">Selutut</SelectItem>
            <SelectItem value="Sepaha">Sepaha</SelectItem>
            <SelectItem value="Sepusar">Sepusar</SelectItem>
            <SelectItem value="Lebih dari sepusar">Lebih dari sepusar</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredReports.length === 0 ? (
          <p>Tidak ada laporan banjir saat ini.</p>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                <p className="text-lg font-semibold">Lokasi: {report.location}</p>
                <p>Pelapor: {report.reporter_name || 'Anonim'}</p>
                <p>Deskripsi Singkat: {report.description || 'Tidak ada deskripsi'}</p>
                <p>Tinggi Air: {classifyWaterLevelString(report.water_level)}</p>
                <p>Waktu Laporan: {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</p>
                {report.photo_url && (
                                    <div className="relative w-48 h-48 mt-2"> {/* Added a relative parent with fixed size */}
                                        <Image src={report.photo_url} alt="Foto Laporan" fill className="object-cover rounded-md" unoptimized />
                                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloodReportList;
