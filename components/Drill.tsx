"use client";

import { useEffect, useRef, useState } from "react";
import { meaning, type Lang } from "@/lib/data";
import type { DQ } from "@/lib/drill";
import { useStore } from "@/lib/store";
import { SpeakBtn, WordView } from "./ui";

const LABEL: Record<DQ["k"], string> = {
  mean: "Chọn nghĩa đúng",
  word: "Chọn từ đúng",
  listen: "Nghe và chọn",
  order: "Sắp xếp thành câu",
  cloze: "Điền vào chỗ trống",
};

/** Chạy một bộ câu hỏi; gọi onDone với điểm phần trăm. */
export default function Drill({ qs, lang, title, onDone, onQuit }: { qs: DQ[]; lang: Lang; title: string; onDone: (score: number, wrong: DQ[]) => void; onQuit: () => void }) {
  const { say } = useStore();
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<string | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [right, setRight] = useState<boolean[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);
  const q = qs[i];
  const zh = lang === "zh";

  useEffect(() => {
    if (q?.k === "listen") { const t = setTimeout(() => say(q.c.w, lang), 250); return () => clearTimeout(t); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => { if (ans !== null) nextRef.current?.focus(); }, [ans]);

  if (!q) return null;
  const done = ans !== null;

  const finish = (ok: boolean, value: string) => {
    setAns(value);
    setRight([...right, ok]);
    if (q.k === "order" || q.k === "cloze") say(q.s.t, lang); else say(q.c.w, lang);
  };
  const next = () => {
    if (i + 1 >= qs.length) {
      const score = Math.round((right.filter(Boolean).length / qs.length) * 100);
      onDone(score, qs.filter((_, k) => !right[k]));
      return;
    }
    setI(i + 1); setAns(null); setPicked([]);
  };

  let body: React.ReactNode;
  let fb: React.ReactNode = null;
  const ok = right[i];

  if (q.k === "mean") {
    body = (
      <>
        <div className="panel q-prompt"><span className="label">{LABEL.mean}</span><WordView c={q.c} /><SpeakBtn text={q.c.w} lang={lang} /></div>
        <div className="opts">{q.opts.map((o) => (
          <button type="button" key={o} disabled={done} onClick={() => finish(o === meaning(q.c), o)}
            className={`opt${done && o === meaning(q.c) ? " right" : done && o === ans ? " wrong" : ""}`}>{o}</button>
        ))}</div>
      </>
    );
  } else if (q.k === "word" || q.k === "listen") {
    body = (
      <>
        <div className="panel q-prompt">
          <span className="label">{LABEL[q.k]}</span>
          {q.k === "word" ? <div className="mean big-mean">{meaning(q.c)}</div> : <><SpeakBtn text={q.c.w} lang={lang} big label="Nghe lại" /><span className="muted small">Bấm loa để nghe lại</span></>}
        </div>
        <div className="opts">{q.opts.map((o) => (
          <button type="button" key={o.key} disabled={done} onClick={() => finish(o.key === q.c.key, o.key)}
            className={`opt${zh ? " han" : ""}${done && o.key === q.c.key ? " right" : done && o.key === ans ? " wrong" : ""}`}>{o.w}</button>
        ))}</div>
      </>
    );
  } else if (q.k === "order") {
    const built = picked.map((id) => q.s.tokens[id]).join(" ");
    body = (
      <div className="panel stack12">
        <span className="label">{LABEL.order}</span>
        <div className="muted">{q.s.vi}</div>
        <div className={`answer-line${zh ? " han-inline" : ""}${done ? (ok ? " right" : " wrong") : ""}`}>
          {picked.length === 0 && <span className="muted small">Bấm các từ bên dưới…</span>}
          {picked.map((id, k) => <button type="button" key={k} className="tok" disabled={done} onClick={() => setPicked(picked.filter((_, x) => x !== k))}>{q.s.tokens[id]}</button>)}
        </div>
        <div className={`tok-pool${zh ? " han-inline" : ""}`}>
          {q.pool.map((p) => <button type="button" key={p.id} className="tok" disabled={done || picked.includes(p.id)} onClick={() => setPicked([...picked, p.id])}>{p.t}</button>)}
        </div>
        {!done && <button type="button" className="btn primary self-start" disabled={picked.length !== q.s.tokens.length} onClick={() => finish(built === q.s.tokens.join(" "), built)}>Kiểm tra</button>}
      </div>
    );
  } else {
    const correct = q.s.tokens[q.blank];
    body = (
      <>
        <div className="panel stack12">
          <span className="label">{LABEL.cloze}</span>
          <div className="muted">{q.s.vi}</div>
          <div className={`cloze${zh ? " han-inline" : ""}`}>
            {q.s.tokens.map((t, k) => <span key={k}>{k === q.blank ? <span className={`blank${done ? (ok ? " right" : " wrong") : ""}`}>{done ? correct : "____"}</span> : t}{zh ? "" : " "}</span>)}
          </div>
        </div>
        <div className="opts two">{q.opts.map((o) => (
          <button type="button" key={o} disabled={done} onClick={() => finish(o.toLowerCase() === correct.toLowerCase(), o)}
            className={`opt${zh ? " han" : ""}${done && o.toLowerCase() === correct.toLowerCase() ? " right" : done && o === ans ? " wrong" : ""}`}>{o}</button>
        ))}</div>
      </>
    );
  }

  if (done) {
    const detail = q.k === "order" || q.k === "cloze"
      ? <><span className={zh ? "han-inline" : undefined}>{q.s.t}</span>{q.s.py && <div className="muted small">{q.s.py}</div>}</>
      : <><span className={zh ? "han-inline" : undefined}>{q.c.w}</span>{q.c.p && ` ${q.c.p}`} = {meaning(q.c)}</>;
    fb = <div className={`fb ${ok ? "ok" : "no"}`}>{ok ? "Đúng rồi" : "Chưa đúng"} · <span className="fb-detail">{detail}</span></div>;
  }

  return (
    <>
      <div className="row between">
        <button type="button" className="btn" onClick={onQuit}>← Thoát</button>
        <span className="muted small num">{title} · {i + 1}/{qs.length}</span>
      </div>
      <div className="progress"><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      {body}
      {fb}
      {done && <button ref={nextRef} type="button" className="btn primary wide" onClick={next}>{i + 1 >= qs.length ? "Xem kết quả" : "Câu tiếp"}</button>}
    </>
  );
}
