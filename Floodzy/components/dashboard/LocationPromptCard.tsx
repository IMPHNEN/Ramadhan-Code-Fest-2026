import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function LocationPromptCard() {
  return (
    <Card className="bg-slate-800/50 border-slate-700/30 backdrop-blur-sm rounded-xl shadow-lg text-white h-full flex flex-col justify-center items-center text-center p-6 hover:bg-slate-800/60 transition-colors duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center space-x-2 text-lg font-medium text-white">
          <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-400/30">
            <MapPin className="h-5 w-5 text-teal-400" />
          </div>
          <span>Pilih Lokasi</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow flex flex-col items-center justify-center space-y-4">
        <p className="text-base text-gray-300 leading-relaxed max-w-xs">
          Pilih lokasi terlebih dahulu untuk melihat
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
            <span>Prakiraan Cuaca</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span>Kualitas Udara</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 flex items-center space-x-2">
          <span>•••</span>
          <span>Mulai dengan memilih lokasi</span>
        </div>
      </CardContent>
    </Card>
  );
}