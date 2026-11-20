/* =====================================================================
 * fortunes.js — เซียมซีมงคล (Siam Si). Every stick is a good one ✨
 * Each fortune: { t: headline, d: one-liner } per language.
 * Add or edit freely — the app picks one at random from the chosen topic.
 * ===================================================================== */
'use strict';

const SIAMSI_TOPICS = [
    { id: 'overall', emoji: '🌕', name: { th: 'ดวงภาพรวม', en: 'Overall Luck', zh: '整体运势' } },
    { id: 'wealth',  emoji: '💰', name: { th: 'การเงิน', en: 'Money', zh: '财运' } },
    { id: 'love',    emoji: '💖', name: { th: 'ความรัก', en: 'Love', zh: '爱情' } },
    { id: 'health',  emoji: '🌿', name: { th: 'สุขภาพ', en: 'Health', zh: '健康' } },
    { id: 'career',  emoji: '🎯', name: { th: 'การงาน & การเรียน', en: 'Work & Study', zh: '事业学业' } }
];

const SIAMSI_FORTUNES = {
    overall: [
        { th: { t: 'ปีนี้ปีของเรา 🌕', d: 'จักรวาลจองที่ไว้ให้แล้ว แค่เดินไปรับเฉยๆ' },
          en: { t: 'This is your year 🌕', d: 'The universe already saved you a seat. Just show up.' },
          zh: { t: '今年是我的主场 🌕', d: '宇宙已经帮你留好位置，直接上就完事。' } },
        { th: { t: 'ตัวหลักของเรื่อง ✨', d: 'ทุกฉากในชีวิตช่วงนี้จบแบบแฮปปี้' },
          en: { t: 'Main character energy ✨', d: 'Every scene this season ends on a high note.' },
          zh: { t: '主角光环 ✨', d: '这一季的每一幕都是高光时刻。' } },
        { th: { t: 'ดวงอัปเกรด 🚀', d: 'ของเก่าที่ติดขัดลอยไปกับน้ำ ของใหม่ที่ดีกว่ารออยู่' },
          en: { t: 'Luck: upgraded 🚀', d: "What was stuck floats away. Something better is on its way." },
          zh: { t: '运气升级 🚀', d: '卡住的随水漂走，更好的已在路上。' } },
        { th: { t: 'Green flag ทั้งปี 💚', d: 'คนดีๆ โอกาสดีๆ วนมาหาแบบไม่ต้องตามหา' },
          en: { t: 'Green flags all year 💚', d: 'Good people and good chances find you — no chasing.' },
          zh: { t: '全年绿灯 💚', d: '好人好运自动找上门。' } },
        { th: { t: 'ใจฟูทุกวัน 🫶', d: 'เรื่องเล็กๆ จะทำให้ยิ้มได้บ่อยกว่าที่คิด' },
          en: { t: 'Heart full 🫶', d: 'Tiny moments will make you smile way more than you expect.' },
          zh: { t: '每天都心暖 🫶', d: '小确幸会比你想的更多。' } },
        { th: { t: 'ปังแบบเงียบๆ 🤫', d: 'ไม่ต้องประกาศ ผลงานจะพูดแทนเอง' },
          en: { t: 'Quietly winning 🤫', d: 'No need to announce it — your results will speak.' },
          zh: { t: '闷声干大事 🤫', d: '不用官宣，成绩自己会说话。' } }
    ],
    wealth: [
        { th: { t: 'เงินเข้าแบบงงๆ 💸', d: 'รายได้เสริมโผล่มาแบบไม่ทันตั้งตัว' },
          en: { t: 'Money glow-up 💸', d: 'Surprise income drops in when you least expect it.' },
          zh: { t: '钱包突然鼓了 💸', d: '意外进账悄悄到来。' } },
        { th: { t: 'สายเปย์…ให้ตัวเอง 🛍️', d: 'ทำงานหนักมาพอแล้ว ปีนี้ได้ให้รางวัลตัวเองแบบไม่รู้สึกผิด' },
          en: { t: 'Treat-yourself era 🛍️', d: "You've earned it. Spend on you, guilt-free." },
          zh: { t: '犒赏自己 🛍️', d: '辛苦这么久，花在自己身上不内疚。' } },
        { th: { t: 'พอร์ตสวยสบายตา 📈', d: 'ลงทุนกับตัวเองตรงไหน ตรงนั้นงอกเงย' },
          en: { t: 'Portfolio looking cute 📈', d: 'Whatever you invest in yourself keeps growing.' },
          zh: { t: '收益一路长红 📈', d: '投资自己的每一分都在增值。' } },
        { th: { t: 'หนี้หาย ใจเบา 🪶', d: 'ภาระเก่าค่อยๆ เคลียร์ เงินเริ่มเหลือเก็บ' },
          en: { t: 'Debt-free vibes 🪶', d: 'Old burdens clear up and savings start stacking.' },
          zh: { t: '无债一身轻 🪶', d: '旧账慢慢清零，存款开始上涨。' } },
        { th: { t: 'เศรษฐีหน้าใหม่ 💰', d: 'ไอเดียที่คิดไว้ ลองเลย มันทำเงินได้จริง' },
          en: { t: 'New money unlocked 💰', d: 'That side idea? Try it — it can actually pay.' },
          zh: { t: '新晋富豪 💰', d: '那个副业点子，试试就会赚。' } },
        { th: { t: 'ทักมาคือรวย 🤑', d: 'คนที่ทักมาช่วงนี้ พาโอกาสดีๆ มาด้วย' },
          en: { t: 'Luck in your DMs 🤑', d: 'Someone reaching out soon brings good fortune with them.' },
          zh: { t: '私信即财运 🤑', d: '最近找你的人会带来好机会。' } }
    ],
    love: [
        { th: { t: 'หวานเกินต้าน 🍯', d: 'ความรักช่วงนี้อบอุ่นแบบไม่ต้องพยายาม' },
          en: { t: 'Too sweet 🍯', d: 'Love feels warm and easy right now.' },
          zh: { t: '甜度超标 🍯', d: '这段时间的爱轻松又温暖。' } },
        { th: { t: 'มีคนแอบมองอยู่ 👀', d: 'เป็นตัวเองไปเรื่อยๆ คนที่ใช่กำลังสังเกตอยู่' },
          en: { t: "Someone's noticing 👀", d: 'Just be you — the right person is already watching.' },
          zh: { t: '有人在偷偷看你 👀', d: '做自己就好，对的人已经注意到你。' } },
        { th: { t: 'Soulmate loading… 💞', d: 'จังหวะลงตัว เดี๋ยวได้เจอคนที่คลิกกัน' },
          en: { t: 'Soulmate loading… 💞', d: 'The timing is lining up for someone who just clicks.' },
          zh: { t: '灵魂伴侣加载中… 💞', d: '时机正好，会遇见超合拍的人。' } },
        { th: { t: 'รักตัวเองก่อน = ปัง 🪞', d: 'ยิ่งดูแลใจตัวเองดี คนรอบตัวยิ่งรักเรามากขึ้น' },
          en: { t: 'Self-love = glow 🪞', d: 'The better you care for yourself, the more love comes back.' },
          zh: { t: '先爱自己 = 发光 🪞', d: '越照顾好自己，收到的爱越多。' } },
        { th: { t: 'บ้านคือเซฟโซน 🏡', d: 'ความอบอุ่นในบ้านเติมพลังให้ทุกวัน' },
          en: { t: 'Home = safe zone 🏡', d: 'Family warmth recharges you every single day.' },
          zh: { t: '家是安全区 🏡', d: '家的温暖每天为你充电。' } },
        { th: { t: 'ของของเรา ยังไงก็มา 🔮', d: 'ไม่ต้องไล่ตาม สิ่งที่ใช่กำลังเดินทางมาหา' },
          en: { t: "What's yours finds you 🔮", d: "No chasing needed — it's already on its way." },
          zh: { t: '属于你的终会来 🔮', d: '不用追，它正在来的路上。' } }
    ],
    health: [
        { th: { t: 'บอดี้ฟิต ใจฟิต 💪', d: 'ร่างกายแข็งแรงขึ้นทุกวัน ลุยอะไรก็ไหว' },
          en: { t: 'Fit body, fit mind 💪', d: 'Stronger every day — ready for anything.' },
          zh: { t: '身心满格 💪', d: '身体一天比一天好，做什么都有劲。' } },
        { th: { t: 'พลังเต็มหลอด 🔋', d: 'นอนหลับดี ตื่นมาสดใส ชาร์จพลังไว' },
          en: { t: 'Battery 100% 🔋', d: 'Better sleep, brighter mornings, faster recharge.' },
          zh: { t: '电量100% 🔋', d: '睡得香，醒来元气满满。' } },
        { th: { t: 'ใจสงบ = ชนะ 🧘', d: 'เรื่องที่เคยกวนใจจะเบาลงเรื่อยๆ' },
          en: { t: 'Peace = power 🧘', d: 'What used to bother you keeps getting lighter.' },
          zh: { t: '内心平静就是赢 🧘', d: '曾经烦心的事越来越轻。' } },
        { th: { t: 'ออร่าพุ่ง ✨', d: 'ผิวดี หน้าใส ใครเห็นก็ทักว่าดูดีขึ้น' },
          en: { t: 'Glowing aura ✨', d: 'Clear skin, bright face — people will notice.' },
          zh: { t: '气色绝了 ✨', d: '状态超好，大家都夸你变好看了。' } },
        { th: { t: 'แข็งแรงทั้งบ้าน 🌿', d: 'คนที่เรารักสุขภาพดี อยู่ด้วยกันไปนานๆ' },
          en: { t: 'Healthy whole crew 🌿', d: 'Everyone you love stays strong and close.' },
          zh: { t: '全家都健康 🌿', d: '爱的人身体棒棒，长长久久。' } },
        { th: { t: 'รีเซ็ตความเหนื่อย 🌊', d: 'พักให้พอ แล้วกลับมาเป็นเวอร์ชันที่ดีที่สุด' },
          en: { t: 'Reset the tired 🌊', d: 'Rest well, then come back as your best version.' },
          zh: { t: '重启疲惫 🌊', d: '好好休息，回来就是最佳版本。' } }
    ],
    career: [
        { th: { t: 'สอบผ่านฉลุย 🎓', d: 'ที่อ่านมาไม่เสียเปล่า คะแนนออกมาตามเป้า' },
          en: { t: 'Exam? Nailed it 🎓', d: 'All that studying pays off — you hit your target.' },
          zh: { t: '考试稳过 🎓', d: '努力没有白费，分数如愿。' } },
        { th: { t: 'เลื่อนขั้นมาแล้ว 📢', d: 'ผลงานเข้าตาคนที่ใช่ โอกาสใหญ่กำลังมา' },
          en: { t: 'Promotion incoming 📢', d: 'The right people see your work. A big chance is near.' },
          zh: { t: '升职在路上 📢', d: '对的人看到你的成绩，大机会要来了。' } },
        { th: { t: 'ไอเดียปังรัวๆ 💡', d: 'ความคิดสร้างสรรค์ไหลมา ทำอะไรก็ออกมาดี' },
          en: { t: 'Idea machine 💡', d: 'Creativity is flowing — everything you make lands.' },
          zh: { t: '灵感爆棚 💡', d: '创意源源不断，做什么都出彩。' } },
        { th: { t: 'ทีมดี ชีวิตดี 🤝', d: 'มีคนเก่งๆ พร้อมช่วยผลักดันไปถึงฝัน' },
          en: { t: 'Dream team 🤝', d: 'Great people are ready to push you toward your goals.' },
          zh: { t: '神仙队友 🤝', d: '身边有高手助你一路冲。' } },
        { th: { t: 'งานดีวิ่งเข้าหา 📩', d: 'ความตั้งใจถูกมองเห็น โอกาสดีๆ ทักมาเอง' },
          en: { t: 'Offers on repeat 📩', d: 'Your effort is seen — good work comes running.' },
          zh: { t: 'offer接到手软 📩', d: '你的认真被看见，好机会主动找来。' } },
        { th: { t: 'Level up 🆙', d: 'ทักษะใหม่ที่เรียนรู้จะพาไปไกลกว่าที่คิด' },
          en: { t: 'Level up 🆙', d: 'New skills will take you further than you think.' },
          zh: { t: '等级提升 🆙', d: '新技能会带你走得比想象更远。' } }
    ]
};

const SIAMSI_COLORS = [
    { hex: '#facc15', name: { th: 'สีทอง', en: 'Gold', zh: '金色' } },
    { hex: '#f472b6', name: { th: 'สีชมพู', en: 'Pink', zh: '粉色' } },
    { hex: '#4ade80', name: { th: 'สีเขียว', en: 'Green', zh: '绿色' } },
    { hex: '#38bdf8', name: { th: 'สีฟ้า', en: 'Sky blue', zh: '天蓝色' } },
    { hex: '#a78bfa', name: { th: 'สีม่วง', en: 'Purple', zh: '紫色' } },
    { hex: '#fb923c', name: { th: 'สีส้ม', en: 'Orange', zh: '橙色' } },
    { hex: '#f8fafc', name: { th: 'สีขาว', en: 'White', zh: '白色' } },
    { hex: '#f87171', name: { th: 'สีแดง', en: 'Red', zh: '红色' } }
];

const SIAMSI_STICKS = 28;   // traditional number of sticks in a Siam Si cup
