# Study App

Web app học tiếng Anh và tiếng Trung cho người mất gốc.

**Tính năng**
- **Giáo trình** (do dự án tự biên soạn)
  - Tiếng Trung: Sơ cấp 1 (Bài 0 ngữ âm + 12 bài, đủ 150 từ HSK 1), Sơ cấp 2 (10 bài, đủ 147 từ HSK 2), Trung cấp 1 (12 bài, đủ 298 từ HSK 3: 把, 被, bổ ngữ khả năng, bổ ngữ xu hướng, 虽然…但是…, 如果…就…), Trung cấp 2 (20 bài, đủ 594 từ HSK 4: 不仅…还, 无论…都, 既然…就, 即使…也, 连…都, 难道, 尽管, 随着…), Cao cấp 1 · HSK 5 phần 1 (20 bài, khoảng 700 từ HSK 5: 毕竟, 反而, 宁可, 一旦, 除非, 与其…不如, 难怪, 万一, 哪怕, 自从…以来, 从而, 总之…).
  - Tiếng Anh: Sơ cấp 1 · A1 (Bài 0 phát âm + 12 bài), Sơ cấp 2 · A2 (10 bài), Trung cấp 1 · B1 (10 bài: hiện tại hoàn thành tiếp diễn, used to, quá khứ hoàn thành, bị động, mệnh đề quan hệ, điều kiện loại 2, câu tường thuật, modal phỏng đoán, cụm động từ, từ nối) và Trung cấp 2 · B2 (10 bài: điều kiện loại 3 và hỗn hợp, wish, tương lai hoàn thành, modal hoàn thành, have sth done, câu chẻ, đảo ngữ, mệnh đề phân từ, hedging, V-ing / to V) và Cao cấp 1 · C1 (10 bài: nhấn mạnh, điều kiện đảo ngữ, giả định cách, danh từ hóa, tương lai trong quá khứ, modal nâng cao, tỉnh lược, từ nối lập trường, mệnh đề nhượng bộ, collocation và thành ngữ).
  - Mỗi bài gồm: mục tiêu, từ mới (nghe + chấm phát âm), 2–3 điểm ngữ pháp có công thức và ví dụ, hội thoại nhập vai, luyện tập và bài kiểm tra 15 câu.
  - Đạt 80% mới mở bài sau. Khi đạt, từ của bài tự vào lịch ôn hằng ngày. Có tùy chọn mở khóa tất cả cho người đã có nền.
- **Hôm nay**: thẻ ghi nhớ lặp lại ngắt quãng (kiểu Anki), lấy từ mới từ các khóa bạn bật, có nút *Nói thử* để chấm phát âm.
- **Khóa học**
  - Tiếng Trung: Nhập môn, HSK 1–6 (4.991 từ). Mỗi từ có pinyin và âm Hán Việt. HSK 1–3 có nghĩa tiếng Việt, HSK 4–6 có nghĩa tiếng Anh.
  - Tiếng Anh: Nhập môn (IPA), Giao tiếp (10 tình huống), IELTS Vocabulary (8 chủ đề, có câu ví dụ), Cụm từ Writing & Speaking.
  - Có tìm kiếm theo chữ Hán, pinyin, Hán Việt hoặc nghĩa (gõ không dấu cũng được).
- **Luyện tập**
  - Từ vựng: chọn nghĩa, chọn từ, nghe chọn, nghe và gõ.
  - Bài tập câu: sắp xếp câu, điền từ, nghe chép chính tả.
- **Hội thoại**: 7 bài tiếng Anh và 7 bài tiếng Trung. Nghe cả bài, hoặc *nhập vai*: app đọc lời người kia, bạn nói và được chấm phát âm từng chữ.
- **IELTS Speaking**: Part 1 (8 chủ đề), Part 2 (đồng hồ 1 phút chuẩn bị + 2 phút nói, ghi lại lời nói thành chữ, đếm từ/phút, có bài mẫu), Part 3.

Công nghệ: **Next.js 15** (App Router) + **Supabase** (đăng nhập, lưu tiến độ) + **Vercel** (hosting).

## Vì sao gần như không tốn tiền

