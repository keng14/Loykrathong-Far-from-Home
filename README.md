# ลอยกระทงออนไลน์ ไกลบ้าน 🌕 Loy Krathong Online — Far From Home

เว็บแอป (PWA) สำหรับลอยกระทงออนไลน์ 16 สถานที่ (ไทย 4 ภาค + ต่างประเทศ 9 + โซนพิเศษ Cyberpunk / Jurassic / Space) พร้อมเสี่ยงเซียมซีมงคลหลังลอยเสร็จ ใช้ภาพวาดเป็นฉากหลัง ออกแบบกระทง เขียนคำอธิษฐาน ส่งหัวใจ และสร้างการ์ดที่ระลึกเป็นรูปภาพ รองรับภาษาไทย / English / 中文

**Live demo:** https://keng14.github.io/Loykrathong-Far-from-Home/

## ใช้งาน

1. เลือกภาษา
2. เลือกสถานที่ที่อยากลอยกระทง
3. ออกแบบกระทง (ฐาน ดอกไม้ เครื่องบูชาเสริมดวง 2 อย่าง) แล้วเขียนคำอธิษฐาน
4. ลอยกระทง แล้วเสี่ยงเซียมซีมงคล (ถ้าอยาก)

แอปทำงานแบบ offline ได้หลังเปิดครั้งแรก ติดตั้งลงหน้าจอโฮมได้ (Add to Home Screen)

## โครงสร้างไฟล์

```
index.html             หน้าเว็บ (markup)
krathong-art.js        ภาพเวกเตอร์กระทง ดอกไม้ เครื่องบูชา (SVG)
fortunes.js            คำทำนายเซียมซี 5 หัวข้อ (ไทย/EN/中文) แก้/เพิ่มได้เลย
styles.css             animation + style เพิ่มเติม
tailwind.css           Tailwind ที่ build แล้ว (ไม่ต้องใช้ CDN)
app.js                 logic ทั้งหมด
manifest.webmanifest   ข้อมูล PWA (ติดตั้งลงหน้าจอโฮม)
sw.js                  service worker (offline + cache ภาพ)
assets/bg/*.jpg        ภาพวาดฉากหลัง 16 สถานที่ (1920px) + thumbnail
assets/icons/*.png     ไอคอนแอป
```

## Deploy บน GitHub Pages

1. สร้าง repo ใหม่ แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (ให้ `index.html` อยู่ที่ root)
2. Settings → Pages → Source: `Deploy from a branch` → เลือก `main` / `(root)`
3. เปิด `https://<username>.github.io/<repo>/`

เมื่อแก้โค้ดแล้ว deploy ใหม่ ให้เปลี่ยน `VERSION` ใน `sw.js` (เช่น `wlk-v8`) เพื่อให้ผู้ใช้ได้ไฟล์ใหม่

> ทดสอบในเครื่อง: `python3 -m http.server 8080` แล้วเปิด http://localhost:8080 (ต้องเปิดผ่าน server ไม่ใช่ดับเบิลคลิกไฟล์ เพราะ service worker / รูปภาพ)

## เปิด Cloud Sync (Firebase Realtime Database)

เพื่อให้ทุกคนเห็นกระทงของกันและกัน:

1. สร้างโปรเจกต์ที่ https://console.firebase.google.com
2. Build → Realtime Database → Create database (region `asia-southeast1` สิงคโปร์)
3. แท็บ **Rules** วางกฎด้านล่าง แล้วกด Publish
4. ใน `app.js` แก้ `const PUBLIC_RTDB_URL = '';` เป็น Database URL เช่น `https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app`

ถ้าไม่ตั้ง `PUBLIC_RTDB_URL` แอปจะทำงานแบบ demo offline (ไม่มีการแชร์กระทงจริง) ผู้ใช้ยังใส่ URL เองผ่านปุ่ม Cloud ได้ แต่ URL นั้นจะถูกจำไว้แค่ในเครื่องนั้น

### Rules แนะนำ (สร้างได้อย่างเดียว ห้ามแก้/ลบกระทงคนอื่น, หัวใจเพิ่มทีละ 1)

