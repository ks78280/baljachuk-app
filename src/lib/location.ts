import * as Location from "expo-location";

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * 현재 위치 1회 조회. 권한 거부/실패 시 null.
 * 설계서 §11.3: 상시 추적 아님, 지도 진입 등 명시적 시점에만 사용.
 */
export async function getCurrentLocation(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}
