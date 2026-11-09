// Liệt kê mọi câu chữ app có thể đọc to, để tạo sẵn file âm thanh.
// Chạy: npx tsx scripts/list-speech.ts > scripts/speech-list.json
import { readFileSync } from "node:fs";
import { DATA, TONES } from "../lib/data";
import { TALK, IELTS, ACADEMIC } from "../lib/content/english";
import { DIALOGUES, show } from "../lib/content/dialogues";
import { PART1, PART2 } from "../lib/content/ielts";
import { COURSES } from "../lib/course";

type Item = { lang: "en" | "zh"; text: string; group: string };
const out: Item[] = [];
const add = (lang: "en" | "zh", text: string | undefined, group: string) => {
  const t = (text || "").trim();
  if (t) out.push({ lang, text: t, group });
};

// Giáo trình
for (const L of ["en", "zh"] as const) {
  for (const l of COURSES[L]) {
    l.words.forEach(([w]) => add(L, w, "course"));
    l.grammar.forEach((g) => g.examples.forEach(([t]) => add(L, show(L, t), "course")));
    l.dialogue.lines.forEach((ln) => add(L, show(L, ln.t), "course"));
  }
}
// Nhập môn, thanh điệu, câu nghe thử
for (const L of ["en", "zh"] as const) DATA[L].topics.forEach((t) => t.items.forEach((it) => add(L, it[0], "basic")));
TONES.forEach((t) => add("zh", t.h, "basic"));
add("en", "Hello, nice to meet you.", "basic");
add("zh", "你好，很高兴认识你。", "basic");
// Hội thoại
DIALOGUES.forEach((d) => d.lines.forEach((ln) => add(d.lang, show(d.lang, ln.t), "dialogue")));
// Tiếng Anh giao tiếp, IELTS
for (const groups of [TALK, IELTS, ACADEMIC]) groups.forEach((g) => g.items.forEach((it) => { add("en", it[0], "english"); add("en", it[3], "english"); }));
PART1.forEach((p) => p.qs.forEach((q) => add("en", q, "ielts")));
PART2.forEach((c) => {
  add("en", `${c.title} You should say: ${c.points.join(", ")}.`, "ielts");
  add("en", c.sample, "ielts");
  c.part3.forEach((q) => add("en", q, "ielts"));
});
// HSK 1–6
for (let i = 1; i <= 6; i++) {
  const rows: string[][] = JSON.parse(readFileSync(`public/data/hsk${i}.json`, "utf8"));
  rows.forEach((r) => add("zh", r[0], `hsk${i}`));
}

const seen = new Set<string>();
const uniq = out.filter((x) => { const k = x.lang + ":" + x.text; if (seen.has(k)) return false; seen.add(k); return true; });
process.stdout.write(JSON.stringify(uniq));
