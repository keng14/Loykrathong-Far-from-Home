/* =====================================================================
 * World Loykratong Online — app.js
 * ลอยกระทงออนไลน์ 8 ประเทศรอบโลก
 * ===================================================================== */
'use strict';

/* ---------------------------------------------------------------------
 * 0. CONFIG
 * ------------------------------------------------------------------- */
// Loykratong nights (full moon, 12th Thai lunar month). Add future years here.
const FESTIVAL_DATES = ['2026-11-24'];
// ── Going public ───────────────────────────────────────────────────────
// Paste your Firebase Realtime Database URL here and every visitor connects
// automatically (the Cloud setup button is then hidden). Leave '' for offline mode.
const PUBLIC_RTDB_URL = '';
const SYNC_INTERVAL_MS = 6000;          // check for NEW krathongs (tiny download)
const FULL_REFRESH_MS = 3 * 60 * 1000;  // re-download recent krathongs to refresh hearts
const CLOUD_LIMIT = 300;                // how many recent krathongs to load
const MAX_ON_RIVER = 30;          // krathongs rendered per country
const MAX_NAME = 40;
const MAX_WISH = 200;

const LS = {
    lang: 'wlk_lang_v1',
    bgs: 'loy_krathong_country_bgs_v2',
    mine: 'wlk_my_krathongs_v1',
    blessed: 'wlk_blessed_v1',
    rtdb: 'wlk_rtdb_url_v1',
    lastName: 'wlk_last_name_v1',
    tutorial: 'wlk_tutorial_v1'
};

function lsGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
}
function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}
function lsDel(key) { try { localStorage.removeItem(key); } catch (e) {} }

/* ---------------------------------------------------------------------
 * 1. ICONS (inline SVG — no icon-font CDN needed)
 * ------------------------------------------------------------------- */
const ICON_PATHS = {
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    compress: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>',
    'volume-x': '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    sparkles: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    wand: '<path d="m15 4 5 5L9 20l-5-5Z"/><path d="m12 7 5 5M5 3v3M3.5 4.5h3M20 15v3M18.5 16.5h3"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="16" cy="16" r="1.3" fill="currentColor"/>',
    'arrow-right': '<path d="M5 12h14M13 5l7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5M11 5l-7 7 7 7"/>',
    flame: '<path d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.5 1.5 2 2.5 2C11 7 11 4.5 12 2Z"/>',
    heart: '<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" fill="currentColor"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.5 13 7 22l5-3 5 3-1.5-9"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a2 2 0 0 1 2-2h11"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lotus: '<path d="M12 20c-4 0-8-2-9-6 3 0 5 1 6 2-1-3 0-7 3-10 3 3 4 7 3 10 1-1 3-2 6-2-1 4-5 6-9 6Z"/>'
};
function iconSvg(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}
function renderIcons(root = document) {
    root.querySelectorAll('i[data-icon]').forEach(el => { el.innerHTML = iconSvg(el.dataset.icon); });
}
function setIcon(el, name) { el.dataset.icon = name; el.innerHTML = iconSvg(name); }

/* ---------------------------------------------------------------------
 * 2. I18N (TH / EN / ZH)
 * ------------------------------------------------------------------- */
const I18N = {
    th: {
        appTitle: 'ลอยกระทงออนไลน์ ไกลบ้าน', badgeCountries: '16 สถานที่',
        introTitle1: 'ลอยกระทงออนไลน์', introTitle2: 'ไกลบ้าน', introTagline: 'อยู่ที่ไหนในโลกก็ลอยกระทงได้ อธิษฐานแล้วส่งใจกลับบ้าน 🏡', docTitle: 'ลอยกระทงออนไลน์ ไกลบ้าน',
        appSubtitle: 'สืบสานประเพณีไทยสู่สากล • ลอยกระทงและอธิษฐานข้ามพรมแดน',
        countdownDays: 'อีก {n} วันถึงคืนลอยกระทง • {date}',
        countdownTomorrow: 'พรุ่งนี้คืนลอยกระทง! • {date}',
        countdownToday: '🌕 คืนนี้คืนลอยกระทง! • {date}',
        btnFullscreen: 'เต็มจอ', btnExitFullscreen: 'ออกจากโหมดเต็มจอ', btnBg: 'ฉากหลัง', btnCloud: 'Cloud',
        soundOn: 'ปิดเสียง', soundOff: 'เสียงดนตรี', btnFireworks: 'จุดพลุ',
        dragDropTitle: 'ปล่อยไฟล์ฉากหลังลงที่นี่', dragDropSub: 'รองรับรูปภาพ • GIF • วิดีโอ (mp4/webm) ใช้เป็นฉากของประเทศที่เลือกอยู่ทันที',
        riverHint: '💡 แตะกระทงในแม่น้ำเพื่ออ่านคำอธิษฐานและส่งหัวใจ • แตะท้องฟ้าเพื่อจุดพลุ',
        toggleShowStudio: 'แต่งกระทงของคุณ', toggleHideStudio: 'ชมวิวฉากหลัง',
        studioTitle: 'สตูดิโอออกแบบกระทงออนไลน์', tabDesign: '② เลือกกระทง', tabWish: '③ อธิษฐานก่อนลอย',
        previewBadge: '✨ ตัวอย่างกระทงแบบเรียลไทม์', btnRandomize: 'สุ่มแบบกระทงและดอกไม้มงคล',
        labelBase: 'ฐานกระทงรักษ์โลก', labelFlower: 'ดอกไม้มงคลประดับ', labelTopping: 'เครื่องบูชาเสริมดวง (เลือกได้ 2 อย่าง)', toppingCount: 'เลือกแล้ว {n}/2',
        btnHelp: 'วิธีใช้', tutStart: 'เริ่มลอยกระทง 🪷',
        tutSteps: [['📍', 'เลือกสถานที่', 'ไทย 4 ภาค ต่างประเทศ หรือโซนพิเศษ'], ['🪷', 'เลือกกระทง', 'ฐาน ดอกไม้ และเครื่องบูชาได้ 2 อย่าง'], ['🙏', 'อธิษฐานก่อนลอย', 'ใส่ชื่อ เขียนคำอธิษฐาน แล้วจุดเทียนลอยเลย'], ['🎋', 'เสี่ยงเซียมซี', 'อยากเสี่ยงก็ได้ หรือจบขั้นตอนเลยก็ได้']],
        locStep: 'ขั้นที่ 1', locTitle: 'เลือกสถานที่ลอยกระทง', locChange: 'เปลี่ยนสถานที่', krathongsHere: '{n} กระทง',
        btnNextWish: 'ถัดไป: เขียนคำอธิษฐาน',
        labelSender: 'ชื่อของคุณ / ครอบครัว / คณะ', placeholderSender: 'เช่น คุณแม่สมศรี & ครอบครัว',
        labelWish: 'คำอธิษฐาน / คำขอขมาพระแม่คงคา', btnRandomWish: 'สุ่มคำอธิษฐานมงคล',
        placeholderWish: 'ขอให้สิ่งไม่ดีลอยไปกับสายน้ำ ขอให้มีแต่ความสุขความเจริญ...',
        labelWishCat: 'หมวดหมู่คำอธิษฐานยอดนิยม:',
        catWealth: '💰 โชคลาภ & การเงิน', catLove: '❤️ ความรัก & ครอบครัว', catHealth: '🌿 สุขภาพ & ความสุข', catCareer: '🎯 การงาน & การเรียน',
        btnBack: 'ย้อนกลับ', btnLaunch: 'จุดเทียนและลอยกระทงเลย',
        floatedAt: 'ลอย ณ', btnBless: 'ร่วมอนุโมทนา', blessed: 'อนุโมทนาแล้ว', btnCloseInspector: 'ปิดหน้าต่าง',
        cardSuccess: 'ลอยกระทงสำเร็จแล้ว!',
        btnCardImage: 'สร้างการ์ดที่ระลึกเป็นรูปภาพ', btnSaveDraft: 'บันทึกรูปกระทงนี้', btnShareCard: 'คัดลอกคำอธิษฐานไปแชร์',
        cardSaveHint: 'กดค้างที่รูป (มือถือ) หรือคลิกขวา เพื่อบันทึกการ์ด',
        btnViewRiver: 'จบขั้นตอน', btnNewKrathong: '+ ออกแบบกระทงใบใหม่',
        siamsiAsk: '🌕 ลอยเสร็จแล้ว อยากเสี่ยงเซียมซีมงคลต่อไหม?', btnSiamsi: 'เสี่ยงเซียมซี',
        siamsiTitle: '🎋 เซียมซีมงคล', siamsiPick: 'ตั้งจิตให้นิ่ง แล้วเลือกเรื่องที่อยากรู้', siamsiSkip: 'ไม่เสี่ยงแล้ว จบขั้นตอน',
        siamsiShaking: 'ตั้งจิตอธิษฐาน... เขย่าๆๆ', siamsiStick: 'ใบที่ {n}', luckyColor: 'สีมงคล', luckyNumber: 'เลขนำโชค {n}',
        siamsiFooter: 'ทุกใบคือใบดี เชื่อในตัวเองไว้ ✨', btnCopyFortune: 'คัดลอก', btnSiamsiAgain: 'เสี่ยงเรื่องอื่น',
        btnFortuneCard: 'ใส่ในการ์ด', btnSiamsiDone: 'จบขั้นตอน', toastFortuneCopied: 'คัดลอกคำทำนายแล้ว!',
        cardFortune: 'เซียมซีใบที่ {n}', toppingMeaning: 'ความหมาย',
        cardHeading: 'ลอยกระทงออนไลน์ ไกลบ้าน',
        bgModalTitle: 'ฉากหลังของแต่ละประเทศ',
        bgModalDesc: 'ใช้ภาพวาดต้นฉบับเป็นค่าเริ่มต้น อัปโหลดรูปของคุณเองแทนได้ (หรือลากรูปวางบนหน้าจอ) รูปจะเก็บไว้ในเครื่องนี้เท่านั้น',
        bgDefault: 'ภาพวาดต้นฉบับ', bgCustom: 'รูปที่อัปโหลด', bgVideo: 'วิดีโอ', bgGif: 'GIF', btnChangeImg: 'เปลี่ยนฉาก', btnUseDefault: 'ใช้ต้นฉบับ',
        btnResetBg: 'รีเซ็ตทั้งหมด', btnDoneBg: 'เสร็จสิ้น',
        toastBgSaved: 'เปลี่ยนฉากหลังแล้ว', toastBgMemory: 'พื้นที่ในเครื่องเต็ม ใช้รูปนี้ได้จนกว่าจะปิดหน้า',
        toastVideoSaving: 'กำลังโหลดวิดีโอ...', toastVideoSaved: 'ตั้งวิดีโอเป็นฉากหลังแล้ว', toastVideoSession: 'ใช้วิดีโอนี้ได้จนกว่าจะปิดหน้า (บันทึกถาวรไม่ได้)',
        toastVideoTooBig: 'วิดีโอใหญ่เกินไป (เกิน {n}MB) กรุณาย่อขนาดก่อน', toastGifTooBig: 'ไฟล์ GIF ใหญ่เกินไป เก็บลงเครื่องไม่ได้', toastBgUnsupported: 'ไฟล์ชนิดนี้ไม่รองรับ (ใช้รูป GIF หรือวิดีโอ mp4/webm)',
        cloudTitle: 'ตั้งค่า Firebase Realtime Database',
        cloudDesc: 'เพื่อให้ผู้ใช้ทั่วโลกเห็นกระทงของกันและกันแบบเรียลไทม์:',
        cloudSteps: [
            'สร้างโปรเจกต์ฟรีที่ <b>console.firebase.google.com</b>',
            'ไปที่ <b>Build → Realtime Database</b> แล้วสร้างฐานข้อมูล',
            'วาง <b>Rules</b> จากไฟล์ README (จำกัดความยาวข้อความ ป้องกันการลบ)',
            'คัดลอก <b>Database URL</b> มาวางด้านล่างแล้วกดเชื่อมต่อ'
        ],
        btnConnectCloud: 'เชื่อมต่อ Cloud Sync', btnDisconnect: 'ยกเลิก',
        cloudConnected: 'เชื่อมต่อแล้ว • ซิงก์กระทงทุก 5 วินาที',
        cloudInvalid: 'ใส่ URL ของ Firebase Realtime Database (…firebaseio.com หรือ …firebasedatabase.app)',
        cloudError: 'เชื่อมต่อไม่ได้ ตรวจสอบ URL และ Rules ของฐานข้อมูล',
        cloudOff: 'ยกเลิกการเชื่อมต่อแล้ว',
        toastCopied: 'คัดลอกคำอธิษฐานแล้ว!', toastAlreadyBlessed: 'คุณร่วมอนุโมทนากระทงนี้แล้ว 🙏',
        defaultSender: 'ผู้ร่วมสืบสานประเพณีไทย',
        defaultWish: 'ขอขมาพระแม่คงคา ขอให้สิ่งไม่ดีลอยไปกับสายน้ำ พบเจอแต่ความสุข ความเจริญรุ่งเรือง'
    },
    en: {
        appTitle: 'Loykratong · Far From Home', badgeCountries: '16 Places',
        introTitle1: 'Loykratong Online', introTitle2: 'Far From Home', introTagline: 'Wherever you are in the world, float a krathong and send your heart home 🏡', docTitle: 'Loykratong Online — Far From Home',
        appSubtitle: 'Global Thai Festival of Lights • Float & Wish Across Borders',
        countdownDays: '{n} days to Loykratong night • {date}',
        countdownTomorrow: 'Loykratong is tomorrow! • {date}',
        countdownToday: '🌕 Tonight is Loykratong! • {date}',
        btnFullscreen: 'Full Screen', btnExitFullscreen: 'Exit Full Screen', btnBg: 'Scenes', btnCloud: 'Cloud',
        soundOn: 'Mute', soundOff: 'Music', btnFireworks: 'Fireworks',
        dragDropTitle: 'Drop a background file here', dragDropSub: 'Image • GIF • video (mp4/webm) — used for the current country right away',
        riverHint: '💡 Tap a krathong to read its wish & send a heart • Tap the sky for fireworks',
        toggleShowStudio: 'Make Your Krathong', toggleHideStudio: 'View the River',
        studioTitle: 'Krathong Studio', tabDesign: '② Pick a Krathong', tabWish: '③ Make a Wish',
        previewBadge: '✨ Live Preview', btnRandomize: 'Randomize Krathong & Flowers',
        labelBase: 'Eco-Friendly Base', labelFlower: 'Auspicious Flowers', labelTopping: 'Lucky Offerings (pick up to 2)', toppingCount: '{n}/2 picked',
        btnHelp: 'How to', tutStart: 'Start floating 🪷',
        tutSteps: [['📍', 'Pick a place', 'Thailand’s 4 regions, abroad, or special zones'], ['🪷', 'Pick a krathong', 'Base, flowers and up to 2 offerings'], ['🙏', 'Wish before you float', 'Add your name, write a wish, light the candle'], ['🎋', 'Draw a fortune', 'Draw a Siam Si stick — or just finish']],
        locStep: 'Step 1', locTitle: 'Where do you want to float?', locChange: 'Change place', krathongsHere: '{n} krathongs',
        btnNextWish: 'Next: Write Your Wish',
        labelSender: 'Your Name / Family / Group', placeholderSender: 'e.g. Sarah & Family',
        labelWish: 'Your Wish / Blessing to the River Goddess', btnRandomWish: 'Lucky Wish',
        placeholderWish: 'May all misfortunes float away with the river, bringing joy and prosperity...',
        labelWishCat: 'Popular wish categories:',
        catWealth: '💰 Wealth & Prosperity', catLove: '❤️ Love & Family', catHealth: '🌿 Health & Happiness', catCareer: '🎯 Career & Studies',
        btnBack: 'Back', btnLaunch: 'Light Candle & Float',
        floatedAt: 'Floated at', btnBless: 'Send Blessing', blessed: 'Blessed', btnCloseInspector: 'Close',
        cardSuccess: 'Your Krathong Is Floating!',
        btnCardImage: 'Create Souvenir Card Image', btnSaveDraft: 'Save This Krathong Picture', btnShareCard: 'Copy Wish to Share',
        cardSaveHint: 'Long-press (mobile) or right-click the image to save it',
        btnViewRiver: "I'm done", btnNewKrathong: '+ Design Another Krathong',
        siamsiAsk: '🌕 Floated! Want to draw a lucky Siam Si fortune stick?', btnSiamsi: 'Draw a fortune',
        siamsiTitle: '🎋 Siam Si Fortune', siamsiPick: 'Take a breath, then pick what you want to know', siamsiSkip: "Skip — I'm done",
        siamsiShaking: 'Making a wish… shake shake shake', siamsiStick: 'Stick #{n}', luckyColor: 'Lucky color', luckyNumber: 'Lucky number {n}',
        siamsiFooter: 'Every stick is a good one. Believe in yourself ✨', btnCopyFortune: 'Copy', btnSiamsiAgain: 'Another topic',
        btnFortuneCard: 'Add to card', btnSiamsiDone: "I'm done", toastFortuneCopied: 'Fortune copied!',
        cardFortune: 'Siam Si stick #{n}', toppingMeaning: 'Meaning',
        cardHeading: 'Loykratong · Far From Home',
        bgModalTitle: 'Country Backgrounds',
        bgModalDesc: 'The original paintings are used by default. Upload your own (or drag & drop anywhere). Uploads stay on this device only.',
        bgDefault: 'Original painting', bgCustom: 'Your upload', bgVideo: 'Video', bgGif: 'GIF', btnChangeImg: 'Upload', btnUseDefault: 'Use original',
        btnResetBg: 'Reset All', btnDoneBg: 'Done',
        toastBgSaved: 'Background updated', toastBgMemory: 'Device storage is full — this image lasts until you close the page',
        toastVideoSaving: 'Loading video…', toastVideoSaved: 'Video background set', toastVideoSession: 'Using this video until you close the page (can\'t be saved)',
        toastVideoTooBig: 'Video is too large (over {n}MB) — please compress it first', toastGifTooBig: 'GIF is too large to store on this device', toastBgUnsupported: 'Unsupported file (use an image, GIF, or mp4/webm video)',
        cloudTitle: 'Firebase Realtime Database Sync',
        cloudDesc: 'Let visitors around the world see each other\'s krathongs in real time:',
        cloudSteps: [
            'Create a free project at <b>console.firebase.google.com</b>',
            'Go to <b>Build → Realtime Database</b> and create a database',
            'Paste the <b>Rules</b> from README (length limits, no deletes)',
            'Paste your <b>Database URL</b> below and connect'
        ],
        btnConnectCloud: 'Connect Cloud Sync', btnDisconnect: 'Disconnect',
        cloudConnected: 'Connected • syncing krathongs every 5 seconds',
        cloudInvalid: 'Enter a Firebase Realtime Database URL (…firebaseio.com or …firebasedatabase.app)',
        cloudError: 'Could not connect. Check the URL and your database Rules.',
        cloudOff: 'Cloud sync disconnected',
        toastCopied: 'Wish copied!', toastAlreadyBlessed: 'You already blessed this krathong 🙏',
        defaultSender: 'Festival Guest',
        defaultWish: 'May all negativity wash away with the river and bring peace, health, and good fortune.'
    },
    zh: {
        appTitle: '远方·在线水灯节', badgeCountries: '16个地点',
        introTitle1: '在线放水灯', introTitle2: '远方的家', introTagline: '无论身在世界哪里，都能放一盏水灯，把心意寄回家 🏡', docTitle: '远方·在线水灯节 Loykratong Online',
        appSubtitle: '泰国传统水灯节文化 • 跨国放水灯祈福体验',
        countdownDays: '距水灯节还有 {n} 天 • {date}',
        countdownTomorrow: '明天就是水灯节！ • {date}',
        countdownToday: '🌕 今晚就是水灯节！ • {date}',
        btnFullscreen: '全屏', btnExitFullscreen: '退出全屏', btnBg: '背景', btnCloud: '云同步',
        soundOn: '静音', soundOff: '背景音乐', btnFireworks: '放烟花',
        dragDropTitle: '将背景文件拖放到此处', dragDropSub: '支持 图片 • GIF • 视频 (mp4/webm)，立即用作当前国家背景',
        riverHint: '💡 点击河面上的水灯阅读祝福并点赞 • 点击夜空燃放烟花',
        toggleShowStudio: '定制您的水灯', toggleHideStudio: '欣赏河景',
        studioTitle: '在线水灯设计工坊', tabDesign: '② 选择水灯', tabWish: '③ 许愿后放灯',
        previewBadge: '✨ 实时预览', btnRandomize: '随机搭配水灯与鲜花',
        labelBase: '环保水灯底座', labelFlower: '吉祥装饰鲜花', labelTopping: '开运供品（可选2样）', toppingCount: '已选 {n}/2',
        btnHelp: '玩法', tutStart: '开始放水灯 🪷',
        tutSteps: [['📍', '选择地点', '泰国四大区、海外或特别区'], ['🪷', '选择水灯', '底座、鲜花，供品可选 2 样'], ['🙏', '许愿后放灯', '写下名字与心愿，点燃蜡烛'], ['🎋', '摇签', '想摇就摇，也可以直接完成']],
        locStep: '第 1 步', locTitle: '选择放水灯的地点', locChange: '更换地点', krathongsHere: '{n} 盏',
        btnNextWish: '下一步：填写心愿',
        labelSender: '您的姓名 / 家人 / 团队', placeholderSender: '例如：林小姐与家人',
        labelWish: '祈福心愿 / 感恩水神', btnRandomWish: '随机吉祥祝福',
        placeholderWish: '愿所有烦恼随水漂走，迎来一整年的平安顺遂与幸福安康...',
        labelWishCat: '热门祈福分类：',
        catWealth: '💰 财运亨通', catLove: '❤️ 爱情美满 & 阖家幸福', catHealth: '🌿 身体健康 & 平安喜乐', catCareer: '🎯 学业进步 & 前程似锦',
        btnBack: '返回', btnLaunch: '点燃蜡烛并放水灯',
        floatedAt: '放灯地点：', btnBless: '送上祝福', blessed: '已祝福', btnCloseInspector: '关闭',
        cardSuccess: '水灯已成功放入河中！',
        btnCardImage: '生成祈福纪念卡图片', btnSaveDraft: '保存这盏水灯的图片', btnShareCard: '复制心愿并分享',
        cardSaveHint: '长按（手机）或右键点击图片即可保存',
        btnViewRiver: '完成', btnNewKrathong: '+ 设计另一盏水灯',
        siamsiAsk: '🌕 放好啦！要不要摇一支吉祥签？', btnSiamsi: '摇签',
        siamsiTitle: '🎋 吉祥求签', siamsiPick: '静下心来，选择你想问的事', siamsiSkip: '不摇了，完成',
        siamsiShaking: '诚心许愿…摇摇摇', siamsiStick: '第 {n} 签', luckyColor: '幸运色', luckyNumber: '幸运数字 {n}',
        siamsiFooter: '每一支都是上上签，相信自己 ✨', btnCopyFortune: '复制', btnSiamsiAgain: '换个问题',
        btnFortuneCard: '加入卡片', btnSiamsiDone: '完成', toastFortuneCopied: '签文已复制！',
        cardFortune: '第 {n} 签', toppingMeaning: '寓意',
        cardHeading: '远方·在线水灯节',
        bgModalTitle: '各国场景背景',
        bgModalDesc: '默认使用原创绘画背景。您可上传自己的图片（或直接拖入屏幕），图片仅保存在本设备。',
        bgDefault: '原创绘画', bgCustom: '已上传', bgVideo: '视频', bgGif: 'GIF', btnChangeImg: '更换背景', btnUseDefault: '使用原图',
        btnResetBg: '全部恢复', btnDoneBg: '完成',
        toastBgSaved: '背景已更新', toastBgMemory: '设备存储已满，此图片仅在关闭页面前有效',
        toastVideoSaving: '正在载入视频…', toastVideoSaved: '已设为视频背景', toastVideoSession: '此视频仅在关闭页面前有效（无法永久保存）',
        toastVideoTooBig: '视频过大（超过 {n}MB），请先压缩', toastGifTooBig: 'GIF 文件过大，无法保存到本设备', toastBgUnsupported: '不支持的文件（请使用图片、GIF 或 mp4/webm 视频）',
        cloudTitle: 'Firebase 实时数据库云同步',
        cloudDesc: '配置后，全球访客可实时看到彼此放出的水灯：',
        cloudSteps: [
            '前往 <b>console.firebase.google.com</b> 创建免费项目',
            '进入 <b>Build → Realtime Database</b> 并创建数据库',
            '粘贴 README 中的 <b>Rules</b>（限制长度、禁止删除）',
            '将 <b>Database URL</b> 粘贴到下方并连接'
        ],
        btnConnectCloud: '连接云同步', btnDisconnect: '断开',
        cloudConnected: '已连接 • 每 5 秒同步一次',
        cloudInvalid: '请输入 Firebase 实时数据库 URL（…firebaseio.com 或 …firebasedatabase.app）',
        cloudError: '无法连接，请检查 URL 与数据库 Rules。',
        cloudOff: '已断开云同步',
        toastCopied: '心愿已复制！', toastAlreadyBlessed: '您已为这盏水灯送上祝福 🙏',
        defaultSender: '水灯节祈福嘉宾',
        defaultWish: '祈愿水神庇佑，烦恼随波逐流，岁岁平安，万事胜意。'
    }
};
const LOCALES = { th: 'th-TH', en: 'en-GB', zh: 'zh-CN' };

