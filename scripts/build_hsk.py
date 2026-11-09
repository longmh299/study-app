"""
Tạo public/data/hsk{1..6}.json từ 2 bộ dữ liệu mở (cùng giấy phép MIT):
  - complete-hsk-vocabulary (drkameleon): từ HSK 2.0, pinyin, nghĩa tiếng Anh
  - hanviet-pinyin-wordlist (ph0ngp): âm Hán Việt theo chữ phồn thể + pinyin
và scripts/vi_hsk.tsv (nghĩa tiếng Việt, tự viết, dạng: từ<TAB>nghĩa).

Chạy:
  python3 scripts/build_hsk.py <thư mục complete-hsk-vocabulary> <file hanviet.csv>

Mỗi từ được ghi thành mảng [chữ giản thể, pinyin, Hán Việt, nghĩa Việt, nghĩa Anh].
"""
import ast
import csv
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chv, hvcsv = sys.argv[1], sys.argv[2]


def norm_py(s: str) -> str:
    s = s.lower().replace("ü", "u:").replace("v", "u:")
    return s


hv: dict[tuple[str, str], str] = {}
hv_any: dict[str, str] = {}
with open(hvcsv, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        ch, py = row["char"], row["pinyin"]
        try:
            opts = ast.literal_eval(row["hanviet"])
        except (ValueError, SyntaxError):
            continue
        if not opts:
            continue
        reading = opts[0]
        hv.setdefault((ch, norm_py(py)), reading)
        hv_any.setdefault(ch, reading)


def hanviet(trad: str, numeric: str) -> str:
    sylls = numeric.split()
    chars = [c for c in trad if not c.isspace()]
    out = []
    for i, ch in enumerate(chars):
        py = norm_py(sylls[i]) if i < len(sylls) else ""
        r = hv.get((ch, py)) or hv.get((ch, re.sub(r"\d", "", py) + "5")) or hv.get((ch, "*")) or hv_any.get(ch)
        if not r:
            return ""
        out.append(r)
    return " ".join(out)


def join_pinyin(p: str) -> str:
    parts = p.split()
    res = parts[0] if parts else ""
    for s in parts[1:]:
        res += ("'" if s[:1].lower() in "aāáǎàeēéěèoōóǒò" else "") + s
    return res


vi: dict[str, str] = {}
py_override: dict[str, str] = {}  # cột 3 (tùy chọn): pinyin đúng cho chữ đa âm
vi_path = os.path.join(ROOT, "scripts", "vi_hsk.tsv")
if os.path.exists(vi_path):
    with open(vi_path, encoding="utf-8") as f:
        for line in f:
            cols = line.rstrip("\n").split("\t")
            if len(cols) >= 2:
                vi[cols[0].strip()] = cols[1].strip()
                if len(cols) >= 3 and cols[2].strip():
                    py_override[cols[0].strip()] = cols[2].strip()

BAD = re.compile(r"^(surname|variant of|old variant|used in|abbr\.|\(archaic\)|archaic|\(Tw\)|\(dialect\)|see )", re.I)


def good_meanings(form):
    return [m for m in form["meanings"] if not BAD.match(m)]


def flat(p: str) -> str:
    return re.sub(r"[\s']", "", p.lower())


def pick_form(simp, forms):
    ov = py_override.get(simp)
    if ov:
        match = [f for f in forms if flat(join_pinyin(f["transcriptions"]["pinyin"])) == flat(ov)]
        if match:
            return max(match, key=lambda f: len(good_meanings(f))), ov
    best = max(forms, key=lambda f: len(good_meanings(f)))
    return best, ov

os.makedirs(os.path.join(ROOT, "public", "data"), exist_ok=True)
seen: set[str] = set()
for level in range(1, 7):
    words = json.load(open(os.path.join(chv, "wordlists", "exclusive", "old", f"{level}.json"), encoding="utf-8"))
    out, miss_hv, miss_vi = [], 0, 0
    for w in words:
        simp = w["simplified"]
        if simp in seen:
            continue
        seen.add(simp)
        form, ov = pick_form(simp, w["forms"])
        t = form["transcriptions"]
        en = "; ".join((good_meanings(form) or form["meanings"])[:2])
        if len(en) > 80:
            en = en[:77].rsplit(" ", 1)[0] + "…"
        h = hanviet(form["traditional"], t["numeric"])
        miss_hv += not h
        miss_vi += simp not in vi
        out.append([simp, ov or join_pinyin(t["pinyin"]), h, vi.get(simp, ""), en])
    with open(os.path.join(ROOT, "public", "data", f"hsk{level}.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"HSK {level}: {len(out)} từ, thiếu Hán Việt {miss_hv}, thiếu nghĩa Việt {miss_vi}")
