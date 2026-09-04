import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { BBox, MapScope } from "../types/api";
import { MapPin, RecordCard } from "../types/models";
import * as mock from "../mocks/db";

export async function getMapRecords(
  bbox: BBox,
  scope: MapScope = "all"
): Promise<MapPin[]> {
  if (USE_MOCK) {
    const pins =
      scope === "me"
        ? mock.mapPins.filter((p) => ["r-1", "r-2"].includes(p.recordId))
        : mock.mapPins;
    return mockDelay(pins);
  }
  return apiFetch("/map/records", {
    query: { ...bbox, scope },
  });
}

export async function getSpotRecords(spotId: string): Promise<RecordCard[]> {
  if (USE_MOCK) {
    const all = [...mock.timelineMine, ...mock.timelineFriends];
    return mockDelay(all.filter((r) => r.spot.id === spotId));
  }
  return apiFetch(`/spots/${spotId}/records`);
}
