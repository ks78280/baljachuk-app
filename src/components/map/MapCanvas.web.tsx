import React, { useEffect, useMemo, useRef } from "react";
import { buildMapHtml } from "./mapHtml";
import { MapCanvasProps } from "./types";

/** 웹: Leaflet HTML 을 iframe(srcDoc)으로. 부모 ↔ iframe 은 postMessage. */
export default function MapCanvas({
  markers,
  myLocation,
  initialCenter,
  onRegionChange,
  onPinPress,
  flyTo,
}: MapCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const html = useMemo(() => buildMapHtml(initialCenter), []); // 최초 1회만

  const send = (payload: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), "*");
  };

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // srcDoc iframe 은 origin 이 "null"이라 문자열 비교가 무의미 — 발신 window
      // 자체가 이 iframe 의 contentWindow 인지로 검증 (다른 프레임/확장 프로그램의
      // 스푸핑 메시지를 무시).
      if (e.source !== iframeRef.current?.contentWindow) return;
      let msg: any;
      try {
        msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "ready") {
        readyRef.current = true;
        send({ type: "render", markers });
        if (myLocation) send({ type: "me", ...myLocation });
      } else if (msg.type === "region") {
        onRegionChange?.({
          swLat: msg.swLat,
          swLng: msg.swLng,
          neLat: msg.neLat,
          neLng: msg.neLng,
          zoom: msg.zoom,
        });
      } else if (msg.type === "pinPress") {
        onPinPress?.({ id: msg.id, spotId: msg.spotId });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, myLocation, onRegionChange, onPinPress]);

  useEffect(() => {
    if (readyRef.current) send({ type: "render", markers });
  }, [markers]);

  useEffect(() => {
    if (readyRef.current && myLocation) send({ type: "me", ...myLocation });
  }, [myLocation]);

  useEffect(() => {
    if (readyRef.current && flyTo) send({ type: "flyTo", lat: flyTo.lat, lng: flyTo.lng, zoom: flyTo.zoom });
  }, [flyTo]);

  return (
    <iframe
      ref={iframeRef}
      title="map"
      srcDoc={html}
      style={{ width: "100%", height: "100%", border: "none", display: "block" }}
    />
  );
}
