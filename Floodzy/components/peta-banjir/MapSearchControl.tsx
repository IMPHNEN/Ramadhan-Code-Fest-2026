'use client';

import React, { useState } from 'react';
// Hapus semua impor 'react-leaflet', 'leaflet', dan 'createPortal'
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MapSearchControlProps {
  onSearch: (query: string) => void;
}

const MapSearchControl: React.FC<MapSearchControlProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // PERBAIKAN: Hapus 'div' luar.
  // Semua kelas positioning, responsive, dan styling
  // sekarang ada di elemen <form>
  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`
        /* --- PERBAIKAN: Positioning & Responsive --- */
        absolute top-20 left-4 right-4 z-[1000] 
        sm:right-auto sm:w-72 md:w-80
        pointer-events-auto

        /* --- UI IMPROVEMENT: Glassmorphism (Tetap ada) --- */
        relative overflow-hidden rounded-2xl
        backdrop-blur-2xl bg-blue-100/20 dark:bg-blue-900/20
        shadow-lg dark:shadow-2xl
        border border-blue-200/30 dark:border-blue-700/30
        
        /* --- UI IMPROVEMENT: Transisi Halus (Tetap ada) --- */
        transition-all duration-300 ease-out
        ${
          isFocused
            ? 'shadow-xl dark:shadow-cyan-900/50 scale-[1.01]'
            : 'dark:shadow-gray-900/50'
        }
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />

      {/* Content */}
      <div className="relative flex items-center gap-2 pl-4 pr-3 py-2.5">
        {/* Search Icon with animation */}
        <div
          className={`
            transition-all duration-300
            ${isFocused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}
          `}
        >
          <Search className="h-5 w-5" strokeWidth={2.5} />
        </div>

        {/* Input Field */}
        <Input
          type="text"
          placeholder="Cari wilayah atau lokasi..."
          className="
            /* --- UI IMPROVEMENT: Input Transparan (Tetap ada) --- */
            flex-1 w-full border-0 bg-transparent
            p-0 text-base font-medium
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent
            !border-transparent !ring-transparent !ring-offset-transparent
            focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!border-transparent
          "
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>

      {/* Bottom highlight line */}
      <div
        className={`
          absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400
          transition-all duration-500 ease-out
          ${
            isFocused
              ? 'w-full opacity-100'
              : 'w-1/2 opacity-0 -translate-x-1/2'
          }
        `}
        style={{ left: isFocused ? '0' : '50%' }}
      />
    </form>
  );
};

export default MapSearchControl;
