// Phát âm bằng giọng đọc có sẵn của máy (Web Speech API): miễn phí, không gọi server.
import { DATA, type Lang } from "./data";

let voices: SpeechSynthesisVoice[] = [];
const listeners = new Set<() => void>();
const warned: Partial<Record<Lang, boolean>> = {};

function load() {
  try {
    voices = window.speechSynthesis.getVoices();
    listeners.forEach((fn) => fn());
  } catch {
    /* không hỗ trợ */
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  load();
  window.speechSynthesis.addEventListener?.("voiceschanged", load);
}

export function onVoices(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function pickVoice(L: Lang): SpeechSynthesisVoice | null {
  const want = L === "zh" ? ["zh-cn", "zh"] : ["en-us", "en-gb", "en"];
  for (const w of want) {
    const v = voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(w));
    if (v) return v;
  }
  return null;
}

export function speak(text: string, L: Lang, rate: number, warn?: (msg: string) => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    warn?.("Trình duyệt này không hỗ trợ đọc to.");
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = DATA[L].tts;
    u.rate = rate;
    const v = pickVoice(L);
    if (v) u.voice = v;
    else if (voices.length && !warned[L]) {
      warned[L] = true;
      warn?.(L === "zh"
        ? "Máy chưa có giọng đọc tiếng Trung. Vào Cài đặt để xem cách thêm."
        : "Máy chưa có giọng đọc tiếng Anh.");
    }
    window.speechSynthesis.speak(u);
  } catch {
    /* bỏ qua */
  }
}
