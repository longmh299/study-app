// Phát âm bằng giọng đọc có sẵn của máy (Web Speech API): miễn phí, không gọi server.
// Có xử lý các lỗi hay gặp trên điện thoại:
//  - iPhone/Safari: phải "mở khóa" giọng đọc bằng một lần chạm của người dùng.
//  - Gọi cancel() rồi speak() ngay lập tức thì Safari và Chrome Android hay nuốt mất câu đọc.
//  - Chrome Android đôi khi để bộ đọc ở trạng thái tạm dừng.
//  - Trình duyệt trong app (Zalo, Facebook, Messenger…) thường không hỗ trợ đọc to.
import { DATA, type Lang } from "./data";
import { hasFile, playFile, stopFile } from "./audio";

let voices: SpeechSynthesisVoice[] = [];
const listeners = new Set<() => void>();
const warned: Record<string, boolean> = {};
// Giữ tham chiếu để trình duyệt không thu hồi câu đang đọc (lỗi im lặng trên Chrome)
const alive: SpeechSynthesisUtterance[] = [];
let unlocked = false;

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

function load() {
  try {
    voices = window.speechSynthesis.getVoices();
    listeners.forEach((fn) => fn());
  } catch {
    /* không hỗ trợ */
  }
}

/** Mở khóa giọng đọc ở lần chạm đầu tiên (bắt buộc trên iPhone). */
function unlock() {
  if (unlocked || !supported()) return;
  unlocked = true;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* bỏ qua */
  }
}

if (supported()) {
  load();
  window.speechSynthesis.addEventListener?.("voiceschanged", load);
  // Một số máy Android chỉ trả danh sách giọng sau vài lần hỏi
  let tries = 0;
  const poll = setInterval(() => { load(); if (voices.length || ++tries > 10) clearInterval(poll); }, 300);
  ["pointerdown", "touchend", "keydown"].forEach((ev) => window.addEventListener(ev, unlock, { once: true, passive: true }));
}

export function onVoices(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function pickVoice(L: Lang): SpeechSynthesisVoice | null {
  const want = L === "zh" ? ["zh-cn", "zh"] : ["en-us", "en-gb", "en"];
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();
  for (const w of want) {
    // Ưu tiên giọng có sẵn trên máy (không cần mạng)
    const v = voices.find((v) => norm(v).startsWith(w) && v.localService) || voices.find((v) => norm(v).startsWith(w));
    if (v) return v;
  }
  return null;
}

/** Nhận biết trình duyệt nhúng trong app (thường chặn đọc to). */
export function inAppBrowser() {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  if (/Zalo/i.test(ua)) return "Zalo";
  if (/FBAN|FBAV|FB_IAB|Messenger/i.test(ua)) return "Facebook";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return "TikTok";
  return "";
}

function say(text: string, L: Lang, rate: number) {
  const s = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = DATA[L].tts;
  u.rate = rate;
  u.volume = 1;
  const v = pickVoice(L);
  if (v) u.voice = v;
  alive.push(u);
  const drop = () => { const i = alive.indexOf(u); if (i >= 0) alive.splice(i, 1); };
  u.onend = drop;
  u.onerror = drop;
  if (s.paused) s.resume();
  s.speak(u);
  return !!v;
}

/** Dừng mọi âm thanh đang phát. */
export function stopSpeaking() {
  stopFile();
  try { if (supported()) window.speechSynthesis.cancel(); } catch { /* bỏ qua */ }
}

export function speak(text: string, L: Lang, rate: number, warn?: (msg: string) => void) {
  // Ưu tiên file âm thanh tạo sẵn; câu nào chưa có file mới dùng giọng đọc của máy
  if (hasFile(text, L)) {
    try { if (supported()) window.speechSynthesis.cancel(); } catch { /* bỏ qua */ }
    playFile(text, L, rate).then((ok) => { if (!ok) speakTTS(text, L, rate, warn); });
    return;
  }
  stopFile();
  speakTTS(text, L, rate, warn);
}

function speakTTS(text: string, L: Lang, rate: number, warn?: (msg: string) => void) {
  if (!supported()) {
    const app = inAppBrowser();
    warn?.(app ? `Trình duyệt trong ${app} không đọc to được. Hãy mở bằng Chrome hoặc Safari.` : "Trình duyệt này không hỗ trợ đọc to.");
    return;
  }
  try {
    unlocked = true;
    const s = window.speechSynthesis;
    let hasVoice: boolean;
    if (s.speaking || s.pending) {
      // Dừng câu cũ rồi đợi một nhịp mới đọc, tránh bị nuốt câu
      s.cancel();
      hasVoice = !!pickVoice(L);
      setTimeout(() => { try { say(text, L, rate); } catch { /* bỏ qua */ } }, 80);
    } else {
      hasVoice = say(text, L, rate);
    }
    if (!hasVoice && voices.length && !warned[L]) {
      warned[L] = true;
      warn?.(L === "zh"
        ? "Máy chưa có giọng đọc tiếng Trung. Vào Cài đặt để xem cách thêm."
        : "Máy chưa có giọng đọc tiếng Anh.");
    }
    const app = inAppBrowser();
    if (app && !warned.app) {
      warned.app = true;
      warn?.(`Bạn đang mở trong ${app}, có thể không có tiếng. Nếu không nghe thấy, hãy mở bằng Chrome hoặc Safari.`);
    }
  } catch {
    /* bỏ qua */
  }
}
