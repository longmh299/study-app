// Đề thi thử: HSK 1–6 (rút gọn theo cấu trúc Nghe / Đọc / Viết) và IELTS (Listening, Reading).
// Câu hỏi được sinh ngẫu nhiên từ từ vựng HSK và câu trong giáo trình, nên mỗi lần làm là một đề mới.
import { meaning, type Card } from "./data";
import { LEVELS, lessonSentences } from "./course";
import { blankable, sentences, type Sentence } from "./sentences";
import { shuffle } from "./srs";
import { PASSAGES } from "./content/ielts-exam";

export type SecId = "listen" | "read" | "write";
export const SEC_NAME: Record<SecId, string> = { listen: "Nghe", read: "Đọc", write: "Viết" };

export type EQ =
  | { k: "choice"; sec: SecId; label: string; audio?: string; show?: string; py?: string; pid?: string; opts: string[]; ans: number; hanOpts?: boolean; hanShow?: boolean; note: string }
  | { k: "order"; sec: SecId; label: string; vi: string; tokens: string[]; pool: { t: string; id: number }[]; note: string }
  | { k: "gap"; sec: SecId; label: string; audio: string; before: string; after: string; ans: string; note: string };

export interface HskSpec { level: number; minutes: number; listen: [number, number, number]; read: [number, number, number]; write: number }

// Số câu: Nghe [nghe từ, nghe câu chọn nghĩa, nghe câu chọn từ nghe được], Đọc [nghĩa của từ, điền từ, hiểu câu], Viết [sắp xếp câu]
export const HSK_SPECS: HskSpec[] = [
  { level: 1, minutes: 15, listen: [5, 5, 0], read: [5, 5, 0], write: 0 },
  { level: 2, minutes: 20, listen: [5, 7, 3], read: [4, 6, 0], write: 0 },
  { level: 3, minutes: 30, listen: [4, 8, 3], read: [5, 5, 5], write: 5 },
  { level: 4, minutes: 40, listen: [0, 14, 6], read: [5, 10, 5], write: 5 },
  { level: 5, minutes: 45, listen: [0, 14, 6], read: [5, 10, 5], write: 6 },
  { level: 6, minutes: 50, listen: [0, 14, 6], read: [8, 8, 4], write: 6 },
];

/** Thang điểm và điểm đạt như bài thi HSK thật: HSK 1–2 tổng 200, đạt 120; HSK 3–6 tổng 300, đạt 180. */
export const hskMax = (lv: number) => (lv <= 2 ? 200 : 300);
export const hskPass = (lv: number) => (lv <= 2 ? 120 : 180);

const CJK = /[㐀-鿿]/;

/** Câu dùng cho đề HSK cấp n: lấy từ giáo trình cùng cấp (HSK 6 chưa có giáo trình nên dùng câu HSK 4–5). */
export function hskSentences(level: number): Sentence[] {
  const ids = level <= 5 ? [`zh${level}`] : ["zh4", "zh5"];
  const lvls = LEVELS.zh.filter((lv) => ids.includes(lv.id));
  return lvls.flatMap((lv) => lv.lessons.flatMap(lessonSentences)).filter((s) => CJK.test(s.t) && s.tokens.length >= 2);
}

const pick4 = <T,>(right: T, pool: T[], same: (a: T, b: T) => boolean) => {
  const wrong = shuffle(pool.filter((x) => !same(x, right)));
  const out: T[] = [right];
  for (const w of wrong) { if (out.length >= 4) break; if (!out.some((o) => same(o, w))) out.push(w); }
  return shuffle(out);
};

function choice(sec: SecId, label: string, right: string, pool: string[], extra: Partial<Extract<EQ, { k: "choice" }>>, note: string): EQ {
  const opts = pick4(right, pool, (a, b) => a.trim() === b.trim());
  return { k: "choice", sec, label, opts, ans: opts.indexOf(right), note, ...extra };
}

