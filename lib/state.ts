import type { Lang } from "./data";

export interface SrsEntry {
  r: number; // số lần nhớ liên tiếp
  i: number; // khoảng cách ôn (ngày)
  e: number; // hệ số dễ
  l: number; // số lần quên
  d: number; // thời điểm đến hạn (ms)
  u?: number; // lần sửa cuối (ms), dùng để gộp dữ liệu giữa các máy
}

export interface DayLog { n: number; r: number }

export interface Settings { newPerDay: number; rate: number; auto: boolean; active: Record<Lang, string[]>; unlockAll: boolean }

export interface State {
  lang: Lang;
  srs: Record<string, SrsEntry>;
  days: Record<string, Partial<Record<Lang, DayLog>>>;
  set: Settings;
  /** Điểm cao nhất bài kiểm tra của từng bài giáo trình */
  course: Record<string, number>;
  u: number;
}

export const DEF: State = {
  lang: "en",
  srs: {},
  days: {},
  set: { newPerDay: 10, rate: 0.85, auto: true, active: { en: ["basic"], zh: ["basic"] }, unlockAll: false },
  course: {},
  u: 0,
};

const LKEY = "vo-song-ngu-v1";

export function normalize(d: unknown): State {
  const x = (d && typeof d === "object" ? d : {}) as Partial<State>;
  return {
    lang: x.lang === "zh" ? "zh" : "en",
    srs: x.srs && typeof x.srs === "object" ? x.srs : {},
    days: x.days && typeof x.days === "object" ? x.days : {},
    set: { ...DEF.set, ...(x.set || {}), active: { ...DEF.set.active, ...(x.set?.active || {}) } },
    course: x.course && typeof x.course === "object" ? x.course : {},
    u: typeof x.u === "number" ? x.u : 0,
  };
}

export function loadLocal(): State {
  try {
    return normalize(JSON.parse(localStorage.getItem(LKEY) || "{}"));
  } catch {
    return normalize({});
  }
}

export function saveLocal(s: State) {
  try {
    localStorage.setItem(LKEY, JSON.stringify(s));
  } catch {
    /* bộ nhớ đầy hoặc bị chặn: bỏ qua */
  }
}

/** Gộp tiến độ của 2 máy: mỗi thẻ lấy bản sửa gần nhất, nhật ký ngày lấy số lớn hơn. */
export function merge(a: State, b: State): State {
  const srs: State["srs"] = { ...a.srs };
  for (const [k, v] of Object.entries(b.srs)) {
    const cur = srs[k];
    if (!cur || (v.u ?? 0) > (cur.u ?? 0)) srs[k] = v;
  }
  const days: State["days"] = structuredClone(a.days);
  for (const [k, langs] of Object.entries(b.days)) {
    days[k] ??= {};
    for (const [L, log] of Object.entries(langs) as [Lang, DayLog][]) {
      const cur = days[k][L];
      days[k][L] = cur ? { n: Math.max(cur.n, log.n), r: Math.max(cur.r, log.r) } : log;
    }
  }
  const course = { ...a.course };
  for (const [k, v] of Object.entries(b.course)) course[k] = Math.max(course[k] ?? -1, v);
  const newer = b.u > a.u ? b : a;
  return { lang: newer.lang, set: newer.set, srs, days, course, u: Math.max(a.u, b.u) };
}
