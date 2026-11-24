# ลอยกระทงออนไลน์ ไกลบ้าน 🌕 Loykratong Online — Far From Home

เว็บแอป (PWA) สำหรับลอยกระทงออนไลน์ 16 สถานที่ (ไทย 4 ภาค + ต่างประเทศ 9 + โซนพิเศษ Cyberpunk / Jurassic / Space) พร้อมเสี่ยงเซียมซีมงคลหลังลอยเสร็จ ใช้ภาพวาดเป็นฉากหลัง ออกแบบกระทง เขียนคำอธิษฐาน ส่งหัวใจ และสร้างการ์ดที่ระลึกเป็นรูปภาพ รองรับภาษาไทย / English / 中文

## โครงสร้างไฟล์

```
index.html             หน้าเว็บ (markup)
krathong-art.js        ภาพเวกเตอร์กระทง ดอกไม้ เครื่องบูชา (SVG)
fortunes.js            คำทำนายเซียมซี 5 หัวข้อ (ไทย/EN/中文) แก้/เพิ่มได้เลย
styles.css             animation + style เพิ่มเติม (นอกจาก Tailwind)
app.js                 logic ทั้งหมด
manifest.webmanifest   ข้อมูล PWA (ติดตั้งลงหน้าจอโฮม)
sw.js                  service worker (offline + cache ภาพ)
assets/bg/*.jpg        ภาพวาดฉากหลัง 16 สถานที่ (1920px) + thumbnail
assets/icons/*.png     ไอคอนแอป
```

## 🌏 เปิดให้ทุกคนใช้ และเห็นกระทงของกันและกัน

1. **สร้างฐานข้อมูล**: console.firebase.google.com → Add project → Build → Realtime Database → Create (เลือก region `asia-southeast1` สิงคโปร์) → แท็บ Rules วางกฎด้านล่าง → Publish
2. **ใส่ URL ในแอป**: เปิด `app.js` บรรทัดบนๆ แก้ `const PUBLIC_RTDB_URL = '';` เป็น URL ของฐานข้อมูล เช่น
   `const PUBLIC_RTDB_URL = 'https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app';`
   ทุกคนที่เปิดเว็บจะเชื่อมต่ออัตโนมัติ (ปุ่ม Cloud จะถูกซ่อน)
3. **อัปเว็บขึ้นออนไลน์** (เลือกทางใดทางหนึ่ง):
   - **Netlify Drop** (ง่ายสุด): ลากทั้งโฟลเดอร์ไปวางที่ app.netlify.com/drop ได้ลิงก์ทันที
   - **GitHub Pages**: ดูหัวข้อถัดไป
   - **Firebase Hosting**: `npm i -g firebase-tools` → `firebase init hosting` → `firebase deploy`
4. แชร์ลิงก์ได้เลย

**แพ็กเกจฟรี (Spark)**: ดาวน์โหลดได้ 10 GB/เดือน และเชื่อมต่อพร้อมกันได้ 100 คน แอปซิงก์แบบประหยัด (ดึงเฉพาะกระทงใหม่ทุก 6 วิ และโหลดยอดหัวใจใหม่ทุก 3 นาที) ใช้ประมาณ 3 MB ต่อคนต่อชั่วโมง ถ้าคนเยอะช่วงคืนลอยกระทง ให้อัปเกรดเป็น Blaze (จ่ายตามจริง)

**ดูแลเนื้อหา**: คำอธิษฐานเป็นสาธารณะ ลบข้อความไม่เหมาะสมได้ที่ Firebase console → Realtime Database → `world_krathongs` → เลือกรายการ → ลบ

## Deploy บน GitHub Pages

1. สร้าง repo ใหม่ แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (ให้ `index.html` อยู่ที่ root)
2. Settings → Pages → Source: `Deploy from a branch` → เลือก `main` / `(root)`
3. เปิด `https://<username>.github.io/<repo>/`

เมื่อแก้โค้ดแล้ว deploy ใหม่ ให้เปลี่ยน `VERSION` ใน `sw.js` (เช่น `wlk-v2`) เพื่อให้ผู้ใช้ได้ไฟล์ใหม่

> ทดสอบในเครื่อง: `python3 -m http.server 8080` แล้วเปิด http://localhost:8080 (ต้องเปิดผ่าน server ไม่ใช่ดับเบิลคลิกไฟล์ เพราะ service worker / รูปภาพ)

