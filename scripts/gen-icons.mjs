// TriPin 앱 아이콘 생성 — 시안 B (지도 조각 + 중앙 핀).
// 실행: node scripts/gen-icons.mjs   (dev 전용, sharp 필요)
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
const CREAM = "#FBEEE3";

// 시안 B 아트 (100 단위). glow 배경 제외.
const ART = `
  <polygon points="18,50 50,68 50,82 18,64" fill="#E5502B"/>
  <polygon points="50,68 82,50 82,64 50,82" fill="#C43F1F"/>
  <polygon points="50,28 82,46 50,64 18,46" fill="#CDD9BB"/>
  <path d="M54 34 C 62 34, 67 38, 65 43 C 61 47, 54 46, 50 41 C 49 37, 51 34, 54 34 Z" fill="#B2D0DD"/>
  <path d="M28 51 L70 42" stroke="#EFE7DA" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="50" cy="46" rx="9" ry="3.4" fill="#2B1710" opacity="0.14"/>
  <ellipse cx="50" cy="46" rx="2.6" ry="1.1" fill="#2B1710" opacity="0.38"/>
  <path d="M50 46 L40 22 A 11 11 0 1 1 60 22 Z" fill="#FF6B45"/>
  <circle cx="50" cy="18" r="4.4" fill="#FFFFFF"/>
`;
const MONO = `
  <polygon points="18,50 50,68 50,82 18,64"/>
  <polygon points="50,68 82,50 82,64 50,82"/>
  <polygon points="50,28 82,46 50,64 18,46"/>
  <path d="M50 46 L40 22 A 11 11 0 1 1 60 22 Z"/>
`;

// 아트 실제 바운딩박스 ≈ x[18,82], y[6.4,82] → 시각 중심 (50, 44.2).
// 캔버스 정중앙(50,50)에 오도록 옮긴 뒤 s 배로 축소.
const ART_CY = 44.2;
const place = (inner, s) =>
  `<g transform="translate(50 50) scale(${s}) translate(-50 ${-ART_CY})">${inner}</g>`;

const GLOW = `
  <defs><radialGradient id="g" cx="50%" cy="42%" r="58%">
    <stop offset="0%" stop-color="#FF6B45" stop-opacity="0.16"/>
    <stop offset="100%" stop-color="#FF6B45" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="100" height="100" fill="url(#g)"/>
`;

// 전체 아이콘 (iOS / 스토어): 크림 + glow + 아트(≈ 68% 채움)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${CREAM}"/>${GLOW}${place(ART, 0.95)}</svg>`;

// Android adaptive 전경: 투명 + 아트만, 세이프존 여유있게(≈ 50% 채움)
const svgForeground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">${place(ART, 0.66)}</svg>`;

// Android adaptive 배경: 크림 + 은은한 glow
const svgBackground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${CREAM}"/>${GLOW}</svg>`;

// Android monochrome (themed): 실루엣, 구멍은 마스크로 제거. 전경과 동일 스케일.
const svgMono = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <defs><mask id="hole"><rect width="100" height="100" fill="#fff"/><circle cx="50" cy="18" r="4.4" fill="#000"/></mask></defs>
  <g fill="#000000" mask="url(#hole)" transform="translate(50 50) scale(0.66) translate(-50 ${-ART_CY})">${MONO}</g>
</svg>`;

const jobs = [
  ["icon.png", svgIcon, 1024, false],
  ["android-icon-foreground.png", svgForeground, 1024, true],
  ["android-icon-background.png", svgBackground, 1024, false],
  ["android-icon-monochrome.png", svgMono, 1024, true],
  ["favicon.png", svgIcon, 96, false],
];

for (const [name, svg, size, alpha] of jobs) {
  let img = sharp(Buffer.from(svg)).resize(size, size);
  if (!alpha) img = img.flatten({ background: CREAM });
  const out = await img.png().toBuffer();
  await writeFile(join(ASSETS, name), out);
  console.log(`✓ ${name}  ${size}×${size}  ${(out.length / 1024).toFixed(1)}KB${alpha ? "  (alpha)" : ""}`);
}
console.log("done");
