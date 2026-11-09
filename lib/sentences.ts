// Ngân hàng câu cho bài tập: lấy từ hội thoại, mẫu câu giao tiếp, câu ví dụ IELTS.
import type { Lang } from "./data";
import { DIALOGUES, show } from "./content/dialogues";
import { IELTS, TALK } from "./content/english";

export interface Sentence { id: string; t: string; tokens: string[]; py?: string; vi: string; src: string }

const PUNCT_ZH = /^[，。！？、；：]+$/;

export function tokEn(t: string) {
  return t.split(/\s+/).map((w) => w.replace(/^[^\w']+|[^\w']+$/g, "")).filter(Boolean);
}

let cache: Record<Lang, Sentence[]> | null = null;

export function sentences(L: Lang): Sentence[] {
  if (!cache) {
    const en: Sentence[] = [];
    const zh: Sentence[] = [];
    for (const d of DIALOGUES) {
      d.lines.forEach((l, i) => {
        const id = `${d.id}:${i}`;
        if (d.lang === "en") en.push({ id, t: l.t, tokens: tokEn(l.t), vi: l.vi, src: d.title });
        else zh.push({ id, t: show("zh", l.t), tokens: l.t.split(/\s+/).filter((x) => x && !PUNCT_ZH.test(x)), py: l.py, vi: l.vi, src: d.title });
      });
    }
    for (const g of TALK) g.items.forEach((it, i) => en.push({ id: `talk:${g.id}:${i}`, t: it[0], tokens: tokEn(it[0]), vi: it[2], src: g.name }));
    for (const g of IELTS) g.items.forEach((it) => it[3] && en.push({ id: `ielts:${it[0]}`, t: it[3], tokens: tokEn(it[3]), vi: `Câu ví dụ cho “${it[0]}” (${it[2]})`, src: `IELTS · ${g.name}` }));
    cache = { en, zh };
  }
  return cache[L];
}

const STOP = new Set(["the", "a", "an", "to", "of", "is", "are", "am", "i", "you", "it", "in", "on", "at", "and", "for", "my", "your", "do", "be"]);

/** Từ có thể đục lỗ trong bài điền từ. */
export function blankable(s: Sentence, L: Lang) {
  return s.tokens
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => (L === "zh" ? true : t.length >= 3 && !STOP.has(t.toLowerCase())));
}
