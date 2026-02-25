import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Info,
  MapPin,
  Calendar,
  Zap,
  DollarSign,
  Users,
  Grid,
  List,
  ChevronUp,
  ChevronDown,
  CloudRain,
  LandPlot,
  Waves,
  Activity,
  FileSearch,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { HistoricalIncident } from '../statistika.types';
import { useLanguage } from '@/src/context/LanguageContext';

const getIncidentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'banjir':
      return CloudRain;
    case 'tanah longsor':
      return LandPlot;
    case 'tsunami':
      return Waves;
    default:
      return Activity;
  }
};

const getSeverityColor = (severity: number) => {
  if (severity >= 9) return {
    bg: 'bg-red-100 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-500/30',
    glow: 'shadow-red-500/20'
  };
  if (severity >= 7) return {
    bg: 'bg-orange-100 dark:bg-orange-500/15',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-500/30',
    glow: 'shadow-orange-500/20'
  };
  if (severity >= 4) return {
    bg: 'bg-yellow-100 dark:bg-yellow-500/15',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-500/30',
    glow: 'shadow-yellow-500/20'
  };
  return {
    bg: 'bg-emerald-100 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    glow: 'shadow-emerald-500/20'
  };
};

interface StatistikHistoricalProps {
  filteredIncidents: HistoricalIncident[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: 'date' | 'severity' | 'type';
  setSortBy: (value: 'date' | 'severity' | 'type') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (value: 'grid' | 'list') => void;
}

export default function StatistikHistorical({
  filteredIncidents,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
}: StatistikHistoricalProps) {
  const { t, lang } = useLanguage();
  return (
    <motion.div
      key="historical"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/20">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800/40 dark:via-slate-700/30 dark:to-slate-800/40 border-b border-slate-200 dark:border-slate-700/50 p-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center group">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 mr-3 group-hover:bg-indigo-300/30 dark:group-hover:bg-indigo-500/30 transition-all duration-300">
                  <History className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <span className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {t('statistika.historical.title')}
                </span>
              </CardTitle>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 ml-14">
                {filteredIncidents.length} {t('statistika.historical.found')}
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Enhanced Search Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('statistika.historical.searchPlaceholder')}
                  className="w-full sm:w-72 pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:border-cyan-500/50 dark:focus:border-cyan-400/50 focus:bg-white dark:focus:bg-slate-800/70 transition-all duration-300 shadow-sm dark:shadow-lg backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Enhanced Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative group">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors duration-300" />
                  <select
                    className="appearance-none pl-10 pr-8 py-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:border-cyan-500/50 dark:focus:border-cyan-400/50 focus:bg-white dark:focus:bg-slate-800/70 transition-all duration-300 shadow-sm dark:shadow-lg cursor-pointer min-w-[120px]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'severity' | 'type')}
                  >
                    <option value="date" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('statistika.historical.sort.date')}</option>
                    <option value="severity" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('statistika.historical.sort.severity')}</option>
                    <option value="type" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('statistika.historical.sort.type')}</option>
                  </select>
                </div>

                {/* Sort Order Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500/50 transition-all duration-300 shadow-sm dark:shadow-lg group"
                >
                  <motion.div
                    animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  </motion.div>
                </Button>

                {/* View Mode Toggle */}
                <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800/30 shadow-sm dark:shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-none transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-none transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {filteredIncidents.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center py-16"
            >
              <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-600/30 shadow-2xl">
                <FileSearch className="w-12 h-12 text-slate-400 dark:text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">{t('statistika.historical.noData.title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {t('statistika.historical.noData.desc')}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {filteredIncidents.map((incident, index) => {
                    const IncidentIcon = getIncidentIcon(incident.type);
                    const severityColors = getSeverityColor(incident.severity);

                    return (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group"
                      >
                        <Card className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/30 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 group-hover:bg-indigo-200/50 dark:group-hover:bg-indigo-500/30 transition-all duration-300">
                                  <IncidentIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-100 mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                                    {t(`statistika.types.${incident.type.toLowerCase()}`) || incident.type}
                                  </h3>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                    <span className="truncate">{incident.location}</span>
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${severityColors.bg} ${severityColors.text} ${severityColors.border} shadow-lg ${severityColors.glow} whitespace-nowrap`}
                              >
                                {t('statistika.historical.card.level')} {incident.severity}
                              </span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                              {incident.description}
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                <Calendar className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                <span className="font-medium">
                                  {new Date(incident.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              {incident.evacuees && (
                                <div className="flex items-center text-sm">
                                  <Users className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                  <span className="font-semibold text-orange-700 dark:text-orange-300">
                                    {incident.evacuees.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} {t('statistika.historical.card.evacuees')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  {filteredIncidents.map((incident, index) => {
                    const IncidentIcon = getIncidentIcon(incident.type);
                    const severityColors = getSeverityColor(incident.severity);

                    return (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className="group"
                      >
                        <Card className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/30 transform hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 group-hover:bg-indigo-200/50 dark:group-hover:bg-indigo-500/30 transition-all duration-300">
                                  <IncidentIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-300" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300 mb-1 truncate">
                                      {t(`statistika.types.${incident.type.toLowerCase()}`) || incident.type} {t('statistika.historical.card.at')} {incident.location}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                                      <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1 text-purple-600 dark:text-purple-400" />
                                        {new Date(incident.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                      </span>
                                      {incident.evacuees && (
                                        <span className="flex items-center font-medium text-orange-700 dark:text-orange-300">
                                          <Users className="w-4 h-4 mr-1 text-orange-600 dark:text-orange-400" />
                                          {incident.evacuees.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} {t('statistika.historical.card.evacuees')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${severityColors.bg} ${severityColors.text} ${severityColors.border} shadow-lg ${severityColors.glow} whitespace-nowrap`}
                                  >
                                    {t('statistika.historical.card.level')} {incident.severity}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                                  {incident.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}