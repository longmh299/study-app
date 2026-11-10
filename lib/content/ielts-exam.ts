// Đề thi thử IELTS tự biên soạn: bài đọc, câu hỏi, đề Writing. (Speaking dùng PART1, PART2 trong ielts.ts.)
// Nội dung bài đọc là văn bản tự viết theo định dạng IELTS, không lấy từ đề thi thật.
import { MORE_PASSAGES } from "./ielts-passages";

export type RQ =
  | { k: "tfng"; q: string; a: "TRUE" | "FALSE" | "NOT GIVEN"; why: string }
  | { k: "ynng"; q: string; a: "YES" | "NO" | "NOT GIVEN"; why: string }
  | { k: "mc"; q: string; opts: string[]; a: number; why: string };

export interface Passage { id: string; title: string; text: string[]; qs: RQ[] }

const BASE: Passage[] = [
  {
    id: "urban-farming", title: "Farming in the City",
    text: [
      "For most of the twentieth century, farming and city life were seen as opposites. Food was grown in the countryside and transported, often over long distances, to urban markets. In recent decades, however, a growing number of city residents have started to grow their own vegetables on rooftops, balconies and unused plots of land.",
      "Supporters of urban farming point to several benefits. Fresh produce does not need to travel far, so it can be sold within hours of being picked. Community gardens also bring neighbours together, and many schools use small gardens to teach children where their food comes from. Some researchers believe that green rooftops help to cool buildings during hot summers, although the size of this effect depends on the climate.",
      "Critics, on the other hand, argue that urban farms will never feed a whole city. Land in city centres is expensive, and most rooftops cannot support the weight of soil and water without costly reinforcement. In addition, air pollution in busy areas may affect the quality of the crops.",
      "Despite these limitations, many city governments now offer small grants to residents who want to start a garden. Their aim is not to replace traditional agriculture, but to make cities greener and to encourage people to think more carefully about what they eat.",
    ],
    qs: [
      { k: "tfng", q: "In the past, food for cities was mainly produced outside them.", a: "TRUE", why: "Đoạn 1: Food was grown in the countryside and transported… to urban markets." },
      { k: "tfng", q: "Vegetables from urban farms are always cheaper than those from the countryside.", a: "NOT GIVEN", why: "Bài chỉ nói rau đến tay người mua nhanh hơn, không nhắc đến giá rẻ hơn." },
      { k: "tfng", q: "Green rooftops have the same cooling effect in every climate.", a: "FALSE", why: "Đoạn 2: the size of this effect depends on the climate." },
      { k: "tfng", q: "Most rooftops can carry the weight of a garden without extra work.", a: "FALSE", why: "Đoạn 3: most rooftops cannot support the weight… without costly reinforcement." },
      { k: "mc", q: "According to the passage, schools use gardens to", opts: ["sell vegetables to parents", "teach children about the origin of food", "reduce the cost of school meals", "cool their classrooms"], a: 1, why: "Đoạn 2: teach children where their food comes from." },
      { k: "mc", q: "Which is NOT mentioned as a problem for urban farming?", opts: ["the high price of land", "air pollution", "a lack of interested residents", "the weight of soil on roofs"], a: 2, why: "Bài nhắc giá đất, ô nhiễm và sức nặng của đất; không nói thiếu người quan tâm." },
      { k: "mc", q: "What is the main aim of city governments that support gardens?", opts: ["to replace traditional farms", "to make cities greener and change eating habits", "to increase the price of land", "to export food to other cities"], a: 1, why: "Đoạn cuối: not to replace traditional agriculture, but to make cities greener…" },
    ],
  },
  {
    id: "adult-language", title: "Is It Too Late to Learn a Language?",
    text: [
      "It is widely believed that children learn languages more easily than adults. Young children who move to a new country often seem to pick up the local language without effort, while their parents struggle with grammar and pronunciation for years.",
      "Research suggests that this picture is only partly accurate. Children do have an advantage when it comes to pronunciation: those who start before adolescence are more likely to sound like native speakers. However, adults often make faster progress in the early stages, because they can use their knowledge of their first language and apply learning strategies consciously.",
      "Motivation also plays an important role. Adults usually learn a language for a clear purpose, such as work or travel, and this can help them to keep going when lessons become difficult. On the other hand, adults tend to have less free time and may feel embarrassed about making mistakes in front of others.",
      "Experts therefore recommend that adult learners focus on regular practice rather than long, occasional study sessions. Listening to the language every day, even for a short time, and speaking without worrying too much about mistakes, are considered two of the most effective habits. In short, age may affect how a person learns, but it does not decide whether they can succeed.",
    ],
    qs: [
      { k: "tfng", q: "Children who start learning before adolescence are more likely to have native-like pronunciation.", a: "TRUE", why: "Đoạn 2 nói rõ điều này." },
      { k: "tfng", q: "Adults always learn more slowly than children at every stage.", a: "FALSE", why: "Đoạn 2: adults often make faster progress in the early stages." },
      { k: "tfng", q: "Most adult learners study languages for work.", a: "NOT GIVEN", why: "Bài chỉ lấy work hoặc travel làm ví dụ, không nói “phần lớn” học vì công việc." },
      { k: "tfng", q: "Fear of making mistakes can be a problem for adult learners.", a: "TRUE", why: "Đoạn 3: may feel embarrassed about making mistakes in front of others." },
      { k: "mc", q: "Why can adults progress quickly at the beginning?", opts: ["They have more free time.", "They can use their first language and learning strategies.", "They are less worried about mistakes.", "They have better pronunciation."], a: 1, why: "Đoạn 2: use their knowledge of their first language and apply learning strategies consciously." },
      { k: "mc", q: "What do experts recommend for adult learners?", opts: ["long study sessions once a week", "short, regular practice", "studying only grammar", "avoiding speaking until they are fluent"], a: 1, why: "Đoạn 4: regular practice rather than long, occasional study sessions." },
      { k: "mc", q: "What is the writer's main conclusion?", opts: ["Adults cannot learn languages well.", "Only children can become fluent.", "Age influences the learning process but does not prevent success.", "Motivation is not important."], a: 2, why: "Câu cuối: age may affect how a person learns, but it does not decide whether they can succeed." },
    ],
  },
  {
    id: "fast-fashion", title: "The True Cost of Cheap Clothes",
    text: [
      "Over the past thirty years, clothes have become much cheaper and fashion trends have started to change more quickly. Many shops now introduce new designs every few weeks, and shoppers are encouraged to buy more items and keep them for a shorter time. This business model is often called fast fashion.",
      "The low prices, however, hide significant environmental costs. Producing textiles requires large amounts of water and energy, and many garments are made from synthetic materials that release tiny plastic fibres when they are washed. Because cheap clothes are often worn only a few times, a large proportion ends up in landfill.",
      "There are also social concerns. Much of the work in the clothing industry is done by low-paid workers, and campaigners argue that pressure to produce clothes quickly and cheaply can lead to poor working conditions.",
      "In response, some consumers are changing their habits. Second-hand shopping has become more popular, particularly among young people, and some brands now offer repair services or collect old clothes for recycling. Critics point out that these efforts remain small compared with the size of the industry, but supporters believe they show that attitudes are beginning to change.",
    ],
    qs: [
      { k: "tfng", q: "Fashion trends change faster now than thirty years ago.", a: "TRUE", why: "Đoạn 1: fashion trends have started to change more quickly." },
      { k: "tfng", q: "Natural fabrics release more plastic fibres than synthetic ones.", a: "FALSE", why: "Bài nói sợi nhựa đến từ chất liệu tổng hợp (synthetic), không phải sợi tự nhiên." },
      { k: "tfng", q: "Fast fashion companies pay higher taxes than other businesses.", a: "NOT GIVEN", why: "Bài không nhắc đến thuế." },
      { k: "tfng", q: "Second-hand shopping is especially popular with young people.", a: "TRUE", why: "Đoạn 4: particularly among young people." },
      { k: "mc", q: "Why does a large amount of cheap clothing end up in landfill?", opts: ["It cannot be washed.", "It is worn only a few times.", "Shops refuse to sell it.", "It is too expensive to recycle."], a: 1, why: "Đoạn 2: cheap clothes are often worn only a few times." },
      { k: "mc", q: "What do campaigners say about the clothing industry?", opts: ["Workers are paid too much.", "Pressure to produce quickly can harm working conditions.", "Factories use too little energy.", "Prices should be lower."], a: 1, why: "Đoạn 3 nói điều này." },
      { k: "mc", q: "How do critics view the new efforts by consumers and brands?", opts: ["as a complete solution", "as small compared with the industry", "as too expensive", "as unpopular with young people"], a: 1, why: "Đoạn 4: these efforts remain small compared with the size of the industry." },
    ],
  },
  {
    id: "remote-work", title: "Working from Home",
    text: [
      "Until recently, working from home was a privilege enjoyed by a small number of employees. Changes in technology, especially fast internet connections and video-calling software, have made it possible for many office workers to do their jobs from almost anywhere.",
      "Employees who work remotely frequently mention the time they save by not commuting. Many also say they can concentrate better at home, away from the noise of an open-plan office. Companies may benefit too, since they can reduce the amount of office space they rent.",
      "Nevertheless, remote work is not suitable for everyone. Some people find it difficult to separate their working life from their private life, and others miss the informal conversations that happen naturally in an office. Managers sometimes worry that new staff learn more slowly when they cannot watch experienced colleagues at work.",
      "As a result, many organisations have adopted a hybrid model, in which employees spend part of the week in the office and part at home. Supporters believe this offers the best of both worlds. However, it is still too early to say which arrangement will become the norm in the long term.",
    ],
    qs: [
      { k: "tfng", q: "In the past, only a few employees could work from home.", a: "TRUE", why: "Đoạn 1: a privilege enjoyed by a small number of employees." },
      { k: "tfng", q: "Remote workers earn higher salaries than office workers.", a: "NOT GIVEN", why: "Bài không nhắc đến lương." },
      { k: "tfng", q: "Every employee finds it easy to separate work and private life at home.", a: "FALSE", why: "Đoạn 3: Some people find it difficult to separate their working life from their private life." },
      { k: "tfng", q: "Experts agree that the hybrid model will be the most common in the future.", a: "FALSE", why: "Đoạn 4: it is still too early to say which arrangement will become the norm." },
      { k: "mc", q: "Which benefit for companies is mentioned?", opts: ["higher productivity", "lower spending on office space", "easier recruitment", "fewer meetings"], a: 1, why: "Đoạn 2: reduce the amount of office space they rent." },
      { k: "mc", q: "Why are some managers worried about remote work?", opts: ["Staff may work too many hours.", "New staff may learn more slowly.", "Internet connections are unreliable.", "Video calls are expensive."], a: 1, why: "Đoạn 3: new staff learn more slowly when they cannot watch experienced colleagues." },
      { k: "mc", q: "What is a hybrid model?", opts: ["working only at home", "working only in the office", "splitting the week between office and home", "working at night"], a: 2, why: "Đoạn 4 định nghĩa hybrid model." },
    ],
  },
];

