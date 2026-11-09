"use client";

import { useState } from "react";
import Quiz from "./Quiz";
import Exercises from "./Exercises";
import { Chips } from "./ui";

export default function Practice({ deck, setDeck }: { deck: string; setDeck: (d: string) => void }) {
  const [tab, setTab] = useState<"vocab" | "sent">("vocab");
  return (
    <section className="view">
      <div className="row between">
        <h2 className="h2">Luyện tập</h2>
        <Chips value={tab} onChange={setTab} options={[["vocab", "Từ vựng"], ["sent", "Bài tập câu"]]} />
      </div>
      {tab === "vocab" ? <Quiz deck={deck} setDeck={setDeck} /> : <Exercises />}
    </section>
  );
}
