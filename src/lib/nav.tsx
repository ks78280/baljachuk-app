import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Phase 1(Expo Router 도입) 전까지 쓰는 최소 네비게이션.
 * 탭 위에 하나의 전체화면 모달(작성/기록상세/스팟상세)을 얹는 구조.
 * 라우터가 들어오면 이 파일과 App.tsx의 모달 분기는 통째로 교체된다.
 */
export type NavModal =
  | { kind: "compose" }
  | { kind: "record"; id: string }
  | { kind: "spot"; id: string }
  | { kind: "search" }
  | { kind: "notifications" }
  | null;

interface NavContextValue {
  modal: NavModal;
  openCompose: () => void;
  openRecord: (id: string) => void;
  openSpot: (id: string) => void;
  openSearch: () => void;
  openNotifications: () => void;
  close: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<NavModal>(null);

  const value = useMemo<NavContextValue>(
    () => ({
      modal,
      openCompose: () => setModal({ kind: "compose" }),
      openRecord: (id) => setModal({ kind: "record", id }),
      openSpot: (id) => setModal({ kind: "spot", id }),
      openSearch: () => setModal({ kind: "search" }),
      openNotifications: () => setModal({ kind: "notifications" }),
      close: () => setModal(null),
    }),
    [modal]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
