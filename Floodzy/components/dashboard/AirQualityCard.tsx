import { Wind, Leaf, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/src/context/LanguageContext';

interface AirQualityCardProps {
  airQuality: {
    aqi: number;
    level: string;
    pollutant: string;
    recommendation: string;
  };
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const { t } = useLanguage();

  if (!airQuality || !airQuality.level) {
    // Return a placeholder or loading state instead of null
    return (
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/30 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl text-slate-900 dark:text-white">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
          <CardTitle className="flex items-center space-x-2 text-lg font-medium text-slate-900 dark:text-white">
            <div className="p-2 bg-slate-100 dark:bg-gray-500/20 rounded-lg border border-slate-200 dark:border-gray-400/30">
              <Leaf className="h-5 w-5 text-slate-500 dark:text-gray-400" />
            </div>
            <span>{t('airQuality.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4 space-y-4">
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500 dark:text-cyan-400" />
            <p className="ml-2 text-slate-500 dark:text-gray-400">{t('landing.loadingWeather')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  const getAqiLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'baik':
      case 'good':
        return 'text-emerald-400';
      case 'sedang':
      case 'moderate':
        return 'text-yellow-400';
      case 'tidak sehat untuk kelompok sensitif':
      case 'unhealthy for sensitive groups':
        return 'text-orange-400';
      case 'tidak sehat':
      case 'unhealthy':
        return 'text-red-400';
      case 'sangat tidak sehat':
      case 'very unhealthy':
        return 'text-purple-400';
      case 'berbahaya':
      case 'hazardous':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getAqiStatus = (aqi: number) => {
    if (aqi <= 50) return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    if (aqi <= 100) return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (aqi <= 150) return { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' };
    if (aqi <= 200) return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
    if (aqi <= 300) return { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
    return { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' };
  };

  const getDetailedAqiInfo = (level: string) => {
    switch (level.toLowerCase()) {
      case 'baik':
      case 'good':
        return {
          description: t('airQuality.goodDesc'),
          recommendation: t('airQuality.goodRec'),
        };
      case 'sedang':
      case 'moderate':
        return {
          description: t('airQuality.moderateDesc'),
          recommendation: t('airQuality.moderateRec'),
        };
      case 'tidak sehat untuk kelompok sensitif':
      case 'unhealthy for sensitive groups':
        return {
          description: t('airQuality.unhealthySensitiveDesc'),
          recommendation: t('airQuality.unhealthySensitiveRec'),
        };
      case 'tidak sehat':
      case 'unhealthy':
        return {
          description: t('airQuality.unhealthyDesc'),
          recommendation: t('airQuality.unhealthyRec'),
        };
      case 'sangat tidak sehat':
      case 'very unhealthy':
        return {
          description: t('airQuality.veryUnhealthyDesc'),
          recommendation: t('airQuality.veryUnhealthyRec'),
        };
      case 'berbahaya':
      case 'hazardous':
        return {
          description: t('airQuality.hazardousDesc'),
          recommendation: t('airQuality.hazardousRec'),
        };
      default:
        return {
          description: t('airQuality.unavailableDesc'),
          recommendation: t('airQuality.unavailableRec'),
        };
    }
  };

  const aqiStatus = getAqiStatus(airQuality.aqi);
  const detailedAqiInfo = getDetailedAqiInfo(airQuality.level);

  return (
    <Card className="h-full bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/30 backdrop-blur-sm rounded-xl shadow-sm dark:shadow-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-200">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <CardTitle className="flex items-center space-x-2 text-lg font-medium text-slate-900 dark:text-white">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg border border-emerald-200 dark:border-emerald-400/30">
            <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span>{t('airQuality.title')}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-4 space-y-4">
        {/* AQI Main Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${aqiStatus.bg} ${aqiStatus.border} border`}>
              <Wind className={`w-8 h-8 ${aqiStatus.color}`} />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{airQuality.aqi}</span>
                <span className="text-sm text-slate-500 dark:text-gray-400">AQI</span>
              </div>
              <p className={`text-sm font-medium ${getAqiLevelColor(airQuality.level)}`}>
                {airQuality.level}
              </p>
            </div>
          </div>
        </div>

        {/* Pollutant Info */}
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 border border-slate-200 dark:border-slate-600/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-gray-400">{t('airQuality.mainPollutant')}</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{airQuality.pollutant}</span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-teal-500 dark:bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">{t('airQuality.description')}</p>
              <p className="text-sm text-slate-700 dark:text-gray-200 leading-relaxed">{detailedAqiInfo.description}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 mb-1">{t('airQuality.recommendation')}</p>
              <p className="text-sm text-slate-700 dark:text-gray-200 leading-relaxed">{detailedAqiInfo.recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}