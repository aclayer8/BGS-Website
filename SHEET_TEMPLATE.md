# 📋 คู่มือใช้งาน Google Sheet สำหรับ BGS Products

> **สำหรับผู้ดูแลเว็บไซต์** — แก้ข้อมูลสินค้าใน Google Sheet → เว็บอัพเดทอัตโนมัติภายใน 5 นาที

---

## 🎯 วิธีใช้แบบเร็ว

1. เปิด Google Sheet ที่ link ใน `js/products-data.js` (บรรทัด `CSV_URL`)
2. แก้/เพิ่ม/ลบสินค้าในแถวต่างๆ ของ Sheet
3. **บันทึก** (Google Sheet จะบันทึกอัตโนมัติ)
4. รอประมาณ **5 นาที** หรือกด **Ctrl+Shift+R** (hard refresh) ที่หน้าเว็บ
5. ข้อมูลใหม่จะแสดงทันที

---

## 📊 คอลัมน์ที่ Google Sheet ต้องมี

ใส่ชื่อคอลัมน์ใน **แถวที่ 1** (header row) ตามนี้:

| ลำดับ | ชื่อคอลัมน์ | คำอธิบาย | ตัวอย่าง | จำเป็น |
|------|-----------|----------|----------|--------|
| 1 | `id` | รหัสไม่ซ้ำ (ใช้ใน URL) | `rg-rap2200` | ✅ จำเป็น |
| 2 | `sku` | รหัสสินค้าโชว์ลูกค้า | `RG-RAP2200(F)` | ✅ |
| 3 | `name` | ชื่อสินค้าเต็ม | `Reyee Wireless Access Point AC Wave 2` | ✅ |
| 4 | `model` | รุ่น (โชว์ใต้ชื่อ) | `RG-RAP2200(F)` | ⬜️ |
| 5 | `brand` | แบรนด์แบบสั้น (logo จะ map ตามนี้) | `Reyee` หรือ `Cisco` | ✅ |
| 6 | `brand_full` | ชื่อแบรนด์เต็ม | `Ruijie Networks` | ⬜️ |
| 7 | `category` | หมวดหมู่ | `Access Point` หรือ `Switch` | ✅ |
| 8 | `price` | ราคา (ตัวเลขเท่านั้น ใส่ 0 = "ติดต่อสอบถาม") | `1690` | ✅ |
| 9 | `image_1` | รูปหลัก (URL จาก Google Drive) | ดูด้านล่าง 👇 | ✅ |
| 10 | `image_2` | รูปที่ 2 | — | ⬜️ |
| 11 | `image_3` | รูปที่ 3 | — | ⬜️ |
| 12 | `image_4` | รูปที่ 4 | — | ⬜️ |
| 13 | `image_5` | รูปที่ 5 | — | ⬜️ |
| 14 | `image_6` | รูปที่ 6 | — | ⬜️ |
| 15 | `short` | คำอธิบายสั้น (โชว์ในการ์ดสินค้า) | `Wireless AP AC1300, Cloud Managed` | ✅ แนะนำ |
| 16 | `details` | รายละเอียดเต็ม (ใช้ `Alt+Enter` ขึ้นบรรทัดใหม่) | ดูด้านล่าง 👇 | ⬜️ |
| 17 | `specs` | ตาราง spec (รูปแบบ `key: value` บรรทัดละ 1 อัน) | ดูด้านล่าง 👇 | ✅ แนะนำ |
| 18 | `tags` | แท็ก (คั่นด้วย comma) | `WiFi 5, Cloud, PoE` | ⬜️ |
| 19 | `badge` | ป้ายมุมการ์ด (New, Hot, In Stock, Outdoor) | `New` | ⬜️ |
| 20 | `rating` | คะแนน 0-5 | `4.5` | ⬜️ |
| 21 | `reviews` | จำนวนรีวิว | `12` | ⬜️ |
| 22 | `pdf` | URL ดาวน์โหลด PDF datasheet | — | ⬜️ |
| 23 | `visible` | `TRUE` = แสดง, `FALSE` = ซ่อน | `TRUE` | ⬜️ (default = TRUE) |

> ⚠️ **ห้ามเปลี่ยนชื่อคอลัมน์** — โปรแกรมอ่านตามชื่อนี้

---

## 🖼 วิธีใส่รูปภาพ (Google Drive)

### Step 1: อัพโหลดรูปไปที่ Google Drive

