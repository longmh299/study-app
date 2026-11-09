"use client";

import { useEffect, useState } from "react";
import { meaning } from "@/lib/data";
import { decksOf, deckInfo, useDecks, type DeckInfo } from "@/lib/decks";
import { deckStats } from "@/lib/srs";
import { useStore } from "@/lib/store";
import { Chips, ItemRow } from "./ui";

export default function Library({ onPractice }: { onPractice: (deck: string) => void }) {
  const { S } = useStore();
  const L = S.lang;
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setOpen(null), [L]);

  if (open) return <DeckView id={open} onBack={() => setOpen(null)} onPractice={onPractice} />;

  const groups = new Map<string, DeckInfo[]>();
  decksOf(L).forEach((d) => groups.set(d.group, [...(groups.get(d.group) || []), d]));

  return (
    <section className="view">
      <div>
        <h2 className="h2">Khóa học</h2>
        <p className="muted small m0">Bật “Học mỗi ngày” cho khóa bạn muốn đưa từ mới vào bài hằng ngày. Có thể bật nhiều khóa.</p>
      </div>
      {[...groups.entries()].map(([g, list]) => (
        <div className="stack8" key={g}>
          <span className="label">{g}</span>
          <div className="decks">
            {list.map((d) => <DeckRow key={d.id} d={d} onOpen={() => setOpen(d.id)} />)}
          </div>
        </div>
      ))}
    </section>
  );
}

function DeckRow({ d, onOpen }: { d: DeckInfo; onOpen: () => void }) {
  const { S, update } = useStore();
  const L = S.lang;
  const st = deckStats(S, L, d.id);
  const on = S.set.active[L].includes(d.id);
  const toggle = () => update((s) => {
    const a = s.set.active[L];
    s.set.active[L] = a.includes(d.id) ? a.filter((x) => x !== d.id) : [...a, d.id];
  });
  return (
    <div className={`deck${on ? " on" : ""}`}>
      <button type="button" className="deck-main" onClick={onOpen}>
        <div className="row between">
          <b className="deck-name">{d.name}</b>
          <span className="muted small num">{st.seen}/{d.count}</span>
        </div>
        <div className="muted small">{d.desc}</div>
        <div className="bar">
          <span className="k" style={{ width: `${(st.ok / d.count) * 100}%` }} />
          <span className="l" style={{ width: `${((st.seen - st.ok) / d.count) * 100}%` }} />
        </div>
      </button>
      <label className="check small deck-toggle">
        <input id={`active-${L}-${d.id}`} type="checkbox" checked={on} onChange={toggle} />
        Học mỗi ngày
      </label>
    </div>
  );
}

const PAGE = 60;

function DeckView({ id, onBack, onPractice }: { id: string; onBack: () => void; onPractice: (deck: string) => void }) {
  const { S } = useStore();
  const L = S.lang;
  const info = deckInfo(L, id)!;
  const { cards, error } = useDecks(L, [id]);
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");
  const [limit, setLimit] = useState(PAGE);

  const topics = cards && info.hasTopics ? [...new Map(cards.map((c) => [c.topic, c.topicName])).entries()] : [];
  const needle = q.trim().toLowerCase();
  const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const list = (cards || []).filter((c) =>
    (topic === "all" || c.topic === topic) &&
    (!needle || c.w.toLowerCase().includes(needle) || strip(c.p).includes(strip(needle)) || strip(meaning(c)).includes(strip(needle)) || (c.hv && strip(c.hv).includes(strip(needle))))
  );

  return (
    <section className="view">
      <div className="row between">
        <button type="button" className="btn" onClick={onBack}>← Khóa học</button>
        <button type="button" className="btn primary" onClick={() => onPractice(id)}>Luyện tập khóa này</button>
      </div>
      <div>
        <h2 className="h2">{info.name}</h2>
        <p className="muted small m0">{info.count} mục · {info.desc}</p>
      </div>
      <input
        id="deck-search"
        type="text"
        placeholder={L === "zh" ? "Tìm chữ Hán, pinyin, Hán Việt hoặc nghĩa" : "Tìm từ hoặc nghĩa"}
        value={q}
        onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }}
      />
      {topics.length > 1 && (
        <Chips value={topic} onChange={(t) => { setTopic(t); setLimit(PAGE); }} options={[["all", "Tất cả"], ...topics]} />
      )}
      <div className="panel list-panel">
        {!cards ? (
          <p className="muted">{error || "Đang tải từ vựng…"}</p>
        ) : list.length === 0 ? (
          <p className="muted">Không tìm thấy từ nào.</p>
        ) : (
          <div className="list">{list.slice(0, limit).map((c) => <ItemRow key={c.key} c={c} />)}</div>
        )}
      </div>
      {list.length > limit && (
        <button type="button" className="btn" onClick={() => setLimit(limit + PAGE * 2)}>
          Xem thêm ({list.length - limit} từ)
        </button>
      )}
    </section>
  );
}
