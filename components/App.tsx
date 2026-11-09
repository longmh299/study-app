"use client";

import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import type { Lang } from "@/lib/data";
import Home from "./Home";
import Course from "./Course";
import Library from "./Library";
import Practice from "./Practice";
import Talk from "./Talk";
import Settings from "./Settings";

export type View = "home" | "course" | "library" | "practice" | "talk" | "settings";

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

const TABS: { v: View; label: string; icon: React.ReactNode }[] = [
  { v: "home", label: "Hôm nay", icon: <><path d="M4 5h11a4 4 0 0 1 4 4v10H8a4 4 0 0 1-4-4z" /><path d="M8 9h7M8 13h5" /></> },
  { v: "course", label: "Giáo trình", icon: <><path d="M4 5.5C6.5 4 9.5 4 12 5.5v14C9.5 18 6.5 18 4 19.5z" /><path d="M20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z" /></> },
  { v: "library", label: "Từ vựng", icon: <><path d="M5 4h4v16H5zM10 4h4v16h-4z" /><path d="m15 5 3.5-1 2.5 15.5-3.5 1z" /></> },
  { v: "practice", label: "Luyện tập", icon: <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></> },
  { v: "talk", label: "Hội thoại", icon: <><path d="M4 5h11v8H8l-4 3z" /><path d="M15 9h5v8l-3-2h-6v-2" /></> },
];

const SYNC_DOT = { off: "", idle: "Chưa đăng nhập", saving: "Đang lưu…", saved: "Đã lưu", error: "Lỗi đồng bộ" };

function Shell() {
  const { S, ready, update, user, sync } = useStore();
  const [view, setView] = useState<View>("home");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [pDeck, setPDeck] = useState<Record<Lang, string>>({ en: "basic", zh: "basic" });

  useEffect(() => { document.body.dataset.lang = S.lang; setLessonId(null); }, [S.lang]);

  const go = (v: View) => { setView(v); window.scrollTo(0, 0); };
  const setLang = (L: Lang) => update((s) => { s.lang = L; });
  const status = user ? SYNC_DOT[sync] : SYNC_DOT[sync === "off" ? "off" : "idle"];

  return (
    <>
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <h1>Vở Song Ngữ</h1>
            {status && (
              <button type="button" className={`sync-chip sync-${user ? sync : "idle"}`} onClick={() => go("settings")}>
                {status}
              </button>
            )}
          </div>
          <div className="top-right">
          <div className="lang" role="group" aria-label="Chọn ngôn ngữ">
            <button type="button" aria-pressed={S.lang === "en"} onClick={() => setLang("en")}>EN</button>
            <button type="button" aria-pressed={S.lang === "zh"} className="zh" onClick={() => setLang("zh")}>中文</button>
          </div>
          <button type="button" className={`gear${view === "settings" ? " on" : ""}`} aria-label="Cài đặt" onClick={() => go("settings")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
          </button>
          </div>
        </header>
        <main>
          {!ready ? (
            <div className="panel loading muted">Đang mở vở…</div>
          ) : view === "home" ? (
            <Home onGo={go} onLesson={(id) => { setLessonId(id); go("course"); }} />
          ) : view === "course" ? (
            <Course openId={lessonId} setOpenId={(id) => { setLessonId(id); window.scrollTo(0, 0); }} />
          ) : view === "library" ? (
            <Library onPractice={(d) => { setPDeck({ ...pDeck, [S.lang]: d }); go("practice"); }} />
          ) : view === "practice" ? (
            <Practice deck={pDeck[S.lang]} setDeck={(d) => setPDeck({ ...pDeck, [S.lang]: d })} />
          ) : view === "talk" ? (
            <Talk />
          ) : (
            <Settings />
          )}
        </main>
      </div>
      <nav className="tabs" aria-label="Điều hướng">
        <div className="in">
          {TABS.map((t) => (
            <button type="button" key={t.v} aria-current={view === t.v ? "page" : undefined} onClick={() => { if (t.v === "course") setLessonId(null); go(t.v); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {t.icon}
              </svg>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