export const PASSAGES: Passage[] = [...BASE, ...MORE_PASSAGES];

export interface Task1 { id: string; prompt: string; head: string[]; rows: (string | number)[][]; unit: string }

export const TASK1: Task1[] = [
  {
    id: "transport", unit: "% số người đi làm",
    prompt: "The table below shows how people travelled to work in a city in 2005 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    head: ["Means of transport", "2005", "2025"],
    rows: [["Car", 45, 30], ["Motorbike", 30, 25], ["Bus or metro", 15, 30], ["Bicycle", 6, 10], ["Walking", 4, 5]],
  },
  {
    id: "spending", unit: "% chi tiêu hằng tháng",
    prompt: "The table below shows the average monthly spending of young people (aged 18–25) in one country in 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    head: ["Category", "2015", "2025"],
    rows: [["Food", 35, 28], ["Rent", 30, 34], ["Entertainment", 15, 12], ["Online shopping", 8, 16], ["Education", 12, 10]],
  },
];

export const TASK2: string[] = [
  "Some people believe that students should learn practical skills, such as cooking and managing money, at school. Others think schools should focus on academic subjects. Discuss both views and give your own opinion.",
  "In many cities, the number of private cars is increasing. What problems does this cause, and what measures could be taken to solve them?",
  "Some people think that working from home is better for both employees and employers. To what extent do you agree or disagree?",
  "Nowadays many young people spend a lot of time on social media. Do the advantages of this outweigh the disadvantages?",
  "Some people say that the best way to learn a foreign language is to live in a country where it is spoken. To what extent do you agree or disagree?",
];

