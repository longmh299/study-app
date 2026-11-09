"use client";

import { useEffect, useMemo, useState } from "react";
import { DATA, TONES, meaning, type Card } from "@/lib/data";
import { deckInfo, useDecks } from "@/lib/decks";
import { COURSES, PASS, best, levelOf, nextLesson } from "@/lib/course";
import { DAY, STATUS_TXT, dayLog, deckStats, dkey, dueCards, ivlLabel, newCards, newLeft, schedule, status, streak, studiedDecks } from "@/lib/srs";
import { useStore } from "@/lib/store";
import { MicCheck, SpeakBtn, WordView } from "./ui";
import type { View } from "./App";

interface Session { q: Card[]; idx: number; flipped: boolean; total: number; done: number; again: number }

export default function Home({ onGo, onLesson }: { onGo: (v: View) => void; onLesson: (id: string) => void }) {
  const { S, user } = useStore();
  const [sess, setSess] = useState<Session | null>(null);
  const L = S.lang;
  const active = S.set.active[L];
  const need = useMemo(() => [...new Set([...active, ...studiedDecks(S, L)])], [active, S, L]);
  const { cards, error } = useDecks(L, need);

  useEffect(() => { setSess(null); }, [L]);

  if (sess) return <Study sess={sess} setSess={setSess} onGo={onGo} />;

  const due = cards ? dueCards(S, cards) : [];
  const fresh = cards ? newCards(S, L, cards.filter((c) => active.includes(c.deck))) : [];
  const nl = Math.min(newLeft(S, L), fresh.length);
  const total = due.length + nl;
  const seen = Object.keys(S.srs).filter((k) => k.startsWith(L + ":")).length;
  const known = Object.entries(S.srs).filter(([k, v]) => k.startsWith(L + ":") && v.i >= 7).length;

  const start = () => {
    const q: Card[] = [];
    let i = 0, j = 0;
    while (i < due.length || j < fresh.length) {
      if (i < due.length) q.push(due[i++]);
      if (i < due.length) q.push(due[i++]);
      if (j < fresh.length) q.push(fresh[j++]);
    }
    setSess({ q, idx: 0, flipped: false, total: q.length, done: 0, again: 0 });
  };

  const strip = Array.from({ length: 14 }, (_, k) => {
    const i = 13 - k;
    const key = dkey(Date.now() - i * DAY);
    const d = S.days[key]?.[L];
    const n = d ? d.n + d.r : 0;
    const lv = n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : 3;
    return <i key={key} data-l={lv} className={i === 0 ? "today" : undefined} title={`${key}: ${n} lượt`} />;
  });

  return (
    <section className="view">
      <div className="panel hero">
        <div className="label">
          {DATA[L].name} · {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}
        </div>
        <div className="big">
          <div className="stat acc"><b>{cards ? due.length : "…"}</b><span className="muted small">thẻ cần ôn</span></div>
          <div className="stat"><b>{cards ? nl : "…"}</b><span className="muted small">từ mới hôm nay</span></div>
          <div className="stat"><b>{streak(S)}</b><span className="muted small">ngày liên tiếp</span></div>
        </div>
        <button type="button" className="btn primary wide" disabled={!total} onClick={start}>
          {!cards ? (error || "Đang tải bài…") : total ? `Bắt đầu học · ${total} thẻ` : "Xong bài hôm nay rồi"}
        </button>
        <div className="row between small">
          <span className="muted">
            Đang học: {active.map((id) => deckInfo(L, id)?.name).filter(Boolean).join(", ") || "chưa chọn khóa nào"}
          </span>
          <button type="button" className="link" onClick={() => onGo("library")}>Đổi khóa học</button>
        </div>
        {cards && !total && <p className="muted small m0">Muốn học thêm? Bật thêm khóa ở tab Khóa học, tăng số từ mới trong Cài đặt, hoặc làm bài ở tab Luyện tập.</p>}
        <div className="stack6">
          <div className="row between">
            <span className="label">14 ngày qua</span>
            <span className="muted small num">{known} từ đã nhớ · {seen} đã gặp</span>
          </div>
          <div className="strip">{strip}</div>
        </div>
      </div>

      <LessonCard onLesson={onLesson} />

      {seen === 0 && (
        <div className="panel">
          <h3 className="h3">Cách học cho người mất gốc</h3>
          <ol className="steps muted">
            <li>Học theo <b>Giáo trình</b> từ Bài 0: từ mới, ngữ pháp, hội thoại, rồi làm kiểm tra.</li>
            <li>Mỗi ngày bấm <b>Bắt đầu học</b> để ôn lại từ đã học, khoảng 10–15 phút là đủ.</li>
            <li>Luôn bấm loa, đọc to theo, rồi bấm <b>Nói thử</b> để app chấm phát âm.</li>
            <li>Chấm điểm thật lòng: quên thì bấm <b>Quên</b>, app sẽ hỏi lại sớm hơn.</li>
            <li>Học xong, vào <b>Luyện tập</b> làm bài, rồi <b>Hội thoại</b> để tập nói theo tình huống.</li>
            <li>Học hết Nhập môn thì vào <b>Khóa học</b> bật {L === "zh" ? "HSK 1" : "Tiếng Anh giao tiếp"}.</li>
            {!user && <li>Vào <b>Cài đặt</b> để đăng nhập, tiến độ sẽ được lưu lên mạng và dùng được trên mọi máy.</li>}
          </ol>
        </div>
      )}

      {L === "zh" && (
        <div className="panel stack12">
          <div>
            <h3 className="h3">4 thanh điệu tiếng Trung</h3>
            <p className="muted small m0">Cùng âm “ma”, đổi thanh là đổi nghĩa. Bấm để nghe.</p>
          </div>
          <Tones />
        </div>
      )}

      <div className="panel stack14">
        <div className="row between">
          <h3 className="h3 m0">Khóa đang học</h3>
          <div className="legend">
            <span><i className="lg-k" />Đã nhớ</span>
            <span><i className="lg-l" />Đang học</span>
          </div>
        </div>
        <div className="topics">
          {active.map((id) => {
            const info = deckInfo(L, id);
            if (!info) return null;
            const st = deckStats(S, L, id);
            return (
              <div className="topic" key={id}>
                <span>{info.name}</span>
                <span className="muted small num">{st.seen}/{info.count}</span>
                <div className="bar">
                  <span className="k" style={{ width: `${(st.ok / info.count) * 100}%` }} />
                  <span className="l" style={{ width: `${((st.seen - st.ok) / info.count) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LessonCard({ onLesson }: { onLesson: (id: string) => void }) {
  const { S } = useStore();
  const L = S.lang;
  const list = COURSES[L];
  const next = nextLesson(S, L);
  const passed = list.filter((l) => best(S, l.id) >= PASS).length;
  return (
    <div className="panel lesson-card">
      <div className="stack6">
        <span className="label">Giáo trình · {passed}/{list.length} bài</span>
        {next ? (
          <>
            <b className={`lc-title${L === "zh" ? " han-mix" : ""}`}>{levelOf(next).short} · Bài {next.no}: {next.title}</b>
            <span className="muted small">{next.sub}</span>
          </>
        ) : <b>Bạn đã hoàn thành giáo trình!</b>}
      </div>
      {next && <button type="button" className="btn primary" onClick={() => onLesson(next.id)}>{passed ? "Học tiếp" : "Bắt đầu"}</button>}
    </div>
  );
}

function Tones() {
  const { say } = useStore();
  return (
    <div className="tones">
      {TONES.map((t) => (
        <button type="button" key={t.p} className="tone" aria-label={t.n} onClick={() => say(t.h, "zh")}>
          <svg viewBox="0 0 56 30" aria-hidden="true">
            <path d={t.path} fill="none" stroke="var(--zh)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="h">{t.h}</span>
          <span className="p">{t.p}</span>
          <span className="m">{t.m}</span>
        </button>
      ))}
    </div>
  );
}

function Study({ sess, setSess, onGo }: { sess: Session; setSess: (s: Session | null) => void; onGo: (v: View) => void }) {
  const { S, update, say } = useStore();
  const c = sess.q[sess.idx];

  const rate = (g: number) => {
    if (!c) return;
    update((s) => {
      const wasNew = !s.srs[c.key];
      s.srs[c.key] = schedule(s.srs[c.key], g);
      const log = dayLog(s, c.lang);
      if (wasNew) log.n++; else log.r++;
    });
    setSess({
      ...sess,
      q: g === 0 ? [...sess.q, c] : sess.q,
      idx: sess.idx + 1,
      flipped: false,
      done: sess.done + 1,
      again: sess.again + (g === 0 ? 1 : 0),
      total: sess.total + (g === 0 ? 1 : 0),
    });
  };
  const flip = () => setSess({ ...sess, flipped: true });

  useEffect(() => {
    if (c && S.set.auto) {
      const t = setTimeout(() => say(c.w, c.lang), 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sess.idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input,textarea,select") || !c) return;
      if (e.code === "Space") { e.preventDefault(); if (!sess.flipped) flip(); }
      else if (sess.flipped && ["1", "2", "3", "4"].includes(e.key)) rate(+e.key - 1);
      else if (e.key.toLowerCase() === "p") say(c.w, c.lang);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!c) {
    return (
      <section className="view">
        <div className="panel done">
          <div className={`seal${S.lang === "zh" ? " han" : ""}`}>{S.lang === "zh" ? "好" : "OK"}</div>
          <h2 className="h2">Xong bài hôm nay</h2>
          <p className="muted m0">
            Bạn đã ôn {sess.done} thẻ{sess.again ? `, quên ${sess.again} lần` : ""}. Ngày mai quay lại để giữ chuỗi nhé.
          </p>
          <div className="row center">
            <button type="button" className="btn primary" onClick={() => { setSess(null); onGo("practice"); }}>Làm bài luyện tập</button>
            <button type="button" className="btn" onClick={() => { setSess(null); onGo("talk"); }}>Tập hội thoại</button>
          </div>
        </div>
      </section>
    );
  }

  const st = status(S, c);
  const prev = [0, 1, 2, 3].map((g) => ivlLabel(schedule(S.srs[c.key], g)));

  return (
    <section className="view">
      <div className="row between">
        <button type="button" className="btn" onClick={() => setSess(null)}>← Dừng</button>
        <span className="muted small num">{sess.done}/{sess.total}</span>
      </div>
      <div className="progress"><span style={{ width: `${(sess.done / Math.max(1, sess.total)) * 100}%` }} /></div>
      <div className="card">
        <span className="tag">{deckInfo(c.lang, c.deck)?.name}{c.deck !== c.topic ? ` · ${c.topicName}` : ""}</span>
        <span className={`state pill ${st}`}>{STATUS_TXT[st]}</span>
        <WordView c={c} />
        <SpeakBtn text={c.w} lang={c.lang} label="Nghe phát âm" />
        {sess.flipped ? (
          <>
            {c.p && <div className="phon">{c.p}{c.hv && <span className="hv"> · {c.hv}</span>}</div>}
            <div className="mean">{meaning(c)}</div>
            {c.m && c.en && <div className="muted small">{c.en}</div>}
            {c.ex && (
              <div className="ex">
                <span>{c.ex}</span>
                <SpeakBtn text={c.ex} lang={c.lang} label="Nghe câu ví dụ" />
              </div>
            )}
          </>
        ) : (
          <p className="muted small m0">Đọc to theo, tự đoán nghĩa rồi lật thẻ.</p>
        )}
        <MicCheck target={c.w} lang={c.lang} compact />
      </div>
      {sess.flipped ? (
        <div className="rates">
          {["Quên", "Khó", "Được", "Dễ"].map((t, g) => (
            <button type="button" key={t} className={`g${g}`} onClick={() => rate(g)} autoFocus={g === 2}>
              {t}<small>{prev[g]}</small>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="btn primary wide" onClick={flip}>Lật thẻ</button>
      )}
      <div className="kbd">Bàn phím: Space lật thẻ · 1–4 chấm điểm · P nghe lại</div>
    </section>
  );
}
