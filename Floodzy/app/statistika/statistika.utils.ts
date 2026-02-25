import { HistoricalIncident, ChartDataPoint } from './statistika.types';

/**
 * Generates chart data from historical incidents, aggregating incidents by date.
 * @param incidents An array of HistoricalIncident objects.
 * @returns An array of ChartDataPoint objects.
 */
export const generateChartData = (incidents: HistoricalIncident[]): ChartDataPoint[] => {
  const dailyData: {
    [date: string]: {
      incidents: number;
      severitySum: number;
      resolved: number;
      ongoing: number;
      losses: number;
    };
  } = {};

  incidents.forEach(incident => {
    const dateKey = new Date(incident.date).toISOString().split('T')[0];
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        incidents: 0,
        severitySum: 0,
        resolved: 0,
        ongoing: 0,
        losses: 0,
      };
    }
    dailyData[dateKey].incidents += 1;
    dailyData[dateKey].severitySum += incident.severity || 0; // Assuming severity is a number
    if (incident.status === 'resolved') {
      dailyData[dateKey].resolved += 1;
    } else if (incident.status === 'ongoing') {
      dailyData[dateKey].ongoing += 1;
    }
    dailyData[dateKey].losses += incident.reported_losses || 0; // Assuming reported_losses is a number
  });

  const chartData: ChartDataPoint[] = Object.keys(dailyData)
    .map(date => ({
      name: date, // Use date as name
      incidents: dailyData[date].incidents,
      severity: dailyData[date].severitySum / dailyData[date].incidents || 0, // Average severity
      resolved: dailyData[date].resolved,
      ongoing: dailyData[date].ongoing,
      losses: dailyData[date].losses,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort by name (date)

  return chartData;
};