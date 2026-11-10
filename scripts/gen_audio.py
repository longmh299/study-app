"""
Tạo file âm thanh MP3 cho mọi câu chữ trong app bằng Kokoro (mã nguồn mở, Apache 2.0)
qua sherpa-onnx. Chạy một lần trên máy; kết quả là file tĩnh trong public/audio.

  pip install sherpa-onnx soundfile
  # tải 2 mô hình từ https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
  #   kokoro-multi-lang-v1_0 (giọng tiếng Anh af_heart), kokoro-multi-lang-v1_1 (giọng tiếng Trung)
  npx tsx scripts/list-speech.ts > scripts/speech-list.json
  python3 scripts/extra_lexicon.py scripts/speech-list.json <mô hình v1_0>/lexicon-us-en.txt <thư mục mô hình>/lexicon-extra.txt
  python3 scripts/gen_audio.py scripts/speech-list.json <thư mục chứa 2 mô hình>

Tên file = FNV-1a 32 bit của "ngôn ngữ:câu" (UTF-8), trùng với lib/audio.ts.
Chạy lại thì bỏ qua file đã có, nên có thể dừng giữa chừng rồi chạy tiếp.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import sherpa_onnx
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio")
ORDER = ["course", "basic", "dialogue", "english", "ielts", "hsk3", "hsk4", "hsk5", "hsk6"]
# Từ điển bổ sung (scripts/extra_lexicon.py), đặt cạnh các mô hình
EXTRA = ""
VOICE = {"en": ("kokoro-multi-lang-v1_0", 3, 0.95), "zh": ("kokoro-multi-lang-v1_1", 3, 0.9)}


def fnv1a(s: str) -> str:
    h = 0x811C9DC5
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def two(n: int) -> str:
    if n < 20:
        return ONES[n]
    return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")


def say_text(lang: str, text: str) -> str:
    """Chuẩn hóa câu trước khi đọc (tên file vẫn tính theo câu gốc)."""
    if lang != "en":
        return text
    text = re.sub(r"\s/\s", ". ", text)
    text = text.replace("→", ".").replace("“", "").replace("”", "")
    # Năm 1900–2099 đọc theo cặp: 2023 → twenty twenty-three
    text = re.sub(r"\b(19|20)(\d\d)\b", lambda m: f"{two(int(m.group(1)))} {'hundred' if m.group(2) == '00' else ('oh ' + ONES[int(m.group(2))] if m.group(2)[0] == '0' else two(int(m.group(2))))}", text)
    text = re.sub(r"\b\d{1,2}\b", lambda m: two(int(m.group(0))), text)
    return text


def engine(models: str, name: str):
    d = os.path.join(models, name) + "/"
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=d + "model.onnx", voices=d + "voices.bin", tokens=d + "tokens.txt",
                data_dir=d + "espeak-ng-data", dict_dir=d + "dict",
                lexicon=EXTRA + "," + d + "lexicon-us-en.txt," + d + "lexicon-zh.txt"),
            num_threads=2),
        max_num_sentences=2)
    return sherpa_onnx.OfflineTts(cfg)


def main():
    items = json.load(open(sys.argv[1], encoding="utf-8"))
    models = sys.argv[2]
    global EXTRA
    EXTRA = os.path.join(models, "lexicon-extra.txt")
    items.sort(key=lambda x: ORDER.index(x["group"]) if x["group"] in ORDER else 0)
    engines = {}
    done = 0
    for it in items:
        lang, text = it["lang"], it["text"]
        path = os.path.join(OUT, lang, fnv1a(f"{lang}:{text}") + ".mp3")
        if os.path.exists(path):
            done += 1
            continue
        model, sid, speed = VOICE[lang]
        if model not in engines:
            engines[model] = engine(models, model)
        a = engines[model].generate(say_text(lang, text), sid=sid, speed=speed)
        if len(a.samples) == 0:
            print("bỏ qua (không tạo được âm thanh):", lang, text, flush=True)
            continue
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            sf.write(tmp.name, a.samples, a.sample_rate)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-af", "silenceremove=start_periods=1:start_threshold=-50dB",
                            "-ac", "1", "-ar", "24000", "-b:a", "32k", path], check=True)
        done += 1
        if done % 100 == 0:
            print(f"{done}/{len(items)}", flush=True)
    write_manifest()
    print("xong", done, flush=True)


def write_manifest():
    man = {}
    for lang in ("en", "zh"):
        d = os.path.join(OUT, lang)
        man[lang] = "".join(sorted(f[:8] for f in os.listdir(d) if f.endswith(".mp3"))) if os.path.isdir(d) else ""
    json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"))


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--manifest":
        write_manifest()
    else:
        main()
