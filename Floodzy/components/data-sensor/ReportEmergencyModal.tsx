'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

const ReportEmergencyModal = () => {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmitReport = () => {
    if (!location || !description || !contact) {
      toast.error('Harap lengkapi semua kolom.');
      return;
    }

    console.log('Emergency Report:', { location, description, contact });
    toast.success('Laporan darurat berhasil dikirim. Tim terkait akan segera menindaklanjuti.');
    setIsOpen(false);
    setLocation('');
    setDescription('');
    setContact('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full justify-start text-left">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Laporkan Darurat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Laporkan Situasi Darurat</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah ini untuk melaporkan situasi darurat terkait banjir.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Lokasi
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              placeholder="Contoh: Jl. Raya No. 12, Jakarta"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Jelaskan situasi darurat secara singkat (misal: ketinggian air, jumlah korban, dll.)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Kontak
            </Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="col-span-3"
              placeholder="Nomor telepon atau email yang bisa dihubungi"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmitReport}>
            Kirim Laporan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportEmergencyModal;