| Phần | Cách làm | Chi phí |
|---|---|---|
| Nội dung bài học | Nằm sẵn trong code (`lib/data.ts`), không đọc database | 0 |
| Phát âm | Web Speech API, dùng giọng đọc có sẵn của máy | 0 |
| Chấm phát âm, ghi lời nói | Nhận diện giọng nói có sẵn trong Chrome, Edge, Safari | 0 |
| HSK 1–6 | File JSON tĩnh trong `public/data`, chỉ tải khóa đang dùng | 0 |
| Tiến độ | Mỗi người dùng **1 dòng JSON** trên Supabase. Nhiều lần chấm điểm được gom lại rồi ghi 1 lần | Gói Free |
| Trang web | Build ra trang tĩnh, không dùng serverless function | Vercel Hobby (miễn phí) |
| Đăng nhập | Email + mật khẩu của Supabase Auth | Gói Free |

Chưa đăng nhập thì app vẫn chạy được, tiến độ lưu trong trình duyệt. Đăng nhập thì tiến độ được đồng bộ lên Supabase để dùng trên nhiều máy. Khi đăng nhập lần đầu, tiến độ trên máy và trên mạng được gộp lại tự động.

---

## Bước 1: Tạo Supabase (khoảng 5 phút)

1. Vào https://supabase.com, đăng nhập, bấm **New project**. Region nên chọn **Southeast Asia (Singapore)** cho nhanh.
2. Mở **SQL Editor**, dán toàn bộ nội dung file `supabase/schema.sql`, bấm **Run**.
3. Vào **Authentication › Sign In / Providers › Email** và **tắt "Confirm email"**, rồi bấm Save.
   Lý do: email mặc định của Supabase bị giới hạn rất ít thư mỗi giờ. Tắt xác nhận email thì tạo tài khoản là dùng được ngay, không cần cấu hình SMTP.
4. Vào **Project Settings › API Keys** (hoặc bấm nút **Connect**), chép 2 giá trị:
   - **Project URL**, dạng `https://xxxx.supabase.co`
   - **Publishable key**, dạng `sb_publishable_...`. Project cũ thì dùng key **anon**, cũng được.

## Bước 2: Chạy thử trên máy (không bắt buộc)

Cần Node.js 18.18 trở lên.

```bash
npm install
cp .env.example .env.local   # rồi điền 2 giá trị ở bước 1.4
npm run dev
```

Mở http://localhost:3000

## Bước 3: Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Study App"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/study-app.git
git push -u origin main
```

(Tạo repo trống tên `study-app` trên GitHub trước. Để chế độ Private cũng được.)

## Bước 4: Deploy lên Vercel

1. Vào https://vercel.com, đăng nhập bằng GitHub, bấm **Add New › Project**, chọn repo `study-app`.
2. Mở phần **Environment Variables** và thêm:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Publishable key
3. Bấm **Deploy**. Khoảng 1 phút sau bạn có link dạng `https://study-app.vercel.app`.
4. (Nên làm) Quay lại Supabase, vào **Authentication › URL Configuration**, đặt **Site URL** bằng link Vercel ở trên.

Từ giờ, mỗi lần `git push` thì Vercel tự deploy lại.

### Cài như app trên điện thoại
Mở link bằng Safari (iPhone) hoặc Chrome (Android), chọn **Thêm vào màn hình chính**.

---

## Lưu ý về gói miễn phí

- **Supabase Free tạm dừng project nếu 7 ngày liền không có hoạt động.** Học mỗi ngày thì không lo. Nếu bị tạm dừng, vào dashboard bấm **Restore**, dữ liệu vẫn còn.
- Gói **Vercel Hobby** dành cho dự án cá nhân, phi thương mại. Nếu sau này thu tiền người dùng thì cần lên gói Pro.
- Dung lượng: mỗi người dùng chỉ chiếm vài chục KB, nên gói Free 500 MB chứa được hàng nghìn người.

## Giọng đọc tiếng Trung

App dùng giọng đọc có sẵn của hệ điều hành. Nếu máy chưa có giọng tiếng Trung, tab Cài đặt sẽ báo và hướng dẫn cài thêm:
- **Windows:** Settings › Time & Language › Speech › Add voices › Chinese (Simplified)
- **Android:** Cài đặt › Chuyển văn bản thành giọng nói › Google › Cài đặt dữ liệu giọng nói
- **iPhone/Mac:** thường có sẵn