function detectLanguage() {
    const saved = lsGet(LS.lang, null);
    if (saved && I18N[saved]) return saved;
    const nav = (navigator.language || 'th').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('th')) return 'th';
    return nav.startsWith('en') ? 'en' : 'th';
}
const needsLangPick = !lsGet(LS.lang, null);   // first visit → show the language step
let currentLang = detectLanguage();

function t(key, vars) {
    let s = (I18N[currentLang] && I18N[currentLang][key]) ?? I18N.th[key] ?? key;
    if (vars && typeof s === 'string') Object.keys(vars).forEach(k => { s = s.replace(`{${k}}`, vars[k]); });
    return s;
}
const $ = id => document.getElementById(id);
function setText(id, key) { const el = $(id); if (el) el.textContent = t(key); }

function setLanguage(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    lsSet(LS.lang, lang);
    document.documentElement.lang = lang;

    ['th', 'en', 'zh'].forEach(code => {
        $(`lang-btn-${code}`).className = code === lang
            ? 'px-2 py-1 rounded-lg transition bg-gold-500 text-night-950 font-bold'
            : 'px-2 py-1 rounded-lg transition text-slate-300 hover:text-white';
    });

    const map = {
        'ui-app-title': 'appTitle', 'ui-badge-countries': 'badgeCountries',
        'ui-btn-fullscreen': 'btnFullscreen', 'ui-btn-exit-fullscreen': 'btnExitFullscreen',
        'ui-btn-bg': 'btnBg', 'ui-btn-cloud': 'btnCloud', 'ui-btn-fireworks': 'btnFireworks',
        'drag-drop-title': 'dragDropTitle', 'drag-drop-sub': 'dragDropSub', 'ui-river-hint': 'riverHint',
        'ui-studio-title': 'studioTitle', 'tab-btn-design': 'tabDesign', 'tab-btn-wish': 'tabWish',
        'ui-preview-badge': 'previewBadge', 'ui-btn-randomize': 'btnRandomize',
        'ui-label-base': 'labelBase', 'ui-label-flower': 'labelFlower', 'ui-label-topping': 'labelTopping',
        'ui-btn-next-wish': 'btnNextWish', 'ui-label-sender': 'labelSender', 'ui-label-wish': 'labelWish',
        'ui-btn-random-wish': 'btnRandomWish', 'ui-label-wish-cat': 'labelWishCat',
        'ui-cat-wealth': 'catWealth', 'ui-cat-love': 'catLove', 'ui-cat-health': 'catHealth', 'ui-cat-career': 'catCareer',
        'ui-btn-back': 'btnBack', 'ui-btn-launch': 'btnLaunch', 'ui-btn-close-inspector': 'btnCloseInspector',
        'ui-card-success': 'cardSuccess', 'ui-btn-card-image': 'btnCardImage', 'ui-btn-save-draft': 'btnSaveDraft','ui-btn-share-card': 'btnShareCard',
        'ui-card-save-hint': 'cardSaveHint', 'ui-btn-view-river': 'btnViewRiver', 'ui-btn-new-krathong': 'btnNewKrathong',
        'ui-bg-modal-title': 'bgModalTitle', 'ui-bg-modal-desc': 'bgModalDesc',
        'ui-btn-reset-bg': 'btnResetBg', 'ui-btn-done-bg': 'btnDoneBg',
        'ui-cloud-title': 'cloudTitle', 'ui-cloud-desc': 'cloudDesc',
        'ui-btn-connect-cloud': 'btnConnectCloud', 'ui-btn-disconnect': 'btnDisconnect',
        'ui-siamsi-ask': 'siamsiAsk', 'ui-btn-siamsi': 'btnSiamsi', 'ui-siamsi-title': 'siamsiTitle', 'ui-siamsi-pick': 'siamsiPick',
        'ui-siamsi-skip': 'siamsiSkip', 'ui-siamsi-shaking': 'siamsiShaking', 'ui-siamsi-footer': 'siamsiFooter',
        'ui-btn-copy-fortune': 'btnCopyFortune', 'ui-btn-siamsi-again': 'btnSiamsiAgain', 'ui-btn-fortune-card': 'btnFortuneCard',
        'ui-btn-siamsi-done': 'btnSiamsiDone', 'ui-btn-help': 'btnHelp', 'ui-tut-start': 'tutStart', 'ui-intro-title1': 'introTitle1', 'ui-intro-title2': 'introTitle2', 'ui-intro-tagline': 'introTagline', 'ui-loc-step': 'locStep', 'ui-loc-title': 'locTitle'
    };
    Object.entries(map).forEach(([id, key]) => setText(id, key));
    $('sound-label').textContent = soundEnabled ? t('soundOn') : t('soundOff');
    $('toggle-studio-text').textContent = isStudioVisible ? t('toggleHideStudio') : t('toggleShowStudio');
    $('user-name-input').placeholder = t('placeholderSender');
    $('user-wish-input').placeholder = t('placeholderWish');
    $('ui-cloud-steps').innerHTML = t('cloudSteps').map(s => `<li>${s}</li>`).join('');
    ['btn-fullscreen', 'btn-bg', 'btn-sound', 'btn-fireworks'].forEach((id, i) => {
        $(id).title = t(['btnFullscreen', 'btnBg', 'soundOff', 'btnFireworks'][i]);
    });
    $('btn-cloud').title = t('cloudTitle');

    renderCountryTabs();
    renderStudioOptions();
    updateKrathongPreview();
    updateSceneTitle();
    updateCountdown();
    refreshRiverLabels();
    if (activeInspectedId) openWishInspector(activeInspectedId, true);
    renderSiamsiTopics();
    renderTutorialSteps();
    document.title = t('docTitle');
    document.querySelectorAll('.intro-lang-mini').forEach(b => { b.className = 'intro-lang-mini px-2.5 py-1 rounded-lg ' + (b.dataset.lang === lang ? 'bg-gold-500 text-night-950' : 'text-slate-300 hover:text-white'); });
    if ($('intro-countdown')) $('intro-countdown').textContent = $('countdown-pill').textContent;
    if ($('location-modal').classList.contains('flex')) renderLocationPicker();
    if (lastFortune && !$('siamsi-stage-result').classList.contains('hidden')) renderFortune(lastFortune);
}

/* ---------------------------------------------------------------------
 * 3. DATA
 * ------------------------------------------------------------------- */
