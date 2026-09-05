/**
 * Leaflet 지도 HTML 문서 (외부 의존성 없이 문자열 하나).
 * - 웹: <iframe srcDoc> 로 삽입, native: react-native-webview 의 source={{html}}
 * - 호스트 → 지도: postMessage / injectJavaScript 로 window.__host(payload)
 * - 지도 → 호스트: window.__post(obj) → ReactNativeWebView.postMessage 또는 parent.postMessage
 * payload 타입:
 *   { type:"render", markers:[{id,lat,lng,kind,color?,count?,spotId?}] }
 *   { type:"me", lat, lng }
 *   { type:"flyTo", lat, lng, zoom }
 * 지도 → 호스트:
 *   { type:"region", swLat,swLng,neLat,neLng,zoom }
 *   { type:"pinPress", id, spotId }
 */
export interface MapInit {
  lat: number;
  lng: number;
  zoom: number;
}

const LEAFLET_VERSION = "1.9.4";

export function buildMapHtml(init: MapInit): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.css" />
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:#F3ECE2;}
  .bj-pin{width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35);}
  .bj-pin.locked{background:#C9B8AE;}
  .bj-wish{width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid #E5502B;
    display:flex;align-items:center;justify-content:center;color:#E5502B;font-size:12px;font-weight:700;
    box-shadow:0 1px 3px rgba(0,0,0,.3);}
  .bj-wish:after{content:"\\2605";}
  .bj-cluster{background:rgba(255,107,69,.92);color:#fff;border:3px solid #fff;border-radius:50%;
    display:flex;align-items:center;justify-content:center;font-weight:800;font-family:-apple-system,system-ui,sans-serif;
    box-shadow:0 2px 6px rgba(0,0,0,.3);}
  .bj-me{width:16px;height:16px;border-radius:50%;background:#2F80ED;border:3px solid #fff;
    box-shadow:0 0 0 6px rgba(47,128,237,.25);}
  .leaflet-container{background:#E8E0D4;}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.js"></script>
<script>
(function(){
  function post(obj){
    var s = JSON.stringify(obj);
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(s);
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(s, "*");
    }
  }

  var map = L.map("map", { zoomControl: true, attributionControl: false })
    .setView([${init.lat}, ${init.lng}], ${init.zoom});
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

  var markerLayer = L.layerGroup().addTo(map);
  var meMarker = null;
  var regionTimer = null;

  function emitRegion(){
    var b = map.getBounds();
    post({ type:"region",
      swLat:b.getSouth(), swLng:b.getWest(), neLat:b.getNorth(), neLng:b.getEast(),
      zoom: Math.round(map.getZoom()) });
  }
  map.on("moveend", function(){
    clearTimeout(regionTimer);
    regionTimer = setTimeout(emitRegion, 250);
  });

  function pinIcon(m){
    if (m.kind === "cluster") {
      var n = m.count || 0;
      var size = n >= 100 ? 52 : n >= 20 ? 44 : 36;
      return L.divIcon({ className:"", html:'<div class="bj-cluster" style="width:'+size+'px;height:'+size+'px;font-size:'+(size>44?15:13)+'px">'+n+'</div>',
        iconSize:[size,size], iconAnchor:[size/2,size/2] });
    }
    if (m.kind === "wish") {
      return L.divIcon({ className:"", html:'<div class="bj-wish"></div>', iconSize:[20,20], iconAnchor:[10,10] });
    }
    var color = m.kind === "locked" ? "#C9B8AE" : (m.color || "#FF6B45");
    return L.divIcon({ className:"", html:'<div class="bj-pin'+(m.kind==="locked"?" locked":"")+'" style="background:'+color+'"></div>',
      iconSize:[22,22], iconAnchor:[11,20] });
  }

  function render(markers){
    markerLayer.clearLayers();
    (markers || []).forEach(function(m){
      var mk = L.marker([m.lat, m.lng], { icon: pinIcon(m) });
      mk.on("click", function(){
        if (m.kind === "cluster") {
          map.flyTo([m.lat, m.lng], Math.min(19, map.getZoom() + 2));
        } else {
          post({ type:"pinPress", id:m.id, spotId:m.spotId });
        }
      });
      mk.addTo(markerLayer);
    });
  }

  function setMe(lat, lng){
    if (meMarker) { meMarker.setLatLng([lat,lng]); return; }
    meMarker = L.marker([lat,lng], {
      icon: L.divIcon({ className:"", html:'<div class="bj-me"></div>', iconSize:[16,16], iconAnchor:[8,8] }),
      interactive:false, keyboard:false
    }).addTo(map);
  }

  window.__host = function(payload){
    var m = typeof payload === "string" ? JSON.parse(payload) : payload;
    if (m.type === "render") render(m.markers);
    else if (m.type === "me") setMe(m.lat, m.lng);
    else if (m.type === "flyTo") map.flyTo([m.lat, m.lng], m.zoom || map.getZoom());
  };
  // 웹(iframe): 부모가 postMessage 로 전달. origin 은 srcDoc 이라 "null"이 되어
  // 문자열 비교가 무의미하므로, 발신 window 가 실제로 이 iframe 의 부모인지로 검증.
  window.addEventListener("message", function(e){
    if (e.source !== window.parent) return;
    try { window.__host(e.data); } catch(_) {}
  });

  // 첫 뷰포트 즉시 통지
  setTimeout(emitRegion, 60);
  post({ type:"ready" });
})();
</script>
</body>
</html>`;
}
