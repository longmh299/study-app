// Đề luyện IELTS Speaking tự biên soạn (theo đúng định dạng 3 phần của bài thi).

export interface Part1 { topic: string; vi: string; qs: string[] }
export interface CueCard { id: string; title: string; vi: string; points: string[]; sample: string; phrases: string[]; part3: string[] }

export const PART1: Part1[] = [
  { topic: "Work or study", vi: "Công việc hoặc học tập", qs: [
    "Do you work or are you a student?",
    "What do you like most about your job or studies?",
    "Would you like to change your job in the future?",
  ]},
  { topic: "Hometown", vi: "Quê hương", qs: [
    "Where is your hometown?",
    "What do you like about your hometown?",
    "Has your hometown changed much in recent years?",
  ]},
  { topic: "Home", vi: "Nơi ở", qs: [
    "Do you live in a house or an apartment?",
    "Which room do you spend the most time in?",
    "What would you change about your home?",
  ]},
  { topic: "Free time", vi: "Thời gian rảnh", qs: [
    "What do you usually do in your free time?",
    "Do you prefer spending free time alone or with friends?",
    "Did you have the same hobbies when you were a child?",
  ]},
  { topic: "Food", vi: "Ẩm thực", qs: [
    "What is your favourite food?",
    "Do you often cook at home?",
    "Is there any food you didn't like as a child?",
  ]},
  { topic: "Weather", vi: "Thời tiết", qs: [
    "What's the weather like in your country?",
    "Do you prefer hot or cold weather?",
    "Does the weather affect your mood?",
  ]},
  { topic: "Mobile phones", vi: "Điện thoại", qs: [
    "How often do you use your phone?",
    "What do you mainly use your phone for?",
    "Could you live without a smartphone?",
  ]},
  { topic: "Travel", vi: "Du lịch", qs: [
    "Do you like travelling?",
    "Where did you go on your last holiday?",
    "Do you prefer travelling alone or in a group?",
  ]},
];

export const PART2: CueCard[] = [
  { id: "person", title: "Describe a person who has influenced you.", vi: "Tả một người đã ảnh hưởng đến bạn.",
    points: ["who this person is", "how you know them", "what they have done", "and explain how they have influenced you"],
    sample: "I'd like to talk about my high school English teacher, Ms Hoa. She taught me for three years. What I remember most is that she never made us feel stupid when we made mistakes. She encouraged us to speak, even when our English was terrible. Because of her, I stopped being afraid of speaking in public, and I started to believe that I could learn anything if I practised every day. That attitude has helped me a lot, both in my studies and in my career.",
    phrases: ["I'd like to talk about…", "What I remember most is…", "Because of her/him, I…", "That has helped me a lot…"],
    part3: ["Who has more influence on children: parents or teachers?", "Do you think famous people are good role models?", "How has the role of teachers changed in recent years?"] },
  { id: "place", title: "Describe a place you would like to visit.", vi: "Tả một nơi bạn muốn đến thăm.",
    points: ["where it is", "how you know about it", "what you would do there", "and explain why you would like to visit it"],
    sample: "One place I'd really love to visit is Kyoto in Japan. I first saw it in a travel video, and I was amazed by the old temples and the quiet streets. If I went there, I'd spend most of my time walking around the historic areas, trying local food and maybe wearing a kimono. The main reason I want to go is that I'm interested in traditional culture, and Kyoto seems to keep its history alive while still being a modern city.",
    phrases: ["One place I'd really love to visit is…", "I first saw it in…", "If I went there, I'd…", "The main reason is that…"],
    part3: ["Why do people like to travel abroad?", "What are the negative effects of tourism?", "Should governments protect historic buildings?"] },
  { id: "skill", title: "Describe a skill you would like to learn.", vi: "Tả một kỹ năng bạn muốn học.",
    points: ["what the skill is", "how you would learn it", "how difficult it would be", "and explain why you want to learn it"],
    sample: "A skill I've always wanted to learn is swimming. It sounds strange, but I never learned as a child because there was no pool near my house. I'd probably take lessons at a local sports centre, maybe twice a week. I think it would be quite difficult at first, because I'm a bit afraid of deep water. Still, I really want to learn because it's a useful life skill, it's good exercise, and I'd love to swim at the beach with my friends.",
    phrases: ["A skill I've always wanted to learn is…", "I'd probably…", "It would be quite difficult at first because…", "Still, I really want to…"],
    part3: ["What skills are most important for young people today?", "Is it better to learn skills online or in person?", "Should schools teach more practical skills?"] },
  { id: "tech", title: "Describe a piece of technology you use every day.", vi: "Tả một thiết bị công nghệ bạn dùng hằng ngày.",
    points: ["what it is", "when you got it", "how you use it", "and explain why it is important to you"],
    sample: "The piece of technology I use the most is my laptop. I bought it about two years ago when I started university. I use it for almost everything: attending online classes, writing assignments, and watching films in the evening. Honestly, I can't imagine studying without it. It saves me a lot of time, and it also helps me stay in touch with friends and family who live far away.",
    phrases: ["The piece of technology I use the most is…", "I use it for almost everything:…", "Honestly, I can't imagine…", "It saves me a lot of time."],
    part3: ["Has technology made people's lives easier or more stressful?", "Should children be allowed to use smartphones?", "What jobs might disappear because of technology?"] },
  { id: "event", title: "Describe a happy event from your childhood.", vi: "Tả một sự kiện vui thời thơ ấu.",
    points: ["what the event was", "when and where it happened", "who you were with", "and explain why it made you happy"],
    sample: "I'd like to describe the first time my family went to the beach together. I was about eight years old, and we travelled to Nha Trang by train. It was a long journey, but I was so excited that I couldn't sleep. We spent three days swimming, building sandcastles and eating seafood. It made me happy because my parents usually worked very hard, so having them relax and play with me was really special.",
    phrases: ["I'd like to describe…", "I was about … years old.", "I was so excited that…", "It was really special because…"],
    part3: ["Are children today happier than in the past?", "How important are family holidays?", "Do people remember childhood events accurately?"] },
  { id: "book", title: "Describe a book or film you enjoyed.", vi: "Tả một cuốn sách hoặc bộ phim bạn thích.",
    points: ["what it was", "when you read or watched it", "what it was about", "and explain why you enjoyed it"],
    sample: "I'd like to talk about an animated film I watched last year about a young girl who leaves home to work in a magical town. I watched it with my younger sister on a rainy weekend. The story is simple, but it shows how hard it is to grow up and become independent. I enjoyed it because the drawings were beautiful and the message was meaningful: everyone feels lost sometimes, but hard work and kindness help us find our way.",
    phrases: ["The story is about…", "What I liked most was…", "The message was…", "I'd recommend it to…"],
    part3: ["Do people read less than they used to?", "Are films better than books for learning about the world?", "Should governments support the film industry?"] },
];

export const SPEAK_TIPS = [
  "Trả lời Part 1 dài 2–3 câu: trả lời thẳng, thêm lý do, thêm ví dụ.",
  "Part 2: dùng 1 phút chuẩn bị để ghi từ khóa cho từng gạch đầu dòng, rồi nói đủ 2 phút.",
  "Part 3: đưa ra quan điểm, giải thích, so sánh quá khứ và hiện tại hoặc các nhóm người.",
  "Nói chậm và rõ còn hơn nói nhanh rồi vấp. Giám khảo chấm độ trôi chảy chứ không chấm tốc độ.",
];
