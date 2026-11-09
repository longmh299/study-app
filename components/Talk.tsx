"use client";

import { useEffect, useRef, useState } from "react";
import { DIALOGUES, show, type Dialogue } from "@/lib/content/dialogues";
import { canListen } from "@/lib/listen";
import { stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { Chips, MicCheck, SpeakBtn } from "./ui";
import Speaking from "./Speaking";

export default function Talk() {
  const { S } = useStore();
  const L = S.lang;
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<"dlg" | "ielts">("dlg");
  useEffect(() => { setOpen(null); setTab("dlg"); }, [L]);

  const d = DIALOGUES.find((x) => x.id === open);
  if (d) return <DialogueView d={d} onBack={() => setOpen(null)} />;

  return (
    <section className="view">
      <div className="row between">
        <h2 className="h2">Hội thoại</h2>
        {L === "en" && <Chips value={tab} onChange={setTab} options={[["dlg", "Tình huống"], ["ielts", "IELTS Speaking"]]} />}
      </div>
      {tab === "ielts" && L === "en" ? (
        <Speaking />
      ) : (
        <>
          <p className="muted small m0">
            Nghe cả bài, rồi chọn <b>Nhập vai</b>: app đọc lời của người kia, bạn nói lời của mình và được chấm phát âm.
            {!canListen() && " Trình duyệt này chưa hỗ trợ micro, bạn vẫn có thể tự đọc và tự chấm."}
          </p>
          <div className="decks">
            {DIALOGUES.filter((x) => x.lang === L).map((x) => (
              <button type="button" key={x.id} className="deck deck-main dlg" onClick={() => setOpen(x.id)}>
                <div className="row between">
                  <b className={`deck-name${L === "zh" ? " han-mix" : ""}`}>{x.title}</b>
                  <span className="pill new">{x.level}</span>
                </div>
                <div className="muted small">{x.scene} · {x.lines.length} lượt lời</div>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function DialogueView({ d, onBack, embedded }: { d: Dialogue; onBack?: () => void; embedded?: boolean }) {
  const { say, S } = useStore();
  const L = d.lang;
  const [mode, setMode] = useState<"read" | "A" | "B">("read");
  const [showPy, setShowPy] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [playing, setPlaying] = useState(-1);
  const [step, setStep] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAll = () => { if (timer.current) clearTimeout(timer.current); setPlaying(-1); stopSpeaking(); };
  useEffect(() => stopAll, []);

  // Đọc lần lượt từng câu, ước lượng thời gian theo độ dài câu
  const playFrom = (k: number) => {
    if (k >= d.lines.length) { setPlaying(-1); return; }
    setPlaying(k);
    const t = show(L, d.lines[k].t);
    say(t, L);
    const ms = (L === "zh" ? t.length * 330 : t.split(" ").length * 420) / S.set.rate + 700;
    timer.current = setTimeout(() => playFrom(k + 1), ms);
  };

  // Nhập vai: tự đọc lời của người kia rồi chờ người học
  const role = mode === "read" ? null : mode;
  useEffect(() => {
    if (!role || step >= d.lines.length) return;
    setReveal(false);
    const line = d.lines[step];
    if (line.s !== role) {
      say(show(L, line.t), L);
      const t = show(L, line.t);
      const ms = (L === "zh" ? t.length * 330 : t.split(" ").length * 420) / S.set.rate + 900;
      timer.current = setTimeout(() => setStep((s) => s + 1), ms);
      return () => { if (timer.current) clearTimeout(timer.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, step]);

  const startRole = (r: "A" | "B") => { stopAll(); setScores({}); setStep(0); setMode(r); };
  const avg = Object.values(scores);

  return (
    <section className="view">
      {!embedded && (
        <>
          <div className="row between">
            <button type="button" className="btn" onClick={() => { stopAll(); onBack?.(); }}>← Hội thoại</button>
            <span className="pill new">{d.level}</span>
          </div>
          <div>
            <h2 className="h2">{d.title}</h2>
            <p className="muted small m0">{d.scene}</p>
          </div>
        </>
      )}
      {embedded && <p className="muted small m0">{d.scene}</p>}
      <div className="stack8">
        <Chips value={mode} onChange={(m) => (m === "read" ? (stopAll(), setMode("read")) : startRole(m))}
          options={[["read", "Đọc & nghe"], ["A", `Nhập vai ${d.roles.A}`], ["B", `Nhập vai ${d.roles.B}`]]} />
        <div className="row small">
          {L === "zh" && <label className="check"><input id="show-py" type="checkbox" checked={showPy} onChange={(e) => setShowPy(e.target.checked)} /> Pinyin</label>}
          <label className="check"><input id="show-vi" type="checkbox" checked={showVi} onChange={(e) => setShowVi(e.target.checked)} /> Nghĩa tiếng Việt</label>
        </div>
      </div>

      {mode === "read" && (
        <button type="button" className="btn primary wide" onClick={() => (playing >= 0 ? stopAll() : playFrom(0))}>
          {playing >= 0 ? "Dừng" : "Nghe cả bài"}
        </button>
      )}

      <div className="chat">
        {d.lines.map((l, k) => {
          const mine = role === l.s;
          const hidden = role && k > step;
          const active = role ? k === step : k === playing;
          if (hidden) return null;
          const showText = !mine || k < step || reveal;
          return (
            <div key={k} className={`bubble ${l.s === "A" ? "left" : "right"}${active ? " active" : ""}${mine ? " mine" : ""}`}>
              <div className="who">{d.roles[l.s]}{mine ? " (bạn)" : ""}</div>
              {showText ? (
                <>
                  <div className={`say${L === "zh" ? " han-inline" : ""}`}>{show(L, l.t)}</div>
                  {L === "zh" && showPy && l.py && <div className="py">{l.py}</div>}
                </>
              ) : (
                <div className="say muted">Đến lượt bạn nói…</div>
              )}
              {(showVi || (mine && !showText)) && <div className="vi">{l.vi}</div>}
              <div className="row bubble-tools">
                {showText && <SpeakBtn text={show(L, l.t)} lang={L} label="Nghe câu này" />}
                {scores[k] !== undefined && <span className={`score ${scores[k] >= 85 ? "good" : scores[k] >= 60 ? "mid" : "low"}`}>{scores[k]}%</span>}
              </div>
              {mine && k === step && (
                <div className="stack8">
                  <MicCheck target={show(L, l.t)} lang={L} onScore={(s) => setScores((x) => ({ ...x, [k]: s }))} />
                  <div className="row">
                    {!reveal && <button type="button" className="btn" onClick={() => setReveal(true)}>Xem câu mẫu</button>}
                    <button type="button" className="btn primary" onClick={() => setStep(step + 1)}>Tiếp</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {role && step >= d.lines.length && (
        <div className="panel done">
          <div className="seal num score">{avg.length ? Math.round(avg.reduce((a, b) => a + b, 0) / avg.length) + "%" : "✓"}</div>
          <h2 className="h2">Xong vai {d.roles[role]}</h2>
          <p className="muted m0">{avg.length ? `Điểm phát âm trung bình ${avg.length} câu.` : "Bạn có thể bấm Nói thử ở mỗi câu để được chấm điểm."}</p>
          <div className="row center">
            <button type="button" className="btn primary" onClick={() => startRole(role === "A" ? "B" : "A")}>Đổi vai</button>
            <button type="button" className="btn" onClick={() => startRole(role)}>Làm lại</button>
          </div>
        </div>
      )}
    </section>
  );
}
