/**
 * Menghitung jarak Haversine antara dua titik di bumi (dalam kilometer).
 * @param coords1 [latitude, longitude] titik pertama
 * @param coords2 [latitude, longitude] titik kedua
 * @returns Jarak dalam kilometer
 */
export function getHaversineDistance(
  coords1: [number, number],
  coords2: [number, number]
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371; // Radius Bumi dalam km

  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Jarak dalam km
}