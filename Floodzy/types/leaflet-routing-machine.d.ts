declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any; // Tipe 'any' untuk kesederhanaan
    function waypoint(latLng: L.LatLng, name?: string, options?: any): any;
  }
}