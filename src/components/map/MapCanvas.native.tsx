import React, { useCallback, useMemo, useRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { buildMapHtml } from "./mapHtml";
import { MapCanvasProps } from "./types";

/** 네이티브: Leaflet HTML 을 WebView 로. host→map 은 injectJavaScript, map→host 는 onMessage. */
export default function MapCanvas({
  markers,
  myLocation,
  initialCenter,
  onRegionChange,
  onPinPress,
  flyTo,
}: MapCanvasProps) {
  const ref = useRef<WebView | null>(null);
  const readyRef = useRef(false);
  const html = useMemo(() => buildMapHtml(initialCenter), []);

  const send = useCallback((payload: unknown) => {
    ref.current?.injectJavaScript(
      `window.__host && window.__host(${JSON.stringify(payload)}); true;`
    );
  }, []);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: any;
      try {
        msg = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
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
    },
    [markers, myLocation, onRegionChange, onPinPress, send]
  );

  // markers / myLocation 변경 시 지도에 반영 (ready 이후에만)
  React.useEffect(() => {
    if (readyRef.current) send({ type: "render", markers });
  }, [markers, send]);
  React.useEffect(() => {
    if (readyRef.current && myLocation) send({ type: "me", ...myLocation });
  }, [myLocation, send]);
  React.useEffect(() => {
    if (readyRef.current && flyTo) send({ type: "flyTo", lat: flyTo.lat, lng: flyTo.lng, zoom: flyTo.zoom });
  }, [flyTo, send]);

  return (
    <WebView
      ref={ref}
      originWhitelist={["*"]}
      source={{ html }}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      style={{ flex: 1, backgroundColor: "#F3ECE2" }}
    />
  );
}
