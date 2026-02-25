// FILE: statistika/statistika.types.ts

import React from 'react';

export interface HistoricalIncident {
  id: string;
  type: string;
  location: string;
  date: string;
  description: string;
  severity: number;
  impact_areas: string[];
  duration_hours?: number;
  reported_losses?: number;
  casualties?: number;
  evacuees?: number;
  damage_level?: string;
  response_time_minutes?: number;
  status: 'resolved' | 'ongoing' | 'monitoring';
}

export interface ChartDataPoint {
  name: string;
  incidents: number;
  severity: number;
  resolved: number;
  ongoing: number;
  losses: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  trend: number[];
  description?: string;
}