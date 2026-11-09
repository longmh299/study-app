"use client";

import { useEffect, useRef, useState } from "react";
import { PART1, PART2, SPEAK_TIPS, type CueCard } from "@/lib/content/ielts";
import { canListen, listen } from "@/lib/listen";
import { useStore } from "@/lib/store";
import { Chips, MicIcon, SpeakBtn } from "./ui";

type Part = "p1" | "p2" | "p3";

export default function Speaking() {
  const [part, setPart] = useState<Part>("p1");
  const [topic, setTopic] = useState(0);
  const [card, setCard] = useState<CueCard | null>(null);

  return (
    <div className="stack16">
      <div className="panel stack8">
        <span className="label">Mẹo</span>
        <ul className="steps muted small">{SPEAK_TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      <Chips value={part} onChange={(p) => { setPart(p); setCard(null); }} options={[["p1", "Part 1"], ["p2", "Part 2"], ["p3", "Part 3"]]} />

      {part === "p1" && (
        <>
          <Chips value={String(topic)} onChange={(v) => setTopic(+v)} options={PART1.map((t, i): [string, string] => [String(i), t.vi])} />
          <Questions key={`p1-${topic}`} title={PART1[topic].topic} qs={PART1[topic].qs} hint="Part 1: trả lời 2–3 câu, khoảng 20–40 từ." />
        </>
      )}

      {(part === "p2" || part === "p3") && !card && (
        <div className="decks">
          {PART2.map((c) => (
            <button type="button" key={c.id} className="deck deck-main dlg" onClick={() => setCard(c)}>
              <b className="deck-name">{c.title}</b>
              <div className="muted small">{c.vi}</div>
            </button>
          ))}
        </div>
      )}
      {part === "p2" && card && <CueCardView c={card} onBack={() => setCard(null)} />}
      {part === "p3" && card && (
        <>
          <button type="button" className="btn self-start" onClick={() => setCard(null)}>← Chọn chủ đề khác</button>
          <Questions key={`p3-${card.id}`} title={card.title} qs={card.part3} hint="Part 3: nêu quan điểm, giải thích lý do, cho ví dụ. Khoảng 40–70 từ." />
        </>
      )}
    </div>
  );
}

function Questions({ title, qs, hint }: { title: string; qs: string[]; hint: string }) {
  const { say } = useStore();
  const [k, setK] = useState(0);
  useEffect(() => { const t = setTimeout(() => say(qs[k], "en"), 200); return () => clearTimeout(t); }, [k, qs, say]);
  return (
    <div className="panel stack12">
      <div className="row between">
        <span className="label">{title}</span>
        <span className="muted small num">{k + 1}/{qs.length}</span>
      </div>
      <div className="row q-line">
        <SpeakBtn text={qs[k]} lang="en" label="Nghe câu hỏi" />
        <div className="mean">{qs[k]}</div>
      </div>
      <p className="muted small m0">{hint}</p>
      <Recorder key={k} />
      <div className="row">
        <button type="button" className="btn" disabled={k === 0} onClick={() => setK(k - 1)}>← Câu trước</button>
        <button type="button" className="btn primary" disabled={k === qs.length - 1} onClick={() => setK(k + 1)}>Câu sau →</button>
      </div>
    </div>
  );
}

function CueCardView({ c, onBack }: { c: CueCard; onBack: () => void }) {
  const [phase, setPhase] = useState<"card" | "prep" | "talk" | "review">("card");
  const [left, setLeft] = useState(0);
  const [notes, setNotes] = useState("");
  const recStop = useRef<() => void>(() => {});

  useEffect(() => {
    if (phase !== "prep" && phase !== "talk") return;
    if (left <= 0) {
      if (phase === "prep") { setPhase("talk"); setLeft(120); }
      else { recStop.current(); setPhase("review"); }
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]);

  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="stack12">
      <button type="button" className="btn self-start" onClick={onBack}>← Chọn đề khác</button>
      <div className="panel cue">
        <div className="mean">{c.title}</div>
        <div className="muted small">You should say:</div>
        <ul className="steps">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <SpeakBtn text={`${c.title} You should say: ${c.points.join(", ")}.`} lang="en" label="Nghe đề" />
      </div>

      {phase === "card" && (
        <button type="button" className="btn primary wide" onClick={() => { setPhase("prep"); setLeft(60); }}>Bắt đầu: 1 phút chuẩn bị</button>
      )}
      {phase === "prep" && (
        <div className="panel stack8">
          <div className="row between"><span className="label">Chuẩn bị</span><span className="timer num">{mmss}</span></div>
          <textarea id="cue-notes" className="notes" placeholder="Ghi vài từ khóa cho mỗi ý…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button type="button" className="btn primary" onClick={() => { setPhase("talk"); setLeft(120); }}>Nói luôn</button>
        </div>
      )}
      {(phase === "talk" || phase === "review") && (
        <div className="panel stack8">
          <div className="row between">
            <span className="label">{phase === "talk" ? "Nói trong 2 phút" : "Kết quả"}</span>
            {phase === "talk" && <span className="timer num">{mmss}</span>}
          </div>
          {notes && <div className="muted small">Ghi chú: {notes}</div>}
          <Recorder autoStart={phase === "talk"} stopRef={recStop} seconds={120 - left} done={phase === "review"} onStop={() => phase === "talk" && setPhase("review")} />
        </div>
      )}
      {phase === "review" && (
        <div className="panel stack8">
          <span className="label">Bài nói mẫu</span>
          <p className="m0 sample">{c.sample}</p>
          <SpeakBtn text={c.sample} lang="en" label="Nghe bài mẫu" />
          <span className="label">Cụm từ nên dùng</span>
          <ul className="steps muted">{c.phrases.map((p) => <li key={p}>{p}</li>)}</ul>
          <button type="button" className="btn" onClick={() => { setPhase("card"); setNotes(""); }}>Làm lại</button>
        </div>
      )}
    </div>
  );
}

/** Ghi âm thành chữ liên tục (tự bật lại khi trình duyệt ngắt vì im lặng). */
function Recorder({ autoStart, stopRef, seconds, done, onStop }: {
  autoStart?: boolean; stopRef?: React.MutableRefObject<() => void>; seconds?: number; done?: boolean; onStop?: () => void;
}) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [t0, setT0] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const want = useRef(false);
  const base = useRef("");
  const stopFn = useRef<() => void>(() => {});

  const run = () => {
    stopFn.current = listen("en", {
      continuous: true,
      onText: (t) => setText((base.current ? base.current + " " : "") + t),
      onError: (m) => { if (!m.startsWith("Không nghe thấy")) { setErr(m); want.current = false; } },
      onEnd: () => {
        setText((cur) => { base.current = cur; return cur; });
        if (want.current) run(); else setOn(false);
      },
    });
  };
  const start = () => { setErr(""); setText(""); base.current = ""; want.current = true; setOn(true); setT0(Date.now()); run(); };
  const stop = () => { want.current = false; stopFn.current(); setOn(false); setElapsed(Math.round((Date.now() - t0) / 1000)); onStop?.(); };

  useEffect(() => { if (stopRef) stopRef.current = stop; });
  useEffect(() => { if (autoStart && canListen()) start(); return () => { want.current = false; stopFn.current(); }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!canListen()) return <p className="muted small m0">Trình duyệt này chưa hỗ trợ ghi giọng nói. Bạn vẫn có thể tự nói và bấm giờ. Hãy dùng Chrome hoặc Safari để được ghi lại.</p>;

  const words = text.split(/\s+/).filter(Boolean).length;
  const secs = seconds ?? elapsed;
  return (
    <div className="stack8">
      {!done && (
        <button type="button" className={`btn mic-btn${on ? " on" : ""}`} onClick={() => (on ? stop() : start())}>
          <MicIcon /> {on ? "Đang ghi… bấm để dừng" : text ? "Ghi lại" : "Bắt đầu nói"}
        </button>
      )}
      {text && <div className="transcript">{text}</div>}
      {text && !on && (
        <div className="muted small num">
          {words} từ{secs > 5 ? ` · khoảng ${Math.round((words / secs) * 60)} từ/phút` : ""}
          {" · "}Kiểm tra: bạn có trả lời đủ ý, có lý do và ví dụ chưa?
        </div>
      )}
      {err && <div className="small err">{err}</div>}
    </div>
  );
}
