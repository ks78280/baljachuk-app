import { useEffect, useState } from "react";

/** value가 delay(ms) 동안 안정되면 그 값을 반환. 입력 중 과도한 요청 방지용. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
