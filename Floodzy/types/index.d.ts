// This file was created by the Gemini CLI agent.

export interface EvacuationLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity_total?: number;
  capacity_current?: number;
  facilities?: string[];
  contact_person?: string;
  contact_phone?: string;
  last_updated?: string;
}
