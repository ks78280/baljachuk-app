import React from "react";
import Svg, { Rect, Path, Ellipse, Circle } from "react-native-svg";

type IconProps = { color?: string; size?: number };

export function SearchIcon({ color = "#2B1710", size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round">
      <Circle cx={11} cy={11} r={7} />
      <Path d="M21 21l-4.3-4.3" />
    </Svg>
  );
}

export function BellIcon({ color = "#2B1710", size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3a5 5 0 0 0-5 5v3.2c0 .9-.3 1.7-.9 2.4L5 15h14l-1.1-1.4a3.6 3.6 0 0 1-.9-2.4V8a5 5 0 0 0-5-5z" />
      <Path d="M10 18a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function MapPinTabIcon({ color = "#B99287", size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
      <Circle cx={12} cy={10} r={2.3} />
    </Svg>
  );
}

export function CompassIcon({ color = "#B99287", size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </Svg>
  );
}

export function TimelineIcon({ color = "#B99287", size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4} y={5.5} width={16} height={2.6} rx={1} />
      <Rect x={4} y={10.7} width={16} height={2.6} rx={1} />
      <Rect x={4} y={15.9} width={10} height={2.6} rx={1} />
    </Svg>
  );
}

export function ProfileIcon({ color = "#B99287", size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8.2} r={3.6} />
      <Path d="M4.5 20c0-4 3.6-6.2 7.5-6.2s7.5 2.2 7.5 6.2" />
    </Svg>
  );
}

export function PlusIcon({ color = "#FFFFFF", size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function BackIcon({ color = "#2B1710", size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

export function CameraIcon({ color = "#E5502B", size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={7} width={18} height={13} rx={2} />
      <Path d="M8 7l1.5-2.5h5L16 7" />
      <Circle cx={12} cy={13.5} r={3.5} />
    </Svg>
  );
}

export function LocateIcon({ color = "#2B1710", size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round">
      <Circle cx={12} cy={12} r={7} />
      <Circle cx={12} cy={12} r={2.4} fill={color} stroke="none" />
      <Path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
    </Svg>
  );
}

export function GalleryIcon({ color = "#E5502B", size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4} width={18} height={16} rx={2} />
      <Circle cx={8.5} cy={9} r={1.8} />
      <Path d="M21 16l-4.5-4.5L7 21" />
    </Svg>
  );
}

export function HeartIcon({ color = "#B4694F", size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4 2.5.5-1.3 2-2.5 4-2.5 3.5 0 5 3.5 3.5 7C19 15.65 12 20 12 20z" />
    </Svg>
  );
}

export function CommentIcon({ color = "#B4694F", size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 5h16v11H8l-4 4V5z" />
    </Svg>
  );
}

export function LockIcon({ color = "#FFFFFF", size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={5} y={10} width={14} height={9} rx={2} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function GearIcon({ color = "#2B1710", size = 21 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" />
    </Svg>
  );
}

export function StarIcon({ filled = "#FFD59E", stroke = "#E5502B", size = 18 }: { filled?: string; stroke?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled} stroke={stroke} strokeWidth={1.3} strokeLinejoin="round">
      <Path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2L3 9.5l6.4-.6L12 3z" />
    </Svg>
  );
}

// 사진 핀 (다녀온 기록) — 지도 화면 전용
export function PhotoPin({ fill }: { fill: string }) {
  return (
    <Svg width={30} height={37} viewBox="0 0 24 30" fill="none">
      <Path d="M12 2C7.5 2 4 5.6 4 10c0 6.4 8 15 8 15s8-8.6 8-15c0-4.4-3.5-8-8-8z" fill={fill} />
      <Ellipse cx={9.5} cy={8} rx={2.6} ry={1.8} fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
}

export function WishPin() {
  return (
    <Svg width={30} height={37} viewBox="0 0 24 30" fill="none">
      <Path
        d="M12 2C7.5 2 4 5.6 4 10c0 6.4 8 15 8 15s8-8.6 8-15c0-4.4-3.5-8-8-8z"
        fill="#FFFBF8"
        stroke="#E5502B"
        strokeWidth={1.6}
        strokeDasharray="2.4 2.4"
      />
      <Path d="M12 6.4l1.5 3 3.3.3-2.5 2.2.7 3.2-3-1.6-3 1.6.7-3.2-2.5-2.2 3.3-.3z" fill="#FFD59E" />
    </Svg>
  );
}

export function SmallPinIcon({ color = "#FF6B45", size = 15 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
      <Circle cx={12} cy={10} r={2.3} />
    </Svg>
  );
}

// 지도 배경(도로/블록)
export function MapBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 672"
      preserveAspectRatio="xMidYMin slice"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Rect x={0} y={0} width={390} height={672} fill="#F3ECE2" />
      <Rect x={0} y={150} width={390} height={14} fill="#FFFFFF" />
      <Rect x={0} y={360} width={390} height={14} fill="#FFFFFF" />
      <Rect x={0} y={520} width={390} height={14} fill="#FFFFFF" />
      <Rect x={118} y={0} width={14} height={672} fill="#FFFFFF" />
      <Rect x={280} y={0} width={14} height={672} fill="#FFFFFF" />
      <Rect x={20} y={30} width={80} height={90} rx={10} fill="#E4DED0" />
      <Rect x={150} y={40} width={110} height={80} rx={10} fill="#DCE6D6" />
      <Rect x={150} y={190} width={110} height={140} rx={10} fill="#E4DED0" />
      <Rect x={20} y={200} width={80} height={120} rx={10} fill="#DCE6D6" />
      <Rect x={310} y={30} width={60} height={90} rx={10} fill="#E4DED0" />
      <Rect x={20} y={400} width={80} height={90} rx={10} fill="#DCE6D6" />
      <Rect x={150} y={400} width={110} height={90} rx={10} fill="#E4DED0" />
      <Rect x={310} y={400} width={60} height={90} rx={10} fill="#DCE6D6" />
      <Rect x={20} y={560} width={80} height={90} rx={10} fill="#E4DED0" />
      <Rect x={150} y={560} width={110} height={90} rx={10} fill="#DCE6D6" />
      <Rect x={310} y={150} width={60} height={180} rx={10} fill="#E4DED0" />
      <Rect x={310} y={560} width={60} height={90} rx={10} fill="#E4DED0" />
    </Svg>
  );
}
