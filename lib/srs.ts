import type { Card, Lang } from "./data";
import { deckOfKey } from "./decks";
import type { DayLog, SrsEntry, State } from "./state";

export const DAY = 864e5;

export function dkey(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dayStart(t = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Lặp lại ngắt quãng kiểu SM-2 rút gọn. g: 0 Quên, 1 Khó, 2 Được, 3 Dễ */
export function schedule(prev: SrsEntry | undefined, g: number): SrsEntry {
  const s: SrsEntry = prev ? { ...prev } : { r: 0, i: 0, e: 2.5, l: 0, d: 0 };
  const now = Date.now();
  s.u = now;
  if (g === 0) {
    s.l++; s.r = 0; s.i = 0; s.e = Math.max(1.3, s.e - 0.2); s.d = now + 60e3;
    return s;
  }
  let ivl = 1;
  if (g === 1) { ivl = s.r === 0 ? 1 : Math.max(s.i + 1, Math.round(s.i * 1.2)); s.e = Math.max(1.3, s.e - 0.15); }
  if (g === 2) { ivl = s.r === 0 ? 1 : s.r === 1 ? 3 : Math.round(s.i * s.e); }
  if (g === 3) { ivl = s.r === 0 ? 3 : s.r === 1 ? 6 : Math.round(s.i * s.e * 1.3); s.e += 0.15; }
  s.r++; s.i = ivl; s.d = dayStart(now) + ivl * DAY;
  return s;
}

export const ivlLabel = (s: SrsEntry) => (s.i === 0 ? "1 phút" : s.i < 30 ? `${s.i} ngày` : `${Math.round(s.i / 30)} tháng`);

export type CardStatus = "new" | "lrn" | "ok";
export const STATUS_TXT: Record<CardStatus, string> = { new: "Mới", lrn: "Đang học", ok: "Đã nhớ" };

export function status(S: State, c: Card): CardStatus {
  const s = S.srs[c.key];
  if (!s) return "new";
  return s.i >= 7 ? "ok" : "lrn";
}

export function dueCards(S: State, cards: Card[]) {
  const now = Date.now();
  return cards.filter((c) => S.srs[c.key] && S.srs[c.key].d <= now).sort((a, b) => S.srs[a.key].d - S.srs[b.key].d);
}

/** Các khóa học có thẻ đã học của một ngôn ngữ (để tải đúng khóa khi ôn). */
export function studiedDecks(S: State, L: Lang) {
  const set = new Set<string>();
  for (const k of Object.keys(S.srs)) if (k.startsWith(L + ":")) set.add(deckOfKey(k));
  return [...set];
}

export function dueCount(S: State, L: Lang) {
  const now = Date.now();
  return Object.entries(S.srs).filter(([k, v]) => k.startsWith(L + ":") && v.d <= now).length;
}

/** Thống kê một khóa học mà không cần tải từ vựng. */
export function deckStats(S: State, L: Lang, deck: string) {
  let seen = 0, ok = 0, due = 0;
  const now = Date.now();
  for (const [k, v] of Object.entries(S.srs)) {
    if (!k.startsWith(L + ":") || deckOfKey(k) !== deck) continue;
    seen++;
    if (v.i >= 7) ok++;
    if (v.d <= now) due++;
  }
  return { seen, ok, due };
}

export function newLeft(S: State, L: Lang) {
  return Math.max(0, S.set.newPerDay - (S.days[dkey()]?.[L]?.n || 0));
}

export function newCards(S: State, L: Lang, cards: Card[]) {
  return cards.filter((c) => !S.srs[c.key]).slice(0, newLeft(S, L));
}

/** Ghi nhận 1 lượt học vào nhật ký hôm nay (sửa trực tiếp S). */
export function dayLog(S: State, L: Lang): DayLog {
  const k = dkey();
  S.days[k] ??= {};
  S.days[k][L] ??= { n: 0, r: 0 };
  return S.days[k][L]!;
}

export function streak(S: State) {
  const has = (k: string) => {
    const d = S.days[k];
    return !!d && Object.values(d).some((x) => x && x.n + x.r > 0);
  };
  let n = 0;
  let t = Date.now();
  if (!has(dkey(t))) t -= DAY;
  while (has(dkey(t))) { n++; t -= DAY; }
  return n;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const normEn = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]/g, "").replace(/\s+/g, " ").trim();

export const normPy = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/v/g, "u").replace(/[^a-z]/g, "");