const COUNTRIES = [
    { id: 'thailand', code: 'th', flag: '🇹🇭', name: { th: 'กรุงเทพฯ', en: 'Bangkok', zh: '曼谷' },
      landmark: { th: 'วัดอรุณฯ & สะพานพระราม 8 ริมเจ้าพระยา', en: 'Wat Arun & Rama VIII Bridge', zh: '郑王庙与拉玛八世大桥' },
      skyColors: ['#040717', '#131d47', '#3b2459'], waterGlow: '#facc15' },
    { id: 'north', code: 'thn', flag: '🇹🇭', name: { th: 'ภาคเหนือ', en: 'Chiang Mai (North)', zh: '泰北清迈' },
      landmark: { th: 'ยี่เป็ง โคมลอย & วัดล้านนา ริมน้ำปิง', en: 'Yi Peng lanterns & Lanna temples', zh: '天灯节与兰纳寺庙' },
      skyColors: ['#050816', '#1c1d3f', '#3a2a4a'], waterGlow: '#fbbf24' },
    { id: 'northeast', code: 'thne', flag: '🇹🇭', name: { th: 'ภาคอีสาน', en: 'Isan (Northeast)', zh: '泰东北伊森' },
      landmark: { th: 'พระธาตุพนม พญานาค & ไหลเรือไฟ ริมโขง', en: 'Phra That Phanom, Naga & fire boats on the Mekong', zh: '帕侬塔、那伽与湄公河火船' },
      skyColors: ['#040716', '#141f45', '#36264f'], waterGlow: '#f59e0b' },
    { id: 'south', code: 'ths', flag: '🇹🇭', name: { th: 'ภาคใต้', en: 'Andaman (South)', zh: '泰南安达曼' },
      landmark: { th: 'เขาหินปูนทะเลอันดามัน & เรือหางยาว', en: 'Andaman karsts & longtail boats', zh: '安达曼石灰岩与长尾船' },
      skyColors: ['#03081a', '#0f2547', '#2a2a5c'], waterGlow: '#2dd4bf' },
    { id: 'singapore', code: 'sg', flag: '🇸🇬', name: { th: 'สิงคโปร์', en: 'Singapore', zh: '新加坡' },
      landmark: { th: 'Marina Bay Sands & Merlion', en: 'Marina Bay Sands & Merlion', zh: '滨海湾金沙与鱼尾狮' },
      skyColors: ['#030816', '#0e2442', '#1e1b4b'], waterGlow: '#38bdf8' },
    { id: 'hongkong', code: 'hk', flag: '🇭🇰', name: { th: 'ฮ่องกง', en: 'Hong Kong', zh: '中国香港' },
      landmark: { th: 'อ่าววิกตอเรีย & เรือสำเภาแดง', en: 'Victoria Harbour & Red Junk Boat', zh: '维多利亚港与红帆船' },
      skyColors: ['#050614', '#1e163b', '#4c1d4b'], waterGlow: '#fb7185' },
    { id: 'korea', code: 'kr', flag: '🇰🇷', name: { th: 'เกาหลีใต้', en: 'South Korea', zh: '韩国' },
      landmark: { th: 'ประตูเมืองโบราณ & N Seoul Tower', en: 'Fortress gates & N Seoul Tower', zh: '古城门与N首尔塔' },
      skyColors: ['#050717', '#1a1c45', '#3b2a5e'], waterGlow: '#f472b6' },
    { id: 'japan', code: 'jp', flag: '🇯🇵', name: { th: 'ญี่ปุ่น', en: 'Japan', zh: '日本' },
      landmark: { th: 'เจดีย์ญี่ปุ่น สะพานแดง & ภูเขาไฟฟูจิ', en: 'Pagoda, red bridge & Mt. Fuji', zh: '五重塔、红桥与富士山' },
      skyColors: ['#040717', '#16204a', '#3a2756'], waterGlow: '#fda4af' },
    { id: 'usa', code: 'us', flag: '🇺🇸', name: { th: 'สหรัฐอเมริกา', en: 'USA', zh: '美国' },
      landmark: { th: 'เทพีเสรีภาพ & สะพานบรูคลิน นิวยอร์ก', en: 'Statue of Liberty & Brooklyn Bridge, NYC', zh: '自由女神像与布鲁克林大桥' },
      skyColors: ['#030714', '#12203d', '#3b1d36'], waterGlow: '#f97316' },
    { id: 'england', code: 'gb', flag: '🇬🇧', name: { th: 'อังกฤษ', en: 'England', zh: '英国' },
      landmark: { th: 'หอนาฬิกาบิ๊กเบน & ลอนดอนอาย', en: 'Big Ben & London Eye', zh: '大本钟与伦敦眼' },
      skyColors: ['#040817', '#152242', '#2e2459'], waterGlow: '#c084fc' },
    { id: 'france', code: 'fr', flag: '🇫🇷', name: { th: 'ฝรั่งเศส', en: 'France', zh: '法国' },
      landmark: { th: 'หอไอเฟล & แม่น้ำแซน', en: 'Eiffel Tower & River Seine', zh: '埃菲尔铁塔与塞纳河' },
      skyColors: ['#050718', '#1d1b4b', '#432359'], waterGlow: '#fde047' },
    { id: 'germany', code: 'de', flag: '🇩🇪', name: { th: 'เยอรมนี', en: 'Germany', zh: '德国' },
      landmark: { th: 'ประตูบรานเดนบวร์ก & ปราสาทนอยชวานสไตน์', en: 'Brandenburg Gate & Neuschwanstein', zh: '勃兰登堡门与新天鹅堡' },
      skyColors: ['#040714', '#16253b', '#38294a'], waterGlow: '#fbbf24' },
    { id: 'australia', code: 'au', flag: '🇦🇺', name: { th: 'ออสเตรเลีย', en: 'Australia', zh: '澳大利亚' },
      landmark: { th: 'ซิดนีย์โอเปร่าเฮาส์ & สะพานฮาร์เบอร์', en: 'Sydney Opera House & Harbour Bridge', zh: '悉尼歌剧院与海港大桥' },
      skyColors: ['#030817', '#0f294a', '#26235c'], waterGlow: '#2dd4bf' }
];

COUNTRIES.push(
    { id: 'cyberpunk', code: 'cy', flag: '🌆', name: { th: 'ไซเบอร์พังก์', en: 'Cyberpunk City', zh: '赛博朋克城' },
      landmark: { th: 'เมืองนีออนแห่งอนาคต & รถลอยฟ้า', en: 'Neon future city & flying cars', zh: '霓虹未来城与飞行车' },
      skyColors: ['#050418', '#1e1250', '#4c1d6b'], waterGlow: '#e879f9' },
    { id: 'jurassic', code: 'ju', flag: '🦕', name: { th: 'จูราสสิก', en: 'Jurassic', zh: '侏罗纪' },
      landmark: { th: 'ไดโนเสาร์ ภูเขาไฟ & ป่าดึกดำบรรพ์', en: 'Dinosaurs, volcano & ancient jungle', zh: '恐龙、火山与远古丛林' },
      skyColors: ['#030a12', '#0f2a2e', '#1f3b2c'], waterGlow: '#a3e635' },
    { id: 'space', code: 'sp', flag: '🚀', name: { th: 'อวกาศ', en: 'Space Station', zh: '太空站' },
      landmark: { th: 'สถานีอวกาศ กาแล็กซี & ดาวเคราะห์', en: 'Space station, galaxy & planets', zh: '空间站、银河与星球' },
      skyColors: ['#02030c', '#0b1036', '#25145a'], waterGlow: '#818cf8' }
);

const ZONES = [
    { id: 'thai', emoji: '🇹🇭', name: { th: 'ประเทศไทย', en: 'Thailand', zh: '泰国' }, ids: ['thailand', 'north', 'northeast', 'south'] },
    { id: 'world', emoji: '🌏', name: { th: 'โซนต่างประเทศ', en: 'Around the World', zh: '海外' }, ids: ['singapore', 'hongkong', 'korea', 'japan', 'usa', 'england', 'france', 'germany', 'australia'] },
    { id: 'special', emoji: '✨', name: { th: 'โซนพิเศษ', en: 'Special Zones', zh: '特别区' }, ids: ['cyberpunk', 'jurassic', 'space'] }
];

const BASES = [
    { id: 'banana', name: { th: 'ใบตองตานี', en: 'Banana Leaf', zh: '香蕉叶底座' }, desc: { th: 'เย็บกลีบประณีต', en: 'Classic folded leaf', zh: '传统手工折叶' }, outer: '#15803d', inner: '#22c55e', rim: '#86efac', stroke: '#052e16' },
    { id: 'bread', name: { th: 'ขนมปัง', en: 'Fish Bread', zh: '鱼食面包' }, desc: { th: 'อาหารปลารักษ์โลก', en: 'Eco fish-food base', zh: '环保可食底座' }, outer: '#b45309', inner: '#f59e0b', rim: '#fde68a', stroke: '#451a03' },
    { id: 'lotus', name: { th: 'กลีบบัวหลวง', en: 'Lotus Petal', zh: '莲花瓣底座' }, desc: { th: 'กลีบบัวชมพูอ่อน', en: 'Sacred pink petals', zh: '圣洁粉莲花瓣' }, outer: '#be185d', inner: '#f472b6', rim: '#fbcfe8', stroke: '#500724' },
    { id: 'coconut', name: { th: 'กะลามะพร้าว', en: 'Coconut Shell', zh: '椰壳底座' }, desc: { th: 'คลาสสิก ยั่งยืน', en: 'Natural coconut shell', zh: '天然复古椰壳' }, outer: '#5c2d16', inner: '#854d0e', rim: '#d97706', stroke: '#291206' },
    { id: 'ice', name: { th: 'น้ำแข็งใส', en: 'Crystal Ice', zh: '水晶冰雕' }, desc: { th: 'ละลายไร้ขยะ 100%', en: 'Zero-waste ice', zh: '零污染纯冰雕' }, outer: '#0284c7', inner: '#7dd3fc', rim: '#e0f2fe', stroke: '#0c4a6e' }
];

const FLOWERS = [
    { id: 'marigold', name: { th: 'ดาวเรือง', en: 'Marigold', zh: '万寿菊' }, color: '#facc15', center: '#ea580c', meaning: { th: 'เงินทองรุ่งเรือง', en: 'Prosperity', zh: '财富兴旺' } },
    { id: 'lotus', name: { th: 'ดอกบัวฉัตร', en: 'Pink Lotus', zh: '粉红莲花' }, color: '#f43f5e', center: '#fda4af', meaning: { th: 'บริสุทธิ์ผ่องใส', en: 'Purity', zh: '圣洁智慧' } },
    { id: 'orchid', name: { th: 'กล้วยไม้ม่วง', en: 'Purple Orchid', zh: '紫兰花' }, color: '#a855f7', center: '#e9d5ff', meaning: { th: 'สง่างามมีเสน่ห์', en: 'Grace & Charm', zh: '高贵优雅' } },
    { id: 'rose', name: { th: 'กุหลาบแดง', en: 'Red Rose', zh: '红玫瑰' }, color: '#dc2626', center: '#fecaca', meaning: { th: 'ความรักมั่นคง', en: 'True Love', zh: '真挚爱情' } },
    { id: 'jasmine', name: { th: 'ดอกมะลิขาว', en: 'White Jasmine', zh: '白茉莉' }, color: '#f8fafc', center: '#fde047', meaning: { th: 'ร่มเย็นเป็นสุข', en: 'Peace & Joy', zh: '平安幸福' } }
];

const TOPPINGS = [
    { id: 'incense', icon: '🕯️', name: { th: 'ธูปเทียนมงคล', en: 'Incense & Candle', zh: '吉祥香烛' },
      desc: { th: 'ขอขมาพระแม่คงคา บูชาพระรัตนตรัย ใจสงบ', en: 'Respect to the river goddess & the Triple Gem', zh: '敬拜水神与三宝，心静平安' } },
    { id: 'coins', icon: '🪙', name: { th: 'ก้อนทองเรียกทรัพย์', en: 'Gold Ingot', zh: '招财金元宝' },
      desc: { th: 'เรียกเงินทอง ค้าขายร่ำรวย เงินไหลมาเทมา', en: 'Calls in wealth & good business', zh: '招财进宝，生意兴隆' } },
    { id: 'couple', icon: '💑', name: { th: 'ป้ายคู่รักสมหวัง', en: 'Love Plaque', zh: '姻缘同心牌' },
      desc: { th: 'ความรักมั่นคง สมหวังในคู่ ไม่มีมือที่สาม', en: 'Steady love & a matched heart', zh: '爱情稳定，有情人终成眷属' } },
    { id: 'cat', icon: '🐱', name: { th: 'น้องแมวนำโชค', en: 'Lucky Cat', zh: '招财猫' },
      desc: { th: 'กวักโชคลาภ ลูกค้าเข้าร้าน คนเอ็นดู', en: 'Waves in luck, customers & charm', zh: '招来好运、客人与人缘' } },
    { id: 'garland', icon: '💮', name: { th: 'พวงมาลัยมะลิ', en: 'Jasmine Garland', zh: '茉莉花环' },
      desc: { th: 'บูชาสิ่งศักดิ์สิทธิ์ ขอให้คนในบ้านแข็งแรง', en: 'An offering for blessings & family health', zh: '供奉神明，祈愿家人健康' } },
    { id: 'betel', icon: '🌿', name: { th: 'หมากพลู', en: 'Betel & Areca', zh: '槟榔蒌叶' },
      desc: { th: 'เครื่องบูชาแบบไทยโบราณ ขอขมาสายน้ำ', en: 'A classic Thai offering of respect to the river', zh: '泰国传统供品，向河流致敬' } },
    { id: 'elephant', icon: '🐘', name: { th: 'ช้างนำโชค', en: 'Lucky Elephant', zh: '吉祥象' },
      desc: { th: 'ฝ่าทุกอุปสรรค มีผู้ใหญ่ค้ำชู', en: 'Breaks through obstacles, brings strong backing', zh: '破除障碍，贵人相助' } },
    { id: 'diploma', icon: '🎓', name: { th: 'ม้วนปริญญา', en: 'Diploma Scroll', zh: '学位卷轴' },
      desc: { th: 'เรียนจบ สอบติด งานรุ่ง', en: 'Graduate, pass exams, rise at work', zh: '学业有成，金榜题名' } }
];

const COUNTRY_IDS = new Set(COUNTRIES.map(c => c.id));
const BASE_IDS = new Set(BASES.map(b => b.id));
const FLOWER_IDS = new Set(FLOWERS.map(f => f.id));
const TOPPING_IDS = new Set(TOPPINGS.map(x => x.id));

const WISH_PRESETS = {
    th: {
        wealth: ['ขอให้การงานราบรื่น ธุรกิจเจริญรุ่งเรือง เงินทองไหลมาเทมาตลอดปี', 'ขอให้หมดหนี้หมดสิน มีโชคลาภก้อนใหญ่เข้ามาในชีวิต', 'ขอให้หน้าที่การงานเลื่อนขั้นเลื่อนตำแหน่ง เงินเดือนปรับขึ้นสมใจ'],
        love: ['ขอให้พบเจอรักแท้ที่ดีและเข้าใจกัน มีความสุขในทุกๆ วัน', 'ขอให้ครอบครัวมีความสุข สุขภาพแข็งแรง พร้อมหน้าพร้อมตากันตลอดไป', 'ขอให้คนรักรักและซื่อสัตย์ต่อกัน ปราศจากอุปสรรคใดๆ'],
        health: ['ขอให้มีสุขภาพร่างกายแข็งแรง ปราศจากโรคภัยไข้เจ็บทั้งปวง', 'ขอให้จิตใจสงบสุข มีพลังบวกในการดำเนินชีวิตในทุกๆ วัน', 'ขอให้คนที่เรารักทุกคนแข็งแรงและมีอายุยืนยาว'],
        career: ['ขอให้การสอบผ่านฉลุย ได้ศึกษาต่อในสถาบันที่ปรารถนา', 'ขอให้โปรเจกต์งานสำเร็จลุล่วงด้วยดี เจ้านายเมตตา เพื่อนร่วมงานช่วยเหลือ', 'ขอให้มีไอเดียสร้างสรรค์และประสบความสำเร็จในสิ่งที่ลงมือทำ']
    },
    en: {
        wealth: ['May my career flourish, business prosper, and wealth flow abundantly all year long.', 'Wishing for financial freedom and unexpected blessings of prosperity.', 'May hard work bring promotion, success, and abundance to my family.'],
        love: ['May I find true, understanding love and share happiness every single day.', 'Wishing my family endless warmth, harmony, and togetherness forever.', 'May love grow stronger and overcome every obstacle with grace.'],
        health: ['Wishing for vibrant health, strength, and protection from all illness.', 'May my mind be peaceful and filled with positive energy each day.', 'Praying for longevity, vitality, and wellness for everyone I love.'],
        career: ['May I pass all exams with flying colors and achieve my academic dreams.', 'Wishing every project succeeds smoothly with supportive colleagues and mentors.', 'May creativity and wisdom guide me to achieve every goal I set.']
    },
    zh: {
        wealth: ['祈愿新的一年事业蒸蒸日上，财源广进，万事顺遂。', '愿烦恼随水漂走，迎来满满的好运与丰盛财富。', '祝愿工作步步高升，付出皆有丰厚回报。'],
        love: ['祈愿遇见真挚良缘，相知相惜，天天幸福快乐。', '祝愿家人平安健康，阖家团圆，幸福美满。', '愿有情人终成眷属，携手共度每一个美好时光。'],
        health: ['祈愿身体健康，远离一切病痛，平安顺遂。', '愿内心平静安宁，每一天都充满阳光与正能量。', '祝愿长辈健康长寿，全家福寿安康。'],
        career: ['祈愿金榜题名，学业进步，考入理想的学府。', '祝愿工作项目顺利推进，贵人相助，前程似锦。', '愿智慧与灵感常伴左右，实现心中的每一个梦想。']
    }
};

