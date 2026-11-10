// Giáo trình: biến bài học thành thẻ từ (nối với lịch ôn) và câu luyện tập.
import { DATA, type Card, type Lang } from "./data";
import type { Lesson } from "./content/course-types";
import { COURSE_ZH } from "./content/course-zh";
import { COURSE_ZH2 } from "./content/course-zh2";
import { COURSE_ZH3 } from "./content/course-zh3";
import { COURSE_EN } from "./content/course-en";
import { COURSE_EN2 } from "./content/course-en2";
import { COURSE_EN3 } from "./content/course-en3";
import { HSK_LEVEL } from "./content/hsk-index";
import { show } from "./content/dialogues";
import { tokEn, type Sentence } from "./sentences";
import type { State } from "./state";

export type { Lesson };

export interface Level { id: string; name: string; short: string; lessons: Lesson[] }

/** Các cấp độ theo thứ tự học; bài đầu của cấp sau mở khi đạt bài cuối của cấp trước. */
export const LEVELS: Record<Lang, Level[]> = {
  zh: [
    { id: "zh1", name: "Sơ cấp 1 · HSK 1", short: "HSK 1", lessons: COURSE_ZH },
    { id: "zh2", name: "Sơ cấp 2 · HSK 2", short: "HSK 2", lessons: COURSE_ZH2 },
    { id: "zh3", name: "Trung cấp 1 · HSK 3", short: "HSK 3", lessons: COURSE_ZH3 },
  ],
  en: [
    { id: "en1", name: "Sơ cấp 1 · A1", short: "A1", lessons: COURSE_EN },
    { id: "en2", name: "Sơ cấp 2 · A2", short: "A2", lessons: COURSE_EN2 },
    { id: "en3", name: "Trung cấp 1 · B1", short: "B1", lessons: COURSE_EN3 },
  ],
};

export const COURSES: Record<Lang, Lesson[]> = { en: LEVELS.en.flatMap((l) => l.lessons), zh: LEVELS.zh.flatMap((l) => l.lessons) };

export function levelOf(l: Lesson): Level {
  return LEVELS[l.lang].find((lv) => lv.lessons.includes(l))!;
}
export const PASS = 80;

// Từ tiếng Anh đã có trong khóa Nhập môn thì dùng chung tiến độ
const enBasic = new Map<string, string>();
DATA.en.topics.forEach((t) => t.items.forEach((it, i) => enBasic.set(it[0].toLowerCase(), `en:${t.id}:${i}`)));

export function lessonCards(l: Lesson): Card[] {
  return l.words.map(([w, p, m]) => {
    let key: string, deck: string;
    if (l.lang === "zh") {
      // Từ thuộc HSK 1–3 dùng chung tiến độ với khóa HSK tương ứng
      const lv = HSK_LEVEL[w];
      deck = lv ? `hsk${lv}` : "lesson";
      key = `zh:${deck}:${w}`;
    } else {
      const b = enBasic.get(w.toLowerCase());
      deck = b ? "basic" : "lesson";
      key = b ?? `en:lesson:${w}`;
    }
    return { key, lang: l.lang, deck, topic: l.id, topicName: `${levelOf(l).short} · Bài ${l.no}`, phr: false, w, p, m };
  });
}

/** Thẻ của khóa ẩn "lesson": các từ chỉ có trong giáo trình (để tải khi ôn). */
export function lessonOnlyCards(L: Lang): Card[] {
  return COURSES[L].flatMap(lessonCards).filter((c) => c.deck === "lesson");
}

const PUNCT_ZH = /^[，。！？、；：]+$/;

export function lessonSentences(l: Lesson): Sentence[] {
  const out: Sentence[] = [];
  const add = (id: string, t: string, py: string | undefined, vi: string, src: string) => {
    const tokens = l.lang === "zh" ? t.split(/\s+/).filter((x) => x && !PUNCT_ZH.test(x)) : tokEn(t);
    out.push({ id, t: show(l.lang, t), tokens, py: py || undefined, vi, src });
  };
  l.grammar.forEach((g, gi) => g.examples.forEach(([t, py, vi], i) => add(`${l.id}:g${gi}:${i}`, t, py, vi, g.title)));
  l.dialogue.lines.forEach((ln, i) => add(`${l.id}:d${i}`, ln.t, ln.py, ln.vi, "Hội thoại"));
  return out;
}

export const best = (S: State, id: string) => S.course[id] ?? -1;

export function isUnlocked(S: State, L: Lang, idx: number) {
  if (idx === 0 || S.set.unlockAll) return true;
  return best(S, COURSES[L][idx - 1].id) >= PASS;
}

/** Bài nên học tiếp: bài đầu tiên chưa đạt. */
export function nextLesson(S: State, L: Lang): Lesson | null {
  return COURSES[L].find((l) => best(S, l.id) < PASS) ?? null;
}
