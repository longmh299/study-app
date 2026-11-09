// Nội dung bài học nằm ngay trong code: không tốn lượt đọc database.
// Muốn thêm từ: thêm dòng [từ, phiên âm, nghĩa] vào chủ đề tương ứng.
// Lưu ý: không đổi thứ tự hoặc xóa từ cũ, vì tiến độ lưu theo vị trí (chủ đề + số thứ tự).

export type Lang = "en" | "zh";

export interface Topic {
  id: string;
  name: string;
  phr?: boolean; // chủ đề câu giao tiếp
  items: [string, string, string][];
}

export interface Card {
  key: string;
  lang: Lang;
  deck: string;
  topic: string;
  topicName: string;
  phr: boolean;
  w: string; // từ / câu
  p: string; // phiên âm IPA, pinyin, hoặc từ loại
  m: string; // nghĩa tiếng Việt (có thể trống với HSK 4–6)
  hv?: string; // âm Hán Việt
  en?: string; // nghĩa tiếng Anh (cho từ tiếng Trung)
  ex?: string; // câu ví dụ
}

/** Nghĩa để hiển thị: ưu tiên tiếng Việt, không có thì dùng tiếng Anh. */
export const meaning = (c: Card) => c.m || c.en || "";

export const DATA: Record<Lang, { name: string; tts: string; topics: Topic[] }> = {
  en: {
    name: "Tiếng Anh",
    tts: "en-US",
    topics: [
      { id: "greet", name: "Chào hỏi", items: [
        ["hello", "/həˈloʊ/", "xin chào"], ["goodbye", "/ɡʊdˈbaɪ/", "tạm biệt"], ["thank you", "/ˈθæŋk juː/", "cảm ơn"],
        ["sorry", "/ˈsɑːri/", "xin lỗi"], ["please", "/pliːz/", "làm ơn, xin vui lòng"], ["yes", "/jes/", "vâng, có"],
        ["no", "/noʊ/", "không"], ["name", "/neɪm/", "tên"], ["friend", "/frend/", "bạn bè"], ["morning", "/ˈmɔːrnɪŋ/", "buổi sáng"],
      ]},
      { id: "num", name: "Số đếm", items: [
        ["one", "/wʌn/", "một (1)"], ["two", "/tuː/", "hai (2)"], ["three", "/θriː/", "ba (3)"], ["four", "/fɔːr/", "bốn (4)"],
        ["five", "/faɪv/", "năm (5)"], ["six", "/sɪks/", "sáu (6)"], ["seven", "/ˈsevn/", "bảy (7)"], ["eight", "/eɪt/", "tám (8)"],
        ["nine", "/naɪn/", "chín (9)"], ["ten", "/ten/", "mười (10)"],
      ]},
      { id: "fam", name: "Gia đình", items: [
        ["mother", "/ˈmʌðər/", "mẹ"], ["father", "/ˈfɑːðər/", "bố"], ["brother", "/ˈbrʌðər/", "anh/em trai"],
        ["sister", "/ˈsɪstər/", "chị/em gái"], ["family", "/ˈfæməli/", "gia đình"], ["child", "/tʃaɪld/", "đứa trẻ, con"],
        ["husband", "/ˈhʌzbənd/", "chồng"], ["wife", "/waɪf/", "vợ"],
      ]},
      { id: "food", name: "Đồ ăn uống", items: [
        ["water", "/ˈwɔːtər/", "nước"], ["rice", "/raɪs/", "cơm, gạo"], ["coffee", "/ˈkɔːfi/", "cà phê"], ["tea", "/tiː/", "trà"],
        ["bread", "/bred/", "bánh mì"], ["egg", "/eɡ/", "trứng"], ["fish", "/fɪʃ/", "cá"], ["chicken", "/ˈtʃɪkɪn/", "thịt gà, con gà"],
        ["fruit", "/fruːt/", "trái cây"], ["milk", "/mɪlk/", "sữa"],
      ]},
      { id: "verb", name: "Động từ cơ bản", items: [
        ["eat", "/iːt/", "ăn"], ["drink", "/drɪŋk/", "uống"], ["go", "/ɡoʊ/", "đi"], ["come", "/kʌm/", "đến"],
        ["see", "/siː/", "nhìn thấy"], ["want", "/wɑːnt/", "muốn"], ["like", "/laɪk/", "thích"], ["have", "/hæv/", "có"],
        ["learn", "/lɜːrn/", "học"], ["speak", "/spiːk/", "nói"], ["read", "/riːd/", "đọc"], ["write", "/raɪt/", "viết"],
        ["sleep", "/sliːp/", "ngủ"], ["work", "/wɜːrk/", "làm việc"],
      ]},
      { id: "adj", name: "Tính từ", items: [
        ["good", "/ɡʊd/", "tốt"], ["bad", "/bæd/", "tệ, xấu"], ["big", "/bɪɡ/", "to, lớn"], ["small", "/smɔːl/", "nhỏ"],
        ["hot", "/hɑːt/", "nóng"], ["cold", "/koʊld/", "lạnh"], ["happy", "/ˈhæpi/", "vui vẻ"], ["new", "/nuː/", "mới"],
        ["old", "/oʊld/", "cũ, già"], ["beautiful", "/ˈbjuːtɪfl/", "đẹp"],
      ]},
      { id: "time", name: "Thời gian & nơi chốn", items: [
        ["today", "/təˈdeɪ/", "hôm nay"], ["tomorrow", "/təˈmɑːroʊ/", "ngày mai"], ["yesterday", "/ˈjestərdeɪ/", "hôm qua"],
        ["now", "/naʊ/", "bây giờ"], ["house", "/haʊs/", "ngôi nhà"], ["school", "/skuːl/", "trường học"],
        ["day", "/deɪ/", "ngày"], ["time", "/taɪm/", "thời gian"],
      ]},
      { id: "phr", name: "Câu giao tiếp", phr: true, items: [
        ["How are you?", "", "Bạn khỏe không?"], ["I'm fine, thank you.", "", "Tôi khỏe, cảm ơn."],
        ["What is your name?", "", "Bạn tên là gì?"], ["My name is Nam.", "", "Tôi tên là Nam."],
        ["Nice to meet you.", "", "Rất vui được gặp bạn."], ["How much is this?", "", "Cái này bao nhiêu tiền?"],
        ["I don't understand.", "", "Tôi không hiểu."], ["Can you say it again?", "", "Bạn nói lại được không?"],
        ["Where is the bathroom?", "", "Nhà vệ sinh ở đâu?"], ["See you later.", "", "Hẹn gặp lại."],
      ]},
    ],
  },
  zh: {
    name: "Tiếng Trung",
    tts: "zh-CN",
    topics: [
      { id: "greet", name: "Chào hỏi", items: [
        ["你好", "nǐ hǎo", "xin chào"], ["再见", "zàijiàn", "tạm biệt"], ["谢谢", "xièxie", "cảm ơn"], ["不客气", "bú kèqi", "không có gì"],
        ["对不起", "duìbuqǐ", "xin lỗi"], ["没关系", "méi guānxi", "không sao"], ["是", "shì", "là"], ["不", "bù", "không"],
        ["名字", "míngzi", "tên"], ["朋友", "péngyou", "bạn bè"],
      ]},
      { id: "num", name: "Số đếm", items: [
        ["一", "yī", "một (1)"], ["二", "èr", "hai (2)"], ["三", "sān", "ba (3)"], ["四", "sì", "bốn (4)"], ["五", "wǔ", "năm (5)"],
        ["六", "liù", "sáu (6)"], ["七", "qī", "bảy (7)"], ["八", "bā", "tám (8)"], ["九", "jiǔ", "chín (9)"], ["十", "shí", "mười (10)"],
      ]},
      { id: "ppl", name: "Con người", items: [
        ["我", "wǒ", "tôi"], ["你", "nǐ", "bạn"], ["他", "tā", "anh ấy"], ["她", "tā", "cô ấy"], ["我们", "wǒmen", "chúng tôi"],
        ["妈妈", "māma", "mẹ"], ["爸爸", "bàba", "bố"], ["儿子", "érzi", "con trai"], ["女儿", "nǚ’ér", "con gái"],
        ["老师", "lǎoshī", "giáo viên"], ["学生", "xuésheng", "học sinh"], ["人", "rén", "người"],
      ]},
      { id: "food", name: "Đồ ăn uống", items: [
        ["水", "shuǐ", "nước"], ["米饭", "mǐfàn", "cơm"], ["茶", "chá", "trà"], ["菜", "cài", "món ăn, rau"],
        ["水果", "shuǐguǒ", "hoa quả"], ["苹果", "píngguǒ", "quả táo"], ["杯子", "bēizi", "cái cốc"],
      ]},
      { id: "verb", name: "Động từ cơ bản", items: [
        ["吃", "chī", "ăn"], ["喝", "hē", "uống"], ["去", "qù", "đi"], ["来", "lái", "đến"], ["看", "kàn", "xem, nhìn"],
        ["想", "xiǎng", "muốn, nghĩ"], ["喜欢", "xǐhuan", "thích"], ["有", "yǒu", "có"], ["学习", "xuéxí", "học tập"],
        ["说", "shuō", "nói"], ["读", "dú", "đọc"], ["写", "xiě", "viết"], ["睡觉", "shuìjiào", "ngủ"],
        ["工作", "gōngzuò", "làm việc"], ["买", "mǎi", "mua"], ["爱", "ài", "yêu"],
      ]},
      { id: "adj", name: "Tính từ", items: [
        ["好", "hǎo", "tốt"], ["大", "dà", "to, lớn"], ["小", "xiǎo", "nhỏ"], ["热", "rè", "nóng"], ["冷", "lěng", "lạnh"],
        ["多", "duō", "nhiều"], ["少", "shǎo", "ít"], ["高兴", "gāoxìng", "vui vẻ"], ["漂亮", "piàoliang", "đẹp"],
      ]},
      { id: "time", name: "Thời gian & nơi chốn", items: [
        ["今天", "jīntiān", "hôm nay"], ["明天", "míngtiān", "ngày mai"], ["昨天", "zuótiān", "hôm qua"], ["现在", "xiànzài", "bây giờ"],
        ["家", "jiā", "nhà"], ["学校", "xuéxiào", "trường học"], ["中国", "Zhōngguó", "Trung Quốc"], ["越南", "Yuènán", "Việt Nam"],
      ]},
      { id: "phr", name: "Câu giao tiếp", phr: true, items: [
        ["你好吗？", "Nǐ hǎo ma?", "Bạn khỏe không?"], ["我很好，谢谢。", "Wǒ hěn hǎo, xièxie.", "Tôi khỏe, cảm ơn."],
        ["你叫什么名字？", "Nǐ jiào shénme míngzi?", "Bạn tên là gì?"], ["我叫小明。", "Wǒ jiào Xiǎo Míng.", "Tôi tên là Tiểu Minh."],
        ["认识你很高兴。", "Rènshi nǐ hěn gāoxìng.", "Rất vui được quen bạn."], ["这个多少钱？", "Zhège duōshao qián?", "Cái này bao nhiêu tiền?"],
        ["我听不懂。", "Wǒ tīng bu dǒng.", "Tôi nghe không hiểu."], ["请再说一遍。", "Qǐng zài shuō yí biàn.", "Xin nói lại một lần nữa."],
        ["厕所在哪儿？", "Cèsuǒ zài nǎr?", "Nhà vệ sinh ở đâu?"], ["明天见。", "Míngtiān jiàn.", "Mai gặp lại."],
      ]},
    ],
  },
};

export const TONES = [
  { p: "mā", h: "妈", m: "mẹ", n: "Thanh 1, ngang cao", path: "M6 8 H50" },
  { p: "má", h: "麻", m: "tê", n: "Thanh 2, đi lên", path: "M6 22 L50 6" },
  { p: "mǎ", h: "马", m: "ngựa", n: "Thanh 3, xuống rồi lên", path: "M6 14 Q26 34 50 8" },
  { p: "mà", h: "骂", m: "mắng", n: "Thanh 4, xuống mạnh", path: "M6 6 L50 24" },
  { p: "ma", h: "吗", m: "trợ từ hỏi", n: "Thanh nhẹ", path: "M24 16 h8" },
];
