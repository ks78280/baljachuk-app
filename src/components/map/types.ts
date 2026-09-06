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
  /** 값이 바뀔 때마다 지도를 그 좌표로 이동 (위치 선택 화면의 "현재 위치" 버튼용) */
  flyTo?: { lat: number; lng: number; zoom?: number } | null;
}
