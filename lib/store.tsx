"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { DEF, loadLocal, merge, normalize, saveLocal, type State } from "./state";
import { speak as speakRaw } from "./speech";
import type { Lang } from "./data";

export type SyncStatus = "off" | "idle" | "saving" | "saved" | "error";

interface Ctx {
  S: State;
  ready: boolean;
  update: (fn: (s: State) => void) => void;
  user: User | null;
  sync: SyncStatus;
  syncError: string;
  toast: (msg: string) => void;
  say: (text: string, lang?: Lang) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore phải nằm trong <StoreProvider>");
  return c;
}

const PUSH_DELAY = 1500; // gom nhiều lần chấm điểm thành 1 lần ghi để tiết kiệm request

/** Dịch lỗi Supabase thường gặp sang hướng dẫn sửa bằng tiếng Việt. */
function explain(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("progress") && (m.includes("does not exist") || m.includes("schema cache") || m.includes("could not find")))
    return "Chưa tạo bảng dữ liệu. Vào Supabase › SQL Editor, dán toàn bộ file supabase/schema.sql rồi bấm Run.";
  if (m.includes("row-level security") || m.includes("permission denied"))
    return "Supabase từ chối ghi dữ liệu. Hãy chạy lại file supabase/schema.sql để tạo đúng quyền (Row Level Security).";
  if (m.includes("jwt") || m.includes("invalid api key") || m.includes("no api key"))
    return "Sai URL hoặc key Supabase. Kiểm tra lại 2 biến môi trường trên Vercel rồi Redeploy.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Mất kết nối mạng. App sẽ tự lưu lại khi có mạng.";
  return msg;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [S, setS] = useState<State>(DEF);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sync, setSync] = useState<SyncStatus>(supabase ? "idle" : "off");
  const [syncError, setSyncError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const sRef = useRef(S);
  sRef.current = S;
  const userRef = useRef<User | null>(null);
  const pulled = useRef(false);
  const lastPushed = useRef(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3200);
  }, []);

  const say = useCallback((text: string, lang?: Lang) => {
    speakRaw(text, lang ?? sRef.current.lang, sRef.current.set.rate, toast);
  }, [toast]);

  const push = useCallback(async (s: State, u: User) => {
    if (!supabase) return;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    lastPushed.current = s.u;
    setSync("saving");
    const { error } = await supabase
      .from("progress")
      .upsert({ user_id: u.id, data: s, updated_at: new Date().toISOString() });
    if (error) { setSync("error"); setSyncError(explain(error.message)); lastPushed.current = -1; }
    else { setSync("saved"); setSyncError(""); }
  }, []);

  const pull = useCallback(async (u: User) => {
    if (!supabase) return;
    setSync("saving");
    const { data, error } = await supabase.from("progress").select("data").eq("user_id", u.id).maybeSingle();
    if (error) { setSync("error"); setSyncError(explain(error.message)); return; }
    const merged = data?.data ? merge(sRef.current, normalize(data.data)) : sRef.current;
    pulled.current = true;
    setS(merged);
    await push(merged, u);
  }, [push]);

  // Đọc dữ liệu trên máy + theo dõi đăng nhập
  useEffect(() => {
    setS(loadLocal());
    setReady(true);
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      userRef.current = u;
      setUser(u);
      if (u) pull(u);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      const prev = userRef.current;
      userRef.current = u;
      setUser(u);
      if (event === "SIGNED_IN" && u && prev?.id !== u.id) { pulled.current = false; pull(u); }
      if (event === "SIGNED_OUT") { pulled.current = false; setSync("idle"); }
    });
    return () => sub.subscription.unsubscribe();
  }, [pull]);

  // Lưu trên máy ngay, đẩy lên Supabase sau một khoảng ngắn
  useEffect(() => {
    if (!ready) return;
    saveLocal(S);
    const u = userRef.current;
    if (!u || !pulled.current || S.u === lastPushed.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(sRef.current, u), PUSH_DELAY);
  }, [S, ready, push]);

  // Có mạng trở lại hoặc mở lại tab: thử đồng bộ lại nếu lần trước lỗi
  useEffect(() => {
    const retry = () => {
      const u = userRef.current;
      if (!u || document.visibilityState === "hidden") return;
      if (!pulled.current) pull(u);
      else if (sRef.current.u !== lastPushed.current) push(sRef.current, u);
    };
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);
    return () => { window.removeEventListener("online", retry); document.removeEventListener("visibilitychange", retry); };
  }, [pull, push]);

  // Rời trang / tắt màn hình: đẩy nốt phần chưa lưu
  useEffect(() => {
    const flush = () => {
      const u = userRef.current;
      if (document.visibilityState === "hidden" && u && timer.current) push(sRef.current, u);
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [push]);

  const update = useCallback((fn: (s: State) => void) => {
    setS((prev) => {
      const next = structuredClone(prev);
      fn(next);
      next.u = Date.now();
      return next;
    });
  }, []);

  return (
    <StoreCtx.Provider value={{ S, ready, update, user, sync, syncError, toast, say }}>
      {children}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </StoreCtx.Provider>
  );
}