const DEMO_KRATHONGS = [
    ['demo-th-1', 'คุณแม่สมศรี & ครอบครัว', 'thailand', 'banana', 'marigold', 'incense', 'ขอให้ครอบครัวร่มเย็นเป็นสุข สุขภาพแข็งแรงทุกท่าน', 18],
    ['demo-th-2', 'นนท์ & เบลล่า', 'thailand', 'lotus', 'rose', 'couple', 'ขอให้ความรักมั่นคงและมีความสุขด้วยกันตลอดไป', 24],
    ['demo-th-3', 'ทีมงานบ้านริมน้ำ', 'thailand', 'bread', 'jasmine', 'coins', 'ขอให้กิจการรุ่งเรือง ลูกค้าเต็มร้านตลอดปี', 11],
    ['demo-thn-1', 'ครอบครัวเชียงใหม่', 'north', 'banana', 'marigold', 'garland', 'ขอให้ทุกคนในบ้านสุขภาพแข็งแรง ยี่เป็งปีนี้สว่างไสว', 21],
    ['demo-thn-2', 'มายด์ & ภู', 'north', 'lotus', 'jasmine', 'couple', 'ขอให้รักกันไปนานๆ เหมือนโคมลอยที่ไม่มีวันดับ', 15],
    ['demo-thne-1', 'ลูกอีสานไกลบ้าน', 'northeast', 'banana', 'marigold', 'betel', 'ขอพญานาคคุ้มครอง ให้พ่อแม่ที่บ้านแข็งแรง', 26],
    ['demo-thne-2', 'ทีมงานริมโขง', 'northeast', 'coconut', 'lotus', 'elephant', 'ขอให้ผ่านทุกอุปสรรค งานรุ่ง เงินเข้า', 12],
    ['demo-ths-1', 'แก๊งทะเลอันดามัน', 'south', 'coconut', 'orchid', 'coins', 'ขอให้ร้านริมหาดขายดี นักท่องเที่ยวเต็มทุกวัน', 18],
    ['demo-ths-2', 'น้องฟ้า', 'south', 'ice', 'jasmine', 'diploma', 'ขอให้สอบติดคณะที่ฝันไว้', 9],
    ['demo-kr-1', '지우 & Min', 'korea', 'lotus', 'rose', 'couple', '모두 행복하세요 — happy Loykratong from Seoul!', 16],
    ['demo-kr-2', 'Thai Students in Seoul', 'korea', 'banana', 'orchid', 'diploma', 'ขอให้เรียนจบได้ทุนต่อ สู้ๆ ทุกคน', 11],
    ['demo-jp-1', 'Yuki', 'japan', 'lotus', 'jasmine', 'garland', 'みんなが幸せになりますように', 19],
    ['demo-jp-2', 'คนไทยในโตเกียว', 'japan', 'bread', 'marigold', 'cat', 'ขอให้ร้านอาหารไทยในโตเกียวขายดี', 13],
    ['demo-us-3', 'NYC Thai Community', 'usa', 'banana', 'marigold', 'elephant', 'Happy Loykratong from the East River!', 17],
    ['demo-cy-1', 'NeonKid_2077', 'cyberpunk', 'ice', 'orchid', 'diploma', 'ขอให้เขียนโค้ดไม่มีบั๊ก deploy ผ่านทุกรอบ', 22],
    ['demo-cy-2', 'Pixel & Byte', 'cyberpunk', 'lotus', 'rose', 'couple', 'Love in high resolution 💜', 14],
    ['demo-ju-1', 'แก๊งไดโนรักษ์โลก', 'jurassic', 'banana', 'marigold', 'elephant', 'ขอให้ผ่านทุกด่านเหมือนไดโนเสาร์ตัวใหญ่', 17],
    ['demo-ju-2', 'Rex Fan Club', 'jurassic', 'bread', 'jasmine', 'garland', 'Stay strong like a T-Rex 🦖', 10],
    ['demo-sp-1', 'นักบินอวกาศน้อย', 'space', 'ice', 'jasmine', 'incense', 'ขอให้ฝันไปได้ไกลถึงดวงดาว', 20],
    ['demo-sp-2', 'Orbit Crew', 'space', 'lotus', 'orchid', 'coins', 'To the moon and beyond 🚀', 12],
    ['demo-sg-1', 'Ken & Friends', 'singapore', 'lotus', 'orchid', 'coins', 'Wishing prosperity and success in Marina Bay!', 25],
    ['demo-sg-2', 'พี่น้องคนไทยในสิงคโปร์', 'singapore', 'banana', 'marigold', 'incense', 'คิดถึงบ้าน ขอให้ทุกคนที่ไทยปลอดภัยและมีความสุข', 17],
    ['demo-hk-1', 'Linh & Alex', 'hongkong', 'bread', 'rose', 'couple', 'May our love shine as bright as Victoria Harbour lights.', 19],
    ['demo-hk-2', '陈家', 'hongkong', 'coconut', 'lotus', 'cat', '祝愿家人平安健康，阖家团圆。', 13],
    ['demo-us-1', 'Emily Chen', 'usa', 'ice', 'jasmine', 'cat', 'Sending peace and joy across the Hudson River!', 14],
    ['demo-us-2', 'Thai Students in SF', 'usa', 'banana', 'orchid', 'incense', 'Good luck on finals, everyone — and happy Loykratong!', 9],
    ['demo-gb-1', 'Oliver & Mia', 'england', 'coconut', 'marigold', 'incense', 'Blessings along the River Thames tonight.', 16],
    ['demo-gb-2', 'แพรวา (London)', 'england', 'lotus', 'jasmine', 'couple', 'ขอให้เรียนจบตามแผนและได้กลับบ้านไปหาแม่', 12],
    ['demo-fr-1', 'Camille Laurent', 'france', 'lotus', 'rose', 'couple', 'Bonheur et amour sur la Seine!', 21],
    ['demo-fr-2', 'Famille Martin', 'france', 'banana', 'jasmine', 'incense', 'Santé et paix pour toute la famille.', 8],
    ['demo-de-1', 'Lukas Weber', 'germany', 'banana', 'marigold', 'coins', 'Viel Glück und Gesundheit für alle!', 15],
    ['demo-de-2', 'Anna & Ploy', 'germany', 'ice', 'lotus', 'couple', 'Liebe über alle Grenzen hinweg.', 10],
    ['demo-au-1', 'Chloe & Liam', 'australia', 'ice', 'orchid', 'cat', 'Celebrating Loykratong under the Sydney Harbour stars!', 22],
    ['demo-au-2', 'ครอบครัวสุขใจ ซิดนีย์', 'australia', 'bread', 'marigold', 'coins', 'ขอให้ธุรกิจร้านอาหารไทยของเราเจริญรุ่งเรือง', 14]
].map(([id, name, country, base, flower, topping, wish, likes]) => ({ id, name, country, base, flower, topping, wish, likes, createdAt: 0, demo: true }));

/* ---------------------------------------------------------------------
 * 4. STATE
 * ------------------------------------------------------------------- */
const store = new Map();             // id -> krathong
DEMO_KRATHONGS.forEach(k => store.set(k.id, k));
const myIds = new Set();
lsGet(LS.mine, []).forEach(raw => {
    const k = sanitizeKrathong(raw);
    if (k) { store.set(k.id, k); myIds.add(k.id); }
});
const blessedIds = new Set(lsGet(LS.blessed, []));

let currentConfig = { country: 'thailand', base: 'banana', flower: 'marigold', topping: 'incense', topping2: 'coins' };
let countryBackgrounds = lsGet(LS.bgs, {}) || {};
let isStudioVisible = false;   // opens after a place is chosen
let isImmersiveMode = false;
let activeInspectedId = null;
let lastLaunched = null;
let paintingShown = false;
let videoShown = false;
let soundEnabled = false;

/* Bundled default videos per country: drop a file in assets/bg/ and map it here,
 * e.g. { thailand: 'assets/bg/th.mp4' }. Custom uploads always override these. */
const DEFAULT_BG_VIDEOS = {};
const MAX_VIDEO_MB = 60;
const videoUrlCache = {};   // countryId -> object URL (revoked on replace)

/* IndexedDB — stores uploaded background videos (too big for localStorage) */
const IDB = {
    _db: null,
    open() {
        return new Promise(res => {
            if (this._db) return res(this._db);
            let r;
            try { r = indexedDB.open('wlk_bg', 1); } catch (e) { return res(null); }
            r.onupgradeneeded = () => { try { r.result.createObjectStore('videos'); } catch (e) {} };
            r.onsuccess = () => { this._db = r.result; res(this._db); };
            r.onerror = () => res(null);
        });
    },
    async put(key, blob) {
        const db = await this.open(); if (!db) return false;
        return new Promise(res => {
            try { const tx = db.transaction('videos', 'readwrite'); tx.objectStore('videos').put(blob, key); tx.oncomplete = () => res(true); tx.onerror = () => res(false); tx.onabort = () => res(false); }
            catch (e) { res(false); }
        });
    },
    async get(key) {
        const db = await this.open(); if (!db) return null;
        return new Promise(res => {
            try { const tx = db.transaction('videos', 'readonly'); const rq = tx.objectStore('videos').get(key); rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null); }
            catch (e) { res(null); }
        });
    },
    async del(key) {
        const db = await this.open(); if (!db) return;
        try { db.transaction('videos', 'readwrite').objectStore('videos').delete(key); } catch (e) {}
    }
};

// Normalize a stored background entry. Legacy string = image data URL.
function bgEntry(id) {
    const v = countryBackgrounds[id];
    if (v) return typeof v === 'string' ? { kind: 'image', src: v } : v;
    if (DEFAULT_BG_VIDEOS[id]) return { kind: 'video', src: DEFAULT_BG_VIDEOS[id] };
    return null;
}
function hasCustomBg(id) { return !!countryBackgrounds[id]; }

// Session-only videos (saved when IndexedDB was unavailable) don't survive a reload — drop them.
Object.keys(countryBackgrounds).forEach(id => {
    const v = countryBackgrounds[id];
    if (v && typeof v === 'object' && v.session) delete countryBackgrounds[id];
});

/* ---------------------------------------------------------------------
 * 5. HELPERS
 * ------------------------------------------------------------------- */
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}
function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
const frac = (id, salt) => (hash32(id + '|' + salt) % 10000) / 10000;
const countryOf = id => COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Every krathong from the cloud or storage is untrusted: whitelist fields and clamp sizes.
function sanitizeKrathong(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const id = String(raw.id || '');
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
    if (!COUNTRY_IDS.has(raw.country)) return null;
    const clean = s => String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
    return {
        id,
        country: raw.country,
        base: BASE_IDS.has(raw.base) ? raw.base : 'banana',
        flower: FLOWER_IDS.has(raw.flower) ? raw.flower : 'marigold',
        topping: TOPPING_IDS.has(raw.topping) ? raw.topping : 'incense',
        topping2: TOPPING_IDS.has(raw.topping2) && raw.topping2 !== raw.topping ? raw.topping2 : '',
        name: clean(raw.name).slice(0, MAX_NAME) || I18N.th.defaultSender,
        wish: clean(raw.wish).slice(0, MAX_WISH) || I18N.th.defaultWish,
        likes: Math.max(0, Math.min(1e6, Math.floor(Number(raw.likes) || 0))),
        createdAt: Math.max(0, Number(raw.createdAt) || 0)
    };
}

let toastTimer = null;
function showToast(msg, tone = 'ok') {
    const el = $('toast');
    $('toast-text').textContent = msg;
    el.classList.remove('hidden', 'bg-emerald-600', 'bg-rose-600', 'bg-slate-700');
    el.classList.add('flex', tone === 'error' ? 'bg-rose-600' : tone === 'info' ? 'bg-slate-700' : 'bg-emerald-600');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.add('hidden'); el.classList.remove('flex'); }, 2800);
}

function openModal(id) { const m = $(id); m.classList.remove('hidden'); m.classList.add('flex'); }
function closeModal(id) { const m = $(id); m.classList.add('hidden'); m.classList.remove('flex'); }

/* ---------------------------------------------------------------------
 * 6. INIT
 * ------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    renderIcons();
    if (!isStudioVisible) applyStudioVisibility();
    // Keep the studio panel just below the header, however many rows the header wraps to
    const header = $('main-header');
    const setHeaderH = () => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    if (window.ResizeObserver) new ResizeObserver(setHeaderH).observe(header);
    setHeaderH();
    initNightAtmosphere();
    resizeCanvases();
    setLanguage(currentLang);
    switchCountryScene('thailand', true);
    switchStudioTab('design');
    // Opening: ① language (first visit only) → ② title → ③ location picker
    openIntro(needsLangPick ? 'lang' : 'title');
    const savedName = lsGet(LS.lastName, '');
    if (savedName) $('user-name-input').value = savedName;

    requestAnimationFrame(animateSkyline);
    requestAnimationFrame(animateWaterReflections);
    requestAnimationFrame(animateFireworks);
    setInterval(updateCountdown, 60 * 1000);

    // Interactions
    $('scene').addEventListener('click', handleSceneClick);
    $('river-krathongs-layer').addEventListener('keydown', e => {
        const item = e.target.closest('.krathong-river-item');
        if (item && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openWishInspector(item.dataset.id); }
    });
    $('user-wish-input').addEventListener('input', e => { $('wish-count').textContent = e.target.value.length; });
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {
        if (e.target === m && typeof window[m.dataset.close] === 'function') window[m.dataset.close]();
    }));
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal.flex').forEach(m => window[m.dataset.close] && window[m.dataset.close]());
    });
    initDragAndDrop();

    // Cloud button is only for admins testing a database; visitors never need it.
    $('btn-cloud').classList.add('hidden');
    if (PUBLIC_RTDB_URL && RTDB_RE.test(PUBLIC_RTDB_URL.replace(/\/+$/, ''))) {
        startFirebaseRtdbSync(PUBLIC_RTDB_URL.replace(/\/+$/, ''));
    }
    const savedUrl = PUBLIC_RTDB_URL ? '' : lsGet(LS.rtdb, '');
    if (savedUrl && RTDB_RE.test(savedUrl)) {
        $('custom-firebase-input').value = savedUrl;
        startFirebaseRtdbSync(savedUrl);
    }

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
    }
});

let resizeRaf = 0;
window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resizeCanvases);
});
function resizeCanvases() {
    resizeSkylineCanvas();
    resizeWaterCanvas();
    resizeFireworksCanvas();
}

/* Countdown to Loykratong night (Bangkok calendar date) */
function updateCountdown() {
    const el = $('countdown-pill');
    const bkkToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date()); // YYYY-MM-DD
    const toUtc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
    const next = FESTIVAL_DATES.find(d => toUtc(d) >= toUtc(bkkToday));
    if (!next) { el.textContent = t('appSubtitle'); return; }
    const days = Math.round((toUtc(next) - toUtc(bkkToday)) / 86400000);
    const date = new Intl.DateTimeFormat(LOCALES[currentLang], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(toUtc(next)));
    el.textContent = days === 0 ? t('countdownToday', { date }) : days === 1 ? t('countdownTomorrow', { date }) : t('countdownDays', { n: days, date });
}

/* ---------------------------------------------------------------------
 * 7. FULLSCREEN / IMMERSIVE
 * ------------------------------------------------------------------- */
function toggleFullScreenMode() {
    const docEl = document.documentElement;
    const nativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!nativeFs && !isImmersiveMode) {
        try {
            if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
            else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        } catch (e) {}
        enterImmersiveMode();
    } else {
        try {
            if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
        } catch (e) {}
        exitImmersiveMode();
    }
}
function enterImmersiveMode() {
    isImmersiveMode = true;
    $('main-header').classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
    $('studio-card').classList.add('studio-hidden');
    $('studio-toggle-wrapper').classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
    $('river-footer-info').classList.add('opacity-0');
    $('exit-immersive-btn').classList.replace('hidden', 'flex');
    playSoftChime(659.25, 0.08);
}
function exitImmersiveMode() {
    isImmersiveMode = false;
    $('main-header').classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
    $('studio-toggle-wrapper').classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    $('river-footer-info').classList.remove('opacity-0');
    applyStudioVisibility();
    $('exit-immersive-btn').classList.replace('flex', 'hidden');
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && isImmersiveMode) exitImmersiveMode(); });
document.addEventListener('webkitfullscreenchange', () => { if (!document.webkitFullscreenElement && isImmersiveMode) exitImmersiveMode(); });

