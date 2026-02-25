import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AirPollutionData } from '@/types/airPollution';
import { Wind } from 'lucide-react';

interface AirQualityDisplayProps {
  data: AirPollutionData | null;
  loading: boolean;
  error: string | null;
}

export function AirQualityDisplay({
  data,
  loading,
  error,
}: AirQualityDisplayProps) {
  if (loading) {
    return <div>Loading air quality data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wind className="h-5 w-5 text-primary" />
          <span>Air Quality</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>PM2.5:</strong> {data.components.pm2_5} µg/m³
          </div>
          <div>
            <strong>PM10:</strong> {data.components.pm10} µg/m³
          </div>
          <div>
            <strong>O₃:</strong> {data.components.o3} µg/m³
          </div>
          <div>
            <strong>CO:</strong> {data.components.co} µg/m³
          </div>
          <div>
            <strong>NO₂:</strong> {data.components.no2} µg/m³
          </div>
          <div>
            <strong>SO₂:</strong> {data.components.so2} µg/m³
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
