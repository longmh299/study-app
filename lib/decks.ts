"use client";
// Danh sách khóa học. Khóa nhỏ nằm trong code; HSK nằm trong public/data/*.json
// và chỉ tải khi cần (file tĩnh, Vercel phục vụ qua CDN, không tốn function).
import { useEffect, useState } from "react";
import { DATA, type Card, type Lang } from "./data";
import { ACADEMIC, IELTS, TALK, type Group } from "./content/english";
import { lessonOnlyCards } from "./course";

export interface DeckInfo {
  id: string;
  lang: Lang;
  group: string;
  name: string;
  desc: string;
  count: number;
  hasTopics: boolean;
  /** Khóa ẩn (từ riêng của giáo trình), không hiện trong danh sách */
  hidden?: boolean;
}

const HSK_COUNTS = [150, 147, 298, 598, 1298, 2500];
const groupCount = (g: Group[]) => g.reduce((n, x) => n + x.items.length, 0);

export const DECKS: DeckInfo[] = [
  { id: "basic", lang: "en", group: "Nền tảng", name: "Nhập môn", desc: "Từ đầu tiên cho người mất gốc, có phiên âm IPA.", count: DATA.en.topics.reduce((n, t) => n + t.items.length, 0), hasTopics: true },
  { id: "talk", lang: "en", group: "Giao tiếp", name: "Tiếng Anh giao tiếp", desc: "Mẫu câu theo 10 tình huống hằng ngày.", count: groupCount(TALK), hasTopics: true },
  { id: "ielts", lang: "en", group: "IELTS", name: "IELTS Vocabulary", desc: "Từ vựng theo 8 chủ đề hay gặp, kèm câu ví dụ.", count: groupCount(IELTS), hasTopics: true },
  { id: "acad", lang: "en", group: "IELTS", name: "Cụm từ Writing & Speaking", desc: "Từ nối, mở bài, kết bài và mẫu câu khi Speaking.", count: groupCount(ACADEMIC), hasTopics: true },
  { id: "basic", lang: "zh", group: "Nền tảng", name: "Nhập môn", desc: "Chào hỏi, số đếm, câu giao tiếp đầu tiên.", count: DATA.zh.topics.reduce((n, t) => n + t.items.length, 0), hasTopics: true },
  ...HSK_COUNTS.map((count, i): DeckInfo => ({
    id: `hsk${i + 1}`, lang: "zh", group: "HSK", name: `HSK ${i + 1}`,
    desc: i < 3 ? "Pinyin, âm Hán Việt, nghĩa tiếng Việt." : "Pinyin, âm Hán Việt, nghĩa tiếng Anh.",
    count, hasTopics: false,
  })),
  { id: "lesson", lang: "en", group: "Giáo trình", name: "Từ vựng giáo trình", desc: "", count: 0, hasTopics: true, hidden: true },
  { id: "lesson", lang: "zh", group: "Giáo trình", name: "Từ vựng giáo trình", desc: "", count: 0, hasTopics: true, hidden: true },
];

export const decksOf = (L: Lang) => DECKS.filter((d) => d.lang === L && !d.hidden);
export const deckInfo = (L: Lang, id: string) => DECKS.find((d) => d.lang === L && d.id === id);

const NEW_STYLE = new Set(["lesson", "talk", "ielts", "acad", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"]);
/** Khóa học của một thẻ, suy ra từ khóa lưu tiến độ. */
export function deckOfKey(key: string) {
  const id = key.split(":")[1];
  return NEW_STYLE.has(id) ? id : "basic";
}

function fromGroups(L: Lang, deck: string, groups: Group[], byWord: boolean): Card[] {
  return groups.flatMap((g) =>
    g.items.map((it, i) => ({
      key: byWord ? `${L}:${deck}:${it[0]}` : `${L}:${deck}:${g.id}:${i}`,
      lang: L, deck, topic: g.id, topicName: g.name, phr: !byWord,
      w: it[0], p: it[1], m: it[2], ex: it[3],
    }))
  );
}

function basic(L: Lang): Card[] {
  return DATA[L].topics.flatMap((t) =>
    t.items.map((it, i) => ({
      key: `${L}:${t.id}:${i}`, lang: L, deck: "basic", topic: t.id, topicName: t.name, phr: !!t.phr, w: it[0], p: it[1], m: it[2],
    }))
  );
}

const cache = new Map<string, Card[]>();
const pending = new Map<string, Promise<Card[]>>();

function buildSync(L: Lang, id: string): Card[] | null {
  if (id === "basic") return basic(L);
  if (id === "lesson") return lessonOnlyCards(L);
  if (L === "en" && id === "talk") return fromGroups(L, id, TALK, false);
  if (L === "en" && id === "ielts") return fromGroups(L, id, IELTS, true);
  if (L === "en" && id === "acad") return fromGroups(L, id, ACADEMIC, false);
  return null;
}

export function getDeck(L: Lang, id: string): Card[] | null {
  const k = `${L}:${id}`;
  if (cache.has(k)) return cache.get(k)!;
  const sync = buildSync(L, id);
  if (sync) cache.set(k, sync);
  return sync;
}

export function loadDeck(L: Lang, id: string): Promise<Card[]> {
  const ready = getDeck(L, id);
  if (ready) return Promise.resolve(ready);
  const k = `${L}:${id}`;
  if (!pending.has(k)) {
    pending.set(k, fetch(`/data/${id}.json`)
      .then((r) => { if (!r.ok) throw new Error(`Không tải được ${id}`); return r.json(); })
      .then((rows: [string, string, string, string, string][]) => {
        const name = deckInfo(L, id)?.name ?? id;
        const cards = rows.map(([w, p, hv, m, en]) => ({
          key: `${L}:${id}:${w}`, lang: L, deck: id, topic: id, topicName: name, phr: false, w, p, m, hv, en,
        }));
        cache.set(k, cards);
        return cards;
      })
      .finally(() => pending.delete(k)));
  }
  return pending.get(k)!;
}

/** Hook tải nhiều khóa học; trả về null khi đang tải. */
export function useDecks(L: Lang, ids: string[]): { cards: Card[] | null; error: string } {
  const sig = ids.join(",");
  const syncAll = () => {
    const parts = ids.map((id) => getDeck(L, id) ?? (cache.get(`${L}:${id}`) || null));
    return parts.every(Boolean) ? (parts as Card[][]).flat() : null;
  };
  const [cards, setCards] = useState<Card[] | null>(syncAll);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const now = syncAll();
    setCards(now);
    setError("");
    if (!now) {
      Promise.all(ids.map((id) => loadDeck(L, id)))
        .then((r) => alive && setCards(r.flat()))
        .catch((e: Error) => alive && setError(e.message || "Lỗi tải dữ liệu"));
    }
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, sig]);
  return { cards, error };
}
