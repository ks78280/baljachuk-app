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
