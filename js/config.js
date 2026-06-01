// ============================================================
//  BGS WEBSITE — Client Configuration
//  แก้ไขไฟล์นี้เพียงไฟล์เดียวเมื่อ deploy ให้ client ใหม่
//  ไม่ต้องแตะไฟล์อื่น
// ============================================================

const SITE_CONFIG = {

  // ── Google Sheets (จำเป็นต้องแก้) ──────────────────────────
  // วิธีได้ URL: Google Sheet → File → Share → Publish to web
  //              → เลือก tab Products → Comma-separated values → Publish
  // ปัจจุบัน: bgs-product-database.xlsx / Products (2026-05-30)
  csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTP7uvHPi5oQKQ36qA4RxRtlSZY4EXzFK2eEXbdLbiqPcdkC0zdKglB0WuUHlORyQ/pub?output=csv',
  // Google Sheets for Projects / Portfolio.
  // Template file: bgs-our-projects.csv
  // วิธีได้ URL: Google Sheet → File → Share → Publish to web
  //              → เลือก tab bgs-our-projects → Comma-separated values → Publish
  // Leave blank to use the built-in demo projects while preparing the sheet.
  projectsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSnnGz66PKsvhKxV69xHA2BoLTZfCa3r7TSoIXlJFF1MRhUfMcH4ZfyS3R7NpxmqZTcqmREsQnZZqh/pub?output=csv',
  visitCounter: {
    enabled: true,
    namespace: 'begrove-solutions',
    totalName: 'website-total',
    dailyPrefix: 'website-day',
  },
  // เก่า (2026-05-30): 2PACX-1vT1iat5AZXrq7OFUdoPC3K6vgtLr1dtrlpWxT2GNCYY976LyMsw3Byi_03MOxpu_A
  // เก่า (2026-05-30): 2PACX-1vTd0vurS7hWw9vZ25kol3h7fI4LZi2OnFGUdDC96ommAfSP2pwBfBAoDtCEvrk-uQ
  // เก่า (2026-05-29): 2PACX-1vQgB6nQ2umu9cymB5L4pK5jEPrGQrmdEyRU6hO7l4OKwNmJLMU5JKSPWBeCeQKHAQ
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
