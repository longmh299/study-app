// Bài đọc IELTS bổ sung (tự biên soạn). Các đoạn được đánh dấu A, B, C, D khi hiển thị.
import type { Passage } from "./ielts-exam";

const para = (q: string, a: number, why: string) => ({ k: "mc" as const, q, opts: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D"], a, why });

export const MORE_PASSAGES: Passage[] = [
  {
    id: "teen-sleep", title: "Why Teenagers Stay Up Late",
    text: [
      "Parents often complain that their teenage children go to bed too late and find it almost impossible to get up in the morning. It is tempting to blame mobile phones or a lack of discipline, but scientists who study sleep suggest that biology also plays a part.",
      "During adolescence, the body's internal clock shifts. Hormones that make people feel sleepy are released later in the evening than they are in younger children or adults. As a result, many teenagers simply do not feel tired until well after their parents expect them to be asleep.",
      "This shift creates a problem when school starts early. A teenager who cannot fall asleep before midnight but must wake up at six will regularly get less sleep than experts recommend. Lack of sleep has been linked to poorer concentration, lower mood and a higher risk of accidents.",
      "In response, a number of schools have experimented with starting the day later. Some have reported that students arrive more alert and that attendance improves. However, later start times can cause difficulties for families and for school transport, and not every school has the flexibility to change its timetable.",
    ],
    qs: [
      { k: "tfng", q: "Scientists believe that biology is one reason why teenagers go to bed late.", a: "TRUE", why: "Đoạn A: scientists… suggest that biology also plays a part." },
      { k: "tfng", q: "Teenagers release sleep hormones earlier in the evening than adults do.", a: "FALSE", why: "Đoạn B: hormones are released later in the evening than in younger children or adults." },
      { k: "tfng", q: "Most teenagers use their phones for more than three hours each evening.", a: "NOT GIVEN", why: "Bài chỉ nhắc điện thoại như một lý do hay bị đổ lỗi, không có số liệu sử dụng." },
      { k: "tfng", q: "Every school that tried a later start reported better attendance.", a: "FALSE", why: "Đoạn D chỉ nói some (một số trường) báo cáo như vậy, không phải mọi trường." },
      para("Which paragraph describes the effects of not getting enough sleep?", 2, "Đoạn C nêu hậu quả: poorer concentration, lower mood, risk of accidents."),
      { k: "mc", q: "Why might some schools be unable to start later?", opts: ["Teachers refuse to work later.", "It can cause problems for families and transport.", "Students prefer early lessons.", "The government does not allow it."], a: 1, why: "Đoạn D: later start times can cause difficulties for families and for school transport." },
      { k: "mc", q: "What is the writer's main point?", opts: ["Teenagers are lazy.", "Phones are the only cause of late nights.", "Teenagers' sleep patterns are partly natural, which affects school timing.", "Schools should finish earlier."], a: 2, why: "Cả bài nói nhịp sinh học thay đổi ở tuổi teen và ảnh hưởng tới giờ học." },
    ],
  },
  {
    id: "bees", title: "Small Insects, Big Responsibilities",
    text: [
      "When people think of bees, they usually think of honey. Yet the most valuable thing bees do for humans is not producing honey but carrying pollen from one flower to another. This process, known as pollination, allows many plants to produce fruit and seeds.",
      "A large number of the fruits and vegetables people eat depend, at least in part, on insects for pollination. Without them, harvests of crops such as apples, strawberries and almonds would be much smaller, and the price of these foods would probably rise.",
      "In many regions, the number of wild bees appears to be falling. Researchers point to several possible causes, including the loss of wild flowers, the use of certain chemicals on farms and changes in climate. Because these factors often act together, it is difficult to say which one is most important.",
      "Fortunately, individuals can help. Planting flowers that bloom at different times of the year provides food for bees over a longer period, and leaving small areas of a garden untidy gives wild bees places to nest. Some farmers now plant strips of wild flowers along the edges of their fields.",
    ],
    qs: [
      { k: "tfng", q: "According to the writer, pollination is more valuable to humans than honey.", a: "TRUE", why: "Đoạn A: the most valuable thing… is not producing honey but carrying pollen." },
      { k: "tfng", q: "Almonds can be grown successfully without any insects.", a: "FALSE", why: "Đoạn B: without insects, harvests of almonds would be much smaller." },
      { k: "tfng", q: "Scientists have proved that farm chemicals are the main cause of falling bee numbers.", a: "FALSE", why: "Đoạn C: it is difficult to say which one is most important." },
      { k: "tfng", q: "Honey bees live longer than wild bees.", a: "NOT GIVEN", why: "Bài không so sánh tuổi thọ." },
      para("Which paragraph suggests actions people can take?", 3, "Đoạn D: Fortunately, individuals can help…"),
      { k: "mc", q: "Why does the writer recommend flowers that bloom at different times?", opts: ["They are cheaper.", "They provide food for bees for longer.", "They need less water.", "They attract fewer insects."], a: 1, why: "Đoạn D: provides food for bees over a longer period." },
      { k: "mc", q: "What would probably happen if insect pollination stopped?", opts: ["Food prices would fall.", "Some harvests would be smaller and prices would rise.", "Farmers would grow more almonds.", "Nothing would change."], a: 1, why: "Đoạn B." },
    ],
  },
  {
    id: "overtourism", title: "When Tourists Become Too Many",
    text: [
      "Tourism brings jobs and income to many places, and for some small towns it is the main source of money. In recent years, however, the term 'overtourism' has appeared to describe destinations where the number of visitors has become so large that it harms the quality of life of local residents.",
      "The problems are easy to see in popular historic centres. Narrow streets become crowded, rents rise as apartments are turned into holiday rentals, and shops selling everyday goods are replaced by souvenir shops. Some residents feel that their neighbourhood no longer belongs to them.",
      "Local authorities have tried a variety of solutions. Some have introduced a tourist tax, while others limit the number of cruise ships that can arrive each day or require visitors to book tickets in advance for the most famous sites. A few cities have run campaigns encouraging travellers to visit less well-known areas instead.",
      "Critics of these measures argue that they may turn travel into a luxury that only wealthier people can afford. Supporters reply that without some control, the very features that attract tourists in the first place may be lost.",
    ],
    qs: [
      { k: "tfng", q: "For some small towns, tourism is the most important source of income.", a: "TRUE", why: "Đoạn A: for some small towns it is the main source of money." },
      { k: "tfng", q: "Holiday rentals can cause rents to increase for local people.", a: "TRUE", why: "Đoạn B: rents rise as apartments are turned into holiday rentals." },
      { k: "tfng", q: "All cities with overtourism have introduced a tourist tax.", a: "FALSE", why: "Đoạn C: Some have introduced a tourist tax, while others…" },
      { k: "tfng", q: "Cruise passengers spend less money than other tourists.", a: "NOT GIVEN", why: "Bài không nói về mức chi tiêu của khách tàu biển." },
      para("Which paragraph explains how overtourism affects daily life for residents?", 1, "Đoạn B mô tả phố đông, giá thuê tăng, cửa hàng bị thay thế."),
      { k: "mc", q: "What is one concern raised by critics of the measures?", opts: ["They will create too many jobs.", "Travel may become affordable only for richer people.", "Famous sites will close.", "Residents will leave."], a: 1, why: "Đoạn D: turn travel into a luxury that only wealthier people can afford." },
      { k: "mc", q: "Why do some cities encourage visits to less famous areas?", opts: ["to spread visitors more widely", "to close historic centres", "to raise ticket prices", "to attract cruise ships"], a: 0, why: "Đoạn C: khuyến khích đi nơi ít nổi tiếng để giảm tải cho trung tâm (dàn trải du khách)." },
    ],
  },
  {
    id: "four-day-week", title: "A Shorter Working Week?",
    text: [
      "The idea of working four days a week instead of five has attracted growing attention. In most versions of the scheme, employees work fewer hours but receive the same salary, on the condition that they maintain their usual level of output.",
      "Companies that have tested the idea often report positive results. Staff say they feel less stressed and have more time for family and hobbies, and some employers find that people take fewer days off sick. Managers have also noticed that meetings become shorter when everyone knows that time is limited.",
      "Not every type of business can adopt the model easily, however. Hospitals, shops and restaurants need staff to be present throughout the week, so reducing working days may require hiring extra workers. For small businesses with tight budgets, this can be a serious obstacle.",
      "In my view, the four-day week is unlikely to replace the traditional pattern everywhere, but it deserves to be taken seriously. Even organisations that keep a five-day week could learn from the trials, for example by cutting unnecessary meetings and focusing more on results than on hours spent at a desk.",
    ],
    qs: [
      { k: "ynng", q: "The writer believes the four-day week will soon be used by all companies.", a: "NO", why: "Đoạn D: unlikely to replace the traditional pattern everywhere." },
      { k: "ynng", q: "The writer thinks companies with a five-day week can still learn from the trials.", a: "YES", why: "Đoạn D: Even organisations that keep a five-day week could learn from the trials." },
      { k: "ynng", q: "The writer believes employees should be paid more for working four days.", a: "NOT GIVEN", why: "Tác giả không bày tỏ ý kiến về việc tăng lương." },
      { k: "tfng", q: "In most four-day schemes, salaries are reduced.", a: "FALSE", why: "Đoạn A: receive the same salary." },
      para("Which paragraph describes difficulties for certain businesses?", 2, "Đoạn C: bệnh viện, cửa hàng, nhà hàng và doanh nghiệp nhỏ."),
      { k: "mc", q: "What did managers notice during trials?", opts: ["Meetings became shorter.", "Staff worked longer hours.", "Sales fell.", "More people were sick."], a: 0, why: "Đoạn B: meetings become shorter." },
      { k: "mc", q: "Why might hospitals find the model difficult?", opts: ["Doctors dislike it.", "They need staff present all week.", "They have too many meetings.", "Patients prefer five days."], a: 1, why: "Đoạn C: need staff to be present throughout the week." },
    ],
  },
  {
    id: "digital-museums", title: "Museums in the Digital Age",
    text: [
      "For centuries, museums were places that people had to visit in person. Today, many of the world's museums allow anyone with an internet connection to explore their collections online, view high-quality photographs of objects and even take virtual tours of their galleries.",
      "Supporters argue that digital access makes culture more democratic. Students in remote areas, people with disabilities and those who cannot afford to travel can now see works that were previously out of reach. Online collections also make it easier for researchers to compare objects held in different countries.",
      "Some museum professionals were initially concerned that virtual visits would reduce the number of people coming through the doors. So far, this fear does not seem to have been confirmed; in some cases, seeing an object online appears to encourage people to visit and see it for themselves.",
      "Digitisation is not without costs, however. Photographing and describing thousands of objects requires time, money and specialist staff, and digital files must be regularly updated as technology changes. Smaller museums may struggle to keep up with larger institutions.",
    ],
    qs: [
      { k: "tfng", q: "Some museums offer virtual tours of their galleries.", a: "TRUE", why: "Đoạn A: even take virtual tours of their galleries." },
      { k: "tfng", q: "Online collections help researchers compare objects in different countries.", a: "TRUE", why: "Đoạn B." },
      { k: "tfng", q: "Virtual visits have clearly reduced the number of museum visitors.", a: "FALSE", why: "Đoạn C: this fear does not seem to have been confirmed." },
      { k: "tfng", q: "Most museums now charge a fee for online access.", a: "NOT GIVEN", why: "Bài không nói về phí truy cập trực tuyến." },
      para("Which paragraph discusses the costs of making collections digital?", 3, "Đoạn D: requires time, money and specialist staff."),
      { k: "mc", q: "According to the passage, who benefits from digital access?", opts: ["only museum staff", "people who cannot easily travel to museums", "only wealthy tourists", "souvenir shops"], a: 1, why: "Đoạn B: students in remote areas, people with disabilities, those who cannot afford to travel." },
      { k: "mc", q: "Why may smaller museums find digitisation difficult?", opts: ["They have fewer visitors.", "They lack resources compared with larger institutions.", "Their objects cannot be photographed.", "They are not allowed online."], a: 1, why: "Đoạn D." },
    ],
  },
  {
    id: "plastic-recycling", title: "The Limits of Recycling",
    text: [
      "Recycling is often presented as the solution to the problem of plastic waste. Many households carefully separate bottles and packaging, believing that these items will be turned into new products. The reality is more complicated.",
      "Plastics come in many different types, and not all of them can be recycled easily. Items made from mixed materials, such as some food packaging, are especially difficult to process. In addition, plastic usually loses quality each time it is recycled, so it cannot be reused endlessly in the same way as glass or metal.",
      "Contamination is another problem. When recycling bins contain food waste or the wrong materials, whole loads may have to be rejected. For this reason, clear information for the public about what can and cannot be recycled is considered essential.",
      "Many experts therefore argue that recycling should be seen as the last step rather than the first. Reducing the amount of plastic produced, and designing products that can be reused or repaired, would have a greater effect. Recycling still has a role, they say, but it cannot carry the whole burden.",
    ],
    qs: [
      { k: "tfng", q: "Packaging made from mixed materials is difficult to recycle.", a: "TRUE", why: "Đoạn B." },
      { k: "tfng", q: "Plastic can be recycled endlessly without losing quality.", a: "FALSE", why: "Đoạn B: plastic usually loses quality each time it is recycled." },
      { k: "tfng", q: "Glass is cheaper to recycle than plastic.", a: "NOT GIVEN", why: "Bài so sánh khả năng tái chế, không nói về chi phí." },
      { k: "tfng", q: "Food waste in recycling bins can cause loads to be rejected.", a: "TRUE", why: "Đoạn C." },
      para("Which paragraph explains why public information is important?", 2, "Đoạn C: clear information for the public… is considered essential."),
      { k: "mc", q: "What do many experts think should come before recycling?", opts: ["burning plastic", "reducing production and designing reusable products", "sending waste abroad", "using more packaging"], a: 1, why: "Đoạn D." },
      { k: "mc", q: "What is the main idea of the passage?", opts: ["Recycling is useless.", "Recycling helps but cannot solve the plastic problem alone.", "Glass should replace all plastic.", "People should stop separating waste."], a: 1, why: "Câu cuối: Recycling still has a role… but it cannot carry the whole burden." },
    ],
  },
  {
    id: "volunteering", title: "The Benefits of Volunteering",
    text: [
      "Volunteering is usually described as a way of helping others, but research increasingly suggests that volunteers themselves also benefit. People who give their time regularly often report a stronger sense of purpose and greater satisfaction with life.",
      "For young people, volunteering can provide practical experience that is useful when applying for jobs. Organising events, working in a team and dealing with members of the public all develop skills that employers value. Some universities also take voluntary work into account when considering applications.",
      "Older adults may gain different advantages. After retirement, some people lose the daily routine and social contact that work provided. Volunteering can replace part of this, helping them stay active and connected to their community.",
      "It would be wrong, however, to assume that more volunteering is always better. Those who take on too many commitments can become exhausted, and organisations need to train and support their volunteers properly. In my opinion, the best approach is a regular commitment that fits comfortably into a person's life.",
    ],
    qs: [
      { k: "tfng", q: "Research suggests that volunteers can benefit personally from their work.", a: "TRUE", why: "Đoạn A." },
      { k: "tfng", q: "All universities require applicants to have done voluntary work.", a: "FALSE", why: "Đoạn B: Some universities also take voluntary work into account." },
      { k: "ynng", q: "The writer believes people should volunteer as much as possible.", a: "NO", why: "Đoạn D: It would be wrong… to assume that more volunteering is always better." },
      { k: "ynng", q: "The writer thinks volunteers should be paid a small salary.", a: "NOT GIVEN", why: "Tác giả không nhắc đến việc trả lương." },
      para("Which paragraph focuses on retired people?", 2, "Đoạn C: After retirement…"),
      { k: "mc", q: "Which skill is NOT mentioned as something young volunteers develop?", opts: ["teamwork", "organising events", "dealing with the public", "foreign languages"], a: 3, why: "Đoạn B không nhắc ngoại ngữ." },
      { k: "mc", q: "What does the writer recommend?", opts: ["volunteering every day", "a regular commitment that fits a person's life", "volunteering only after retirement", "avoiding volunteer work"], a: 1, why: "Câu cuối đoạn D." },
    ],
  },
  {
    id: "ai-health", title: "Computers in the Clinic",
    text: [
      "Computer programs that can recognise patterns in large amounts of data are increasingly being tested in hospitals. One area where they show promise is the analysis of medical images, such as X-rays and scans, where software can highlight areas that may need closer attention.",
      "Supporters believe such tools could reduce waiting times and help doctors who face heavy workloads. In some trials, programs have identified possible problems that were then confirmed by specialists, allowing patients to be treated earlier.",
      "Nevertheless, there are important concerns. A program is only as reliable as the data used to train it; if that data does not represent all groups of patients fairly, the results may be less accurate for some people. There are also questions about who is responsible when a computer-assisted decision turns out to be wrong.",
      "For these reasons, most experts see the technology as a support for medical staff rather than a replacement. The final decision, they argue, should remain with a qualified doctor who can consider the patient's full situation.",
    ],
    qs: [
      { k: "tfng", q: "Software is being tested to help analyse medical images.", a: "TRUE", why: "Đoạn A." },
      { k: "tfng", q: "In some trials, problems found by programs were later confirmed by specialists.", a: "TRUE", why: "Đoạn B." },
      { k: "tfng", q: "Computer programs are always equally accurate for every group of patients.", a: "FALSE", why: "Đoạn C: results may be less accurate for some people." },
      { k: "tfng", q: "Hospitals that use these programs have fewer doctors.", a: "NOT GIVEN", why: "Bài không nói về số lượng bác sĩ." },
      para("Which paragraph raises the question of responsibility for mistakes?", 2, "Đoạn C: who is responsible when a computer-assisted decision turns out to be wrong."),
      { k: "mc", q: "How do most experts see the technology?", opts: ["as a replacement for doctors", "as a support for medical staff", "as too dangerous to use", "as useful only for research"], a: 1, why: "Đoạn D." },
      { k: "mc", q: "What determines how reliable a program is, according to the passage?", opts: ["the price of the software", "the data used to train it", "the size of the hospital", "the speed of the computer"], a: 1, why: "Đoạn C: only as reliable as the data used to train it." },
    ],
  },
];
