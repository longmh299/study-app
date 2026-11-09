"use client";

import { useEffect, useRef, useState } from "react";
import { blankable, sentences, type Sentence } from "@/lib/sentences";
import { compare } from "@/lib/listen";
import { shuffle } from "@/lib/srs";
import { useStore } from "@/lib/store";
import { Chips, Diff, SpeakBtn } from "./ui";

type Kind = "order" | "cloze" | "dict";
const KINDS: [Kind, string][] = [["order", "Sắp xếp câu"], ["cloze", "Điền từ"], ["dict", "Nghe chép"]];
const DESC: Record<Kind, string> = {
  order: "Bấm các từ theo đúng thứ tự để tạo thành câu.",
  cloze: "Chọn từ đúng để điền vào chỗ trống.",
  dict: "Nghe câu rồi gõ lại. Tiếng Trung có thể gõ pinyin không dấu hoặc chữ Hán.",
};

interface Item { s: Sentence; pool: { t: string; id: number }[]; blank?: number; opts?: string[] }

const noTone = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ü/g, "u").replace(/[^a-z\s]/g, " ");

export default function Exercises() {
  const { S, say } = useStore();
  const L = S.lang;
  const [kind, setKind] = useState<Kind>("order");
  const [items, setItems] = useState<Item[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setItems(null); }, [L]);

  const build = () => {
    const bank = sentences(L);
    let pool = bank.filter((s) => s.tokens.length >= 3 && s.tokens.length <= 11);
    if (kind === "cloze") pool = pool.filter((s) => blankable(s, L).length > 0);
    const allTokens = [...new Set(bank.flatMap((s) => blankable(s, L).map((b) => b.t)))];
    const list: Item[] = shuffle(pool).slice(0, 10).map((s) => {
      const it: Item = { s, pool: shuffle(s.tokens.map((t, id) => ({ t, id }))) };
      if (kind === "cloze") {
        const b = shuffle(blankable(s, L))[0];
        it.blank = b.i;
        const wrong = shuffle(allTokens.filter((t) => t.toLowerCase() !== b.t.toLowerCase())).slice(0, 3);
        it.opts = shuffle([b.t, ...wrong]);
      }
      return it;
    });
    setItems(list); setI(0); reset(); setScores([]);
  };
  const reset = () => { setPicked([]); setChoice(null); setTyped(""); setDone(false); };

  const it = items?.[i];

  useEffect(() => {
    if (it && kind === "dict" && !done) {
      const t = setTimeout(() => say(it.s.t, L), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [it?.s.id]);
  useEffect(() => { if (done) nextRef.current?.focus(); }, [done]);

  if (!items) {
    return (
      <div className="panel stack16">
        <div className="stack8">
          <span className="label">Dạng bài</span>
          <Chips value={kind} onChange={setKind} options={KINDS} />
          <p className="muted small m0">{DESC[kind]} Câu lấy từ các bài hội thoại{L === "en" ? ", mẫu câu giao tiếp và câu ví dụ IELTS" : ""}.</p>
        </div>
        <button type="button" className="btn primary wide" onClick={build}>Bắt đầu</button>
      </div>
    );
  }

  if (!it) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
    return (
      <>
        <div className="panel done">
          <div className="seal num score">{avg}%</div>
          <h2 className="h2">{avg >= 90 ? "Xuất sắc!" : avg >= 70 ? "Làm tốt lắm" : "Cần luyện thêm"}</h2>
          <p className="muted m0">Điểm trung bình {scores.length} câu.</p>
        </div>
        <div className="row">
          <button type="button" className="btn primary" onClick={build}>Làm bài mới</button>
          <button type="button" className="btn" onClick={() => setItems(null)}>Đổi dạng bài</button>
        </div>
      </>
    );
  }

  const zh = L === "zh";
  const sep = zh ? "" : " ";
  const finish = (score: number) => { setDone(true); setScores([...scores, score]); say(it.s.t, L); };

  let body: React.ReactNode = null;
  let verdict: React.ReactNode = null;

  if (kind === "order") {
    const built = picked.map((id) => it.s.tokens[id]);
    const ok = built.join(" ") === it.s.tokens.join(" ");
    body = (
      <>
        <div className={`answer-line${zh ? " han-inline" : ""}${done ? (ok ? " right" : " wrong") : ""}`}>
          {picked.length === 0 && <span className="muted small">Bấm các từ bên dưới…</span>}
          {picked.map((id, k) => (
            <button type="button" key={k} className="tok" disabled={done} onClick={() => setPicked(picked.filter((_, x) => x !== k))}>{it.s.tokens[id]}</button>
          ))}
        </div>
        <div className={`tok-pool${zh ? " han-inline" : ""}`}>
          {it.pool.map((p) => (
            <button type="button" key={p.id} className="tok" disabled={done || picked.includes(p.id)} onClick={() => setPicked([...picked, p.id])}>{p.t}</button>
          ))}
        </div>
        {!done && (
          <div className="row">
            <button type="button" className="btn primary" disabled={picked.length !== it.s.tokens.length} onClick={() => finish(ok ? 100 : 0)}>Kiểm tra</button>
            <button type="button" className="btn" onClick={() => setPicked([])}>Xóa</button>
          </div>
        )}
      </>
    );
    if (done) verdict = <div className={`fb ${ok ? "ok" : "no"}`}>{ok ? "Đúng rồi" : "Chưa đúng"} · <span className="fb-detail">{it.s.t}</span></div>;
  }

  if (kind === "cloze") {
    const ans = it.s.tokens[it.blank!];
    const ok = choice !== null && choice.toLowerCase() === ans.toLowerCase();
    body = (
      <>
        <div className={`cloze${zh ? " han-inline" : ""}`}>
          {it.s.tokens.map((t, k) => (
            <span key={k}>{k === it.blank ? <span className={`blank${done ? (ok ? " right" : " wrong") : ""}`}>{done ? ans : "____"}</span> : t}{sep}</span>
          ))}
        </div>
        <div className="opts two">
          {it.opts!.map((o) => {
            let cls = "opt" + (zh ? " han" : "");
            if (done) { if (o.toLowerCase() === ans.toLowerCase()) cls += " right"; else if (o === choice) cls += " wrong"; }
            return <button type="button" key={o} className={cls} disabled={done} onClick={() => { setChoice(o); finish(o.toLowerCase() === ans.toLowerCase() ? 100 : 0); }}>{o}</button>;
          })}
        </div>
      </>
    );
    if (done) verdict = <div className={`fb ${ok ? "ok" : "no"}`}>{ok ? "Đúng rồi" : `Đáp án: ${ans}`} · <span className="fb-detail">{it.s.t}</span></div>;
  }

  if (kind === "dict") {
    const usesHan = /[㐀-鿿]/.test(typed);
    const res = done
      ? zh && !usesHan && it.s.py
        ? compare(noTone(it.s.py), noTone(typed), "en")
        : compare(it.s.t, typed, L)
      : null;
    body = (
      <>
        <div className="row center"><SpeakBtn text={it.s.t} lang={L} big label="Nghe lại câu" /></div>
        <form className="stack8" onSubmit={(e) => { e.preventDefault(); if (!typed.trim()) return; const r = zh && !/[㐀-鿿]/.test(typed) && it.s.py ? compare(noTone(it.s.py), noTone(typed), "en") : compare(it.s.t, typed, L); finish(r.score); }}>
          <input id="dict-input" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={done}
            placeholder={zh ? "gõ pinyin không dấu hoặc chữ Hán" : "gõ câu bạn nghe được"} value={typed} onChange={(e) => setTyped(e.target.value)} />
          {!done && <button type="submit" className="btn primary">Kiểm tra</button>}
        </form>
      </>
    );
    if (done && res) verdict = (
      <div className={`fb ${res.score >= 85 ? "ok" : "no"}`}>
        {res.score}% · <Diff units={res.units} hit={res.hit} lang={zh && !usesHan ? "en" : L} />
        <div className={`fb-detail${zh ? " han-inline" : ""}`}>{it.s.t}</div>
      </div>
    );
  }

  return (
    <>
      <div className="row between">
        <button type="button" className="btn" onClick={() => setItems(null)}>← Thoát</button>
        <span className="muted small num">Câu {i + 1}/{items.length}</span>
      </div>
      <div className="progress"><span style={{ width: `${(i / items.length) * 100}%` }} /></div>
      <div className="panel stack12">
        <span className="label">{KINDS.find((k) => k[0] === kind)![1]} · {it.s.src}</span>
        {kind !== "dict" || done ? <div className="muted">{it.s.vi}</div> : <div className="muted small">Nghe kỹ rồi gõ lại cả câu.</div>}
        {body}
        {verdict}
        {done && it.s.py && <div className="muted small">{it.s.py}</div>}
      </div>
      {done && (
        <button ref={nextRef} type="button" className="btn primary wide" onClick={() => { setI(i + 1); reset(); }}>
          {i === items.length - 1 ? "Xem kết quả" : "Câu tiếp"}
        </button>
      )}
    </>
  );
}