## เปิด Cloud Sync (Firebase Realtime Database)

1. สร้างโปรเจกต์ที่ https://console.firebase.google.com
2. Build → Realtime Database → Create database
3. แท็บ **Rules** วางกฎด้านล่าง แล้วกด Publish
4. คัดลอก Database URL (เช่น `https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app`) ไปวางในปุ่ม **Cloud** ของแอป

URL ที่ใส่ผ่านปุ่ม Cloud จะถูกจำไว้แค่ในเครื่องนั้น ถ้าต้องการให้ทุกคนเชื่อมต่ออัตโนมัติ ใช้ `PUBLIC_RTDB_URL` ตามหัวข้อด้านบน

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

ข้อมูลจากคลาวด์ทุกชิ้นถูกตรวจซ้ำในแอป (`sanitizeKrathong`) ก่อนแสดงผล จึงไม่มีใครฝังโค้ดผ่านชื่อหรือคำอธิษฐานได้ แต่ถ้าเปิดสาธารณะจริง ควรมีระบบลบข้อความไม่เหมาะสม (เช่น ให้แอดมินลบผ่าน Firebase console) และพิจารณาเปิด App Check

## ปรับแต่ง

- **วันลอยกระทง**: `FESTIVAL_DATES` บนสุดของ `app.js` (ตอนนี้ `2026-11-24`) — ใส่ปีถัดไปเพิ่มได้
- **ฉากหลังเคลื่อนไหว (วิดีโอ / GIF)**: กดปุ่ม **ฉากหลัง** หรือลากไฟล์วางบนหน้าจอ รองรับ GIF และวิดีโอ `mp4` / `webm`
  - วิดีโอเล่นวนอัตโนมัติ (ไม่มีเสียง) และเก็บไว้ในเครื่องผู้ใช้ผ่าน IndexedDB (รูป/GIF เก็บใน localStorage)
  - จำกัดขนาดวิดีโอที่อัปโหลด ~60MB (แก้ได้ที่ `MAX_VIDEO_MB` ใน `app.js`) แนะนำคลิปสั้น 5–15 วิ ตัดต่อให้ลูปเนียน
  - อยากตั้ง **วิดีโอเริ่มต้น** ต่อประเทศ: วางไฟล์เช่น `assets/bg/th.mp4` แล้วแก้ `DEFAULT_BG_VIDEOS` ใน `app.js` เป็น `{ thailand: 'assets/bg/th.mp4' }`
- **ฉากหลัง**: แทนไฟล์ใน `assets/bg/` (ชื่อ `th, thn, thne, ths, sg, hk, kr, jp, us, gb, fr, de, au, cy, ju, sp` + `-thumb`)
- **เพิ่ม/ย้ายสถานที่**: แก้ `COUNTRIES` และกลุ่มใน `ZONES` (thai / world / special) ใน `app.js` ขนาดแนะนำ 1920×1072
- **จำนวนกระทงต่อประเทศบนแม่น้ำ**: `MAX_ON_RIVER`
- **Tailwind**: ตอนนี้ใช้ Tailwind Play CDN (สะดวก แต่ขึ้นคำเตือนใน console) ถ้าต้องการ production เต็มรูปแบบ ให้ build ด้วย Tailwind CLI แล้วเปลี่ยนเป็นไฟล์ CSS

## เซียมซีมงคล

หลังลอยกระทงเสร็จ ผู้ใช้เลือกได้ว่าจะ **เสี่ยงเซียมซี** หรือ **จบขั้นตอน** ถ้าเสี่ยง เลือกหัวข้อ (ภาพรวม / การเงิน / ความรัก / สุขภาพ / การงาน & การเรียน) แล้วเขย่ากระบอก จะได้ใบที่ 1–28 พร้อมคำทำนายสั้นๆ สีมงคล และเลขนำโชค — ทุกใบเป็นใบดี
- แก้หรือเพิ่มคำทำนายได้ที่ `fortunes.js` (แต่ละหัวข้อเป็น array ใส่กี่ใบก็ได้)
- กด "ใส่ในการ์ด" เพื่อให้คำทำนายไปอยู่ในการ์ดที่ระลึกด้วย