/** Tiêu chí tự chấm Writing, theo 4 tiêu chí chấm IELTS. */
export const WRITING_CHECK: { c: string; items: string[] }[] = [
  { c: "Task Response / Achievement", items: ["Trả lời đủ mọi phần của đề", "Task 2 có quan điểm rõ ràng từ mở bài đến kết bài", "Task 1 có câu tổng quan (overview) nêu xu hướng chính"] },
  { c: "Coherence & Cohesion", items: ["Mỗi đoạn một ý chính", "Dùng từ nối tự nhiên (however, as a result…), không lạm dụng", "Có mở bài và kết bài"] },
  { c: "Lexical Resource", items: ["Không lặp một từ quá nhiều lần", "Dùng được vài collocation (make a decision, a sharp rise…)", "Ít lỗi chính tả"] },
  { c: "Grammatical Range & Accuracy", items: ["Có câu phức (mệnh đề quan hệ, câu điều kiện…)", "Chia thì đúng", "Ít lỗi ngữ pháp làm khó hiểu"] },
];

/** Quy đổi số câu đúng (thang 40) sang band, theo bảng tham khảo phổ biến của bài Listening/Reading. */
export function bandOf(correct40: number) {
  const t: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [20, 5.5], [16, 5], [13, 4.5], [10, 4], [6, 3.5], [4, 3], [2, 2.5], [0, 0]];
  return t.find(([n]) => correct40 >= n)![1];
}
