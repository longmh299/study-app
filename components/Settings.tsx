"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { onVoices, pickVoice } from "@/lib/speech";
import { useStore } from "@/lib/store";

const SYNC_TXT = { off: "Chưa cấu hình Supabase", idle: "Chưa đồng bộ", saving: "Đang lưu…", saved: "Đã lưu lên mạng", error: "Lỗi đồng bộ" };

export default function Settings() {
  const { S, update, user, sync, syncError, say, toast } = useStore();
  const [, force] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => onVoices(() => force((n) => n + 1)), []);
  const ven = pickVoice("en");
  const vzh = pickVoice("zh");

  return (
    <section className="view">
      <h2 className="h2">Cài đặt</h2>

      <div className="panel">
        <div className="setting">
          <span className="label">Tài khoản</span>
          {!supabase ? (
            <p className="muted small m0">
              App chưa được nối với Supabase, tiến độ đang lưu trên máy này. Xem README để thêm biến môi trường.
            </p>
          ) : user ? (
            <>
              <div className="row between">
                <div className="t-min">
                  <div className="ellipsis"><b>{user.email}</b></div>
                  <div className={`small sync-${sync}`}>{SYNC_TXT[sync]}</div>
                </div>
                <button type="button" className="btn" onClick={() => supabase!.auth.signOut()}>Đăng xuất</button>
              </div>
              {sync === "error" && <p className="small err m0">{syncError}</p>}
            </>
          ) : (
            <AuthForm />
          )}
        </div>
      </div>

      <div className="panel">
        <div className="setting">
          <label className="label" htmlFor="npd">Từ mới mỗi ngày (mỗi ngôn ngữ)</label>
          <select id="npd" value={S.set.newPerDay} onChange={(e) => update((s) => { s.set.newPerDay = +e.target.value; })}>
            {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n} từ{n === 10 ? " (khuyên dùng)" : ""}</option>)}
          </select>
        </div>
        <div className="setting">
          <label className="label" htmlFor="rate">Tốc độ đọc: <span className="num">{S.set.rate.toFixed(2)}×</span></label>
          <input id="rate" type="range" min="0.5" max="1.2" step="0.05" value={S.set.rate}
            onChange={(e) => update((s) => { s.set.rate = +e.target.value; })} />
          <button type="button" className="btn self-start"
            onClick={() => say(S.lang === "zh" ? "你好，很高兴认识你。" : "Hello, nice to meet you.")}>Nghe thử</button>
        </div>
        <div className="setting">
          <label className="check">
            <input id="auto" type="checkbox" checked={S.set.auto} onChange={(e) => update((s) => { s.set.auto = e.target.checked; })} />
            Tự đọc khi lật sang thẻ mới
          </label>
        </div>
      </div>

      <div className="panel">
        <div className="setting">
          <span className="label">Giọng đọc trên máy này</span>
          <div className="small">
            Tiếng Anh: <b>{ven ? ven.name : "chưa có"}</b><br />
            Tiếng Trung: <b>{vzh ? vzh.name : "chưa có"}</b>
          </div>
          <p className="muted small m0">
            Không nghe thấy tiếng? Kiểm tra: tăng âm lượng, tắt gạt im lặng trên iPhone, và mở trang bằng Chrome hoặc Safari (không mở trong Zalo, Facebook).
          </p>
          {!vzh && (
            <p className="muted small m0">
              Thêm giọng tiếng Trung miễn phí: Windows vào Settings › Time &amp; Language › Speech › Add voices › Chinese (Simplified).
              Android vào Cài đặt › Chuyển văn bản thành giọng nói › Google › Cài đặt dữ liệu giọng nói. iPhone/Mac thường có sẵn giọng Tingting.
            </p>
          )}
        </div>
        <div className="setting">
          <span className="label">Xóa tiến độ</span>
          {confirmReset ? (
            <>
              <p className="small err m0">Xóa toàn bộ tiến độ cả hai ngôn ngữ{user ? ", kể cả bản lưu trên mạng" : ""}? Không thể hoàn tác.</p>
              <div className="row">
                <button type="button" className="btn danger" onClick={() => {
                  update((s) => { s.srs = {}; s.days = {}; });
                  setConfirmReset(false);
                  toast("Đã xóa tiến độ");
                }}>Xóa hẳn</button>
                <button type="button" className="btn" onClick={() => setConfirmReset(false)}>Hủy</button>
              </div>
            </>
          ) : (
            <button type="button" className="btn self-start" onClick={() => setConfirmReset(true)}>Xóa tiến độ…</button>
          )}
        </div>
      </div>
    </section>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg({ ok: false, text: error.message === "Invalid login credentials" ? "Sai email hoặc mật khẩu." : error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password: pw });
      if (error) setMsg({ ok: false, text: error.message });
      else if (!data.session) setMsg({ ok: true, text: "Đã tạo tài khoản. Hãy mở email để xác nhận rồi đăng nhập." });
    }
    setBusy(false);
  };

  return (
    <form className="stack8" onSubmit={submit}>
      <p className="muted small m0">Đăng nhập để lưu tiến độ lên mạng và học tiếp trên điện thoại, máy tính khác.</p>
      <input id="email" type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input id="pw" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"}
        placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={pw} onChange={(e) => setPw(e.target.value)} />
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? "Đang xử lý…" : mode === "in" ? "Đăng nhập" : "Tạo tài khoản"}
      </button>
      <button type="button" className="link" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
        {mode === "in" ? "Chưa có tài khoản? Tạo mới" : "Đã có tài khoản? Đăng nhập"}
      </button>
      {msg && <p className={`small m0 ${msg.ok ? "okc" : "err"}`}>{msg.text}</p>}
    </form>
  );
}
