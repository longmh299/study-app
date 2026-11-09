// Hội thoại tự biên soạn. Câu tiếng Trung viết cách từng từ bằng dấu cách
// (dùng cho bài tập sắp xếp câu); khi hiển thị, dấu cách được bỏ đi.
import type { Lang } from "../data";

export interface Line { s: "A" | "B"; t: string; py?: string; vi: string }
export interface Dialogue {
  id: string;
  lang: Lang;
  title: string;
  level: string;
  scene: string;
  roles: { A: string; B: string };
  lines: Line[];
}

export const DIALOGUES: Dialogue[] = [
  // ---------------- Tiếng Anh ----------------
  { id: "en-meet", lang: "en", title: "Làm quen bạn mới", level: "Cơ bản", scene: "Hai người gặp nhau ở một buổi tiệc.",
    roles: { A: "Anna", B: "Nam" }, lines: [
    { s: "A", t: "Hi, I'm Anna. Nice to meet you.", vi: "Chào, mình là Anna. Rất vui được gặp bạn." },
    { s: "B", t: "Nice to meet you too. I'm Nam.", vi: "Mình cũng rất vui được gặp bạn. Mình là Nam." },
    { s: "A", t: "Where are you from, Nam?", vi: "Nam đến từ đâu?" },
    { s: "B", t: "I'm from Vietnam. How about you?", vi: "Mình đến từ Việt Nam. Còn bạn?" },
    { s: "A", t: "I'm from Canada. What do you do?", vi: "Mình đến từ Canada. Bạn làm nghề gì?" },
    { s: "B", t: "I'm a student. I study English.", vi: "Mình là sinh viên. Mình học tiếng Anh." },
    { s: "A", t: "Your English is very good!", vi: "Tiếng Anh của bạn rất tốt!" },
    { s: "B", t: "Thank you. I practice every day.", vi: "Cảm ơn. Mình luyện tập mỗi ngày." },
  ]},
  { id: "en-cafe", lang: "en", title: "Gọi đồ ở quán cà phê", level: "Cơ bản", scene: "Khách gọi đồ uống tại quầy.",
    roles: { A: "Nhân viên", B: "Khách" }, lines: [
    { s: "A", t: "Good morning. What can I get for you?", vi: "Chào buổi sáng. Anh/chị dùng gì ạ?" },
    { s: "B", t: "Can I have an iced latte, please?", vi: "Cho tôi một ly latte đá." },
    { s: "A", t: "Sure. What size would you like?", vi: "Vâng. Anh/chị muốn cỡ nào?" },
    { s: "B", t: "A medium, please.", vi: "Cỡ vừa." },
    { s: "A", t: "Anything else?", vi: "Còn gì nữa không ạ?" },
    { s: "B", t: "No, thanks. How much is it?", vi: "Không, cảm ơn. Bao nhiêu tiền?" },
    { s: "A", t: "That's four dollars fifty.", vi: "Bốn đô năm mươi xu." },
    { s: "B", t: "Here you are. Thank you.", vi: "Gửi bạn. Cảm ơn." },
  ]},
  { id: "en-shop", lang: "en", title: "Mua áo", level: "Cơ bản", scene: "Khách hỏi mua áo ở cửa hàng quần áo.",
    roles: { A: "Nhân viên", B: "Khách" }, lines: [
    { s: "A", t: "Hello. Can I help you?", vi: "Xin chào. Tôi giúp gì được ạ?" },
    { s: "B", t: "Yes. I'm looking for a white shirt.", vi: "Vâng. Tôi đang tìm một chiếc áo sơ mi trắng." },
    { s: "A", t: "What size do you wear?", vi: "Anh/chị mặc cỡ nào?" },
    { s: "B", t: "Medium, I think. Can I try it on?", vi: "Chắc là cỡ M. Tôi mặc thử được không?" },
    { s: "A", t: "Of course. The fitting room is over there.", vi: "Tất nhiên. Phòng thử đồ ở đằng kia." },
    { s: "B", t: "It fits well. How much is it?", vi: "Vừa lắm. Bao nhiêu tiền?" },
    { s: "A", t: "It's twenty dollars. It's on sale today.", vi: "Hai mươi đô. Hôm nay đang giảm giá." },
    { s: "B", t: "Great. I'll take it.", vi: "Tuyệt. Tôi lấy cái này." },
  ]},
  { id: "en-way", lang: "en", title: "Hỏi đường", level: "Cơ bản", scene: "Một khách du lịch hỏi đường người đi đường.",
    roles: { A: "Khách du lịch", B: "Người đi đường" }, lines: [
    { s: "A", t: "Excuse me. Is there a bank near here?", vi: "Xin lỗi. Gần đây có ngân hàng không?" },
    { s: "B", t: "Yes, there's one on Main Street.", vi: "Có, có một cái ở phố Main." },
    { s: "A", t: "How do I get there?", vi: "Tôi đi đến đó thế nào?" },
    { s: "B", t: "Go straight and turn right at the traffic lights.", vi: "Đi thẳng rồi rẽ phải ở đèn giao thông." },
    { s: "A", t: "Is it far?", vi: "Có xa không?" },
    { s: "B", t: "No, it's about five minutes on foot.", vi: "Không, đi bộ khoảng năm phút." },
    { s: "A", t: "Thank you so much.", vi: "Cảm ơn nhiều." },
    { s: "B", t: "You're welcome.", vi: "Không có gì." },
  ]},
  { id: "en-hotel", lang: "en", title: "Nhận phòng khách sạn", level: "Trung cấp", scene: "Khách đến quầy lễ tân khách sạn.",
    roles: { A: "Lễ tân", B: "Khách" }, lines: [
    { s: "A", t: "Good evening. Welcome to the Riverside Hotel.", vi: "Chào buổi tối. Chào mừng đến khách sạn Riverside." },
    { s: "B", t: "Hi. I have a reservation under the name Tran.", vi: "Chào. Tôi đã đặt phòng tên Trần." },
    { s: "A", t: "Let me check. Yes, a double room for three nights.", vi: "Để tôi kiểm tra. Vâng, phòng đôi ba đêm." },
    { s: "B", t: "That's right. Is breakfast included?", vi: "Đúng rồi. Có bao gồm bữa sáng không?" },
    { s: "A", t: "Yes, breakfast is served from six to ten.", vi: "Có, bữa sáng phục vụ từ sáu đến mười giờ." },
    { s: "B", t: "Great. What's the Wi-Fi password?", vi: "Tuyệt. Mật khẩu Wi-Fi là gì?" },
    { s: "A", t: "It's on your key card. Your room is on the fifth floor.", vi: "Có ghi trên thẻ phòng. Phòng của anh/chị ở tầng năm." },
    { s: "B", t: "Thank you very much.", vi: "Cảm ơn rất nhiều." },
  ]},
  { id: "en-doctor", lang: "en", title: "Đi khám bác sĩ", level: "Trung cấp", scene: "Bệnh nhân kể triệu chứng với bác sĩ.",
    roles: { A: "Bác sĩ", B: "Bệnh nhân" }, lines: [
    { s: "A", t: "What seems to be the problem?", vi: "Anh/chị bị làm sao?" },
    { s: "B", t: "I have a bad cough and a sore throat.", vi: "Tôi bị ho nặng và đau họng." },
    { s: "A", t: "How long have you had these symptoms?", vi: "Anh/chị có triệu chứng này bao lâu rồi?" },
    { s: "B", t: "For about three days.", vi: "Khoảng ba ngày." },
    { s: "A", t: "Do you have a fever?", vi: "Có bị sốt không?" },
    { s: "B", t: "Yes, a little, especially at night.", vi: "Có, hơi sốt, nhất là vào ban đêm." },
    { s: "A", t: "I'll give you some medicine. Drink plenty of water and get some rest.", vi: "Tôi sẽ kê thuốc. Uống nhiều nước và nghỉ ngơi nhé." },
    { s: "B", t: "Thank you, doctor.", vi: "Cảm ơn bác sĩ." },
  ]},
  { id: "en-job", lang: "en", title: "Phỏng vấn xin việc", level: "Trung cấp", scene: "Một buổi phỏng vấn ngắn.",
    roles: { A: "Người phỏng vấn", B: "Ứng viên" }, lines: [
    { s: "A", t: "Could you tell me a little about yourself?", vi: "Bạn giới thiệu đôi chút về bản thân được không?" },
    { s: "B", t: "Sure. I graduated in marketing two years ago.", vi: "Vâng. Tôi tốt nghiệp ngành marketing hai năm trước." },
    { s: "A", t: "Why do you want to work for our company?", vi: "Vì sao bạn muốn làm việc cho công ty chúng tôi?" },
    { s: "B", t: "I admire your products and I want to grow with your team.", vi: "Tôi ngưỡng mộ sản phẩm của công ty và muốn phát triển cùng đội ngũ." },
    { s: "A", t: "What is your greatest strength?", vi: "Điểm mạnh lớn nhất của bạn là gì?" },
    { s: "B", t: "I'm a fast learner and I work well under pressure.", vi: "Tôi học nhanh và làm việc tốt dưới áp lực." },
    { s: "A", t: "Do you have any questions for us?", vi: "Bạn có câu hỏi nào cho chúng tôi không?" },
    { s: "B", t: "Yes. What does a typical day look like in this role?", vi: "Có. Một ngày làm việc bình thường ở vị trí này như thế nào?" },
  ]},

  // ---------------- Tiếng Trung ----------------
  { id: "zh-meet", lang: "zh", title: "认识新朋友 · Làm quen", level: "HSK 1", scene: "Hai bạn sinh viên gặp nhau lần đầu.",
    roles: { A: "李明", B: "阿兰" }, lines: [
    { s: "A", t: "你好 ！ 我 叫 李明 。", py: "Nǐ hǎo! Wǒ jiào Lǐ Míng.", vi: "Chào bạn! Mình tên là Lý Minh." },
    { s: "B", t: "你好 ！ 我 叫 阿兰 。", py: "Nǐ hǎo! Wǒ jiào Ālán.", vi: "Chào bạn! Mình tên là Lan." },
    { s: "A", t: "你 是 哪 国 人 ？", py: "Nǐ shì nǎ guó rén?", vi: "Bạn là người nước nào?" },
    { s: "B", t: "我 是 越南 人 。 你 呢 ？", py: "Wǒ shì Yuènán rén. Nǐ ne?", vi: "Mình là người Việt Nam. Còn bạn?" },
    { s: "A", t: "我 是 中国 人 。 你 是 学生 吗 ？", py: "Wǒ shì Zhōngguó rén. Nǐ shì xuésheng ma?", vi: "Mình là người Trung Quốc. Bạn là sinh viên à?" },
    { s: "B", t: "是 ， 我 在 这儿 学习 汉语 。", py: "Shì, wǒ zài zhèr xuéxí Hànyǔ.", vi: "Đúng, mình học tiếng Trung ở đây." },
    { s: "A", t: "认识 你 很 高兴 ！", py: "Rènshi nǐ hěn gāoxìng!", vi: "Rất vui được quen bạn!" },
    { s: "B", t: "我 也 很 高兴 。", py: "Wǒ yě hěn gāoxìng.", vi: "Mình cũng rất vui." },
  ]},
  { id: "zh-food", lang: "zh", title: "在饭馆 · Gọi món", level: "HSK 1–2", scene: "Khách gọi món ở nhà hàng.",
    roles: { A: "服务员", B: "客人" }, lines: [
    { s: "A", t: "你好 ， 你们 几 位 ？", py: "Nǐ hǎo, nǐmen jǐ wèi?", vi: "Xin chào, các bạn đi mấy người?" },
    { s: "B", t: "两 位 。", py: "Liǎng wèi.", vi: "Hai người." },
    { s: "A", t: "请 坐 。 你们 想 吃 什么 ？", py: "Qǐng zuò. Nǐmen xiǎng chī shénme?", vi: "Mời ngồi. Các bạn muốn ăn gì?" },
    { s: "B", t: "我们 要 一 个 鱼 和 两 碗 米饭 。", py: "Wǒmen yào yí ge yú hé liǎng wǎn mǐfàn.", vi: "Chúng tôi lấy một món cá và hai bát cơm." },
    { s: "A", t: "喝 什么 ？", py: "Hē shénme?", vi: "Uống gì ạ?" },
    { s: "B", t: "两 杯 茶 ， 谢谢 。", py: "Liǎng bēi chá, xièxie.", vi: "Hai cốc trà, cảm ơn." },
    { s: "B", t: "服务员 ， 买单 ！", py: "Fúwùyuán, mǎidān!", vi: "Bạn ơi, tính tiền!" },
    { s: "A", t: "一共 八十五 块 。", py: "Yígòng bāshíwǔ kuài.", vi: "Tổng cộng tám mươi lăm tệ." },
  ]},
  { id: "zh-shop", lang: "zh", title: "买东西 · Mua đồ", level: "HSK 2", scene: "Mặc cả ở chợ.",
    roles: { A: "老板", B: "客人" }, lines: [
    { s: "B", t: "老板 ， 这 件 衣服 多少 钱 ？", py: "Lǎobǎn, zhè jiàn yīfu duōshao qián?", vi: "Ông chủ, cái áo này bao nhiêu tiền?" },
    { s: "A", t: "一百二十 块 。", py: "Yìbǎi èrshí kuài.", vi: "Một trăm hai mươi tệ." },
    { s: "B", t: "太 贵 了 ！ 便宜 一点儿 吧 。", py: "Tài guì le! Piányi yìdiǎnr ba.", vi: "Đắt quá! Rẻ chút đi." },
    { s: "A", t: "一百 块 ， 怎么样 ？", py: "Yìbǎi kuài, zěnmeyàng?", vi: "Một trăm tệ, thế nào?" },
    { s: "B", t: "八十 块 可以 吗 ？", py: "Bāshí kuài kěyǐ ma?", vi: "Tám mươi tệ được không?" },
    { s: "A", t: "好 吧 ， 八十 块 。", py: "Hǎo ba, bāshí kuài.", vi: "Thôi được, tám mươi tệ." },
    { s: "B", t: "有 红色 的 吗 ？", py: "Yǒu hóngsè de ma?", vi: "Có màu đỏ không?" },
    { s: "A", t: "有 ， 你 等 一下 。", py: "Yǒu, nǐ děng yíxià.", vi: "Có, bạn đợi một chút." },
  ]},
  { id: "zh-way", lang: "zh", title: "问路 · Hỏi đường", level: "HSK 2", scene: "Hỏi đường đến ga tàu điện ngầm.",
    roles: { A: "游客", B: "路人" }, lines: [
    { s: "A", t: "请问 ， 地铁站 在 哪儿 ？", py: "Qǐngwèn, dìtiězhàn zài nǎr?", vi: "Xin hỏi, ga tàu điện ngầm ở đâu?" },
    { s: "B", t: "一直 往 前 走 ， 然后 往 左 拐 。", py: "Yìzhí wǎng qián zǒu, ránhòu wǎng zuǒ guǎi.", vi: "Đi thẳng, sau đó rẽ trái." },
    { s: "A", t: "离 这儿 远 吗 ？", py: "Lí zhèr yuǎn ma?", vi: "Cách đây có xa không?" },
    { s: "B", t: "不 远 ， 走 路 五 分钟 。", py: "Bù yuǎn, zǒu lù wǔ fēnzhōng.", vi: "Không xa, đi bộ năm phút." },
    { s: "A", t: "太 好 了 ， 谢谢 你 ！", py: "Tài hǎo le, xièxie nǐ!", vi: "Tốt quá, cảm ơn bạn!" },
    { s: "B", t: "不 客气 。", py: "Bú kèqi.", vi: "Không có gì." },
  ]},
  { id: "zh-taxi", lang: "zh", title: "打车 · Đi taxi", level: "HSK 2–3", scene: "Khách đi taxi ra sân bay.",
    roles: { A: "司机", B: "乘客" }, lines: [
    { s: "A", t: "你好 ， 去 哪儿 ？", py: "Nǐ hǎo, qù nǎr?", vi: "Chào, đi đâu?" },
    { s: "B", t: "去 机场 ， 要 多 长 时间 ？", py: "Qù jīchǎng, yào duō cháng shíjiān?", vi: "Ra sân bay, mất bao lâu?" },
    { s: "A", t: "不 堵车 的话 ， 四十 分钟 。", py: "Bù dǔchē dehuà, sìshí fēnzhōng.", vi: "Nếu không tắc đường thì bốn mươi phút." },
    { s: "B", t: "我 的 飞机 是 十 点 的 ， 请 开 快 一点儿 。", py: "Wǒ de fēijī shì shí diǎn de, qǐng kāi kuài yìdiǎnr.", vi: "Máy bay của tôi lúc mười giờ, làm ơn đi nhanh một chút." },
    { s: "A", t: "别 着急 ， 来得及 。", py: "Bié zháojí, láidejí.", vi: "Đừng lo, kịp mà." },
    { s: "B", t: "可以 用 手机 付 钱 吗 ？", py: "Kěyǐ yòng shǒujī fù qián ma?", vi: "Trả tiền bằng điện thoại được không?" },
    { s: "A", t: "可以 ， 扫 这个 码 就 行 。", py: "Kěyǐ, sǎo zhège mǎ jiù xíng.", vi: "Được, quét mã này là xong." },
  ]},
  { id: "zh-weekend", lang: "zh", title: "周末计划 · Hẹn cuối tuần", level: "HSK 3", scene: "Hai người bạn rủ nhau đi chơi.",
    roles: { A: "小王", B: "小林" }, lines: [
    { s: "A", t: "这个 周末 你 有 时间 吗 ？", py: "Zhège zhōumò nǐ yǒu shíjiān ma?", vi: "Cuối tuần này bạn có thời gian không?" },
    { s: "B", t: "星期六 有 ， 星期天 要 上班 。", py: "Xīngqīliù yǒu, xīngqītiān yào shàngbān.", vi: "Thứ Bảy có, Chủ nhật phải đi làm." },
    { s: "A", t: "我们 一起 去 爬山 ， 怎么样 ？", py: "Wǒmen yìqǐ qù páshān, zěnmeyàng?", vi: "Chúng mình cùng đi leo núi nhé, thế nào?" },
    { s: "B", t: "好 啊 ！ 几 点 出发 ？", py: "Hǎo a! Jǐ diǎn chūfā?", vi: "Hay đấy! Mấy giờ xuất phát?" },
    { s: "A", t: "早上 七 点 ， 在 地铁站 见 。", py: "Zǎoshang qī diǎn, zài dìtiězhàn jiàn.", vi: "Bảy giờ sáng, gặp ở ga tàu điện ngầm." },
    { s: "B", t: "如果 下雨 怎么办 ？", py: "Rúguǒ xiàyǔ zěnme bàn?", vi: "Nếu trời mưa thì sao?" },
    { s: "A", t: "那 我们 就 去 看 电影 吧 。", py: "Nà wǒmen jiù qù kàn diànyǐng ba.", vi: "Thế thì mình đi xem phim." },
    { s: "B", t: "好 ， 星期六 见 ！", py: "Hǎo, xīngqīliù jiàn!", vi: "Được, hẹn thứ Bảy!" },
  ]},
  { id: "zh-doctor", lang: "zh", title: "看病 · Đi khám", level: "HSK 3", scene: "Bệnh nhân đi khám vì bị cảm.",
    roles: { A: "医生", B: "病人" }, lines: [
    { s: "A", t: "你 哪儿 不 舒服 ？", py: "Nǐ nǎr bù shūfu?", vi: "Bạn khó chịu ở đâu?" },
    { s: "B", t: "我 头 疼 ， 还 有 点儿 发烧 。", py: "Wǒ tóu téng, hái yǒudiǎnr fāshāo.", vi: "Tôi đau đầu, còn hơi sốt." },
    { s: "A", t: "什么 时候 开始 的 ？", py: "Shénme shíhou kāishǐ de?", vi: "Bắt đầu từ khi nào?" },
    { s: "B", t: "昨天 晚上 开始 的 。", py: "Zuótiān wǎnshang kāishǐ de.", vi: "Bắt đầu từ tối hôm qua." },
    { s: "A", t: "你 感冒 了 ， 不 太 严重 。", py: "Nǐ gǎnmào le, bú tài yánzhòng.", vi: "Bạn bị cảm, không nặng lắm." },
    { s: "B", t: "我 需要 吃 药 吗 ？", py: "Wǒ xūyào chī yào ma?", vi: "Tôi có cần uống thuốc không?" },
    { s: "A", t: "这 是 药 ， 一 天 吃 三 次 ， 多 喝 水 。", py: "Zhè shì yào, yì tiān chī sān cì, duō hē shuǐ.", vi: "Đây là thuốc, một ngày uống ba lần, uống nhiều nước." },
    { s: "B", t: "好 的 ， 谢谢 医生 。", py: "Hǎo de, xièxie yīshēng.", vi: "Vâng, cảm ơn bác sĩ." },
  ]},
];

/** Câu để hiển thị: tiếng Trung bỏ dấu cách giữa các từ. */
export const show = (lang: Lang, t: string) => (lang === "zh" ? t.replace(/\s+/g, "") : t);