/* ---------------------------------------------------------------------
 * 8. COUNTRY SCENES & STUDIO
 * ------------------------------------------------------------------- */
function countByCountry() {
    const counts = {};
    store.forEach(k => { counts[k.country] = (counts[k.country] || 0) + 1; });
    return counts;
}

function renderCountryTabs() {
    const c = countryOf(currentConfig.country);
    const count = countByCountry()[c.id] || 0;
    $('country-tabs-container').innerHTML = `
        <button onclick="openLocationPicker()" class="w-full lg:w-auto px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-2 border bg-amber-500/20 border-amber-400/70 text-amber-100 hover:bg-amber-500/30 shadow-md shadow-amber-500/10">
            <span aria-hidden="true">📍</span><span>${c.flag} ${c.name[currentLang]}</span>
            <span class="px-1.5 rounded-full text-[10px] bg-gold-400 text-night-950 font-bold">${count}</span>
            <span class="text-amber-300/80 font-medium">• ${t('locChange')} ▾</span>
        </button>`;
}

/* Opening sequence: ① language → ② title + 4-step guide → ③ location picker */
function renderTutorialSteps() {
    $('tutorial-steps').innerHTML = t('tutSteps').map(([emoji, title, desc], i) => `
        <li class="p-3 rounded-2xl bg-night-950/75 border border-gold-500/20 backdrop-blur-sm">
            <span class="flex items-center gap-2 mb-1">
                <span class="w-7 h-7 shrink-0 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-sm">${emoji}</span>
                <span class="text-[11px] font-bold text-gold-400">${i + 1}</span>
            </span>
            <span class="block text-xs sm:text-sm font-bold text-amber-100">${title}</span>
            <span class="block text-[10px] sm:text-[11px] text-slate-400 leading-snug">${desc}</span>
        </li>`).join('');
}

function introStage(name) {
    $('intro-stage-lang').classList.toggle('hidden', name !== 'lang');
    $('intro-stage-title').classList.toggle('hidden', name !== 'title');
}
function openIntro(stage = 'title') {
    const el = $('intro-screen');
    el.classList.remove('hidden', 'leaving'); el.classList.add('flex');
    if (!$('intro-lanterns').childElementCount) {
        let html = '';
        for (let i = 0; i < 14; i++) {
            html += `<div class="lantern" style="left:${(3 + Math.random() * 94).toFixed(1)}%; --scale:${(0.5 + Math.random() * 0.7).toFixed(2)}; --duration:${(14 + Math.random() * 12).toFixed(1)}s; --delay:${(-Math.random() * 24).toFixed(1)}s;"><svg width="34" height="48" viewBox="0 0 34 48" aria-hidden="true"><use href="#khomloy"/></svg></div>`;
        }
        $('intro-lanterns').innerHTML = html;
    }
    $('intro-krathong').innerHTML = buildKrathongSVG({ base: 'banana', flower: 'marigold', topping: 'incense', topping2: 'garland' });
    $('intro-countdown').textContent = $('countdown-pill').textContent;
    renderTutorialSteps();
    introStage(stage);
}
function introPickLang(lang, stay = false) {
    setLanguage(lang);
    playSoftChime(659.25, 0.06);
    if (!stay) introStage('title');
}
// Kept for the header "? วิธีใช้" button
function openTutorial() { openIntro('title'); }
function closeTutorial() {
    const el = $('intro-screen');
    lsSet(LS.tutorial, true);
    el.classList.add('leaving');
    setTimeout(() => { el.classList.add('hidden'); el.classList.remove('flex', 'leaving'); }, 430);
    openLocationPicker();
}

function renderLocationPicker() {
    const counts = countByCountry();
    $('location-zones').innerHTML = ZONES.map(z => `
        <section>
            <h4 class="text-sm font-bold text-gold-300 mb-2 flex items-center gap-2"><span>${z.emoji}</span>${z.name[currentLang]}</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 ${z.id === 'thai' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-2.5">
                ${z.ids.map(id => {
                    const c = countryOf(id);
                    const entry = bgEntry(id);
                    const thumb = (entry && entry.kind !== 'video' && entry.src) || `assets/bg/${c.code}-thumb.jpg`;
                    const active = currentConfig.country === id;
                    return `
                    <button type="button" onclick="chooseLocation('${id}')" class="loc-card text-left rounded-2xl overflow-hidden border ${active ? 'border-gold-400 ring-2 ring-gold-400/40' : 'border-slate-700'} bg-night-950">
                        <span class="block relative h-20 sm:h-24 overflow-hidden">
                            <span class="loc-img absolute inset-0 bg-cover bg-center" style="background-image:url('${thumb}')"></span>
                            <span class="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent to-transparent"></span>
                            <span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-night-950/80 text-amber-200 border border-amber-500/30">🪷 ${t('krathongsHere', { n: counts[id] || 0 })}</span>
                        </span>
                        <span class="block px-2.5 py-2">
                            <span class="block text-xs sm:text-sm font-bold text-amber-100 truncate">${c.flag} ${c.name[currentLang]}</span>
                            <span class="text-[10px] text-slate-400 line-clamp-1">${c.landmark[currentLang]}</span>
                        </span>
                    </button>`;
                }).join('')}
            </div>
        </section>`).join('');
}
function openLocationPicker() { renderLocationPicker(); openModal('location-modal'); }
function closeLocationPicker() { closeModal('location-modal'); }
function chooseLocation(id) {
    closeLocationPicker();
    switchCountryScene(id);
    switchStudioTab('design');
    if (!isStudioVisible) toggleStudioPanel();
}

function updateSceneTitle() {
    const c = countryOf(currentConfig.country);
    $('current-scene-title').textContent = `${c.flag} ${c.name[currentLang]} • ${c.landmark[currentLang]}`;
}

// Image source for a country (default painting, uploaded image, or GIF). null for video backgrounds.
function sceneBackgroundSrc(countryId) {
    const e = bgEntry(countryId);
    if (e && e.kind === 'video') return null;
    if (e) return e.src;
    return `assets/bg/${countryOf(countryId).code}.jpg`;
}

async function videoUrlFor(id, entry) {
    if (entry.src) return entry.src;                 // bundled path
    if (videoUrlCache[id]) return videoUrlCache[id]; // already made
    if (entry.key) {
        const blob = await IDB.get(entry.key);
        if (blob) return (videoUrlCache[id] = URL.createObjectURL(blob));
    }
    return null;
}

let bgToken = 0;
function stopBgVideo() {
    const vid = $('country-bg-video');
    vid.style.opacity = '0';
    try { vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) {}
}

async function applySceneBackground(countryId) {
    const token = ++bgToken;
    const layer = $('country-bg-layer');
    const vid = $('country-bg-video');
    const entry = bgEntry(countryId);
    paintingShown = false;
    videoShown = false;

    if (entry && entry.kind === 'video') {
        const url = await videoUrlFor(countryId, entry);
        if (token !== bgToken) return;
        if (url) {
            layer.style.opacity = '0';
            document.body.classList.add('no-painting');
            vid.src = url;
            vid.load();
            const onReady = () => { if (token === bgToken) { vid.style.opacity = '1'; videoShown = true; document.body.classList.remove('no-painting'); } };
            vid.oncanplay = onReady;
            vid.play().then(onReady).catch(() => { onReady(); });
            return;
        }
        // video blob missing (e.g. after reload with no IDB) -> fall through to painting
    }

    stopBgVideo();
    const src = sceneBackgroundSrc(countryId);
    layer.style.opacity = '0';
    document.body.classList.add('no-painting');
    const img = new Image();
    img.onload = () => {
        if (token !== bgToken) return;
        layer.style.backgroundImage = `url("${src}")`;
        layer.style.opacity = '1';
        paintingShown = true;
        document.body.classList.remove('no-painting');
    };
    img.onerror = () => {}; // keep the procedural 2.5D skyline
    img.src = src;
}

function switchCountryScene(countryId, initial = false) {
    if (!COUNTRY_IDS.has(countryId)) return;
    const changed = currentConfig.country !== countryId || initial;
    currentConfig.country = countryId;
    renderCountryTabs();
    updateSceneTitle();
    if (changed) {
        applySceneBackground(countryId);
        $('river-krathongs-layer').innerHTML = '';
        renderRiverKrathongs();
    }
    if (!initial) {
        playSoftChime(523.25, 0.08);
        triggerFireworksBurst(1);
    }
}

