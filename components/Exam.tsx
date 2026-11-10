"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useDecks } from "@/lib/decks";
import { buildHsk, buildIeltsListening, buildIeltsReading, examKey, HSK_SPECS, hskMax, hskPass, isRight, SEC_NAME, type EQ, type HskSpec, type SecId } from "@/lib/exam";
import { bandOf, PASSAGES, TASK1, TASK2, WRITING_CHECK, type Passage } from "@/lib/content/ielts-exam";
import { PART1, PART2 } from "@/lib/content/ielts";
import { canListen, listen } from "@/lib/listen";
import { shuffle } from "@/lib/srs";
import { Chips } from "./ui";

type Ans = Record<number, string | number>;
type View =
  | { k: "home" }
  | { k: "hsk"; spec: HskSpec }
  | { k: "ielts-l" } | { k: "ielts-r" } | { k: "ielts-w" } | { k: "ielts-s" };

export default function Exam() {
  const { S } = useStore();
  const [v, setV] = useState<View>({ k: "home" });
  const [lang, setLang] = useState<"zh" | "en">(S.lang);
  useEffect(() => { window.scrollTo(0, 0); }, [v]);
  const home = () => setV({ k: "home" });

  if (v.k === "hsk") return <HskExam spec={v.spec} onBack={home} />;
  if (v.k === "ielts-l") return <IeltsAuto part="l" onBack={home} />;
  if (v.k === "ielts-r") return <IeltsAuto part="r" onBack={home} />;
  if (v.k === "ielts-w") return <IeltsWriting onBack={home} />;
  if (v.k === "ielts-s") return <IeltsSpeaking onBack={home} />;

  const bestOf = (id: string) => S.course[examKey(id)];
  return (
    <div className="stack12">
      <p className="muted small m0">Đề rút gọn theo cấu trúc bài thi thật, có tính giờ và quy đổi điểm. Câu hỏi lấy ngẫu nhiên nên mỗi lần làm là một đề mới. Điểm chỉ để tham khảo, không thay cho kỳ thi chính thức.</p>
      <Chips value={lang} onChange={setLang} options={[["zh", "HSK (tiếng Trung)"], ["en", "IELTS (tiếng Anh)"]]} />
      {lang === "zh" ? (
        <ol className="lessons">
          {HSK_SPECS.map((sp) => {
            const b = bestOf(`hsk${sp.level}`);
            const n = sp.listen.reduce((a, x) => a + x, 0) + sp.read.reduce((a, x) => a + x, 0) + sp.write;
            return (
              <li key={sp.level}>
                <button type="button" className={`lesson ${b !== undefined ? (b >= hskPass(sp.level) ? "pass" : "tried") : "open"}`} onClick={() => setV({ k: "hsk", spec: sp })}>
                  <span className="no num">{sp.level}</span>
                  <span className="lt">
                    <b>Thi thử HSK {sp.level}</b>
                    <span className="muted small">{n} câu · {sp.minutes} phút · {sp.write ? "Nghe, Đọc, Viết" : "Nghe, Đọc"} · đạt {hskPass(sp.level)}/{hskMax(sp.level)}</span>
                  </span>
                  <span className="ls small">{b !== undefined ? <span className={`pill ${b >= hskPass(sp.level) ? "ok" : "lrn"}`}>{b}/{hskMax(sp.level)}</span> : <span className="pill new">Làm đề</span>}</span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="lessons">
          {([
            ["ielts-l", "Listening", "20 câu · 15 phút · nghe điền từ và chọn câu đúng", "ielts-l"],
            ["ielts-r", "Reading", "3 bài đọc, 21 câu · 30 phút · True/False/Not Given, trắc nghiệm", "ielts-r"],
            ["ielts-w", "Writing", "Task 1 (20 phút) và Task 2 (40 phút) · đếm chữ, tự chấm theo 4 tiêu chí", ""],
            ["ielts-s", "Speaking", "Part 1, 2, 3 · có hẹn giờ chuẩn bị và nói, ghi lại lời nói", ""],
          ] as const).map(([k, name, desc, key], i) => {
            const b = key ? bestOf(key) : undefined;
            return (
              <li key={k}>
                <button type="button" className={`lesson ${b !== undefined ? "pass" : "open"}`} onClick={() => setV({ k } as View)}>
                  <span className="no num">{i + 1}</span>
                  <span className="lt"><b>IELTS {name}</b><span className="muted small">{desc}</span></span>
                  <span className="ls small">{b !== undefined ? <span className="pill ok">Band {(b / 10).toFixed(1)}</span> : <span className="pill new">Làm đề</span>}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function HskExam({ spec, onBack }: { spec: HskSpec; onBack: () => void }) {
  const { S, update } = useStore();
  const { cards, error } = useDecks("zh", [`hsk${spec.level}`]);
  const [qs, setQs] = useState<EQ[] | null>(null);
  const [res, setRes] = useState<{ qs: EQ[]; ans: Ans } | null>(null);
  const key = examKey(`hsk${spec.level}`);
  const b = S.course[key];
  const max = hskMax(spec.level), pass = hskPass(spec.level);
  const secs: SecId[] = spec.write ? ["listen", "read", "write"] : ["listen", "read"];

  const submit = (ans: Ans) => {
    const r = { qs: qs!, ans };
    setQs(null); setRes(r);
    const total = secs.reduce((n, s) => n + secScore(r, s, max / secs.length), 0);
    update((st) => { st.course[key] = Math.max(st.course[key] ?? -1, total); });
  };

  if (qs) return <Runner qs={qs} lang="zh" minutes={spec.minutes} title={`HSK ${spec.level}`} onSubmit={submit} onQuit={() => setQs(null)} />;

  const count = (s: SecId) => (s === "listen" ? spec.listen : s === "read" ? spec.read : [spec.write]).reduce((a, x) => a + x, 0);
  return (
    <section className="view stack12">
      <div className="row between">
        <button type="button" className="btn" onClick={onBack}>← Thi thử</button>
        {b !== undefined && <span className={`pill ${b >= pass ? "ok" : "lrn"}`}>Cao nhất {b}/{max}</span>}
      </div>
      <div className="lesson-head">
        <span className="label">Đề thi thử</span>
        <h2 className="h2 lesson-title">HSK {spec.level}</h2>
      </div>
      {res ? (
        <Result res={res} lang="zh" secs={secs} perSec={max / secs.length}
          head={(total) => <><div className="seal num score">{total}</div><h2 className="h2">{total >= pass ? `Đạt! (cần ${pass}/${max})` : `Chưa đạt, cần ${pass}/${max}`}</h2></>}
          onAgain={() => { setRes(null); cards && setQs(buildHsk(spec, cards)); }} />
      ) : (
        <div className="panel stack12">
          <span className="label">Cấu trúc đề</span>
          <ul className="steps">
            {secs.map((s) => <li key={s}><b>{SEC_NAME[s]}</b>: {count(s)} câu, {max / secs.length} điểm</li>)}
            <li>Thời gian: {spec.minutes} phút. Hết giờ, bài tự nộp.</li>
            <li>Phần nghe: mỗi câu được nghe tối đa 2 lần.</li>
            <li>Đạt khi tổng điểm từ {pass}/{max}, giống quy định của kỳ thi HSK.</li>
            {spec.level === 6 && <li className="muted">Giáo trình HSK 6 đang soạn, nên phần câu của đề HSK 6 tạm lấy từ HSK 4–5; từ vựng là từ HSK 6.</li>}
          </ul>
          {error && <p className="err m0">{error}</p>}
          <button type="button" className="btn primary wide" disabled={!cards} onClick={() => cards && setQs(buildHsk(spec, cards))}>{cards ? "Bắt đầu làm bài" : "Đang tải đề…"}</button>
        </div>
      )}
    </section>
  );
}

function IeltsAuto({ part, onBack }: { part: "l" | "r"; onBack: () => void }) {
  const { S, update } = useStore();
  const key = examKey(`ielts-${part}`);
  const [run, setRun] = useState<{ qs: EQ[]; passages?: Passage[] } | null>(null);
  const [res, setRes] = useState<{ qs: EQ[]; ans: Ans } | null>(null);
  const b = S.course[key];
  const name = part === "l" ? "Listening" : "Reading";
  const start = () => { setRes(null); setRun(part === "l" ? { qs: buildIeltsListening() } : buildIeltsReading()); };
  const submit = (ans: Ans) => {
    const r = { qs: run!.qs, ans };
    setRun(null); setRes(r);
    const right = r.qs.filter((q, i) => isRight(q, ans[i])).length;
    const band = bandOf(Math.round((right / r.qs.length) * 40));
    update((st) => { st.course[key] = Math.max(st.course[key] ?? -1, band * 10); });
  };
  if (run) return <Runner qs={run.qs} lang="en" minutes={part === "l" ? 15 : 30} passages={run.passages} title={`IELTS ${name}`} onSubmit={submit} onQuit={() => setRun(null)} />;
  return (
    <section className="view stack12">
      <div className="row between">
        <button type="button" className="btn" onClick={onBack}>← Thi thử</button>
        {b !== undefined && <span className="pill ok">Cao nhất band {(b / 10).toFixed(1)}</span>}
      </div>
      <div className="lesson-head"><span className="label">Đề thi thử</span><h2 className="h2 lesson-title">IELTS {name}</h2></div>
      {res ? (
        <Result res={res} lang="en" secs={[part === "l" ? "listen" : "read"]} perSec={40}
          head={(_, right, n) => { const band = bandOf(Math.round((right / n) * 40)); return <><div className="seal num score">{band.toFixed(1)}</div><h2 className="h2">Band ước tính {band.toFixed(1)}</h2><p className="muted m0">Đúng {right}/{n} câu, quy ra thang 40 câu là {Math.round((right / n) * 40)}/40.</p></>; }}
          onAgain={start} />
      ) : (
        <div className="panel stack12">
          <span className="label">Cấu trúc đề</span>
          {part === "l" ? (
            <ul className="steps">
              <li>10 câu nghe và gõ MỘT từ còn thiếu (giống dạng điền form, điền ghi chú của IELTS). Chú ý chính tả.</li>
              <li>10 câu nghe và chọn đúng câu bạn vừa nghe.</li>
              <li>15 phút, mỗi câu nghe tối đa 2 lần (đề thật chỉ nghe 1 lần, hãy tập nghe 1 lần khi đã quen).</li>
            </ul>
          ) : (
            <ul className="steps">
              <li>3 bài đọc ngẫu nhiên trong {PASSAGES.length} bài, mỗi bài 7 câu: True / False / Not Given và trắc nghiệm.</li>
              <li>30 phút (đề thật: 60 phút cho 40 câu). Bấm “Bài đọc” để xem lại đoạn văn.</li>
              <li>Not Given là khi bài đọc không nhắc đến thông tin đó, đừng dùng hiểu biết riêng để suy luận. TRUE/FALSE hỏi về thông tin, YES/NO hỏi về quan điểm của tác giả.</li>
              <li>Các đoạn được đánh dấu A, B, C, D cho dạng câu hỏi “đoạn nào nói về…”.</li>
            </ul>
          )}
          <button type="button" className="btn primary wide" onClick={start}>Bắt đầu làm bài</button>
        </div>
      )}
    </section>
  );
}

function secScore(r: { qs: EQ[]; ans: Ans }, s: SecId, per: number) {
  const idx = r.qs.map((q, i) => [q, i] as const).filter(([q]) => q.sec === s);
  if (!idx.length) return 0;
  return Math.round((idx.filter(([q, i]) => isRight(q, r.ans[i])).length / idx.length) * per);
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function useCountdown(minutes: number, onEnd?: () => void) {
  const [left, setLeft] = useState(minutes * 60);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    const t = setInterval(() => setLeft((x) => {
      if (x <= 1) { clearInterval(t); setTimeout(() => end.current?.(), 0); return 0; }
      return x - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

function Runner({ qs, lang, minutes, passages, title, onSubmit, onQuit }: { qs: EQ[]; lang: "zh" | "en"; minutes: number; passages?: Passage[]; title: string; onSubmit: (a: Ans) => void; onQuit: () => void }) {
  const { say } = useStore();
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<Ans>({});
  const [plays, setPlays] = useState<Record<number, number>>({});
  const [picked, setPicked] = useState<Record<number, number[]>>({});
  const [quit, setQuit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showP, setShowP] = useState(true);
  const ansRef = useRef(ans);
  ansRef.current = ans;
  const left = useCountdown(minutes, () => onSubmit(ansRef.current));
  const q = qs[i];
  const zh = lang === "zh";

  const play = (n: number) => {
    const qq = qs[n];
    if (!("audio" in qq) || !qq.audio) return;
    if ((plays[n] ?? 0) >= 2) return;
    setPlays((p) => ({ ...p, [n]: (p[n] ?? 0) + 1 }));
    say(qq.audio, lang);
  };
  useEffect(() => {
    window.scrollTo(0, 0);
    setConfirm(false);
    if ("audio" in q && q.audio && !plays[i]) { const t = setTimeout(() => play(i), 300); return () => clearTimeout(t); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const set = (v: string | number) => setAns((a) => ({ ...a, [i]: v }));
  const answered = Object.keys(ans).filter((k) => ans[+k] !== "" && ans[+k] !== undefined).length;
  const passage = q.k === "choice" && q.pid ? passages?.find((p) => p.id === q.pid) : undefined;
  const audioLeft = 2 - (plays[i] ?? 0);

  let body: React.ReactNode;
  if (q.k === "choice") {
    body = (
      <>
        {passage && (
          <div className="panel passage">
            <button type="button" className="row between plain" onClick={() => setShowP(!showP)}>
              <b>{passage.title}</b><span className="muted small">{showP ? "Thu gọn" : "Bài đọc"}</span>
            </button>
            {showP && passage.text.map((p, k) => <p key={k} className="m0 gp"><b className="para-l">{String.fromCharCode(65 + k)}</b> {p}</p>)}
          </div>
        )}
        <div className="panel q-prompt stack8">
          <span className="label">{q.label}</span>
          {q.audio && <AudioBtn left={audioLeft} onPlay={() => play(i)} />}
          {q.show && <div className={q.hanShow ? "exam-han" : "exam-q"}>{q.show}</div>}
        </div>
        <div className="opts">{q.opts.map((o, k) => (
          <button type="button" key={k} onClick={() => set(k)} className={`opt${q.hanOpts ? " han" : ""}${ans[i] === k ? " sel" : ""}`}>
            <span className="opt-l">{String.fromCharCode(65 + k)}</span> {o}
          </button>
        ))}</div>
      </>
    );
  } else if (q.k === "order") {
    const p = picked[i] ?? [];
    const setP = (np: number[]) => { setPicked({ ...picked, [i]: np }); set(np.length === q.tokens.length ? np.map((id) => q.tokens[id]).join(" ") : ""); };
    body = (
      <div className="panel stack12">
        <span className="label">{q.label}</span>
        <div className="muted">{q.vi}</div>
        <div className={`answer-line${zh ? " han-inline" : ""}`}>
          {p.length === 0 && <span className="muted small">Bấm các từ bên dưới theo đúng thứ tự…</span>}
          {p.map((id, k) => <button type="button" key={k} className="tok" onClick={() => setP(p.filter((_, x) => x !== k))}>{q.tokens[id]}</button>)}
        </div>
        <div className={`tok-pool${zh ? " han-inline" : ""}`}>
          {q.pool.map((t) => <button type="button" key={t.id} className="tok" disabled={p.includes(t.id)} onClick={() => setP([...p, t.id])}>{t.t}</button>)}
        </div>
      </div>
    );
  } else {
    body = (
      <div className="panel stack12">
        <span className="label">{q.label}</span>
        <AudioBtn left={audioLeft} onPlay={() => play(i)} />
        <div className="exam-q gap-line">
          {q.before} <input className="gap-input" aria-label="Từ còn thiếu" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={String(ans[i] ?? "")} onChange={(e) => set(e.target.value)} /> {q.after}
        </div>
      </div>
    );
  }

  return (
    <section className="view stack12">
      <div className="row between">
        <button type="button" className="btn" onClick={() => (quit ? onQuit() : setQuit(true))}>{quit ? "Bấm lần nữa để thoát" : "← Thoát"}</button>
        <span className={`pill num ${left < 60 ? "lrn" : "new"}`}>{fmt(left)}</span>
      </div>
      <div className="row between">
        <span className="label">{title} · {SEC_NAME[q.sec]}</span>
        <span className="muted small num">Câu {i + 1}/{qs.length} · đã làm {answered}</span>
      </div>
      <div className="progress"><span style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>
      {body}
      <div className="row between">
        <button type="button" className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>← Câu trước</button>
        {i + 1 < qs.length
          ? <button type="button" className="btn primary" onClick={() => setI(i + 1)}>Câu tiếp →</button>
          : <button type="button" className="btn primary" onClick={() => (confirm || answered === qs.length ? onSubmit(ans) : setConfirm(true))}>{confirm ? `Còn ${qs.length - answered} câu chưa làm. Vẫn nộp?` : "Nộp bài"}</button>}
      </div>
      <details className="panel">
        <summary className="small">Danh sách câu hỏi</summary>
        <div className="qgrid">
          {qs.map((_, k) => (
            <button type="button" key={k} className={`qn num${k === i ? " cur" : ""}${ans[k] !== undefined && ans[k] !== "" ? " done" : ""}`} onClick={() => setI(k)}>{k + 1}</button>
          ))}
        </div>
        <button type="button" className="btn wide" onClick={() => onSubmit(ans)}>Nộp bài ngay</button>
      </details>
    </section>
  );
}

function AudioBtn({ left, onPlay }: { left: number; onPlay: () => void }) {
  return (
    <button type="button" className="btn self-start" disabled={left <= 0} onClick={onPlay}>
      ▶ {left > 0 ? `Nghe (còn ${left} lần)` : "Đã hết lượt nghe"}
    </button>
  );
}

function Result({ res, lang, secs, perSec, head, onAgain }: { res: { qs: EQ[]; ans: Ans }; lang: "zh" | "en"; secs: SecId[]; perSec: number; head: (total: number, right: number, n: number) => React.ReactNode; onAgain: () => void }) {
  const zh = lang === "zh";
  const right = res.qs.filter((q, i) => isRight(q, res.ans[i])).length;
  const total = secs.reduce((n, s) => n + secScore(res, s, perSec), 0);
  const wrong = res.qs.map((q, i) => [q, i] as const).filter(([q, i]) => !isRight(q, res.ans[i]));
  const shown = (q: EQ, a: string | number | undefined) => (a === undefined || a === "" ? "(bỏ trống)" : q.k === "choice" ? q.opts[a as number] : String(a));
  const correct = (q: EQ) => (q.k === "choice" ? q.opts[q.ans] : q.k === "order" ? q.tokens.join(zh ? "" : " ") : q.ans);
  return (
    <div className="stack12">
      <div className="panel done">
        {head(total, right, res.qs.length)}
        {secs.length > 1 && (
          <div className="sec-scores">
            {secs.map((s) => {
              const v = secScore(res, s, perSec);
              return (
                <div key={s} className="stack4">
                  <div className="row between small"><span>{SEC_NAME[s]}</span><b className="num">{v}/{perSec}</b></div>
                  <div className="bar"><span className="k" style={{ width: `${(v / perSec) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
        <div className="row center"><button type="button" className="btn primary" onClick={onAgain}>Làm đề mới</button></div>
      </div>
      {wrong.length > 0 && (
        <div className="panel stack8">
          <span className="label">Câu sai và đáp án ({wrong.length})</span>
          {wrong.map(([q, i]) => (
            <div key={i} className="wrong-row stack4">
              <div className="muted small">Câu {i + 1} · {SEC_NAME[q.sec]} · {q.label}</div>
              {q.k === "choice" && q.show && <div className={zh ? "han-inline" : undefined}>{q.show}</div>}
              <div className="small">Bạn chọn: <span className="err">{shown(q, res.ans[i])}</span></div>
              <div className="small">Đáp án: <b className={`okc${zh ? " han-inline" : ""}`}>{correct(q)}</b></div>
              <div className={`muted small${zh ? " han-mix" : ""}`}>{q.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- IELTS Writing ----------

function IeltsWriting({ onBack }: { onBack: () => void }) {
  const [task, setTask] = useState<1 | 2>(2);
  const [n1, setN1] = useState(() => Math.floor(Math.random() * TASK1.length));
  const [n2, setN2] = useState(() => Math.floor(Math.random() * TASK2.length));
  const [started, setStarted] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const min = task === 1 ? 150 : 250;
  const t1 = TASK1[n1];

  if (started && !done) return <WritingRun task={task} prompt={task === 1 ? t1.prompt : TASK2[n2]} t1={task === 1 ? t1 : undefined} text={text} setText={setText} words={words} min={min} onDone={() => setDone(true)} onQuit={() => setStarted(false)} />;

  const nChecked = Object.values(checks).filter(Boolean).length;
  const nAll = WRITING_CHECK.reduce((n, c) => n + c.items.length, 0);
  return (
    <section className="view stack12">
      <div className="row between"><button type="button" className="btn" onClick={onBack}>← Thi thử</button></div>
      <div className="lesson-head"><span className="label">Đề thi thử</span><h2 className="h2 lesson-title">IELTS Writing</h2></div>
      {done ? (
        <>
          <div className="panel stack8">
            <span className="label">Bài của bạn · {words} từ {words < min && <span className="err">(chưa đủ {min} từ, bài thật sẽ bị trừ điểm)</span>}</span>
            <div className="essay">{text || <span className="muted">(trống)</span>}</div>
            <button type="button" className="btn self-start" onClick={() => { try { navigator.clipboard.writeText(text); } catch { /* bỏ qua */ } }}>Sao chép bài viết</button>
          </div>
          <div className="panel stack12">
            <span className="label">Tự chấm theo 4 tiêu chí IELTS</span>
            <p className="muted small m0">Đọc lại bài và tích những điều bạn đã làm được. Muốn có band chính xác, hãy nhờ giáo viên chấm.</p>
            {WRITING_CHECK.map((c) => (
              <div key={c.c} className="stack4">
                <b className="small">{c.c}</b>
                {c.items.map((it) => (
                  <label key={it} className="check small"><input type="checkbox" checked={!!checks[it]} onChange={(e) => setChecks({ ...checks, [it]: e.target.checked })} /> {it}</label>
                ))}
              </div>
            ))}
            <div className="small"><b className="num">{nChecked}/{nAll}</b> tiêu chí. {nChecked >= 10 ? "Bài đã khá đầy đủ, có thể hướng tới band 6.5 trở lên." : nChecked >= 6 ? "Khá ổn, hãy cải thiện những mục chưa tích." : "Hãy tập trung vào bố cục và trả lời đủ đề trước."}</div>
            <div className="row">
              <button type="button" className="btn primary" onClick={() => { setDone(false); setStarted(false); setText(""); setChecks({}); }}>Làm đề khác</button>
            </div>
          </div>
        </>
      ) : (
        <div className="panel stack12">
          <Chips value={String(task) as "1" | "2"} onChange={(v) => setTask(+v as 1 | 2)} options={[["1", "Task 1 · 20 phút"], ["2", "Task 2 · 40 phút"]]} />
          <div className="exam-q">{task === 1 ? t1.prompt : TASK2[n2]}</div>
          {task === 1 && <DataTable t={t1} />}
          <ul className="steps small">
            <li>Viết tối thiểu {min} từ trong {task === 1 ? 20 : 40} phút. App đếm chữ và đếm giờ cho bạn.</li>
            {task === 1 ? <li>Bố cục gợi ý: mở bài (viết lại đề), tổng quan (xu hướng chính), 2 đoạn chi tiết so sánh số liệu.</li> : <li>Bố cục gợi ý: mở bài nêu quan điểm, 2 đoạn thân bài (mỗi đoạn một ý và ví dụ), kết bài.</li>}
          </ul>
          <div className="row">
            <button type="button" className="btn" onClick={() => (task === 1 ? setN1((n1 + 1) % TASK1.length) : setN2((n2 + 1) % TASK2.length))}>Đổi đề</button>
            <button type="button" className="btn primary" onClick={() => { setText(""); setStarted(true); }}>Bắt đầu viết</button>
          </div>
        </div>
      )}
    </section>
  );
}

function DataTable({ t }: { t: (typeof TASK1)[number] }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead><tr>{t.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{t.rows.map((r) => <tr key={String(r[0])}>{r.map((c, k) => <td key={k} className={k ? "num" : undefined}>{c}{k ? "%" : ""}</td>)}</tr>)}</tbody>
      </table>
      <div className="muted small">Đơn vị: {t.unit}</div>
    </div>
  );
}

function WritingRun({ task, prompt, t1, text, setText, words, min, onDone, onQuit }: { task: 1 | 2; prompt: string; t1?: (typeof TASK1)[number]; text: string; setText: (s: string) => void; words: number; min: number; onDone: () => void; onQuit: () => void }) {
  const left = useCountdown(task === 1 ? 20 : 40);
  const [quit, setQuit] = useState(false);
  return (
    <section className="view stack12">
      <div className="row between">
        <button type="button" className="btn" onClick={() => (quit ? onQuit() : setQuit(true))}>{quit ? "Bấm lần nữa để thoát" : "← Thoát"}</button>
        <span className={`pill num ${left < 120 ? "lrn" : "new"}`}>{left ? fmt(left) : "Hết giờ"}</span>
      </div>
      <div className="panel stack8">
        <span className="label">Task {task}</span>
        <div className="exam-q">{prompt}</div>
        {t1 && <DataTable t={t1} />}
      </div>
      <textarea className="essay-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Viết bài của bạn ở đây…" spellCheck={false} />
      <div className="row between">
        <span className={`small num ${words >= min ? "okc" : "muted"}`}>{words}/{min} từ</span>
        <button type="button" className="btn primary" onClick={onDone}>Nộp bài và tự chấm</button>
      </div>
    </section>
  );
}

// ---------- IELTS Speaking ----------

type SpStep = { part: 1 | 2 | 3; q: string; prep: number; talk: number };

function IeltsSpeaking({ onBack }: { onBack: () => void }) {
  const steps = useMemo<SpStep[]>(() => {
    const p1 = shuffle(PART1).slice(0, 2).flatMap((t) => t.qs.slice(0, 2));
    const c = shuffle(PART2)[0];
    return [
      ...p1.map((q) => ({ part: 1 as const, q, prep: 0, talk: 30 })),
      { part: 2 as const, q: `${c.title} You should say: ${c.points.join(", ")}.`, prep: 60, talk: 120 },
      ...c.part3.slice(0, 3).map((q) => ({ part: 3 as const, q, prep: 0, talk: 45 })),
    ];
  }, []);
  const [i, setI] = useState(-1);
  const [log, setLog] = useState<{ q: string; said: string; sec: number }[]>([]);

  if (i >= 0 && i < steps.length) return <SpeakStep key={i} st={steps[i]} n={i} total={steps.length} onNext={(said, sec) => { setLog([...log, { q: steps[i].q, said, sec }]); setI(i + 1); }} onQuit={() => setI(-1)} />;

  return (
    <section className="view stack12">
      <div className="row between"><button type="button" className="btn" onClick={onBack}>← Thi thử</button></div>
      <div className="lesson-head"><span className="label">Đề thi thử</span><h2 className="h2 lesson-title">IELTS Speaking</h2></div>
      {i >= steps.length ? (
        <div className="panel stack12">
          <span className="label">Bạn đã hoàn thành phần thi nói</span>
          {log.map((l, k) => (
            <div key={k} className="wrong-row stack4">
              <div className="small"><b>{l.q}</b></div>
              <div className="small">{l.said ? l.said : <span className="muted">(không ghi lại được lời nói)</span>}</div>
              {l.said && <div className="muted small num">{l.said.split(/\s+/).length} từ trong {l.sec} giây</div>}
            </div>
          ))}
          <p className="muted small m0">Tự đánh giá: câu trả lời Part 1 nên dài 2–3 câu, Part 2 nói đủ khoảng 2 phút (180–250 từ), Part 3 có lý do và ví dụ. Nếu bạn hay ngập ngừng, hãy luyện thêm ở tab Hội thoại › IELTS Speaking.</p>
          <button type="button" className="btn primary self-start" onClick={() => { setLog([]); setI(0); }}>Làm lại</button>
        </div>
      ) : (
        <div className="panel stack12">
          <span className="label">Cấu trúc đề</span>
          <ul className="steps">
            <li>Part 1: 4 câu hỏi ngắn về bản thân, mỗi câu trả lời khoảng 30 giây.</li>
            <li>Part 2: 1 phút chuẩn bị, rồi nói 2 phút theo thẻ đề.</li>
            <li>Part 3: 3 câu hỏi thảo luận sâu hơn, mỗi câu khoảng 45 giây.</li>
            <li>Câu hỏi được đọc to. {canListen() ? "App ghi lại lời bạn nói thành chữ để bạn xem lại." : "Trình duyệt này không ghi lại được lời nói, bạn vẫn luyện được với đồng hồ đếm giờ."}</li>
          </ul>
          <button type="button" className="btn primary wide" onClick={() => setI(0)}>Bắt đầu</button>
        </div>
      )}
    </section>
  );
}

function SpeakStep({ st, n, total, onNext, onQuit }: { st: SpStep; n: number; total: number; onNext: (said: string, sec: number) => void; onQuit: () => void }) {
  const { say } = useStore();
  const [phase, setPhase] = useState<"prep" | "talk">(st.prep ? "prep" : "talk");
  const [left, setLeft] = useState(st.prep || st.talk);
  const [said, setSaid] = useState("");
  const [err, setErr] = useState("");
  const stopRef = useRef<() => void>(() => {});
  const live = useRef(true);
  const started = useRef(Date.now());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => { const t = setTimeout(() => say(st.q, "en"), 300); return () => { clearTimeout(t); live.current = false; stopRef.current(); }; }, [st.q, say]);
  useEffect(() => {
    const t = setInterval(() => setLeft((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (left > 0) return;
    if (phase === "prep") { setPhase("talk"); setLeft(st.talk); }
  }, [left, phase, st.talk]);
  useEffect(() => {
    if (phase !== "talk" || !canListen()) return;
    started.current = Date.now();
    let base = "";
    const go = () => {
      stopRef.current = listen("en", {
        continuous: true,
        onText: (t, fin) => { setSaid((base + " " + t).trim()); if (fin) base = (base + " " + t).trim(); },
        onEnd: () => { if (live.current && phaseRef.current === "talk") setTimeout(go, 200); },
        onError: (m) => setErr(m),
      });
    };
    go();
    return () => stopRef.current();
  }, [phase]);

  const next = () => { live.current = false; stopRef.current(); onNext(said, Math.round((Date.now() - started.current) / 1000)); };

  return (
    <section className="view stack12">
      <div className="row between">
        <button type="button" className="btn" onClick={onQuit}>← Thoát</button>
        <span className="muted small num">Part {st.part} · {n + 1}/{total}</span>
      </div>
      <div className="panel stack12">
        <span className="label">{phase === "prep" ? "Chuẩn bị" : "Nói"}</span>
        <div className="exam-q">{st.q}</div>
        <button type="button" className="btn self-start" onClick={() => say(st.q, "en")}>▶ Nghe lại câu hỏi</button>
        <div className="big-timer num">{fmt(left)}</div>
        {phase === "prep"
          ? <button type="button" className="btn primary" onClick={() => { setPhase("talk"); setLeft(st.talk); }}>Bắt đầu nói ngay</button>
          : <div className="stack8">
              {canListen() && <div className="said small">{said || <span className="muted">Đang nghe… hãy bắt đầu nói.</span>}</div>}
              {err && <div className="err small">{err}</div>}
              <button type="button" className="btn primary" onClick={next}>{left > 0 ? "Xong, câu tiếp" : "Hết giờ, câu tiếp"}</button>
            </div>}
      </div>
    </section>
  );
}