```json
{
  "rules": {
    "world_krathongs": {
      ".read": true,
      "$id": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['id','name','wish','country','base','flower','topping','likes','createdAt']) && newData.child('id').val() === $id && $id.length <= 64",
        "id":       { ".validate": "newData.isString()" },
        "name":     { ".validate": "newData.isString() && newData.val().length <= 40" },
        "wish":     { ".validate": "newData.isString() && newData.val().length <= 200" },
        "country":  { ".validate": "newData.isString() && newData.val().matches(/^(thailand|north|northeast|south|singapore|hongkong|korea|japan|usa|england|france|germany|australia|cyberpunk|jurassic|space)$/)" },
        "base":     { ".validate": "newData.isString() && newData.val().matches(/^(banana|bread|lotus|coconut|ice)$/)" },
        "flower":   { ".validate": "newData.isString() && newData.val().matches(/^(marigold|lotus|orchid|rose|jasmine)$/)" },
        "topping":  { ".validate": "newData.isString() && newData.val().matches(/^(incense|coins|couple|cat|garland|betel|elephant|diploma)$/)" },
        "topping2": { ".validate": "newData.isString() && newData.val().matches(/^(|incense|coins|couple|cat|garland|betel|elephant|diploma)$/)" },
        "createdAt":{ ".validate": "newData.isNumber() && newData.val() <= now + 60000" },
        "likes": {
          ".write": "data.exists()",
          ".validate": "newData.isNumber() && ((!data.exists() && newData.val() === 0) || (data.exists() && newData.val() === data.val() + 1))"
        },
        "$other": { ".validate": false }
      }
    }
  }
}
```

ข้อมูลจากคลาวด์ทุกชิ้นถูกตรวจซ้ำในแอป (`sanitizeKrathong`) ก่อนแสดงผล แต่ถ้าเปิดสาธารณะจริง ควรมีวิธีลบข้อความไม่เหมาะสม (แอดมินลบผ่าน Firebase console) และพิจารณาเปิด App Check

## ปรับแต่ง

- **วันลอยกระทง**: `FESTIVAL_DATES` บนสุดของ `app.js` (ตอนนี้ `2026-11-24`) ใส่ปีถัดไปเพิ่มได้
- **ฉากหลังเคลื่อนไหว (วิดีโอ / GIF)**: กดปุ่ม **ฉากหลัง** หรือลากไฟล์วางบนหน้าจอ รองรับ GIF และวิดีโอ `mp4` / `webm`
  - วิดีโอเล่นวนอัตโนมัติ (ไม่มีเสียง) เก็บไว้ในเครื่องผู้ใช้ผ่าน IndexedDB
  - จำกัดขนาดวิดีโอ ~60MB (แก้ได้ที่ `MAX_VIDEO_MB`) แนะนำคลิปสั้น 5–15 วิ ตัดต่อให้ลูปเนียน
  - ตั้ง **วิดีโอเริ่มต้น** ต่อประเทศได้: วางไฟล์เช่น `assets/bg/th.mp4` แล้วแก้ `DEFAULT_BG_VIDEOS` ใน `app.js` เป็น `{ thailand: 'assets/bg/th.mp4' }`
- **ฉากหลัง**: แทนไฟล์ใน `assets/bg/` (ชื่อ `th, thn, thne, ths, sg, hk, kr, jp, us, gb, fr, de, au, cy, ju, sp` + `-thumb`)
- **เพิ่ม/ย้ายสถานที่**: แก้ `COUNTRIES` และกลุ่มใน `ZONES` (thai / world / special) ใน `app.js` ขนาดแนะนำ 1920×1072
- **จำนวนกระทงบนแม่น้ำต่อสถานที่**: `MAX_ON_RIVER`
- **ภาษา**: แก้ข้อความทั้งหมดได้ที่ `I18N` ใน `app.js` (th / en / zh)

## เซียมซีมงคล

หลังลอยกระทงเสร็จ ผู้ใช้เลือกได้ว่าจะ **เสี่ยงเซียมซี** หรือ **จบขั้นตอน** ถ้าเสี่ยง เลือกหัวข้อ (ภาพรวม / การเงิน / ความรัก / สุขภาพ / การงาน) แล้วเขย่ากระบอก จะได้ใบที่ 1–28 พร้อมคำทำนายสั้นๆ สีมงคล และเลขนำโชค
- แก้หรือเพิ่มคำทำนายได้ที่ `fortunes.js` (แต่ละหัวข้อเป็น array ใส่กี่ใบก็ได้)
- กด "ใส่ในการ์ด" เพื่อให้คำทำนายไปอยู่ในการ์ดที่ระลึกด้วย

## License

ระบุ license ที่ต้องการเองที่นี่ (เช่น MIT) หรือไม่ใส่ก็ได้
