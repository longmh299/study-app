// Phát file âm thanh tạo sẵn (public/audio, xem scripts/gen_audio.py).
// Máy không có giọng đọc (ví dụ điện thoại Xiaomi bản nội địa) vẫn có tiếng.
import type { Lang } from "./data";

/** FNV-1a 32 bit trên UTF-8, trùng với scripts/gen_audio.py */
export function fnv1a(s: string) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(s)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

let have: Record<Lang, Set<string>> | null = null;
let player: HTMLAudioElement | null = null;

if (typeof window !== "undefined") {
  fetch("/audio/manifest.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((m: Record<Lang, string> | null) => {
      if (!m) return;
      const split = (s: string) => new Set(s.match(/.{8}/g) || []);
      have = { en: split(m.en || ""), zh: split(m.zh || "") };
    })
    .catch(() => { /* không có file âm thanh: dùng giọng của máy */ });
}

export function hasFile(text: string, L: Lang) {
  return !!have && have[L].has(fnv1a(`${L}:${text.trim()}`));
}

/** Phát file nếu có. Trả về false khi không có file hoặc trình duyệt chặn phát. */
export async function playFile(text: string, L: Lang, rate: number): Promise<boolean> {
  if (!hasFile(text, L)) return false;
  try {
    player ??= new Audio();
    player.pause();
    player.src = `/audio/${L}/${fnv1a(`${L}:${text.trim()}`)}.mp3`;
    // Tốc độ mặc định 0.85 tương ứng tốc độ gốc của file
    player.playbackRate = Math.min(1.5, Math.max(0.6, rate / 0.85));
    await player.play();
    return true;
  } catch {
    return false;
  }
}

export function stopFile() {
  try { player?.pause(); } catch { /* bỏ qua */ }
}
