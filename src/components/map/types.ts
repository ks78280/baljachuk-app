export interface MapMarkerVM {
  id: string;
  lat: number;
  lng: number;
  kind: "pin" | "locked" | "wish" | "cluster";
  color?: string | null;
  count?: number;
  spotId?: string;
}

export interface MapRegion {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  zoom: number;
}

export interface MapCanvasProps {
  markers: MapMarkerVM[];
  myLocation?: { lat: number; lng: number } | null;
  initialCenter: { lat: number; lng: number; zoom: number };
  onRegionChange?: (r: MapRegion) => void;
  onPinPress?: (m: { id: string; spotId?: string }) => void;
}