function optionBtnClass(active) {
    return `p-2 rounded-xl border text-left transition flex flex-col justify-between ${active ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md' : 'bg-night-950/70 border-slate-800 text-slate-300 hover:border-slate-600'}`;
}
function renderStudioOptions() {
    $('bases-grid').innerHTML = BASES.map(b => `
        <button type="button" onclick="selectStudioOption('base','${b.id}')" aria-pressed="${currentConfig.base === b.id}" class="${optionBtnClass(currentConfig.base === b.id)}">
            <span class="block w-full h-7 mb-1">${ktBaseSwatch(b.id)}</span>
            <span class="text-xs font-bold truncate">${b.name[currentLang]}</span>
            <span class="text-[10px] text-slate-400 line-clamp-1">${b.desc[currentLang]}</span>
        </button>`).join('');
    $('flowers-grid').innerHTML = FLOWERS.map(f => `
        <button type="button" onclick="selectStudioOption('flower','${f.id}')" aria-pressed="${currentConfig.flower === f.id}" class="${optionBtnClass(currentConfig.flower === f.id)}">
            <span class="text-xs font-bold flex items-center gap-1.5"><span class="w-7 h-7 shrink-0">${ktFlowerSwatch(f.id)}</span><span class="truncate">${f.name[currentLang]}</span></span>
            <span class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${f.meaning[currentLang]}</span>
        </button>`).join('');
    const chosen = selectedToppings();
    $('toppings-grid').innerHTML = TOPPINGS.map(tp => {
        const order = chosen.indexOf(tp.id);
        return `
        <button type="button" onclick="toggleTopping('${tp.id}')" aria-pressed="${order >= 0}" class="${optionBtnClass(order >= 0)} relative !items-center !justify-center gap-1 text-center">
            ${order >= 0 ? `<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-400 text-night-950 text-[9px] font-bold flex items-center justify-center">${order + 1}</span>` : ''}
            <span class="block w-9 h-9">${ktToppingSwatch(tp.id)}</span>
            <span class="text-[10px] font-semibold line-clamp-1">${tp.name[currentLang]}</span>
        </button>`;
    }).join('');
    $('topping-count').textContent = t('toppingCount', { n: chosen.length });
    $('topping-meaning').innerHTML = chosen.map(id => {
        const tp = TOPPINGS.find(x => x.id === id);
        return `<span class="block">✨ <b>${tp.name[currentLang]}</b> — ${tp.desc[currentLang]}</span>`;
    }).join('');
}

function selectedToppings(cfg = currentConfig) {
    return [cfg.topping, cfg.topping2].filter((x, i, a) => x && TOPPING_IDS.has(x) && a.indexOf(x) === i);
}
// Up to 2 offerings: tap to add/remove; a 3rd tap replaces the oldest pick. At least one stays selected.
function toggleTopping(id) {
    let list = selectedToppings();
    if (list.includes(id)) { if (list.length > 1) list = list.filter(x => x !== id); }
    else { list.push(id); if (list.length > 2) list.shift(); }
    currentConfig.topping = list[0];
    currentConfig.topping2 = list[1] || '';
    renderStudioOptions();
    updateKrathongPreview();
    playSoftChime(659.25, 0.06);
}

function selectStudioOption(category, id) {
    currentConfig[category] = id;
    renderStudioOptions();
    updateKrathongPreview();
    playSoftChime(659.25, 0.06);
}

function randomizeKrathong() {
    currentConfig.base = pick(BASES).id;
    currentConfig.flower = pick(FLOWERS).id;
    const shuffled = [...TOPPINGS].sort(() => Math.random() - 0.5);
    currentConfig.topping = shuffled[0].id;
    currentConfig.topping2 = Math.random() < 0.75 ? shuffled[1].id : '';
    renderStudioOptions();
    updateKrathongPreview();
    playSoftChime(783.99, 0.08);
}

function switchStudioTab(tab) {
    const isDesign = tab === 'design';
    $('studio-tab-design').classList.toggle('hidden', !isDesign);
    $('studio-tab-wish').classList.toggle('hidden', isDesign);
    const on = 'flex-1 py-2.5 text-center text-gold-400 border-b-2 border-gold-400 transition';
    const off = 'flex-1 py-2.5 text-center text-slate-400 border-b-2 border-transparent transition';
    $('tab-btn-design').className = isDesign ? on : off;
    $('tab-btn-wish').className = isDesign ? off : on;
}

function applyStudioVisibility() {
    const card = $('studio-card');
    card.classList.toggle('studio-hidden', !isStudioVisible || isImmersiveMode);
    setIcon($('toggle-studio-icon'), isStudioVisible ? 'eye' : 'lotus');
    $('toggle-studio-text').textContent = isStudioVisible ? t('toggleHideStudio') : t('toggleShowStudio');
}
function toggleStudioPanel() {
    isStudioVisible = !isStudioVisible;
    applyStudioVisibility();
}

/* ---------------------------------------------------------------------
 * 9. SVG KRATHONG RENDERER — drawing lives in krathong-art.js
 * ------------------------------------------------------------------- */
function buildKrathongSVG(config, opts = {}) {
    return ktKrathongSVG({
        base: BASE_IDS.has(config.base) ? config.base : 'banana',
        flower: FLOWER_IDS.has(config.flower) ? config.flower : 'marigold',
        topping: TOPPING_IDS.has(config.topping) ? config.topping : 'incense',
        topping2: TOPPING_IDS.has(config.topping2) && config.topping2 !== config.topping ? config.topping2 : ''
    }, opts);
}

function updateKrathongPreview() {
    $('studio-krathong-preview').innerHTML = buildKrathongSVG(currentConfig);
    const baseObj = BASES.find(b => b.id === currentConfig.base);
    const flowerObj = FLOWERS.find(f => f.id === currentConfig.flower);
    $('preview-summary-pill').textContent = `${baseObj.name[currentLang]} • ${flowerObj.name[currentLang]}`;
}

/* ---------------------------------------------------------------------
 * 10. RIVER — keyed rendering so cloud sync never restarts animations
 * ------------------------------------------------------------------- */
function riverListFor(countryId) {
    return [...store.values()]
        .filter(k => k.country === countryId)
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-MAX_ON_RIVER);
}

function riverVisuals(k, fresh) {
    const lane = 3 + frac(k.id, 'lane') * 56;              // % from top of river
    const speed = 46 + frac(k.id, 'speed') * 30;           // seconds to cross
    const s = 0.62 + (lane / 59) * 0.48;                   // nearer = bigger
    const rtl = frac(k.id, 'dir') < 0.3;
    const delay = fresh ? -speed * 0.03 : -frac(k.id, 'phase') * speed;
    const bob = 3 + frac(k.id, 'bob') * 1.6;
    return { lane, speed, s, rtl, delay, bob };
}

function riverItemHtml(k, fresh) {
    const v = riverVisuals(k, fresh);
    const c = countryOf(k.country);
    const mine = myIds.has(k.id);
    return `<div data-id="${escapeHtml(k.id)}" role="button" tabindex="0" aria-label="${escapeHtml(k.name)}"
        class="krathong-river-item${v.rtl ? ' rtl' : ''}${mine ? ' mine' : ''}"
        style="top:${v.lane.toFixed(1)}%; --s:${v.s.toFixed(2)}; --speed:${v.speed.toFixed(1)}s; --delay:${v.delay.toFixed(1)}s; --bob:${v.bob.toFixed(2)}s; z-index:${Math.round(v.lane) + 1};">
        <div class="hov flex flex-col items-center">
            <div class="label mb-0.5 px-2.5 py-0.5 rounded-full bg-night-950/85 border border-gold-400/45 text-[11px] text-amber-200 whitespace-nowrap shadow-md flex items-center gap-1 max-w-[180px]">
                <span>${c.flag}</span><span class="truncate">${escapeHtml(k.name)}</span>
                <span class="likes text-rose-300/90 text-[10px]">♥ ${k.likes}</span>
            </div>
            <div class="bob" style="width:124px;height:124px;margin-top:-10px">${buildKrathongSVG(k)}</div>
        </div>
    </div>`;
}

function renderRiverKrathongs(freshId) {
    const container = $('river-krathongs-layer');
    const list = riverListFor(currentConfig.country);
    const wanted = new Set(list.map(k => k.id));
    container.querySelectorAll('.krathong-river-item').forEach(el => { if (!wanted.has(el.dataset.id)) el.remove(); });
    const present = new Set([...container.children].map(el => el.dataset.id));
    let html = '';
    list.forEach(k => { if (!present.has(k.id)) html += riverItemHtml(k, k.id === freshId); });
    if (html) container.insertAdjacentHTML('beforeend', html);
    refreshRiverLabels();
}

function refreshRiverLabels() {
    document.querySelectorAll('#river-krathongs-layer .krathong-river-item').forEach(el => {
        const k = store.get(el.dataset.id);
        if (k) el.querySelector('.likes').textContent = `♥ ${k.likes}`;
    });
}

function handleSceneClick(event) {
    const item = event.target.closest('.krathong-river-item');
    if (item) { openWishInspector(item.dataset.id); return; }
    const rect = fwCanvas.getBoundingClientRect();
    spawnFireworkAt(event.clientX - rect.left, event.clientY - rect.top, null, 60);
    playSoftChime(784, 0.06);
}

/* ---------------------------------------------------------------------
 * 11. LAUNCH, WISHES, MODALS
 * ------------------------------------------------------------------- */
function generateRandomWish() { setWishByCategory(pick(Object.keys(WISH_PRESETS[currentLang]))); }

function setWishByCategory(category) {
    const presets = WISH_PRESETS[currentLang] || WISH_PRESETS.th;
    const input = $('user-wish-input');
    input.value = pick(presets[category] || presets.wealth);
    $('wish-count').textContent = input.value.length;
    playSoftChime(587, 0.08);
}

let launching = false;
function launchUserKrathong() {
    if (launching) return;
    launching = true;
    $('launch-btn').disabled = true;

    const name = $('user-name-input').value.trim().slice(0, MAX_NAME) || t('defaultSender');
    const wish = $('user-wish-input').value.trim().slice(0, MAX_WISH) || t('defaultWish');
    if ($('user-name-input').value.trim()) lsSet(LS.lastName, name);

    const k = sanitizeKrathong({
        id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name, wish,
        country: currentConfig.country, base: currentConfig.base, flower: currentConfig.flower, topping: currentConfig.topping, topping2: currentConfig.topping2,
        likes: 0, createdAt: Date.now()
    });

    const stage = $('live-preview-stage');
    stage.classList.add('launching-krathong');
    playCelebrationChord();
    triggerFireworksBurst(4);

    store.set(k.id, k);
    myIds.add(k.id);
    lsSet(LS.mine, [...myIds].map(id => store.get(id)).filter(Boolean).slice(-50));
    lastLaunched = k;
    pushKrathongToCloud(k);

    setTimeout(() => {
        stage.classList.remove('launching-krathong');
        renderCountryTabs();
        renderRiverKrathongs(k.id);
        showCommemorativeModal(k);
        launching = false;
        $('launch-btn').disabled = false;
    }, 1150);
}

function openWishInspector(id, silent = false) {
    const item = store.get(id);
    if (!item) return;
    activeInspectedId = id;
    if (!silent) playSoftChime(659, 0.1);
    const c = countryOf(item.country);
    const baseObj = BASES.find(b => b.id === item.base) || BASES[0];
    const flowerObj = FLOWERS.find(f => f.id === item.flower) || FLOWERS[0];
    $('inspector-krathong-svg').innerHTML = buildKrathongSVG(item);
    $('inspector-country-pill').textContent = `${c.flag} ${t('floatedAt')} ${c.name[currentLang]}`;
    $('inspector-name').textContent = item.name;
    const offerings = selectedToppings(item).map(id => TOPPINGS.find(x => x.id === id).name[currentLang]).join(' + ');
    $('inspector-details').textContent = `${baseObj.name[currentLang]} • ${flowerObj.name[currentLang]} • ${offerings}`;
    $('inspector-wish').textContent = item.wish;
    updateBlessButton(item);
    openModal('wish-inspector-modal');
}
function updateBlessButton(item) {
    $('inspector-likes').textContent = item.likes;
    const done = blessedIds.has(item.id);
    $('ui-btn-bless').textContent = done ? t('blessed') : t('btnBless');
    $('bless-btn').classList.toggle('opacity-70', done);
}
function closeWishInspector() { closeModal('wish-inspector-modal'); activeInspectedId = null; }

function sendBlessingHeart() {
    const item = store.get(activeInspectedId);
    if (!item) return;
    if (blessedIds.has(item.id)) { showToast(t('toastAlreadyBlessed'), 'info'); return; }
    item.likes += 1;
    blessedIds.add(item.id);
    lsSet(LS.blessed, [...blessedIds].slice(-500));
    if (myIds.has(item.id)) lsSet(LS.mine, [...myIds].map(i => store.get(i)).filter(Boolean).slice(-50));
    updateBlessButton(item);
    refreshRiverLabels();
    spawnHeartBurst();
    playSoftChime(784, 0.12);
    if (!item.demo) incrementKrathongLikeOnCloud(item.id);
}

function spawnHeartBurst() {
    const rect = $('bless-btn').getBoundingClientRect();
    const fwRect = fwCanvas.getBoundingClientRect();
    spawnFireworkAt(rect.left + rect.width / 2 - fwRect.left, rect.top - fwRect.top, '#fb7185', 28, 'ring');
}

function showCommemorativeModal(k) {
    const c = countryOf(k.country);
    $('card-country-badge').textContent = `${c.flag} ${c.name[currentLang]} • ${c.landmark[currentLang]}`;
    $('card-krathong-svg').innerHTML = buildKrathongSVG(k);
    $('card-user-name').textContent = k.name;
    $('card-user-wish').textContent = `"${k.wish}"`;
    $('card-preview-box').classList.remove('hidden');
    $('card-image-output').classList.add('hidden');
    $('ui-card-save-hint').classList.add('hidden');
    openModal('commemorative-modal');
}
function closeCommemorativeModal() { closeModal('commemorative-modal'); }

function viewRiverAfterFloat() {
    closeCommemorativeModal();
    if (isStudioVisible) toggleStudioPanel();
    triggerFireworksBurst(3);
}
function createNewKrathong() {
    closeCommemorativeModal();
    $('user-wish-input').value = '';
    $('wish-count').textContent = '0';
    switchStudioTab('design');
    if (!isStudioVisible) toggleStudioPanel();
}

function shareText(k) {
    const c = countryOf(k.country);
    let text = `🌕 ${t('appTitle')} • ${c.flag} ${c.name[currentLang]} (${c.landmark[currentLang]})\n${k.name}\n🙏 "${k.wish}"`;
    if (location.protocol === 'https:' && !/claude/i.test(location.hostname)) text += `\n${location.origin}${location.pathname}`;
    return text;
}

function copyText(text, toastMsg) {
    const fallback = () => {
        const temp = document.createElement('textarea');
        temp.value = text; temp.setAttribute('readonly', '');
        temp.style.position = 'fixed'; temp.style.opacity = '0';
        document.body.appendChild(temp); temp.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(temp);
    };
    const done = () => { showToast(toastMsg); playSoftChime(880, 0.1); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => { fallback(); done(); });
    else { fallback(); done(); }
}

function copyWishText() {
    if (!lastLaunched) return;
    copyText(shareText(lastLaunched), t('toastCopied'));
}

/* Souvenir card image (1080×1350) drawn on canvas */
function loadImage(src) {
    return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
}
function drawCover(ctx, img, x, y, w, h) {
    const r = Math.max(w / img.width, h / img.height);
    const sw = w / r, sh = h / r;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
function wrapLines(ctx, text, maxWidth, maxLines) {
    let tokens;
    if (window.Intl && Intl.Segmenter) tokens = [...new Intl.Segmenter(LOCALES[currentLang], { granularity: 'word' }).segment(text)].map(s => s.segment);
    else tokens = text.split(/(\s+)/);
    const lines = []; let line = '';
    for (const tok of tokens) {
        const test = line + tok;
        if (ctx.measureText(test).width > maxWidth && line) { lines.push(line.trim()); line = tok.trimStart(); }
        else line = test;
        if (lines.length === maxLines) break;
    }
    if (lines.length < maxLines && line.trim()) lines.push(line.trim());
    if (lines.length === maxLines && tokens.join('').length > lines.join('').length + 2) lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…');
    return lines;
}
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); }
}

/* Save a picture of the krathong while designing (before floating).
 * Reuses the souvenir renderer with the current design; the draft is never stored or uploaded. */
function saveDraftKrathong() {
    const name = $('user-name-input').value.trim().slice(0, MAX_NAME) || t('defaultSender');
    const wish = $('user-wish-input').value.trim().slice(0, MAX_WISH) || t('defaultWish');
    const draft = sanitizeKrathong({
        id: 'draft', name, wish,
        country: currentConfig.country, base: currentConfig.base, flower: currentConfig.flower,
        topping: currentConfig.topping, topping2: currentConfig.topping2,
        likes: 0, createdAt: Date.now()
    });
    if (draft) makeSouvenirImage(draft);
}

async function makeSouvenirImage(draft) {
    const k = (draft && draft.id) ? draft : lastLaunched;
    if (!k) return;
    const btn = $('card-image-btn');
    btn.disabled = true;
    try {
        try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
        const W = 1080, H = 1350;
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d');
        const c = countryOf(k.country);
        const font = `'Prompt', 'Noto Sans SC', sans-serif`;

        ctx.fillStyle = '#030712'; ctx.fillRect(0, 0, W, H);
        try {
            const vid = $('country-bg-video');
            if (videoShown && k.country === currentConfig.country && vid.readyState >= 2) drawCover(ctx, vid, 0, 0, W, H);
            else { const bgSrc = sceneBackgroundSrc(k.country); if (bgSrc) drawCover(ctx, await loadImage(bgSrc), 0, 0, W, H); }
        } catch (e) {}
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, 'rgba(3,7,18,0.55)'); g.addColorStop(0.35, 'rgba(3,7,18,0.15)'); g.addColorStop(0.6, 'rgba(3,7,18,0.55)'); g.addColorStop(1, 'rgba(3,7,18,0.95)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde68a';
        ctx.font = `700 54px ${font}`;
        ctx.fillText(`🌕 ${t('cardHeading')}`, W / 2, 110);
        ctx.fillStyle = '#facc15';
        ctx.font = `500 32px ${font}`;
        ctx.fillText(`${c.name[currentLang]} • ${c.landmark[currentLang]}`, W / 2, 165);

        // glow + krathong
        const glow = ctx.createRadialGradient(W / 2, 640, 20, W / 2, 640, 340);
        glow.addColorStop(0, 'rgba(250,204,21,0.32)'); glow.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 300, W, 700);
        const svg = buildKrathongSVG(k, { standalone: true, size: 560 });
        const kImg = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
        ctx.drawImage(kImg, (W - 560) / 2, 380, 560, 560);

        // text panel — height fits the wish, anchored above the footer
        const fortune = (lastFortune && lastFortune.krathongId === k.id) ? lastFortune : null;
        ctx.font = `italic 400 36px ${font}`;
        const wishLines = wrapLines(ctx, `“${k.wish}”`, W - 260, fortune ? 3 : 4);
        const panelH = 150 + wishLines.length * 52 + (fortune ? 140 : 0);
        const panelY = 1240 - panelH;
        ctx.fillStyle = 'rgba(11,15,25,0.82)';
        roundRect(ctx, 80, panelY, W - 160, panelH, 40); ctx.fill();
        ctx.strokeStyle = 'rgba(234,179,8,0.55)'; ctx.lineWidth = 3; ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `700 46px ${font}`;
        ctx.fillText(wrapLines(ctx, k.name, W - 260, 1)[0] || '', W / 2, panelY + 80);
        ctx.fillStyle = '#fde68a';
        ctx.font = `italic 400 36px ${font}`;
        wishLines.forEach((line, i) => ctx.fillText(line, W / 2, panelY + 145 + i * 52));
        if (fortune) {
            const ft = fortuneText(fortune);
            const fy = panelY + 145 + wishLines.length * 52 + 12;
            ctx.strokeStyle = 'rgba(232,121,249,0.5)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(240, fy - 22); ctx.lineTo(W - 240, fy - 22); ctx.stroke();
            ctx.fillStyle = '#f5d0fe'; ctx.font = `600 26px ${font}`;
            ctx.fillText(`🎋 ${t('cardFortune', { n: fortune.stick })}`, W / 2, fy + 14);
            ctx.fillStyle = '#fde68a'; ctx.font = `700 38px ${font}`;
            ctx.fillText(wrapLines(ctx, ft.t, W - 260, 1)[0] || '', W / 2, fy + 62);
            ctx.fillStyle = 'rgba(226,232,240,0.92)'; ctx.font = `400 27px ${font}`;
            ctx.fillText(wrapLines(ctx, ft.d, W - 260, 1)[0] || '', W / 2, fy + 102);
        }

        const dateStr = new Intl.DateTimeFormat(LOCALES[currentLang], { dateStyle: 'long' }).format(new Date(k.createdAt || Date.now()));
        ctx.fillStyle = 'rgba(226,232,240,0.85)';
        ctx.font = `400 28px ${font}`;
        ctx.fillText(`${dateStr} • World Loykratong Online`, W / 2, 1300);

        const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
        const url = URL.createObjectURL(blob);
        const out = $('card-image-output');
        out.src = url;
        out.alt = `${k.name} — ${k.wish}`;
        out.classList.remove('hidden');
        $('ui-card-save-hint').classList.remove('hidden');
        $('card-preview-box').classList.add('hidden');
        playCelebrationChord();

        // Mobile: native share sheet. Desktop: download. Both may be blocked in sandboxed previews — the image stays visible to save manually.
        const file = new File([blob], `loy-krathong-${c.code}.png`, { type: 'image/png' });
        try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: shareText(k) });
            } else {
                const a = document.createElement('a');
                a.href = url; a.download = file.name;
                document.body.appendChild(a); a.click(); a.remove();
            }
        } catch (e) {}
    } catch (e) {
        showToast('⚠️ ' + (e && e.message ? e.message : 'error'), 'error');
    } finally {
        btn.disabled = false;
    }
}

/* ---------------------------------------------------------------------
 * 11b. SIAM SI (เซียมซีมงคล) — draw a lucky stick after floating
 * ------------------------------------------------------------------- */
let lastFortune = null;
let siamsiTimer = null;

function renderSiamsiTopics() {
    const el = $('siamsi-topics');
    if (!el || typeof SIAMSI_TOPICS === 'undefined') return;
    el.innerHTML = SIAMSI_TOPICS.map((tp, i) => `
        <button type="button" onclick="drawSiamsi('${tp.id}')" class="siamsi-topic ${i === 0 ? 'col-span-2' : ''} py-3 px-3 rounded-2xl bg-night-950/80 border border-fuchsia-400/30 hover:bg-fuchsia-500/15 hover:border-fuchsia-300/60 text-sm font-bold text-amber-100 flex items-center justify-center gap-2">
            <span class="text-lg leading-none">${tp.emoji}</span><span>${tp.name[currentLang]}</span>
        </button>`).join('');
}

function siamsiStage(name) {
    ['pick', 'shake', 'result'].forEach(n => $(`siamsi-stage-${n}`).classList.toggle('hidden', n !== name));
}

function openSiamsi() {
    closeCommemorativeModal();
    renderSiamsiTopics();
    siamsiStage('pick');
    openModal('siamsi-modal');
    playSoftChime(659.25, 0.08);
}

function closeSiamsi() {
    clearTimeout(siamsiTimer);
    $('siamsi-cup-anim').classList.remove('shaking');
    $('siamsi-stick').classList.remove('out');
    closeModal('siamsi-modal');
}

function siamsiPickAgain() { siamsiStage('pick'); }

function drawSiamsi(topicId) {
    const list = SIAMSI_FORTUNES[topicId] || SIAMSI_FORTUNES.overall;
    let idx;
    do { idx = Math.floor(Math.random() * list.length); }
    while (list.length > 1 && lastFortune && lastFortune.topic === topicId && lastFortune.idx === idx);
    const fortune = {
        topic: SIAMSI_FORTUNES[topicId] ? topicId : 'overall', idx,
        stick: 1 + Math.floor(Math.random() * SIAMSI_STICKS),
        color: Math.floor(Math.random() * SIAMSI_COLORS.length),
        number: 1 + Math.floor(Math.random() * 99),
        krathongId: lastLaunched ? lastLaunched.id : null
    };

    siamsiStage('shake');
    const cup = $('siamsi-cup-anim'), stick = $('siamsi-stick');
    stick.classList.remove('out'); void stick.getBoundingClientRect();
    cup.classList.add('shaking');
    for (let i = 0; i < 8; i++) setTimeout(() => playSoftChime(200 + Math.random() * 110, 0.05, 0.16), i * 170); // wooden clacks

    clearTimeout(siamsiTimer);
    siamsiTimer = setTimeout(() => {
        cup.classList.remove('shaking');
        stick.classList.add('out');
        playSoftChime(880, 0.1);
        siamsiTimer = setTimeout(() => {
            lastFortune = fortune;
            renderFortune(fortune);
            siamsiStage('result');
            playCelebrationChord();
            triggerFireworksBurst(2);
        }, 950);
    }, 1500);
}

function fortuneText(f) {
    const item = (SIAMSI_FORTUNES[f.topic] || SIAMSI_FORTUNES.overall)[f.idx];
    return item[currentLang] || item.th;
}

function renderFortune(f) {
    const tp = SIAMSI_TOPICS.find(x => x.id === f.topic) || SIAMSI_TOPICS[0];
    const ft = fortuneText(f);
    const col = SIAMSI_COLORS[f.color] || SIAMSI_COLORS[0];
    $('siamsi-topic-pill').textContent = `${tp.emoji} ${tp.name[currentLang]}`;
    $('siamsi-stick-no').textContent = t('siamsiStick', { n: f.stick });
    $('siamsi-headline').textContent = ft.t;
    $('siamsi-line').textContent = ft.d;
    $('siamsi-color-dot').style.background = col.hex;
    $('siamsi-color').textContent = `${t('luckyColor')}: ${col.name[currentLang]}`;
    $('siamsi-number').textContent = t('luckyNumber', { n: f.number });
    const card = document.querySelector('.siamsi-card');
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
}

function copyFortune() {
    if (!lastFortune) return;
    const f = lastFortune, ft = fortuneText(f);
    const tp = SIAMSI_TOPICS.find(x => x.id === f.topic) || SIAMSI_TOPICS[0];
    const col = SIAMSI_COLORS[f.color] || SIAMSI_COLORS[0];
    let text = `${t('siamsiTitle')} • ${t('siamsiStick', { n: f.stick })} (${tp.emoji} ${tp.name[currentLang]})\n${ft.t}\n${ft.d}\n${t('luckyColor')}: ${col.name[currentLang]} • ${t('luckyNumber', { n: f.number })}`;
    if (location.protocol === 'https:' && !/claude/i.test(location.hostname)) text += `\n${location.origin}${location.pathname}`;
    copyText(text, t('toastFortuneCopied'));
}

function fortuneToCard() {
    closeSiamsi();
    if (!lastLaunched) return;
    showCommemorativeModal(lastLaunched);
    makeSouvenirImage();
}

/* ---------------------------------------------------------------------
 * 12. BACKGROUND MANAGER + DRAG & DROP
 * ------------------------------------------------------------------- */
function initDragAndDrop() {
    let depth = 0;
    const overlay = $('drag-drop-overlay');
    const show = on => { overlay.classList.toggle('hidden', !on); overlay.classList.toggle('flex', on); };
    const hasFiles = e => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
    document.addEventListener('dragenter', e => { if (!hasFiles(e)) return; e.preventDefault(); depth++; show(true); });
    document.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
    document.addEventListener('dragleave', e => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) show(false); });
    document.addEventListener('drop', e => {
        if (!hasFiles(e)) return;
        e.preventDefault(); depth = 0; show(false);
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleBgFile(f, currentConfig.country);
    });
}

// Route an uploaded/dropped file to the right saver. GIF is kept animated (no canvas re-encode); video goes to IndexedDB.
function handleBgFile(file, countryId) {
    if (!file) return;
    if (file.type.startsWith('video/')) return saveVideoBg(file, countryId);
    if (file.type === 'image/gif') return saveGifBg(file, countryId);
    if (file.type.startsWith('image/')) return processAndSaveImage(file, countryId);
    showToast(t('toastBgUnsupported'), 'error');
}

function afterBgSaved(countryId) {
    if (currentConfig.country !== countryId) switchCountryScene(countryId);
    else applySceneBackground(countryId);
    playCelebrationChord();
    if ($('bg-manager-modal').classList.contains('flex')) openBgManagerModal();
}

function saveGifBg(file, countryId) {
    const reader = new FileReader();
    reader.onload = e => {
        countryBackgrounds[countryId] = { kind: 'gif', src: e.target.result };
        const saved = lsSet(LS.bgs, countryBackgrounds);
        if (!saved) { delete countryBackgrounds[countryId]; showToast(t('toastGifTooBig'), 'error'); return; }
        showToast(t('toastBgSaved'));
        afterBgSaved(countryId);
    };
    reader.readAsDataURL(file);
}

async function saveVideoBg(file, countryId) {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) { showToast(t('toastVideoTooBig', { n: MAX_VIDEO_MB }), 'error'); return; }
    showToast(t('toastVideoSaving'), 'info');
    if (videoUrlCache[countryId]) { URL.revokeObjectURL(videoUrlCache[countryId]); delete videoUrlCache[countryId]; }
    videoUrlCache[countryId] = URL.createObjectURL(file);   // instant preview + playback
    const key = 'vid_' + countryId;
    const stored = await IDB.put(key, file);                // persistence across reloads
    countryBackgrounds[countryId] = stored ? { kind: 'video', key } : { kind: 'video', key, session: true };
    lsSet(LS.bgs, countryBackgrounds);
    showToast(stored ? t('toastVideoSaved') : t('toastVideoSession'), stored ? 'ok' : 'info');
    afterBgSaved(countryId);
}

function openBgManagerModal() {
    $('bg-manager-grid').innerHTML = COUNTRIES.map(c => {
        const entry = bgEntry(c.id);
        const custom = hasCustomBg(c.id);
        const isVideo = entry && entry.kind === 'video';
        const isGif = entry && entry.kind === 'gif';
        const typeLabel = !custom ? t('bgDefault') : isVideo ? t('bgVideo') : isGif ? t('bgGif') : t('bgCustom');
        const pillClass = !custom ? 'bg-amber-500/15 text-amber-300' : isVideo ? 'bg-fuchsia-500/20 text-fuchsia-300' : isGif ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300';

        let preview;
        if (isVideo) {
            const url = videoUrlCache[c.id] || entry.src || '';
            preview = url
                ? `<video class="h-28 w-full rounded-xl object-cover border border-slate-600" src="${url}" muted loop autoplay playsinline></video>`
                : `<div class="h-28 w-full rounded-xl border border-slate-600 bg-night-900 flex items-center justify-center text-2xl">🎬</div>`;
            preview = `<button type="button" onclick="closeBgManagerModal(); switchCountryScene('${c.id}')" class="block w-full" aria-label="${c.name[currentLang]}">${preview}</button>`;
        } else {
            const src = (entry && entry.src) || `assets/bg/${c.code}-thumb.jpg`;
            preview = `<button type="button" onclick="closeBgManagerModal(); switchCountryScene('${c.id}')" class="h-28 w-full rounded-xl bg-cover bg-center border border-slate-600" style="background-image:url('${src}')" aria-label="${c.name[currentLang]}"></button>`;
        }

        return `
            <div class="bg-night-950/90 border ${currentConfig.country === c.id ? 'border-gold-500/70' : 'border-slate-700'} rounded-2xl p-3 flex flex-col gap-2">
                <div class="flex justify-between items-center text-xs font-bold text-gold-300 gap-2">
                    <span class="whitespace-nowrap">${c.flag} ${c.name[currentLang]}</span>
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${pillClass}">${typeLabel}</span>
                </div>
                ${preview}
                <div class="flex gap-2">
                    <label class="flex-1 cursor-pointer bg-gold-500 hover:bg-gold-600 text-night-950 font-bold px-3 py-1.5 rounded-lg text-xs text-center flex items-center justify-center gap-1.5">
                        <i data-icon="upload" class="w-3.5 h-3.5"></i> ${t('btnChangeImg')}
                        <input type="file" accept="image/*,video/mp4,video/webm,video/ogg" class="hidden" onchange="uploadCountryBg(event,'${c.id}')">
                    </label>
                    ${custom ? `<button type="button" onclick="resetCountryBg('${c.id}')" class="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300">${t('btnUseDefault')}</button>` : ''}
                </div>
            </div>`;
    }).join('');
    renderIcons($('bg-manager-grid'));
    openModal('bg-manager-modal');
}
function closeBgManagerModal() { closeModal('bg-manager-modal'); }

function uploadCountryBg(event, countryId) {
    const file = event.target.files[0];
    if (file) handleBgFile(file, countryId);
    event.target.value = '';
}

function processAndSaveImage(file, countryId) {
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            const maxDim = 1600;
            let { width, height } = img;
            const r = Math.min(1, maxDim / Math.max(width, height));
            width = Math.round(width * r); height = Math.round(height * r);
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            countryBackgrounds[countryId] = { kind: 'image', src: dataUrl };
            const saved = lsSet(LS.bgs, countryBackgrounds);
            showToast(saved ? t('toastBgSaved') : t('toastBgMemory'), saved ? 'ok' : 'info');
            afterBgSaved(countryId);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function clearVideoFor(countryId) {
    if (videoUrlCache[countryId]) { URL.revokeObjectURL(videoUrlCache[countryId]); delete videoUrlCache[countryId]; }
    IDB.del('vid_' + countryId);
}
function resetCountryBg(countryId) {
    clearVideoFor(countryId);
    delete countryBackgrounds[countryId];
    lsSet(LS.bgs, countryBackgrounds);
    if (currentConfig.country === countryId) applySceneBackground(countryId);
    openBgManagerModal();
}
function resetAllCustomBackgrounds() {
    COUNTRIES.forEach(c => clearVideoFor(c.id));
    countryBackgrounds = {};
    lsDel(LS.bgs);
    applySceneBackground(currentConfig.country);
    openBgManagerModal();
}

/* ---------------------------------------------------------------------
 * 13. CANVASES: SKYLINE (fallback), WATER, FIREWORKS, LANTERNS
 * ------------------------------------------------------------------- */
const skylineCanvas = $('skyline-canvas');
const skyCtx = skylineCanvas.getContext('2d');
let skyStars = [];
let skyTime = 0;
let skyW = 0, skyH = 0;

function resizeSkylineCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    skyW = skylineCanvas.offsetWidth; skyH = skylineCanvas.offsetHeight;
    skylineCanvas.width = skyW * dpr; skylineCanvas.height = skyH * dpr;
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    skyStars = Array.from({ length: 70 }, () => ({ x: Math.random() * skyW, y: Math.random() * skyH * 0.52, r: 0.7 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2 }));
}

function animateSkyline() {
    requestAnimationFrame(animateSkyline);
    if (paintingShown || videoShown) return;   // the painting/video covers the canvas; skip drawing
    skyTime += 0.02;
    const w = skyW, h = skyH, horizonY = h * 0.54;
    const c = countryOf(currentConfig.country);
    const grad = skyCtx.createLinearGradient(0, 0, 0, horizonY);
    grad.addColorStop(0, c.skyColors[0]); grad.addColorStop(0.55, c.skyColors[1]); grad.addColorStop(1, c.skyColors[2]);
    skyCtx.fillStyle = grad; skyCtx.fillRect(0, 0, w, h);

    skyStars.forEach(s => {
        const alpha = 0.35 + Math.sin(skyTime * 2 + s.phase) * 0.45;
        skyCtx.fillStyle = `rgba(255,250,220,${Math.max(0.1, alpha)})`;
        skyCtx.beginPath(); skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2); skyCtx.fill();
    });

    const moonX = w * 0.72, moonY = h * 0.19;
    const halo = skyCtx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 110);
    halo.addColorStop(0, 'rgba(254,249,195,0.55)'); halo.addColorStop(1, 'rgba(254,249,195,0)');
    skyCtx.fillStyle = halo; skyCtx.beginPath(); skyCtx.arc(moonX, moonY, 110, 0, Math.PI * 2); skyCtx.fill();
    skyCtx.fillStyle = '#fef9c3'; skyCtx.beginPath(); skyCtx.arc(moonX, moonY, 32, 0, Math.PI * 2); skyCtx.fill();

    const haze = skyCtx.createLinearGradient(0, horizonY - 70, 0, horizonY + 10);
    haze.addColorStop(0, 'rgba(250,204,21,0)'); haze.addColorStop(1, 'rgba(250,204,21,0.16)');
    skyCtx.fillStyle = haze; skyCtx.fillRect(0, horizonY - 70, w, 80);
    drawCountryLandmark(skyCtx, currentConfig.country, w, horizonY, skyTime);
}

function drawCountryLandmark(ctx, countryId, w, y, time) {
    ctx.save();
    ctx.fillStyle = '#070b19';
    ctx.strokeStyle = 'rgba(250,204,21,0.55)';
    ctx.lineWidth = 1.6;
    if (countryId === 'thailand') {
        const wx = w * 0.24;
        ctx.beginPath();
        ctx.moveTo(wx - 70, y); ctx.lineTo(wx - 45, y - 45); ctx.lineTo(wx - 22, y - 105); ctx.lineTo(wx, y - 175);
        ctx.lineTo(wx + 22, y - 105); ctx.lineTo(wx + 45, y - 45); ctx.lineTo(wx + 70, y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        const bx = w * 0.66;
        ctx.beginPath(); ctx.moveTo(bx - 160, y - 22); ctx.lineTo(bx + 160, y - 22); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx - 12, y); ctx.lineTo(bx, y - 155); ctx.lineTo(bx + 12, y); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(253,224,71,0.45)'; ctx.lineWidth = 1;
        for (let i = 1; i <= 6; i++) {
            ctx.beginPath();
            ctx.moveTo(bx, y - 145 + i * 12); ctx.lineTo(bx - i * 24, y - 22);
            ctx.moveTo(bx, y - 145 + i * 12); ctx.lineTo(bx + i * 24, y - 22);
            ctx.stroke();
        }
    } else if (countryId === 'singapore') {
        const mx = w * 0.52;
        [-55, 0, 55].forEach(o => { ctx.fillRect(mx + o - 15, y - 140, 30, 140); ctx.strokeRect(mx + o - 15, y - 140, 30, 140); });
        roundRect(ctx, mx - 85, y - 156, 175, 16, 8); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(56,189,248,0.35)'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, y - 156); ctx.lineTo(mx + Math.sin(time) * 180, y - 320);
        ctx.moveTo(mx + 40, y - 156); ctx.lineTo(mx + 40 + Math.cos(time * 0.8) * 180, y - 320);
        ctx.stroke();
    } else if (countryId === 'hongkong') {
        const hx = w * 0.35;
        ctx.fillRect(hx - 80, y - 130, 36, 130); ctx.fillRect(hx - 20, y - 185, 42, 185); ctx.fillRect(hx + 45, y - 150, 38, 150);
        ctx.strokeRect(hx - 20, y - 185, 42, 185);
        const boatX = ((w * 0.5 + time * 18) % (w * 0.7)) + w * 0.15;
        ctx.fillStyle = '#991b1b';
        ctx.beginPath(); ctx.moveTo(boatX - 24, y - 16); ctx.lineTo(boatX - 4, y - 52); ctx.lineTo(boatX + 10, y - 16); ctx.closePath(); ctx.fill();
    } else if (countryId === 'usa') {
        const sx = w * 0.25;
        ctx.fillRect(sx - 20, y - 55, 40, 55);
        ctx.beginPath(); ctx.moveTo(sx - 12, y - 55); ctx.lineTo(sx, y - 135); ctx.lineTo(sx + 12, y - 55); ctx.fill();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(sx + 8, y - 148, 6 + Math.sin(time * 5) * 1.5, 0, Math.PI * 2); ctx.fill();
        const gx = w * 0.65;
        ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 3;
        ctx.strokeRect(gx - 90, y - 120, 12, 120); ctx.strokeRect(gx + 80, y - 120, 12, 120);
        ctx.beginPath(); ctx.moveTo(gx - 150, y - 28); ctx.lineTo(gx + 150, y - 28); ctx.stroke();
    } else if (countryId === 'england') {
        const bx = w * 0.34;
        ctx.fillRect(bx - 16, y - 165, 32, 165); ctx.strokeRect(bx - 16, y - 165, 32, 165);
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(bx, y - 135, 9, 0, Math.PI * 2); ctx.fill();
        const lx = w * 0.62, ly = y - 85;
        ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(lx, ly, 68, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 12; i++) {
            const a = time * 0.3 + (i / 12) * Math.PI * 2;
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a) * 68, ly + Math.sin(a) * 68); ctx.stroke();
        }
    } else if (countryId === 'france') {
        const ex = w * 0.48;
        ctx.beginPath();
        ctx.moveTo(ex - 55, y); ctx.quadraticCurveTo(ex - 16, y - 85, ex - 6, y - 195);
        ctx.lineTo(ex + 6, y - 195); ctx.quadraticCurveTo(ex + 16, y - 85, ex + 55, y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(254,240,138,0.35)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(ex, y - 195); ctx.lineTo(ex + Math.cos(time) * 260, y - 240); ctx.stroke();
    } else if (countryId === 'germany') {
        const gx = w * 0.56;
        for (let i = -2; i <= 2; i++) ctx.fillRect(gx + i * 24 - 5, y - 75, 10, 75);
        ctx.fillRect(gx - 65, y - 92, 130, 18); ctx.strokeRect(gx - 65, y - 92, 130, 18);
        const cx = w * 0.25;
        ctx.beginPath(); ctx.moveTo(cx - 80, y); ctx.lineTo(cx - 30, y - 65); ctx.lineTo(cx + 50, y - 65); ctx.lineTo(cx + 90, y); ctx.fill();
        ctx.fillRect(cx - 10, y - 125, 18, 60); ctx.strokeRect(cx - 10, y - 125, 18, 60);
    } else if (countryId === 'australia') {
        const ox = w * 0.32;
        [0, 28, 52].forEach((o, idx) => {
            const sailH = 75 - idx * 14;
            ctx.beginPath();
            ctx.moveTo(ox + o - 25, y); ctx.quadraticCurveTo(ox + o - 10, y - sailH, ox + o + 22, y - sailH + 12);
            ctx.lineTo(ox + o + 18, y); ctx.closePath(); ctx.fill(); ctx.stroke();
        });
        const hx = w * 0.66;
        ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(hx, y - 24, 95, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hx - 120, y - 24); ctx.lineTo(hx + 120, y - 24); ctx.stroke();
    }
    ctx.restore();
}

const waterCanvas = $('water-reflection-canvas');
const waterCtx = waterCanvas.getContext('2d');
let waveTime = 0;
function resizeWaterCanvas() { waterCanvas.width = waterCanvas.offsetWidth; waterCanvas.height = waterCanvas.offsetHeight; }
function animateWaterReflections() {
    requestAnimationFrame(animateWaterReflections);
    waveTime += 0.035;
    const w = waterCanvas.width, h = waterCanvas.height;
    waterCtx.clearRect(0, 0, w, h);
    const c = countryOf(currentConfig.country);
    const strength = (paintingShown || videoShown) ? 0.08 : 0.12;
    for (let col = 0; col < 6; col++) {
        const centerX = ((col + 0.5) / 6) * w;
        waterCtx.fillStyle = col % 2 === 0 ? '#fde047' : c.waterGlow;
        for (let row = 0; row < 16; row++) {
            const p = row / 16;
            const offset = Math.sin(waveTime * 2 + row + col) * (5 + p * 10);
            waterCtx.globalAlpha = (1 - p) * strength;
            waterCtx.fillRect(centerX + offset - 24, p * h, 48, 2);
        }
    }
    waterCtx.globalAlpha = 1;
}

const fwCanvas = $('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
let particles = [], rockets = [];
let fwW = 0, fwH = 0, fwDirty = false;
const FW_PALETTES = [['#fde047', '#f59e0b'], ['#fb7185', '#fecdd3'], ['#38bdf8', '#e0f2fe'], ['#c084fc', '#f5d0fe'], ['#4ade80', '#fef08a'], ['#fbbf24', '#fff7ed']];

function resizeFireworksCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fwW = fwCanvas.offsetWidth; fwH = fwCanvas.offsetHeight;
    fwCanvas.width = fwW * dpr; fwCanvas.height = fwH * dpr;
    fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Burst types: peony (full sphere), ring, willow (slow drooping gold)
function spawnFireworkAt(x, y, color, count = 70, type) {
    type = type || pick(['peony', 'peony', 'ring', 'willow']);
    const pal = color ? [color, '#fff1f2'] : pick(FW_PALETTES);
    const willow = type === 'willow';
    const maxS = willow ? 3.3 : 4.3;
    for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.12;
        const sp = type === 'ring' ? maxS * (0.88 + Math.random() * 0.08) : maxS * (0.3 + 0.7 * Math.sqrt(Math.random()));
        particles.push({
            x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1,
            decay: willow ? 0.0065 + Math.random() * 0.004 : 0.012 + Math.random() * 0.01,
            color: willow ? (Math.random() < .8 ? '#fcd34d' : '#fff7ed') : (Math.random() < .72 ? pal[0] : pal[1]),
            w: willow ? 1.5 : 2.2, drag: willow ? 0.972 : 0.984, g: willow ? 0.03 : 0.045, glitter: Math.random() < 0.35
        });
    }
    particles.push({ flash: true, x, y, life: 1, decay: 0.1, r: willow ? 46 : 60, color: pal[0] });
    if (particles.length > 1800) particles.splice(0, particles.length - 1800);
}

function launchRocket(tx, ty) {
    const sx = tx + (Math.random() - 0.5) * 90, sy = fwH + 8;
    const frames = 44 + Math.random() * 16;
    rockets.push({ x: sx, y: sy, vx: (tx - sx) / frames, vy: (ty - sy) / frames, t: 0, frames });
}

function triggerFireworksBurst(count = 2) {
    for (let b = 0; b < count; b++) {
        setTimeout(() => launchRocket((0.15 + Math.random() * 0.7) * fwW, (0.08 + Math.random() * 0.3) * fwH), b * 320);
    }
    if (count > 1) playSoftChime(1046.5, 0.05);
}

function animateFireworks() {
    requestAnimationFrame(animateFireworks);
    if (!particles.length && !rockets.length) {
        if (fwDirty) { fwCtx.clearRect(0, 0, fwW, fwH); fwDirty = false; }
        return;
    }
    fwDirty = true;
    // fade previous frame -> soft trails
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0,0,0,0.26)';
    fwCtx.fillRect(0, 0, fwW, fwH);
    fwCtx.globalCompositeOperation = 'lighter';
    fwCtx.lineCap = 'round';

    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const px = r.x, py = r.y;
        r.x += r.vx; r.y += r.vy; r.t++;
        fwCtx.globalAlpha = 0.95;
        fwCtx.strokeStyle = '#fef08a'; fwCtx.lineWidth = 2.2;
        fwCtx.beginPath(); fwCtx.moveTo(px, py); fwCtx.lineTo(r.x, r.y); fwCtx.stroke();
        if (Math.random() < 0.6) particles.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: (Math.random() - .5) * .6, vy: .4 + Math.random() * .6, life: .6, decay: .03, color: '#fbbf24', w: 1.2, drag: .96, g: .02 });
        if (r.t >= r.frames) { spawnFireworkAt(r.x, r.y); rockets.splice(i, 1); playSoftChime(392 + Math.random() * 200, 0.04); }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        if (p.flash) {
            const g = fwCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, `rgba(255,251,235,${0.32 * p.life})`);
            g.addColorStop(1, 'rgba(255,251,235,0)');
            fwCtx.globalAlpha = 1; fwCtx.fillStyle = g;
            fwCtx.beginPath(); fwCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fwCtx.fill();
            continue;
        }
        p.px = p.x; p.py = p.y;
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
        p.x += p.vx; p.y += p.vy;
        let alpha = Math.min(1, p.life * 1.4);
        if (p.glitter && p.life < .6 && Math.random() < .45) alpha *= 0.15;
        fwCtx.globalAlpha = alpha;
        fwCtx.strokeStyle = p.color; fwCtx.lineWidth = p.w;
        fwCtx.beginPath(); fwCtx.moveTo(p.px, p.py); fwCtx.lineTo(p.x, p.y); fwCtx.stroke();
    }
    fwCtx.globalAlpha = 1;
    fwCtx.globalCompositeOperation = 'source-over';
}

// Khom loy sky lanterns — one shared <symbol id="khomloy"> in index.html, tinted per lantern
function initNightAtmosphere() {
    let html = '';
    for (let i = 0; i < 10; i++) {
        const left = 4 + Math.random() * 92;
        const scale = (0.45 + Math.random() * 0.55).toFixed(2);
        const duration = (22 + Math.random() * 18).toFixed(1);
        const delay = (-Math.random() * 34).toFixed(1);
        const hue = Math.round(-14 + Math.random() * 26);
        const sway = (Math.random() * 6 - 3).toFixed(1);
        html += `<div class="lantern" style="left:${left}%; --scale:${scale}; --duration:${duration}s; --delay:${delay}s;"><svg width="34" height="48" viewBox="0 0 34 48" aria-hidden="true" style="filter:hue-rotate(${hue}deg); transform: rotate(${sway}deg)"><use href="#khomloy"/></svg></div>`;
    }
    $('lanterns-layer').innerHTML = html;
}

/* ---------------------------------------------------------------------
 * 14. AUDIO (Web Audio — no files)
 * ------------------------------------------------------------------- */
let audioCtx = null;
let ambientTimer = null;
function ensureAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playSoftChime(freq = 523.25, volume = 0.08, duration = 1.3) {
    if (!soundEnabled) return;
    try {
        ensureAudioContext();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + duration + 0.05);
    } catch (e) {}
}
function playCelebrationChord() {
    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => setTimeout(() => playSoftChime(n, 0.1), i * 100));
}
function toggleAmbientSound() {
    soundEnabled = !soundEnabled;
    setIcon($('sound-icon'), soundEnabled ? 'volume' : 'volume-x');
    $('sound-icon').classList.toggle('text-gold-400', soundEnabled);
    $('sound-label').textContent = soundEnabled ? t('soundOn') : t('soundOff');
    clearInterval(ambientTimer);
    if (soundEnabled) {
        try { ensureAudioContext(); } catch (e) {}
        // Thai-flavoured pentatonic, gentle and sparse
        const notes = [392, 440, 523.25, 587.33, 659.25, 783.99];
        playSoftChime(523.25, 0.06, 2.4);
        ambientTimer = setInterval(() => {
            if (document.hidden) return;
            playSoftChime(pick(notes), 0.045, 2.2);
            if (Math.random() < 0.35) setTimeout(() => playSoftChime(pick(notes) / 2, 0.03, 2.6), 450);
        }, 1600);
    }
}

/* ---------------------------------------------------------------------
 * 15. FIREBASE REALTIME DATABASE (REST) CLOUD SYNC
 * ------------------------------------------------------------------- */
const RTDB_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebaseio\.com|firebasedatabase\.app)$/i;
let rtdbBaseUrl = '';
let syncTimer = null;

function setCloudStatus(state) {
    const dot = $('cloud-dot');
    dot.className = 'w-2 h-2 rounded-full ' + ({ on: 'bg-emerald-400 animate-pulse', error: 'bg-rose-500', off: 'bg-slate-500' }[state] || 'bg-slate-500');
    $('ui-btn-disconnect').classList.toggle('hidden', state === 'off');
}
function openCloudSetupModal() { openModal('cloud-setup-modal'); }
function closeCloudSetupModal() { closeModal('cloud-setup-modal'); }

function cloudFeedback(msg, ok) {
    const fb = $('cloud-config-feedback');
    fb.classList.remove('hidden');
    fb.className = `text-xs mt-1.5 font-medium ${ok ? 'text-emerald-400' : 'text-rose-400'}`;
    fb.textContent = msg;
}

async function applyCustomFirebaseFromUI() {
    const val = $('custom-firebase-input').value.trim().replace(/\/+$/, '');
    if (!RTDB_RE.test(val)) { cloudFeedback(t('cloudInvalid'), false); return; }
    const ok = await startFirebaseRtdbSync(val);
    if (ok) { lsSet(LS.rtdb, val); cloudFeedback('✓ ' + t('cloudConnected'), true); }
    else cloudFeedback(t('cloudError'), false);
}

function disconnectCloud() {
    clearInterval(syncTimer);
    syncTimer = null;
    rtdbBaseUrl = '';
    lsDel(LS.rtdb);
    setCloudStatus('off');
    cloudFeedback(t('cloudOff'), true);
}

// Bandwidth-friendly sync: one full load, then only krathongs newer than the last key
// (ids start with a base-36 timestamp, so key order = time order). Hearts refresh every few minutes.
let lastCloudKey = '';
let lastFullSync = 0;
async function syncFromCloud(forceFull = false) {
    if (!rtdbBaseUrl || document.hidden) return true;
    const full = forceFull || !lastCloudKey || Date.now() - lastFullSync > FULL_REFRESH_MS;
    const q = full
        ? `orderBy=%22%24key%22&limitToLast=${CLOUD_LIMIT}`
        : `orderBy=%22%24key%22&startAt=${encodeURIComponent(JSON.stringify(lastCloudKey))}`;
    try {
        const res = await fetch(`${rtdbBaseUrl}/world_krathongs.json?${q}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (full) lastFullSync = Date.now();
        let changed = false;
        if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
                if (key > lastCloudKey) lastCloudKey = key;
                const k = sanitizeKrathong(data[key]);
                if (!k) return;
                const prev = store.get(k.id);
                if (!prev) { store.set(k.id, k); changed = true; }
                else if (prev.likes !== k.likes) { prev.likes = Math.max(prev.likes, k.likes); changed = true; }
            });
        }
        if (changed) {
            renderCountryTabs();
            renderRiverKrathongs();
            if ($('location-modal').classList.contains('flex')) renderLocationPicker();
            if (activeInspectedId && store.get(activeInspectedId)) updateBlessButton(store.get(activeInspectedId));
        }
        setCloudStatus('on');
        return true;
    } catch (e) {
        setCloudStatus('error');
        return false;
    }
}

