// Metro 는 플랫폼별로 MapCanvas.web.tsx / MapCanvas.native.tsx 를 자동 선택한다.
// 이 파일은 타입 체커(tsc)와 비플랫폼 번들러용 진입점.
export { default } from "./MapCanvas.web";
export * from "./types";
