'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import { SelectedLocation } from '@/types/location';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: SelectedLocation) => void;
  initialLocation?: SelectedLocation | null;
}

export function LocationPickerModal({ isOpen, onClose, onSave, initialLocation }: LocationPickerModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(initialLocation || null);

  useEffect(() => {
    setSelectedLocation(initialLocation || null);
  }, [initialLocation, isOpen]);

  const handleSave = () => {
    if (selectedLocation) {
      onSave(selectedLocation);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle>Pilih Lokasi</DialogTitle>
          <DialogDescription>
            Cari dan pilih lokasi dari peta atau daftar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RegionDropdown
            onSelectDistrict={setSelectedLocation}
            selectedLocation={selectedLocation}
          />
          {selectedLocation && (
            <p className="mt-4 text-sm text-muted-foreground">
              Lokasi terpilih: <strong>{selectedLocation.districtName}</strong>
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Batal</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!selectedLocation}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
