import type { Lang } from "../data";

/** Ví dụ: [câu (tiếng Trung cách từ bằng dấu cách), pinyin hoặc "", nghĩa Việt] */
export type Example = [string, string, string];

export interface Grammar {
  title: string;
  /** Giải thích bằng tiếng Việt; xuống dòng bằng \n */
  explain: string;
  /** Công thức ngắn gọn, ví dụ: "A + 是 + B" */
  pattern?: string;
  examples: Example[];
}

export interface CourseLine { s: "A" | "B"; t: string; py?: string; vi: string }

export interface Lesson {
  id: string;
  lang: Lang;
  no: number;
  title: string;
  /** Tiêu đề phụ bằng tiếng Việt */
  sub: string;
  /** Sau bài này bạn có thể… */
  goals: string[];
  /** [từ, phiên âm, nghĩa, 1 nếu là từ ngoài HSK 1] */
  words: [string, string, string, 1?][];
  grammar: Grammar[];
  dialogue: { scene: string; roles: { A: string; B: string }; lines: CourseLine[] };
  /** Ghi chú văn hóa, phát âm, mẹo nhớ */
  notes?: string[];
}
