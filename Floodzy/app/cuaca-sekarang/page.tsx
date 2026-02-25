import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WeatherPopupContent } from '@/components/weather-shortcut';
import { CloudSun } from 'lucide-react';

export default function CuacaSekarangPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Dialog defaultOpen={true}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start text-base">
            <CloudSun className="mr-2 h-4 w-4" />
            <span>Cuaca Sekarang</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[380px] backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Cuaca Saat Ini</DialogTitle>
            <DialogDescription>
              Informasi cuaca singkat di lokasi Anda.
            </DialogDescription>
          </DialogHeader>
          <WeatherPopupContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}
