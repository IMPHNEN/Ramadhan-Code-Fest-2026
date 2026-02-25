'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useDebounce } from '@/hooks/useDebounce';
import { getCoordsByLocationName } from '@/lib/geocodingService';
import { useAppStore } from '@/lib/store';
import { MapPin, Loader2 } from 'lucide-react';
import { GeocodingResponse } from '@/types/geocoding';
import { MapBounds, SelectedLocation } from '@/types';

interface CommandMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CommandMenu({ isOpen, setIsOpen }: CommandMenuProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [results, setResults] = React.useState<GeocodingResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const { setSelectedLocation, setMapBounds } = useAppStore();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  React.useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      const fetchLocations = async () => {
        setIsLoading(true);
        const searchResults = await getCoordsByLocationName(debouncedSearchQuery, 5);
        setResults(searchResults || []);
        setIsLoading(false);
      };
      fetchLocations();
    } else {
      setResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleSelect = (location: GeocodingResponse) => {
    const { lat, lon, name, state, country } = location;
    
    const newSelectedLocation: SelectedLocation = {
      provinceName: state || country || '',
      districtName: name,
      latitude: lat,
      longitude: lon,
    };
    setSelectedLocation(newSelectedLocation);

    const buffer = 0.1;
    const newMapBounds: MapBounds = {
      center: [lat, lon],
      zoom: 11,
      bounds: [[lat - buffer, lon - buffer], [lat + buffer, lon + buffer]],
    };
    setMapBounds(newMapBounds);

    setIsOpen(false);
    router.push('/');
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder="Ketik nama kota atau provinsi..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>{isLoading ? 'Mencari...' : 'Tidak ada hasil ditemukan.'}</CommandEmpty>
        {isLoading && (
            <div className="p-4 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )}
        {!isLoading && results.length > 0 && (
          <CommandGroup heading="Saran Lokasi">
            {results.map((location) => (
              <CommandItem
                key={`${location.lat}-${location.lon}`}
                onSelect={() => handleSelect(location)}
                value={`${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}`}
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>{`${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}`}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