## Micro & chấm phát âm

- Dùng được trên **Chrome, Edge** (máy tính, Android) và **Safari** (iPhone, Mac). Firefox chưa hỗ trợ.
- Lần đầu bấm *Nói thử*, trình duyệt sẽ hỏi quyền dùng micro.
- Micro chỉ hoạt động trên trang **https** (Vercel đã có sẵn) hoặc `localhost`.
- Điểm phát âm là mức trùng khớp giữa câu mẫu và câu máy nghe được. Nó cho biết bạn nói đã rõ chưa, nhưng không chấm chi tiết thanh điệu.

## Cấu trúc thư mục

```
app/                   layout, trang chính, CSS, icon, manifest (PWA)
components/            App (khung + tab), Home, Library, Practice (Quiz + Exercises),
                       Talk (hội thoại), Speaking (IELTS), Settings, ui
lib/data.ts            khóa Nhập môn, thanh điệu
lib/decks.ts           danh sách khóa học, tải HSK theo nhu cầu
lib/content/           giáo trình (course-zh.ts, course-en.ts), giao tiếp & IELTS,
                       hội thoại, đề IELTS Speaking
lib/course.ts          nối bài học với lịch ôn, điều kiện mở khóa
lib/drill.ts           tạo bài luyện tập / kiểm tra của mỗi bài
lib/sentences.ts       ngân hàng câu cho bài tập
lib/listen.ts          nhận giọng nói, so sánh câu
public/data/hsk*.json  từ vựng HSK 1–6 đã xử lý
scripts/               tạo lại dữ liệu HSK (build_hsk.py, vi_hsk.tsv)
lib/srs.ts      thuật toán lặp lại ngắt quãng (SM-2 rút gọn)
lib/state.ts    kiểu dữ liệu, lưu trên máy, gộp tiến độ giữa các máy
lib/store.tsx   trạng thái app + đồng bộ Supabase
lib/speech.ts   phát âm
supabase/schema.sql   bảng `progress` + Row Level Security
```

## Thêm nội dung

- **Giáo trình:** mỗi cấp là một file trong `lib/content/` (course-zh.ts, course-zh2.ts, course-zh3.ts, course-zh4.ts, course-zh5.ts, course-en.ts … course-en5.ts). Danh sách từ HSK 3, 4, 5 nằm riêng trong các file course-zh*-words.ts, khai báo thứ tự cấp trong `LEVELS` ở `lib/course.ts`. Thêm bài theo đúng cấu trúc các bài sẵn có (kiểu dữ liệu trong `course-types.ts`). Từ tiếng Trung ngoài HSK 1 đánh dấu `1` ở cuối. Câu tiếng Trung viết cách từ bằng dấu cách.

- **Nhập môn, Giao tiếp, Cụm từ:** thêm dòng vào **cuối** chủ đề trong `lib/data.ts` hoặc `lib/content/english.ts`. Không xóa hoặc đổi thứ tự dòng cũ, vì tiến độ được lưu theo vị trí.
- **IELTS Vocabulary, HSK:** tiến độ lưu theo chính từ đó, nên thêm hay sắp xếp lại thoải mái.
- **Hội thoại:** thêm vào `lib/content/dialogues.ts`. Câu tiếng Trung viết cách từng từ bằng dấu cách (`我 叫 李明 。`) để làm được bài sắp xếp câu.
- **Nghĩa tiếng Việt cho HSK 4–6:** thêm dòng `từ<TAB>nghĩa` vào `scripts/vi_hsk.tsv`, tải 2 bộ dữ liệu gốc (xem `THIRD_PARTY_NOTICES.md`) rồi chạy:
  ```bash
  python3 scripts/build_hsk.py <thư mục complete-hsk-vocabulary> <file hanviet.csv>
  ```

## Ghi công

Dữ liệu HSK và âm Hán Việt lấy từ 2 dự án mã nguồn mở (giấy phép MIT), chi tiết trong `THIRD_PARTY_NOTICES.md`. Nghĩa tiếng Việt, mẫu câu, hội thoại và đề IELTS do dự án tự biên soạn.