async function startFirebaseRtdbSync(baseUrl) {
    clearInterval(syncTimer);
    rtdbBaseUrl = baseUrl;
    lastCloudKey = ''; lastFullSync = 0;
    const ok = await syncFromCloud(true);
    syncTimer = setInterval(syncFromCloud, SYNC_INTERVAL_MS);
    // Push my own krathongs in case they were floated while offline
    if (ok) myIds.forEach(id => { const k = store.get(id); if (k) pushKrathongToCloud(k); });
    return ok;
}
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && rtdbBaseUrl) syncFromCloud();
    const vid = $('country-bg-video');
    if (videoShown) { if (document.hidden) { try { vid.pause(); } catch (e) {} } else { vid.play().catch(() => {}); } }
});

async function pushKrathongToCloud(k) {
    if (!rtdbBaseUrl) return;
    try {
        const { id, name, wish, country, base, flower, topping, topping2, likes, createdAt } = k;
        // PUT only creates; Rules should block overwriting someone else's krathong (see README)
        await fetch(`${rtdbBaseUrl}/world_krathongs/${encodeURIComponent(id)}.json`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, wish, country, base, flower, topping, topping2, likes, createdAt })
        });
    } catch (e) {}
}

// Atomic-ish +1 using the REST ETag (conditional write), retried a few times on conflict.
async function incrementKrathongLikeOnCloud(id) {
    if (!rtdbBaseUrl) return;
    const url = `${rtdbBaseUrl}/world_krathongs/${encodeURIComponent(id)}/likes.json`;
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const res = await fetch(url, { headers: { 'X-Firebase-ETag': 'true' }, cache: 'no-store' });
            if (!res.ok) return;
            const etag = res.headers.get('ETag');
            const current = Number(await res.json()) || 0;
            const headers = { 'Content-Type': 'application/json' };
            if (etag) headers['if-match'] = etag;
            const put = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(current + 1) });
            if (put.ok) {
                const k = store.get(id);
                if (k) { k.likes = Math.max(k.likes, current + 1); refreshRiverLabels(); }
                return;
            }
            if (put.status !== 412) return;   // 412 = someone else liked first; retry
        } catch (e) { return; }
    }
}
