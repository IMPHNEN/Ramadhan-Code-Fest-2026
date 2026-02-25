// src/lib/api.server.ts
'server-only';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { RegionData } from './api'; // Import RegionData from the shared api.ts (for interfaces)
import { UserFriendlyError } from './error-utils'; // ADDED: Import UserFriendlyError

export async function getRegionDataServer(
  type: string,
  parentCode?: string | number | null,
): Promise<RegionData[]> {
  // Guard: hard-fail if supabaseServiceRole is not available (i.e., called from client)
  if (typeof window !== 'undefined' || !supabaseAdmin) {
    const errorMessage = `ERROR: getRegionDataServer called from client-side or supabaseServiceRole not initialized. Module: lib/api.ts, Runtime: ${typeof window !== 'undefined' ? 'client' : 'unknown'}`;
    console.error(errorMessage);
    throw new UserFriendlyError('Terjadi kesalahan server saat mengambil data wilayah.', new Error(errorMessage)); // Use UserFriendlyError
  }
  console.log(
    `getRegionData called with type='${type}' and parentCode='${parentCode}'`,
  );

  if (!type) {
    throw new UserFriendlyError('Tipe wilayah tidak valid.', new Error('Missing required parameter: type')); // Use UserFriendlyError
  }

  let tableName: string;
  let selectColumns: string;
  let whereColumn: string | null = null;

  switch (type) {
    case 'provinces':
      tableName = 'provinces';
      selectColumns =
        'province_code, province_name, province_latitude, province_longitude';
      break;
    case 'regencies':
      tableName = 'regencies';
      selectColumns = 'city_code, city_name, city_latitude, city_longitude';
      whereColumn = 'city_province_code';
      break;
    case 'districts':
      tableName = 'districts';
      selectColumns =
        'sub_district_code, sub_district_name, sub_district_latitude, sub_district_longitude, sub_district_geometry';
      whereColumn = 'sub_district_city_code';
      break;
    case 'villages':
      tableName = 'villages';
      selectColumns =
        'village_code, village_name, village_postal_codes, village_latitude, village_longitude, village_geometry';
      whereColumn = 'village_sub_district_code';
      break;
    default:
      throw new UserFriendlyError(`Tipe wilayah tidak dikenal: '${type}'.`, new Error(`Invalid region type: '${type}'`)); // Use UserFriendlyError
  }

  if (
    (type === 'regencies' || type === 'districts' || type === 'villages') &&
    (parentCode === undefined || parentCode === null || String(parentCode).toLowerCase() === 'undefined')
  ) {
    const errorMessage = `ERROR: Missing parent_code for type: ${type}. Received: ${parentCode}. This function should not be called with undefined/null parentCode for this type.`;
    console.error(errorMessage);
    throw new UserFriendlyError('Kode induk wilayah tidak ditemukan.', new Error(errorMessage)); // Use UserFriendlyError
  }

  let query = supabaseAdmin.from(tableName).select(selectColumns);

  const sortColumn =
    selectColumns.split(',')[1]?.trim() ||
    selectColumns.split(',')[0]?.trim();
  if (sortColumn) {
    query = query.order(sortColumn, { ascending: true });
  }

  if (whereColumn && parentCode) {
    query = query.eq(whereColumn, parentCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching data from Supabase:', error.message);
    throw new UserFriendlyError('Gagal mengambil data wilayah dari database.', error); // Use UserFriendlyError
  }

  return (data as RegionData[]) || [];
}


export async function fetchRegionsServer(
  type: 'provinces' | 'regencies' | 'districts' | 'villages',
  parentCode?: number | string,
): Promise<RegionData[]> {
  try {
    const data = await getRegionDataServer(type, parentCode);
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchRegionsServer: ${error.message}`);
    throw error; // Re-throw UserFriendlyError
  }
}