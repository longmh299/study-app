// Nhận diện giọng nói bằng Web Speech API có sẵn trong trình duyệt (Chrome, Edge, Safari).
// Miễn phí, không cần server hay API key.
import { DATA, type Lang } from "./data";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Rec = any;

function Ctor(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export const canListen = () => !!Ctor();

export interface ListenOpts {
  continuous?: boolean;
  onText: (text: string, final: boolean) => void;
  onEnd: () => void;
  onError: (msg: string) => void;
}

/** Bắt đầu nghe; trả về hàm dừng. */
export function listen(lang: Lang, o: ListenOpts): () => void {
  const C = Ctor();
  if (!C) { o.onError("Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Safari."); o.onEnd(); return () => {}; }
  const r: Rec = new C();
  r.lang = DATA[lang].tts;
  r.interimResults = true;
  r.continuous = !!o.continuous;
  r.maxAlternatives = 1;
  let finalText = "";
  r.onresult = (e: any) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += (finalText && lang === "en" ? " " : "") + t.trim();
      else interim += t;
    }
    o.onText((finalText + (interim ? (lang === "en" && finalText ? " " : "") + interim : "")).trim(), !interim);
  };
  r.onerror = (e: any) => {
    const m: Record<string, string> = {
      "not-allowed": "Chưa cho phép dùng micro. Bấm biểu tượng ổ khóa trên thanh địa chỉ để bật.",
      "no-speech": "Không nghe thấy gì, hãy thử lại và nói to hơn.",
      "audio-capture": "Không tìm thấy micro.",
      network: "Mất kết nối mạng khi nhận giọng nói.",
    };
    if (e.error !== "aborted") o.onError(m[e.error] || "Không nhận được giọng nói, thử lại nhé.");
  };
  r.onend = () => o.onEnd();
  try { r.start(); } catch { o.onError("Không bật được micro."); o.onEnd(); }
  return () => { try { r.stop(); } catch { /* đã dừng */ } };
}

/** Tách câu thành đơn vị so sánh: từ (tiếng Anh) hoặc chữ (tiếng Trung). */
export function units(text: string, lang: Lang): string[] {
  if (lang === "zh") return [...text.replace(/[^㐀-鿿\w]/g, "")];
  return text.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
}

/** So sánh câu mẫu với câu đã nói: điểm 0–100 và từng đơn vị đúng/sai trong câu mẫu. */
export function compare(target: string, said: string, lang: Lang) {
  const a = units(target, lang), b = units(said, lang);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(n).fill(false);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { hit[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const lcs = dp[0][0];
  const score = n + m === 0 ? 0 : Math.round((200 * lcs) / (n + m));
  return { score, units: a, hit };
}
