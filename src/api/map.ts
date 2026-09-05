import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { BBox, MapScope } from "../types/api";
import { MapPin, MapCluster, RecordCard } from "../types/models";
import * as mock from "../mocks/db";

function inBox(lat: number, lng: number, b: BBox): boolean {
  return lat >= b.swLat && lat <= b.neLat && lng >= b.swLng && lng <= b.neLng;
}

export async function getMapRecords(
  bbox: BBox,
  scope: MapScope = "all"
): Promise<MapPin[]> {
  if (USE_MOCK) {
    const base =
      scope === "me"
        ? mock.mapPins.filter((p) => ["r-1", "r-2"].includes(p.recordId))
        : mock.mapPins;
    return mockDelay(base.filter((p) => inBox(p.latitude, p.longitude, bbox)));
  }
  return apiFetch("/map/records", {
    query: {
      swLat: bbox.swLat,
      swLng: bbox.swLng,
      neLat: bbox.neLat,
      neLng: bbox.neLng,
      scope,
    },
  });
}

export async function getMapClusters(
  bbox: BBox,
  zoom: number,
  scope: MapScope = "all"
): Promise<MapCluster[]> {
  if (USE_MOCK) {
    // 목: 뷰포트 내 핀을 scope로 먼저 걸러낸 뒤 격자로 묶어 대충 클러스터링
    const scoped =
      scope === "me" ? mock.mapPins.filter((p) => ["r-1", "r-2"].includes(p.recordId)) : mock.mapPins;
    const cell = 0.5 / Math.pow(2, Math.max(0, Math.min(14, zoom - 3)));
    const buckets = new Map<string, { latSum: number; lngSum: number; count: number; n: number }>();
    for (const p of scoped) {
      if (!inBox(p.latitude, p.longitude, bbox)) continue;
      const key = `${Math.floor(p.latitude / cell)}:${Math.floor(p.longitude / cell)}`;
      const b = buckets.get(key) ?? { latSum: 0, lngSum: 0, count: 0, n: 0 };
      b.latSum += p.latitude;
      b.lngSum += p.longitude;
      b.count += 1;
      b.n += 1;
      buckets.set(key, b);
    }
    return mockDelay(
      [...buckets.values()].map((b) => ({
        latitude: b.latSum / b.n,
        longitude: b.lngSum / b.n,
        count: b.count,
      }))
    );
  }
  return apiFetch("/map/clusters", {
    query: {
      swLat: bbox.swLat,
      swLng: bbox.swLng,
      neLat: bbox.neLat,
      neLng: bbox.neLng,
      zoom,
      scope,
    },
  });
}

export async function getSpotRecords(spotId: string): Promise<RecordCard[]> {
  if (USE_MOCK) {
    const all = [...mock.timelineMine, ...mock.timelineFriends];
    return mockDelay(all.filter((r) => r.spot.id === spotId));
  }
  return apiFetch(`/spots/${spotId}/records`);
}