1. เปิด [drive.google.com](https://drive.google.com)
2. สร้างโฟลเดอร์ชื่อ `BGS-Products` (จัดเก็บง่าย)
3. อัพโหลดรูปสินค้าทั้งหมด (ขนาดแนะนำ 800x800px, .jpg หรือ .png)

### Step 2: ตั้งค่าให้รูปเข้าถึงสาธารณะ

1. คลิกขวาที่ **โฟลเดอร์** → **Share** → **General access** → เลือก **"Anyone with the link"**
2. ทำครั้งเดียวพอ ทุกรูปในโฟลเดอร์จะแชร์อัตโนมัติ

### Step 3: คัดลอก URL รูปแต่ละรูป

1. คลิกขวาที่ **รูป** → **Get link** → **Copy link**
2. URL ที่ได้จะเป็น `https://drive.google.com/file/d/XXXXX/view?usp=sharing`
3. **วางลง Sheet ในคอลัมน์ `image_1`, `image_2`, ฯลฯ** — ระบบจะแปลง URL ให้อัตโนมัติ

### ตัวอย่าง:
```
image_1: https://drive.google.com/file/d/1abc...xyz/view?usp=sharing
image_2: https://drive.google.com/file/d/2def...uvw/view?usp=sharing
```

---

## 📝 ตัวอย่างการกรอก `specs`

ใช้รูปแบบ `key: value` หนึ่งบรรทัดต่อหนึ่งสเปก (ใช้ `Alt+Enter` ขึ้นบรรทัดใหม่ใน Google Sheet):

```
มาตรฐาน Wi-Fi: WiFi 5 (802.11ac)
ความเร็วสูงสุด: AC1300 (1.3Gbps)
MIMO: 2x2
ผู้ใช้แนะนำ: 20 Devices
พื้นที่ครอบคลุม: 50 sqm
ย่านความถี่: Dual-band 2.4/5 GHz
พอร์ต LAN: 1x 100Mbps
Power: 12VDC / PoE 802.3af
Warranty: รับประกัน 3 ปี
```

→ จะแสดงเป็นตาราง 2 คอลัมน์อัตโนมัติบนหน้าเว็บ

---

## 📝 ตัวอย่างการกรอก `details`

ใช้ `•` (bullet) นำหน้าหรือเขียนเป็นข้อความปกติก็ได้:

```
• ปล่อยสัญญาณ 2 ความถี่ 2.4/5GHz ความเร็วสูงสุด 1.267Gbps
• มาตรฐาน WIFI 802.11ac MU-MIMO Wave 2
• รองรับการ Optimize สัญญาณ WIFI เพียง Click เดียว
• Config ได้ง่ายผ่าน Ruijie Cloud ใช้เวลาเพียง 3 นาที
• เหมาะสำหรับงานหอพัก, โรงแรม
```

---

## 🚀 วิธี Publish Google Sheet ให้เว็บอ่านได้

### ครั้งแรก (ทำครั้งเดียว):

1. เปิด Google Sheet ของคุณ
2. เมนู **File → Share → Publish to web**
3. ตั้งค่า:
   - **Link**: เลือกชีตที่จะ publish (เลือก "Entire Document" ก็ได้)
   - **Format**: **Comma-separated values (.csv)** ⚠️ สำคัญ!
4. กด **Publish** → ยืนยัน
5. คัดลอก **link** ที่ได้
6. นำลิงค์นั้นไปวางใน `js/products-data.js` บรรทัดแรก:
   ```javascript
   const CSV_URL = 'วาง link ตรงนี้';
   ```

### หลังจากนั้น:
- แก้ Sheet ได้เลย ไม่ต้อง re-publish
- เว็บอัพเดทอัตโนมัติทุก 5 นาที (cache)
- ถ้าอยากเห็นทันที: เปิดเว็บแล้วกด **Ctrl + Shift + R** (Windows) หรือ **Cmd + Shift + R** (Mac)

---

## 🎨 แบรนด์ที่มี Logo built-in (คอลัมน์ `brand`)

ระบบจะ map logo จากคอลัมน์ `brand` อัตโนมัติ (lowercase, ไม่สนตัวพิมพ์):

| ใส่ในคอลัมน์ `brand` | ได้ logo |
|---------------------|---------|
| `cisco` | Cisco |
| `ruijie` | Ruijie Networks |
| `reyee` | Reyee Network |
| `fortinet` | Fortinet |
| `hpe` | HPE |
| `aruba` | Aruba Networks |
| `microsoft` | Microsoft |

หากแบรนด์อื่น → จะโชว์เป็นข้อความตัวอักษร แทน logo

> อยากเพิ่ม logo ใหม่? ทำได้ 2 step:
> 1. วางไฟล์ logo ไว้ใน `images/product-partner/yourbrand-logo.png`
> 2. แก้ใน `product.html` → ตัวแปร `BRAND_LOGOS` เพิ่มบรรทัดใหม่

---

## 🐛 แก้ปัญหา

### ปัญหา: เว็บโหลดสินค้าไม่ขึ้น
**สาเหตุ:** Sheet ยังไม่ได้ Publish หรือ link ผิด

**วิธีแก้:**
1. ลองเปิด `CSV_URL` ใน browser โดยตรง — ควรเห็นข้อมูล CSV
2. ถ้าไม่เห็น: re-publish Sheet ใหม่ตามขั้นตอนข้างบน
3. ถ้าเห็น CSV แต่เว็บยังไม่ขึ้น: เปิด Console (F12) ดู error

### ปัญหา: รูปภาพไม่แสดง
**สาเหตุ:** ลิงก์ Google Drive ไม่ได้ตั้งเป็น "Anyone with the link"

**วิธีแก้:**
1. ไปที่ Google Drive → ขวาคลิกโฟลเดอร์ที่เก็บรูป
2. Share → General access → **Anyone with the link**

### ปัญหา: ข้อมูลใหม่ไม่อัพเดท
**สาเหตุ:** Browser cache

**วิธีแก้:**
- กด **Ctrl + Shift + R** (Windows) / **Cmd + Shift + R** (Mac)
- หรือเปิด console (F12) แล้วพิมพ์ `BGS.clearProductsCache()` กด Enter

---

## 📞 สอบถามเพิ่มเติม

หากมีปัญหาการใช้งาน ติดต่อทีมที่พัฒนาเว็บ