export function buildHsk(spec: HskSpec, cards: Card[]): EQ[] {
  const sents = shuffle(hskSentences(spec.level));
  const words = shuffle(cards.filter((c) => meaning(c)));
  const means = words.map(meaning);
  const vis = sents.map((s) => s.vi);
  let wi = 0, si = 0;
  const nextWord = () => words[wi++ % words.length];
  const nextSent = (ok: (s: Sentence) => boolean = () => true) => {
    for (let n = 0; n < sents.length; n++) { const s = sents[si++ % sents.length]; if (ok(s)) return s; }
    return sents[si++ % sents.length];
  };
  const tokBank = [...new Set([...sents.flatMap((s) => s.tokens), ...words.map((c) => c.w)])].filter((t) => CJK.test(t));
  const qs: EQ[] = [];
  const [lw, ls, lh] = spec.listen;
  const [rm, rc, rs] = spec.read;

  for (let i = 0; i < lw; i++) {
    const c = nextWord();
    qs.push(choice("listen", "Nghe từ và chọn nghĩa đúng", meaning(c), means, { audio: c.w }, `${c.w} ${c.p} = ${meaning(c)}`));
  }
  for (let i = 0; i < ls; i++) {
    const s = nextSent();
    qs.push(choice("listen", "Nghe câu và chọn nghĩa đúng", s.vi, vis, { audio: s.t }, `${s.t} ${s.py ?? ""} = ${s.vi}`));
  }
  for (let i = 0; i < lh; i++) {
    const s = nextSent((x) => x.tokens.some((t) => t.length >= 2 && CJK.test(t)));
    const cand = shuffle(s.tokens.filter((t) => t.length >= 2 && CJK.test(t)))[0] ?? s.tokens[0];
    const pool = tokBank.filter((t) => !s.t.includes(t) && Math.abs(t.length - cand.length) <= 1);
    qs.push(choice("listen", "Nghe câu. Từ nào có trong câu bạn vừa nghe?", cand, pool, { audio: s.t, hanOpts: true }, `${s.t} = ${s.vi}`));
  }
  for (let i = 0; i < rm; i++) {
    const c = nextWord();
    qs.push(choice("read", "Chọn nghĩa đúng của từ", meaning(c), means, { show: c.w, hanShow: true }, `${c.w} ${c.p} = ${meaning(c)}`));
  }
  for (let i = 0; i < rc; i++) {
    const s = nextSent((x) => x.tokens.length >= 3 && blankable(x, "zh").some((b) => CJK.test(b.t)));
    const b = shuffle(blankable(s, "zh").filter((x) => CJK.test(x.t)))[0];
    const shown = s.tokens.map((t, k) => (k === b.i ? "＿＿" : t)).join("");
    const pool = tokBank.filter((t) => t !== b.t && Math.abs(t.length - b.t.length) <= 1 && !s.tokens.includes(t));
    qs.push(choice("read", "Chọn từ thích hợp điền vào chỗ trống", b.t, pool, { show: shown, hanShow: true, hanOpts: true }, `${s.t} = ${s.vi}`));
  }
  for (let i = 0; i < rs; i++) {
    const s = nextSent((x) => x.tokens.length >= 4);
    qs.push(choice("read", "Đọc câu và chọn nghĩa đúng", s.vi, vis, { show: s.t, hanShow: true }, `${s.t} ${s.py ?? ""}`));
  }
  for (let i = 0; i < spec.write; i++) {
    const s = nextSent((x) => x.tokens.length >= 4 && x.tokens.length <= 9);
    qs.push({ k: "order", sec: "write", label: "Sắp xếp các từ thành câu đúng", vi: s.vi, tokens: s.tokens, pool: shuffle(s.tokens.map((t, id) => ({ t, id }))), note: `${s.t} ${s.py ?? ""}` });
  }
  return qs;
}

// ---------- IELTS ----------

const STOP = new Set(["the", "a", "an", "to", "of", "is", "are", "was", "were", "and", "for", "with", "that", "this", "have", "has", "you", "your", "they", "their", "there", "what", "will", "would", "been", "from", "about", "it's", "i'm", "don't"]);

