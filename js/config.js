// ============================================================
//  BGS WEBSITE — Client Configuration
//  แก้ไขไฟล์นี้เพียงไฟล์เดียวเมื่อ deploy ให้ client ใหม่
//  ไม่ต้องแตะไฟล์อื่น
// ============================================================

const SITE_CONFIG = {

  // ── Google Sheets (จำเป็นต้องแก้) ──────────────────────────
  // วิธีได้ URL: Google Sheet → File → Share → Publish to web
  //              → เลือก tab Products → Comma-separated values → Publish
  // ปัจจุบัน: บัญชี Google ใหม่ (2026-05-29)
  csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgB6nQ2umu9cymB5L4pK5jEPrGQrmdEyRU6hO7l4OKwNmJLMU5JKSPWBeCeQKHAQ/pub?output=csv',
  // เก่า (บัญชีเดิม): 2PACX-1vQp6_JUEIDV9sQpLLsW79Jm4yCvmgbn7FNgoieHddmphUScCbQJfyQqvBKt8BzDvga54elZSw4BQKJA
  // ── ข้อมูลบริษัท ────────────────────────────────────────────
  companyName:    'BE GROVE SOLUTIONS CO., LTD',
  companyShort:   'BGS',
  tagline:        'ผู้ให้บริการด้าน IT System Integration ครบวงจร',

  // ── ช่องทางติดต่อ ────────────────────────────────────────────
  lineId:         '@begrove',
  lineUrl:        'https://line.me/ti/p/@begrove',
  phone:          '+66 9 1495 9997',
  email:          'info@begrovesolutions.com',
  address:        '111/38 หมู่ 4 ต.บึงยี่โถ อ.ธัญบุรี จ.ปทุมธานี 12130',

  // ── Cache ────────────────────────────────────────────────────
  // 0 = ไม่ cache (ใช้ตอน dev)
  // 5 * 60 * 1000 = 5 นาที (ใช้ตอน production)
  cacheTtl:       5 * 60 * 1000,

};
