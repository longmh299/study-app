"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSES, LEVELS, PASS, best, isUnlocked, lessonCards, lessonSentences, levelOf, nextLesson, type Lesson } from "@/lib/course";
import { buildDrill, PRACTICE, TEST, type DQ } from "@/lib/drill";
import { schedule } from "@/lib/srs";
import { useStore } from "@/lib/store";
import { meaning } from "@/lib/data";
import { Chips, MicCheck, SpeakBtn } from "./ui";
import { DialogueView } from "./Talk";
import Drill from "./Drill";

export default function Course({ openId, setOpenId }: { openId: string | null; setOpenId: (id: string | null) => void }) {
  const { S, update } = useStore();
  const L = S.lang;
  const list = COURSES[L];
  const lesson = list.find((l) => l.id === openId);
  if (lesson) return <LessonView l={lesson} onBack={() => setOpenId(null)} onOpen={setOpenId} />;

  const passed = list.filter((l) => best(S, l.id) >= PASS).length;
  const next = nextLesson(S, L);

  return (
    <section className="view">
      <div>
        <h2 className="h2">Giáo trình {L === "zh" ? "tiếng Trung" : "tiếng Anh"}</h2>
        <p className="muted small m0">
          {LEVELS[L].length} cấp độ, {list.length} bài. Mỗi bài gồm từ mới, ngữ pháp, hội thoại, luyện tập và bài kiểm tra. Đạt {PASS}% mở khóa bài tiếp theo, từ của bài được đưa vào lịch ôn hằng ngày.
        </p>
      </div>
      <div className="panel stack8">
        <div className="row between">
          <span className="small"><b className="num">{passed}/{list.length}</b> bài đã đạt</span>
          {next && <button type="button" className="btn primary" onClick={() => setOpenId(next.id)}>{passed ? "Học tiếp" : "Bắt đầu"}: {levelOf(next).short} · Bài {next.no}</button>}
        </div>
        <div className="bar"><span className="k" style={{ width: `${(passed / list.length) * 100}%` }} /></div>
        <label className="check small">
          <input id="unlock-all" type="checkbox" checked={S.set.unlockAll} onChange={(e) => update((s) => { s.set.unlockAll = e.target.checked; })} />
          Mở khóa tất cả bài (nếu bạn đã có nền tảng)
        </label>
      </div>
      {LEVELS[L].map((lv) => {
        const done = lv.lessons.filter((l) => best(S, l.id) >= PASS).length;
        return (
          <div className="stack8" key={lv.id}>
            <div className="row between">
              <span className="label">{lv.name}</span>
              <span className="muted small num">{done}/{lv.lessons.length}</span>
            </div>
            <ol className="lessons">
              {lv.lessons.map((l) => {
                const i = list.indexOf(l);
                const b = best(S, l.id);
                const open = isUnlocked(S, L, i);
                const st = b >= PASS ? "pass" : b >= 0 ? "tried" : open ? "open" : "lock";
                return (
                  <li key={l.id}>
                    <button type="button" className={`lesson ${st}`} disabled={!open} onClick={() => setOpenId(l.id)}>
                      <span className="no num">{l.no}</span>
                      <span className="lt">
                        <b className={L === "zh" ? "han-mix" : undefined}>{l.title}</b>
                        <span className="muted small">{l.sub} · {l.words.length} từ</span>
                      </span>
                      <span className="ls small">
                        {st === "pass" ? <span className="pill ok">Đạt {b}%</span> : st === "tried" ? <span className="pill lrn">{b}%</span> : st === "lock" ? <span className="muted">Khóa</span> : <span className="pill new">Mới</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </section>
  );
}

type Step = "words" | "grammar" | "dialogue" | "practice" | "test";
const STEPS: [Step, string][] = [["words", "Từ mới"], ["grammar", "Ngữ pháp"], ["dialogue", "Hội thoại"], ["practice", "Luyện tập"], ["test", "Kiểm tra"]];

function LessonView({ l, onBack, onOpen }: { l: Lesson; onBack: () => void; onOpen: (id: string) => void }) {
  const { S, update, toast } = useStore();
  const L = l.lang;
  const [step, setStep] = useState<Step>("words");
  const [run, setRun] = useState<{ kind: "practice" | "test"; qs: DQ[] } | null>(null);
  const [result, setResult] = useState<{ kind: "practice" | "test"; score: number; wrong: DQ[] } | null>(null);
  const [mic, setMic] = useState<string | null>(null);

  useEffect(() => { setStep("words"); setRun(null); setResult(null); window.scrollTo(0, 0); }, [l.id]);

  const cards = useMemo(() => lessonCards(l), [l]);
  const sents = useMemo(() => lessonSentences(l), [l]);
  const extra = useMemo(() => COURSES[L].filter((x) => x.id !== l.id).flatMap(lessonCards), [L, l.id]);
  const idx = COURSES[L].findIndex((x) => x.id === l.id);
  const nextL = COURSES[L][idx + 1];
  const b = best(S, l.id);
  const zh = L === "zh";

  const start = (kind: "practice" | "test") => {
    setResult(null);
    setRun({ kind, qs: buildDrill(L, cards, extra, sents, kind === "test" ? TEST : PRACTICE, l.no === 0) });
  };

  const finish = (score: number, wrong: DQ[]) => {
    const kind = run!.kind;
    setRun(null);
    setResult({ kind, score, wrong });
    if (kind !== "test") return;
    let added = 0;
    update((s) => {
      s.course[l.id] = Math.max(s.course[l.id] ?? -1, score);
      if (score >= PASS) {
        for (const c of cards) if (!s.srs[c.key]) { s.srs[c.key] = schedule(undefined, 2); added++; }
      }
    });
    if (score >= PASS) toast(added ? `Đạt! ${cards.length} từ của bài đã vào lịch ôn.` : "Đạt! Đã mở khóa bài tiếp theo.");
  };

  if (run) return <section className="view"><Drill qs={run.qs} lang={L} title={run.kind === "test" ? "Kiểm tra" : "Luyện tập"} onDone={finish} onQuit={() => setRun(null)} /></section>;

  const goNext = () => { const k = STEPS.findIndex((s) => s[0] === step); if (k < STEPS.length - 1) { setStep(STEPS[k + 1][0]); window.scrollTo(0, 0); } };

  return (
    <section className="view">
      <div className="row between">
        <button type="button" className="btn" onClick={onBack}>← Giáo trình</button>
        {b >= 0 && <span className={`pill ${b >= PASS ? "ok" : "lrn"}`}>Điểm cao nhất {b}%</span>}
      </div>
      <div className="lesson-head">
        <span className="label">Bài {l.no} · {levelOf(l).name}</span>
        <h2 className={`h2 lesson-title${zh ? " han-mix" : ""}`}>{l.title}</h2>
        <div className="muted">{l.sub}</div>
      </div>
      <div className="steps-bar">
        <Chips value={step} onChange={(s) => { setStep(s); setResult(null); }} options={STEPS} />
      </div>

      {step === "words" && (
        <>
          <div className="panel stack8">
            <span className="label">Mục tiêu bài học</span>
            <ul className="steps">{l.goals.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>
          <div className="panel list-panel">
            <div className="list">
              {cards.map((c, k) => (
                <div key={c.key} className="item-wrap">
                  <div className="item">
                    <SpeakBtn text={c.w} lang={L} />
                    <div className="t">
                      <div className={`w${zh ? " han" : ""}`}>{c.w} <span className="w-p">{c.p}</span>{l.words[k][3] && zh ? <span className="w-hv"> · ngoài HSK 1</span> : null}</div>
                      <div className="muted small">{c.m}</div>
                    </div>
                    <button type="button" className="btn small-btn" onClick={() => setMic(mic === c.key ? null : c.key)}>{mic === c.key ? "Đóng" : "Nói thử"}</button>
                  </div>
                  {mic === c.key && <div className="item-mic"><MicCheck target={c.w} lang={L} /></div>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {step === "grammar" && l.grammar.map((g, gi) => (
        <article className="panel grammar" key={gi}>
          <span className="label">Ngữ pháp {gi + 1}</span>
          <h3 className="h3">{g.title}</h3>
          {g.pattern && <div className={`pattern${zh ? " han-mix" : ""}`}>{g.pattern}</div>}
          {g.explain.split("\n").map((p, i) => <p key={i} className="m0 gp">{p}</p>)}
          <div className="examples">
            {g.examples.map(([t, py, vi], i) => {
              const txt = zh ? t.replace(/\s+/g, "") : t;
              return (
                <div className="ex-row" key={i}>
                  <SpeakBtn text={txt} lang={L} label="Nghe ví dụ" />
                  <div>
                    <div className={`ex-t${zh ? " han-inline" : ""}`}>{txt}</div>
                    {py && <div className="ex-py">{py}</div>}
                    <div className="muted small">{vi}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      ))}

      {step === "grammar" && l.notes && (
        <div className="panel note">
          <span className="label">Ghi chú</span>
          {l.notes.map((n) => <p key={n} className="m0 gp">{n}</p>)}
        </div>
      )}

      {step === "dialogue" && (
        <DialogueView embedded d={{ id: l.id, lang: L, title: l.title, level: `Bài ${l.no}`, scene: l.dialogue.scene, roles: l.dialogue.roles, lines: l.dialogue.lines }} />
      )}

      {(step === "practice" || step === "test") && (
        result && result.kind === step ? (
          <div className="stack12">
            <div className="panel done">
              <div className="seal num score">{result.score}%</div>
              <h2 className="h2">
                {step === "test" ? (result.score >= PASS ? "Bạn đã đạt bài này!" : `Chưa đạt, cần ${PASS}%`) : result.score >= PASS ? "Sẵn sàng làm kiểm tra" : "Luyện thêm một lượt nhé"}
              </h2>
              {step === "test" && result.score >= PASS && <p className="muted m0">Từ của bài đã vào lịch ôn ở tab Hôm nay.</p>}
              <div className="row center">
                <button type="button" className="btn" onClick={() => start(step)}>Làm lại</button>
                {step === "practice" && <button type="button" className="btn primary" onClick={() => { setResult(null); setStep("test"); }}>Làm kiểm tra</button>}
                {step === "test" && result.score >= PASS && nextL && <button type="button" className="btn primary" onClick={() => onOpen(nextL.id)}>Sang {levelOf(nextL).short} · Bài {nextL.no}</button>}
                {step === "test" && result.score < PASS && <button type="button" className="btn primary" onClick={() => { setResult(null); setStep("grammar"); }}>Xem lại ngữ pháp</button>}
              </div>
            </div>
            {result.wrong.length > 0 && (
              <div className="panel stack8">
                <span className="label">Câu làm sai</span>
                {result.wrong.map((q, k) => (
                  <div key={k} className="wrong-row">
                    {"c" in q
                      ? <><b className={zh ? "han-inline" : undefined}>{q.c.w}</b> {q.c.p} = {meaning(q.c)}</>
                      : <><b className={zh ? "han-inline" : undefined}>{q.s.t}</b> <span className="muted">{q.s.vi}</span></>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="panel stack12">
            <span className="label">{step === "test" ? "Bài kiểm tra" : "Luyện tập"}</span>
            <p className="m0">
              {step === "test"
                ? `${TEST.vocab + TEST.order + TEST.cloze} câu: chọn nghĩa, chọn từ, nghe${l.no === 0 ? "" : ", sắp xếp câu, điền từ"}. Cần đạt ${PASS}% để mở bài tiếp theo.`
                : "Câu hỏi trộn từ vựng và câu trong bài. Làm bao nhiêu lần cũng được, không tính điểm."}
            </p>
            <button type="button" className="btn primary wide" onClick={() => start(step)}>{step === "test" ? "Bắt đầu kiểm tra" : "Bắt đầu luyện tập"}</button>
          </div>
        )
      )}

      {step !== "practice" && step !== "test" && (
        <button type="button" className="btn primary wide" onClick={goNext}>
          Tiếp: {STEPS[STEPS.findIndex((s) => s[0] === step) + 1][1]} →
        </button>
      )}
    </section>
  );
}