/** Câu nghe cho IELTS: hội thoại và ví dụ ở B1–C1 cùng câu ví dụ của bộ từ IELTS (đều có sẵn âm thanh). */
export function ieltsSentences(): Sentence[] {
  const course = LEVELS.en.filter((lv) => ["en3", "en4", "en5"].includes(lv.id)).flatMap((lv) => lv.lessons.flatMap(lessonSentences));
  const ex = sentences("en").filter((s) => s.src.startsWith("IELTS"));
  return [...course, ...ex].filter((s) => s.tokens.length >= 6 && s.tokens.length <= 18);
}

const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9']/g, "");
export const gapOk = (said: string, ans: string) => norm(said) === norm(ans);

export function buildIeltsListening(): EQ[] {
  const sents = shuffle(ieltsSentences());
  const bank = [...new Set(sents.flatMap((s) => s.tokens).filter((t) => t.length >= 4 && !STOP.has(t.toLowerCase()) && /^[a-z]+$/i.test(t)))];
  const qs: EQ[] = [];
  let i = 0;
  while (qs.length < 10 && i < sents.length) {
    const s = sents[i++];
    const cand = s.tokens.map((t, k) => ({ t, k })).filter(({ t, k }) => k > 0 && t.length >= 4 && !STOP.has(t.toLowerCase()) && /^[a-z]+$/i.test(t));
    if (!cand.length) continue;
    const b = shuffle(cand)[0];
    qs.push({ k: "gap", sec: "listen", label: "Nghe và điền MỘT từ còn thiếu", audio: s.t, before: s.tokens.slice(0, b.k).join(" "), after: s.tokens.slice(b.k + 1).join(" "), ans: b.t, note: `${s.t} (${s.vi})` });
  }
  while (qs.length < 20 && i < sents.length) {
    const s = sents[i++];
    const spots = s.tokens.map((t, k) => ({ t, k })).filter(({ t }) => t.length >= 4 && !STOP.has(t.toLowerCase()) && /^[a-z]+$/i.test(t));
    if (spots.length < 2) continue;
    // Phương án nhiễu: thay một từ trong câu bằng từ khác
    const variants = new Set<string>();
    for (let n = 0; n < 12 && variants.size < 3; n++) {
      const sp = shuffle(spots)[0];
      const w = shuffle(bank.filter((x) => x.toLowerCase() !== sp.t.toLowerCase()))[0];
      const v = s.tokens.map((t, k) => (k === sp.k ? (sp.t[0] === sp.t[0].toUpperCase() ? w[0].toUpperCase() + w.slice(1) : w.toLowerCase()) : t)).join(" ");
      variants.add(v);
    }
    const right = s.tokens.join(" ");
    const opts = shuffle([right, ...variants]);
    qs.push({ k: "choice", sec: "listen", label: "Nghe và chọn câu bạn vừa nghe", audio: s.t, opts, ans: opts.indexOf(right), note: `${s.t} (${s.vi})` });
  }
  return qs;
}

export function buildIeltsReading(n = 3): { qs: EQ[]; passages: typeof PASSAGES } {
  const ps = shuffle(PASSAGES).slice(0, n);
  const qs: EQ[] = ps.flatMap((p) => p.qs.map((q): EQ => q.k === "tfng"
    ? { k: "choice", sec: "read", pid: p.id, label: "TRUE / FALSE / NOT GIVEN", show: q.q, opts: ["TRUE", "FALSE", "NOT GIVEN"], ans: ["TRUE", "FALSE", "NOT GIVEN"].indexOf(q.a), note: q.why }
    : { k: "choice", sec: "read", pid: p.id, label: "Chọn đáp án đúng", show: q.q, opts: q.opts, ans: q.a, note: q.why }));
  return { qs, passages: ps };
}

export function isRight(q: EQ, a: string | number | undefined): boolean {
  if (a === undefined) return false;
  if (q.k === "choice") return a === q.ans;
  if (q.k === "order") return a === q.tokens.join(" ");
  return gapOk(String(a), q.ans);
}

export const examKey = (id: string) => `exam:${id}`;
