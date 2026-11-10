// Tạo bộ câu hỏi trộn (từ vựng + câu) cho phần Luyện tập và Kiểm tra của mỗi bài.
import { meaning, type Card, type Lang } from "./data";
import { blankable, type Sentence } from "./sentences";
import { shuffle } from "./srs";

export type DQ =
  | { k: "mean"; c: Card; opts: string[] }
  | { k: "word"; c: Card; opts: Card[] }
  | { k: "listen"; c: Card; opts: Card[] }
  | { k: "order"; s: Sentence; pool: { t: string; id: number }[] }
  | { k: "cloze"; s: Sentence; blank: number; opts: string[] };

export interface DrillPlan { vocab: number; order: number; cloze: number }
export const PRACTICE: DrillPlan = { vocab: 6, order: 3, cloze: 3 };
export const TEST: DrillPlan = { vocab: 8, order: 4, cloze: 3 };
export const FINAL: DrillPlan = { vocab: 24, order: 8, cloze: 8 };

/** cards: từ của bài; extra: từ của các bài khác để làm phương án nhiễu. */
export function buildDrill(lang: Lang, cards: Card[], extra: Card[], sents: Sentence[], plan: DrillPlan, vocabOnly = false): DQ[] {
  const qs: DQ[] = [];
  const pool = [...cards, ...extra];
  const others = (c: Card) => {
    const near = shuffle(cards.filter((x) => x.key !== c.key && meaning(x) !== meaning(c)));
    const far = shuffle(extra.filter((x) => x.key !== c.key && meaning(x) !== meaning(c) && !near.some((n) => n.w === x.w)));
    return [...near, ...far].slice(0, 3);
  };
  const total = plan.vocab + plan.order + plan.cloze;
  let picks = shuffle(cards);
  while (picks.length < total * 2 && cards.length) picks = picks.concat(shuffle(cards));
  let pi = 0;
  const addVocab = (n: number) => {
    for (let k = 0; k < n && pi < picks.length; k++, pi++) {
      const c = picks[pi];
      const kind = (["mean", "word", "listen"] as const)[pi % 3];
      const o = others(c);
      if (kind === "mean") qs.push({ k: "mean", c, opts: shuffle([meaning(c), ...o.map(meaning)]) });
      else qs.push({ k: kind, c, opts: shuffle([c, ...o]) });
    }
  };
  addVocab(vocabOnly ? total : plan.vocab);
  if (!vocabOnly) {
    const okLen = sents.filter((s) => s.tokens.length >= 3 && s.tokens.length <= 10);
    shuffle(okLen).slice(0, plan.order).forEach((s) => qs.push({ k: "order", s, pool: shuffle(s.tokens.map((t, id) => ({ t, id }))) }));
    const bankTokens = [...new Set([...sents.flatMap((s) => blankable(s, lang).map((b) => b.t)), ...pool.map((c) => c.w).filter((w) => !w.includes(" "))])];
    shuffle(okLen.filter((s) => blankable(s, lang).length)).slice(0, plan.cloze).forEach((s) => {
      const b = shuffle(blankable(s, lang))[0];
      const wrong = shuffle(bankTokens.filter((t) => t.toLowerCase() !== b.t.toLowerCase())).slice(0, 3);
      qs.push({ k: "cloze", s, blank: b.i, opts: shuffle([b.t, ...wrong]) });
    });
    // Bài có ít câu dài thì bù bằng câu hỏi từ vựng cho đủ số câu
    addVocab(total - qs.length);
  }
  return shuffle(qs);
}
