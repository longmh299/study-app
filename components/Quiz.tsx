"use client";

import { useEffect, useRef, useState } from "react";
import { meaning, type Card } from "@/lib/data";
import { decksOf, deckInfo, useDecks } from "@/lib/decks";
import { normEn, normPy, shuffle } from "@/lib/srs";
import { useStore } from "@/lib/store";
import { Chips, ItemRow, SpeakBtn, WordView } from "./ui";

type Mode = "mix" | "mean" | "rev" | "listen" | "type";
type QType = Exclude<Mode, "mix">;
const MODES: [Mode, string][] = [["mix", "Trộn lẫn"], ["mean", "Chọn nghĩa"], ["rev", "Chọn từ"], ["listen", "Nghe chọn"], ["type", "Nghe & gõ"]];

interface Q { c: Card; t: QType; opts: Card[]; ans: number | null; ok: boolean | null; typed: string }

export default function Quiz({ deck, setDeck }: { deck: string; setDeck: (d: string) => void }) {
  const { S, say } = useStore();
  const L = S.lang;
  const info = deckInfo(L, deck);
  const { cards, error } = useDecks(L, [deck]);
  const [topic, setTopic] = useState("all");
  const [mode, setMode] = useState<Mode>("mix");
  const [qs, setQs] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setQs(null); setTopic("all"); }, [L, deck]);

  const build = () => {
    if (!cards) return;
    let pool = cards.filter((c) => topic === "all" || c.topic === topic);
    const seen = pool.filter((c) => S.srs[c.key]);
    if (seen.length >= 8) pool = seen;
    const list: Q[] = shuffle(pool).slice(0, 10).map((c) => {
      const types: QType[] = ["mean", "rev", "listen"];
      if (!c.phr) types.push("type");
      let t: QType = mode === "mix" ? types[Math.floor(Math.random() * types.length)] : mode;
      if (t === "type" && c.phr) t = "listen";
      const same = cards.filter((x) => x.key !== c.key && x.phr === c.phr && meaning(x) !== meaning(c) && x.w !== c.w);
      const pref = shuffle(same.filter((x) => x.topic === c.topic)).slice(0, 12).concat(shuffle(same).slice(0, 12));
      const opts: Card[] = [];
      for (const o of pref) if (opts.length < 3 && !opts.some((y) => y.key === o.key)) opts.push(o);
      return { c, t, opts: shuffle([c, ...opts]), ans: null, ok: null, typed: "" };
    });
    setQs(list);
    setI(0);
    setTyped("");
  };

  const q = qs?.[i];

  useEffect(() => {
    if (!q || q.ans !== null) return;
    if (q.t === "listen" || q.t === "type") {
      const t = setTimeout(() => say(q.c.w, q.c.lang), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs && i, q?.c.key]);

  useEffect(() => {
    if (q?.ans !== null) nextRef.current?.focus();
    else if (q?.t === "type") inputRef.current?.focus();
  }, [q?.ans, q?.t, i]);

  const answer = (k: number, text = "") => {
    if (!qs || !q || q.ans !== null) return;
    const ok = q.t === "type"
      ? (L === "zh" ? normPy(text) === normPy(q.c.p) : normEn(text) === normEn(q.c.w))
      : q.opts[k].key === q.c.key;
    const copy = [...qs];
    copy[i] = { ...q, ans: k, ok, typed: text };
    setQs(copy);
    if (q.t === "mean" || q.t === "rev") say(q.c.w, q.c.lang);
  };

  if (!qs) {
    const topics = cards && info?.hasTopics ? [...new Map(cards.map((c) => [c.topic, c.topicName])).entries()] : [];
    return (
      <div className="panel stack16">
        <p className="muted small m0">10 câu, ưu tiên từ bạn đã học. Không ảnh hưởng lịch ôn.</p>
        <div className="stack8">
          <span className="label">Khóa học</span>
          <Chips value={deck} onChange={setDeck} options={decksOf(L).map((d): [string, string] => [d.id, d.name])} />
        </div>
        {topics.length > 1 && (
          <div className="stack8">
            <span className="label">Chủ đề</span>
            <Chips value={topic} onChange={setTopic} options={[["all", "Tất cả"], ...topics]} />
          </div>
        )}
        <div className="stack8">
          <span className="label">Kiểu câu hỏi</span>
          <Chips value={mode} onChange={setMode} options={MODES} />
          {mode === "type" && (
            <p className="muted small m0">
              {L === "zh" ? "Gõ pinyin không cần dấu thanh, ví dụ “nihao”. Chữ ü gõ là v hoặc u." : "Nghe rồi gõ lại từ tiếng Anh."} Mẫu câu dài sẽ chuyển sang Nghe chọn.
            </p>
          )}
        </div>
        <button type="button" className="btn primary wide" onClick={build} disabled={!cards}>
          {cards ? "Bắt đầu" : error || "Đang tải…"}
        </button>
      </div>
    );
  }

  if (!q) {
    const right = qs.filter((x) => x.ok).length;
    const wrong = qs.filter((x) => !x.ok);
    return (
      <>
        <div className="panel done">
          <div className="seal num score">{right}/{qs.length}</div>
          <h2 className="h2">{right === qs.length ? "Tuyệt đối!" : right >= 7 ? "Làm tốt lắm" : "Cần ôn thêm"}</h2>
        </div>
        {wrong.length > 0 && (
          <div className="panel">
            <h3 className="h3">Các câu sai</h3>
            <div className="list">{wrong.map((x) => <ItemRow key={x.c.key} c={x.c} />)}</div>
          </div>
        )}
        <div className="row">
          <button type="button" className="btn primary" onClick={build}>Làm lại bài mới</button>
          <button type="button" className="btn" onClick={() => setQs(null)}>Đổi chủ đề</button>
        </div>
      </>
    );
  }

  const han = L === "zh";
  const c = q.c;

  return (
    <>
      <div className="row between">
        <button type="button" className="btn" onClick={() => setQs(null)}>← Thoát</button>
        <span className="muted small num">Câu {i + 1}/{qs.length}</span>
      </div>
      <div className="progress"><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>

      <div className="panel q-prompt">
        {q.t === "mean" && (<><span className="label">Từ này nghĩa là gì?</span><WordView c={c} /><SpeakBtn text={c.w} lang={c.lang} /></>)}
        {q.t === "rev" && (<><span className="label">Chọn {han ? "chữ Hán" : "từ tiếng Anh"} đúng</span><div className="mean big-mean">{meaning(c)}</div></>)}
        {(q.t === "listen" || q.t === "type") && (
          <>
            <span className="label">{q.t === "type" ? (han ? "Nghe rồi gõ pinyin" : "Nghe rồi gõ lại") : "Nghe và chọn"}</span>
            <SpeakBtn text={c.w} lang={c.lang} big label="Nghe lại" />
            <span className="muted small">Bấm loa để nghe lại</span>
          </>
        )}
      </div>

      {q.t === "type" ? (
        <form className="stack8" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) answer(0, typed); }}>
          <input
            ref={inputRef}
            id="quiz-type"
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={han ? "ví dụ: nihao" : "gõ từ bạn nghe được"}
            value={q.ans !== null ? q.typed : typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={q.ans !== null}
          />
          {q.ans === null && <button type="submit" className="btn primary">Kiểm tra</button>}
        </form>
      ) : (
        <div className="opts">
          {q.opts.map((o, k) => {
            let cls = "opt" + (q.t !== "mean" && han ? " han" : "");
            if (q.ans !== null) {
              if (o.key === c.key) cls += " right";
              else if (k === q.ans) cls += " wrong";
            }
            return (
              <button type="button" key={o.key} className={cls} disabled={q.ans !== null} onClick={() => answer(k)}>
                {q.t === "mean" ? meaning(o) : o.w}
              </button>
            );
          })}
        </div>
      )}

      {q.ans !== null && (
        <>
          <div className={`fb ${q.ok ? "ok" : "no"}`}>
            {q.ok ? "Đúng rồi" : "Chưa đúng"} ·{" "}
            <span className="fb-detail">
              <span className={han ? "han-inline" : undefined}>{c.w}</span>
              {c.p && ` ${c.p}`}{c.hv && ` (${c.hv})`} = {meaning(c)}
            </span>
          </div>
          <button ref={nextRef} type="button" className="btn primary wide" onClick={() => { setI(i + 1); setTyped(""); }}>
            {i === qs.length - 1 ? "Xem kết quả" : "Câu tiếp"}
          </button>
        </>
      )}
    </>
  );
}
