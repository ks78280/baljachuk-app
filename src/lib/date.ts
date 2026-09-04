/** 로컬 기준 YYYY-MM-DD */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 2026-09-04 -> 2026.09.04 */
export function formatDot(iso: string): string {
  return iso.replace(/-/g, ".");
}

/** "방문한 날짜" 임시 선택지 — 최근 며칠. 정식 캘린더 선택기는 추후. */
export function recentDateOptions(
  count = 7
): { label: string; value: string }[] {
  const names = ["오늘", "어제", "2일 전", "3일 전", "4일 전", "5일 전", "6일 전"];
  const now = new Date();
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = todayISO(d);
    return { label: `${names[i]} · ${formatDot(iso)}`, value: iso };
  });
}
