"""Tạo từ điển phát âm bổ sung cho Kokoro: dạng -s, -ed, 's, từ ghép có gạch nối, viết tắt
và tên riêng tiếng Việt mà từ điển gốc không có (nếu thiếu, Kokoro sẽ bỏ qua từ đó khi đọc).
Chạy: python3 scripts/extra_lexicon.py <speech-list.json> <lexicon-us-en.txt> <file ra>"""
import json, re, sys

items, lexpath, outpath = sys.argv[1], sys.argv[2], sys.argv[3]
lex = {}
for line in open(lexpath, encoding="utf-8"):
    p = line.split()
    if p and p[0].lower() not in lex:
        lex[p[0].lower()] = p[1:]

VOICELESS = {"p", "t", "k", "f", "θ"}
SIBIL = {"s", "z", "ʃ", "ʒ", "ʧ", "ʤ"}
# Tên riêng và chữ viết tắt: ghép từ các từ tiếng Anh có cách đọc gần nhất
MANUAL = {"mai": "my", "hoa": "who-ah", "minh": "min", "vung": "voong", "sa": "saw", "tau": "tow",
          "tv": "tee-vee", "ok": "okay", "lan": "lahn", "da": "dah", "nang": "nahng", "binh": "bin",
          "hometown": "home-town", "sandcastles": "sand-castles",
          # Viết trực tiếp ký hiệu âm (bắt đầu bằng "="): A = /eɪ/, Y = /ɔɪ/
          "n-a-m": "=ˈ ɛ n ˈ A ˈ ɛ m", "hoi": "=h ˈ Y", "vung": "=v ˈ u ŋ", "nha": "=n j ˈ ɑ", "trang": "=ʧ ˈ ɑ ŋ"}


def phones(w):
    w = w.lower().replace("’", "'")
    if w in lex:
        return lex[w]
    if w in MANUAL:
        m = MANUAL[w]
        return m[1:].split() if m.startswith("=") else phones(m)
    if "-" in w:
        parts = [phones(x) for x in w.split("-") if x]
        return sum(parts, []) if all(parts) else None
    if w.endswith("'"):
        return phones(w[:-1])
    if w.endswith("'s"):
        b = phones(w[:-2])
        return b and add_s(b)
    if w.endswith("ies"):
        b = phones(w[:-3] + "y")
        if b: return b + ["z"]
    if w.endswith("es"):
        b = phones(w[:-2])
        if b and b[-1] in SIBIL: return b + ["ᵻ", "z"]
    if w.endswith("s") and not w.endswith("ss"):
        b = phones(w[:-1])
        if b: return add_s(b)
    if w.endswith("ed"):
        for base in (w[:-2], w[:-1], w[:-3] if len(w) > 4 and w[-3] == w[-4] else None, w[:-3] + "y" if w.endswith("ied") else None):
            if base and (b := phones(base)):
                last = b[-1]
                if base.endswith("y") and w.endswith("ied"): return b + ["d"]
                if last in {"t", "d"}: return b + ["ᵻ", "d"]
                return b + (["t"] if last in VOICELESS or last in {"s", "ʃ", "ʧ"} else ["d"])
    return None


def add_s(b):
    last = b[-1]
    if last in SIBIL: return b + ["ᵻ", "z"]
    return b + (["s"] if last in VOICELESS else ["z"])


words = set()
for it in json.load(open(items, encoding="utf-8")):
    if it["lang"] == "en":
        for w in re.findall(r"[A-Za-z][A-Za-z'’-]*", it["text"]):
            w = w.lower().replace("’", "'")
            words.add(w.strip("'-") or w)
            if w.endswith("'"):
                words.add(w)  # dạng sở hữu số nhiều như parents' cũng cần một mục riêng
missing, out = [], []
for w in sorted(words):
    if w in lex: continue
    p = phones(w)
    if p: out.append(f"{w} {' '.join(p)}")
    else: missing.append(w)
open(outpath, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("bổ sung", len(out), "từ; chưa xử lý được:", missing)
