"use client";

import { useEffect, useRef, useState } from "react";
import { meaning, type Card, type Lang } from "@/lib/data";
import { STATUS_TXT, status } from "@/lib/srs";
import { canListen, compare, listen } from "@/lib/listen";
import { useStore } from "@/lib/store";

export function SpkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10v4h4l5 4V6L8 10z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

export function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export function SpeakBtn({ text, lang, big, label }: { text: string; lang?: Lang; big?: boolean; label?: string }) {
  const { say } = useStore();
  return (
    <button
      type="button"
      className={`speak${big ? " big" : ""}`}
      aria-label={label ?? `Nghe ${text}`}
      onClick={(e) => { e.stopPropagation(); say(text, lang); }}
    >
      <SpkIcon />
    </button>
  );
}

export function WordView({ c }: { c: Card }) {
  if (c.lang === "zh") {
    const chars = [...c.w];
    if (c.phr || chars.length > 4) return <div className="sentence-zh">{c.w}</div>;
    return (
      <div className="grid-zh" aria-label={c.w}>
        {chars.map((ch, i) => <span className="cell" key={i}>{ch}</span>)}
      </div>
    );
  }
  return (
    <div className="ruled">
      <div className={`word-en${c.w.length > 14 ? " long" : ""}`}>{c.w}</div>
    </div>
  );
}

export function ItemRow({ c }: { c: Card }) {
  const { S } = useStore();
  const st = status(S, c);
  const s = S.srs[c.key];
  const due = s
    ? s.d <= Date.now()
      ? "đến hạn ôn"
      : "ôn " + new Date(s.d).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })
    : "";
  return (
    <div className="item">
      <SpeakBtn text={c.w} lang={c.lang} />
      <div className="t">
        <div className={`w${c.lang === "zh" ? " han" : ""}`}>
          {c.w}
          {c.p && <span className="w-p"> {c.p}</span>}
          {c.hv && <span className="w-hv"> · {c.hv}</span>}
        </div>
        <div className="muted small">{meaning(c)}{due && ` · ${due}`}</div>
      </div>
      <span className={`pill ${st}`}>{STATUS_TXT[st]}</span>
    </div>
  );
}

export function Chips<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="chips">
      {options.map(([k, label]) => (
        <button type="button" key={k} className="chip" aria-pressed={value === k} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

/** Tô màu từng từ/chữ của câu mẫu: xanh là nói đúng, đỏ là thiếu hoặc sai. */
export function Diff({ units, hit, lang }: { units: string[]; hit: boolean[]; lang: Lang }) {
  return (
    <span className={`diff${lang === "zh" ? " han-inline" : ""}`}>
      {units.map((u, i) => (
        <span key={i} className={hit[i] ? "hit" : "miss"}>{u}{lang === "en" ? " " : ""}</span>
      ))}
    </span>
  );
}

/** Nút nói thử: nghe người học đọc câu mẫu rồi chấm điểm. */
export function MicCheck({ target, lang, onScore, compact }: { target: string; lang: Lang; onScore?: (s: number) => void; compact?: boolean }) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [res, setRes] = useState<ReturnType<typeof compare> | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const textRef = useRef("");

  useEffect(() => { setText(""); setRes(null); setErr(""); textRef.current = ""; return () => stopRef.current(); }, [target]);

  if (!canListen()) return compact ? null : <p className="muted small m0">Trình duyệt này chưa hỗ trợ chấm phát âm. Hãy mở bằng Chrome hoặc Safari.</p>;

  const start = () => {
    setErr(""); setRes(null); setText(""); textRef.current = "";
    setOn(true);
    stopRef.current = listen(lang, {
      onText: (t) => { textRef.current = t; setText(t); },
      onError: setErr,
      onEnd: () => {
        setOn(false);
        if (textRef.current) {
          const r = compare(target, textRef.current, lang);
          setRes(r);
          onScore?.(r.score);
        }
      },
    });
  };

  return (
    <div className="mic">
      <button type="button" className={`btn mic-btn${on ? " on" : ""}`} onClick={() => (on ? stopRef.current() : start())}>
        <MicIcon /> {on ? "Đang nghe… bấm để dừng" : "Nói thử"}
      </button>
      {text && <div className="small muted">Bạn nói: “{text}”</div>}
      {res && (
        <div className="mic-res">
          <span className={`score ${res.score >= 85 ? "good" : res.score >= 60 ? "mid" : "low"}`}>{res.score}%</span>
          <Diff units={res.units} hit={res.hit} lang={lang} />
        </div>
      )}
      {err && <div className="small err">{err}</div>}
    </div>
  );
}
