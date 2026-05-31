# BGS Projects Sheet Template

หน้า `projects.html` ทำงานแบบ reference: แสดงรูป cover + ชื่อโปรเจค และเมื่อกดเข้า `project-detail.html?project=...` จะแสดงรูปทั้งหมดของโปรเจคนั้น

## วิธีใช้งาน

1. สร้าง Google Sheet ใหม่ หรือ copy จาก `bgs-projects-template.csv`
2. ใส่ข้อมูล 1 โปรเจคต่อ 1 แถว
3. อัปโหลดรูปเข้า Google Drive แล้วตั้ง permission เป็น Anyone with the link can view
4. นำลิงก์รูป Drive มาใส่ในช่อง `cover`, `image_1`, `image_2` ...
5. Google Sheets: File > Share > Publish to web
6. เลือก tab ที่เก็บข้อมูล และ format เป็น Comma-separated values (.csv)
7. เอา URL ที่ได้มาใส่ใน `js/config.js` ตรง `projectsCsvUrl`

## Columns

| Column | Required | Example | Notes |
| --- | --- | --- | --- |
| `slug` | Yes | `dib-bangkok` | ใช้เป็นลิงก์ เช่น `project-detail.html?project=dib-bangkok` |
| `title` | Yes | `Dib Bangkok` | ชื่อที่แสดงใต้รูปและบนหน้า detail |
| `cover` | Yes | Google Drive URL | รูปหน้าปกบนหน้า list |
| `image_1` - `image_12` | No | Google Drive URL | รูปทั้งหมดในหน้า detail |
| `gallery` | No | `url1 | url2 | url3` | ใช้รวมหลายรูปในช่องเดียวได้ |
| `sort_order` | No | `1` | ลำดับการแสดง ยิ่งน้อยยิ่งมาก่อน |
| `visible` | No | `TRUE` | ใส่ `FALSE` เพื่อซ่อนโปรเจค |

ระบบยังรองรับคอลัมน์เสริมอย่าง `summary`, `category`, `client`, `location`, `year` ได้ แต่ layout ปัจจุบันตั้งใจไม่แสดง เพื่อให้หน้าตาเรียบตาม reference
