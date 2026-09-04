import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "../types/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx/세션만료 같은 도메인 에러는 재시도 무의미 → 네트워크성만 1회 재시도
      retry: (count, err) => !(err instanceof ApiRequestError) && count < 1,
      refetchOnWindowFocus: false,
    },
  },
});
