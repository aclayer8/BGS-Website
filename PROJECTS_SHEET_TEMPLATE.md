# BGS Our Projects Sheet

หน้า `projects.html` ทำงานแบบ reference: แสดงรูป cover + ชื่อโปรเจค และเมื่อกดเข้า `project-detail.html?project=...` จะแสดงรูปทั้งหมดของโปรเจคนั้น

## วิธีใช้งาน

1. อัปโหลดไฟล์ `bgs-our-projects.csv` ขึ้น Google Drive ของลูกค้า
2. คลิกขวาที่ไฟล์ > Open with > Google Sheets เพื่อแปลงเป็น Sheet ที่ลูกค้าแก้เองได้
3. เปลี่ยนชื่อไฟล์/Sheet เป็น `bgs-our-projects` หรือชื่อที่ลูกค้าจำง่าย
4. ใส่ข้อมูล 1 โปรเจคต่อ 1 แถว
5. อัปโหลดรูปเข้า Google Drive แล้วตั้ง permission เป็น Anyone with the link can view
6. นำลิงก์รูป Drive มาใส่ในช่อง `cover`, `image_1`, `image_2` ...
7. Google Sheets: File > Share > Publish to web
8. เลือก tab ที่เก็บข้อมูล และ format เป็น Comma-separated values (.csv)
9. เอา URL ที่ได้มาใส่ใน `js/config.js` ตรง `projectsCsvUrl`

## วิธีส่งให้ลูกค้าแก้เอง

1. สร้างโฟลเดอร์ใน Drive เช่น `BGS Website Data`
2. อัปโหลด/สร้าง Google Sheet ชื่อ `bgs-our-projects`
3. สร้างโฟลเดอร์ย่อยสำหรับรูป เช่น `BGS Project Images`
4. แชร์ Google Sheet ให้ลูกค้าเป็น Editor
5. แชร์โฟลเดอร์รูปให้ลูกค้าเป็น Editor
6. รูปที่จะขึ้นเว็บต้องตั้งสิทธิ์เป็น Anyone with the link can view
7. หลังลูกค้าแก้ Sheet แล้ว หน้าเว็บจะอัปเดตตาม URL CSV ที่ publish ไว้ โดยอาจรอ cache ประมาณ 5 นาที

## ตัวอย่าง workflow จริง

1. ลูกค้าเพิ่มแถวใหม่
2. ใส่ `slug` เช่น `new-office-network`
3. ใส่ `title` เช่น `New Office Network`
4. ใส่ `detail_title` เช่น `โปรเจ็ค New Office Network` เพื่อแก้ข้อความบนแถบหน้า detail
5. อัปโหลดรูป cover และรูป gallery เข้า Drive
6. Copy link ของรูปมาใส่ `cover`, `image_1`, `image_2`
7. ใส่ `sort_order` เป็นเลขลำดับ เช่น `1`
8. ใส่ `visible` เป็น `TRUE`
9. เปิด `https://www.begrovesolutions.com/projects.html` เพื่อตรวจหน้า list
10. กดรูปโปรเจคเพื่อตรวจหน้า detail

## ข้อควรระวัง

1. ห้ามลบหรือเปลี่ยนชื่อ header แถวแรก เช่น `slug`, `title`, `cover`
2. `slug` ควรเป็นภาษาอังกฤษตัวเล็ก ใช้ขีดกลางแทนเว้นวรรค เช่น `paolo-hospital`
3. อย่าใช้ `slug` ซ้ำกัน เพราะ URL หน้า detail จะชนกัน
4. ถ้ารูปไม่ขึ้น ให้เช็ค permission ของรูปใน Drive ก่อน
5. ถ้าต้องการซ่อนโปรเจค ให้ใส่ `FALSE` ในคอลัมน์ `visible`

## วิธีเปลี่ยน URL ในเว็บ

หลัง Publish to web แล้วจะได้ URL ประมาณนี้:

```text
https://docs.google.com/spreadsheets/d/e/xxxxx/pub?output=csv
```

นำ URL นี้ไปใส่ใน `js/config.js`:

```js
projectsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/xxxxx/pub?output=csv',
```

ถ้าปล่อยว่างไว้ เว็บจะใช้ demo projects ที่อยู่ในโค้ด:

```js
projectsCsvUrl: '',
```

## Columns

| Column | Required | Example | Notes |
| --- | --- | --- | --- |
| `slug` | Yes | `dib-bangkok` | ใช้เป็นลิงก์ เช่น `project-detail.html?project=dib-bangkok` |
| `title` | Yes | `Dib Bangkok` | ชื่อที่แสดงใต้รูปและบนหน้า detail |
| `detail_title` | No | `โปรเจ็ค Dib Bangkok` | ข้อความบนแถบสีฟ้าในหน้า detail ถ้าปล่อยว่างจะใช้ `โปรเจ็ค` + `title` |
| `cover` | Yes | Google Drive URL | รูปหน้าปกบนหน้า list |
| `image_1` - `image_12` | No | Google Drive URL | รูปทั้งหมดในหน้า detail |
| `gallery` | No | `url1 | url2 | url3` | ใช้รวมหลายรูปในช่องเดียวได้ |
| `sort_order` | No | `1` | ลำดับการแสดง ยิ่งน้อยยิ่งมาก่อน |
| `visible` | No | `TRUE` | ใส่ `FALSE` เพื่อซ่อนโปรเจค |

ระบบยังรองรับคอลัมน์เสริมอย่าง `summary`, `category`, `client`, `location`, `year` ได้ แต่ layout ปัจจุบันตั้งใจไม่แสดง เพื่อให้หน้าตาเรียบตาม reference
