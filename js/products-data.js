// ============================================================
//  BGS WEBSITE — Product Data Layer  v3 (Multi-image + B2B)
//  ดึงข้อมูลจาก Google Sheets (CSV) + cache localStorage
//  รองรับ image_1..image_6 + ข้อมูล B2B (no cart)
// ============================================================

// ── 1. CONFIG ────────────────────────────────────────────────
//  ค่าทั้งหมดอ่านจาก js/config.js — แก้ไขแค่นั้นเมื่อ deploy ให้ client ใหม่
const _cfg      = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
const CSV_URL   = _cfg.csvUrl   || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgB6nQ2umu9cymB5L4pK5jEPrGQrmdEyRU6hO7l4OKwNmJLMU5JKSPWBeCeQKHAQ/pub?output=csv';
// CACHE_KEY ผูกกับ URL → ย้าย Sheet ใหม่ปุ๊บ cache เก่าถูกทิ้งอัตโนมัติ
const _urlHash  = CSV_URL.split('/').slice(-2, -1)[0]?.slice(-12) || 'default';
const CACHE_KEY = `bgs_products_v4_${_urlHash}`;
const CACHE_TTL = (_cfg.cacheTtl !== undefined) ? _cfg.cacheTtl : 5 * 60 * 1000;

// ── 2. BRAND NAME MAP (auto-fill เมื่อ Sheet ไม่ได้ใส่ brand_full) ──
const BRAND_NAMES = {
  'cisco':    'Cisco Systems',       'hpe':      'Hewlett Packard Enterprise',
  'fortinet': 'Fortinet',            'aruba':    'Aruba Networks',
  'ruijie':   'Ruijie Networks',     'reyee':    'Reyee',
  'microsoft':'Microsoft',           'juniper':  'Juniper Networks',
  'dell':     'Dell Technologies',   'ubiquiti': 'Ubiquiti',
  'hikvision':'Hikvision',           'dahua':    'Dahua Technology',
  'mikrotik': 'MikroTik',            'tp-link':  'TP-Link',
  'zyxel':    'Zyxel',               'apc':      'APC by Schneider Electric',
};

// ── 3. CSV PARSER (รองรับ comma ใน "quoted strings") ─────────
function parseCSV(text) {
  const lines = [];
  let line = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"') {
      if (inQ && next === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      line.push(field); field = '';
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQ) {
      if (ch === '\r') i++;
      line.push(field); field = '';
      if (line.some(f => f.trim())) lines.push(line);
      line = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field || line.length) { line.push(field); if (line.some(f => f.trim())) lines.push(line); }
  return lines;
}

function csvToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
    return obj;
  });
}

// ── 3. Google Drive URL → direct image URL ───────────────────
function driveUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!url) return '';
  // รูปแบบ: https://drive.google.com/file/d/FILE_ID/view
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return `https://lh3.googleusercontent.com/d/${m1[1]}=w800`;
  // รูปแบบ: https://drive.google.com/open?id=FILE_ID
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}=w800`;
  return url;
}

// ── 4. ROW → PRODUCT OBJECT ─────────────────────────────────
//  ชื่อคอลัมน์ที่รองรับ (ไม่ case-sensitive, space → _):
//   id, sku, name, model, brand, brand_full, category,
//   menu_group, menu_category,
//   price, image_1..image_6, short, details, specs, tags, badge, visible
function mapRow(r) {
  // รวบรวมรูป image_1..image_6 (รวม image เก่าด้วย)
  const images = [];
  for (let i = 1; i <= 8; i++) {
    const v = driveUrl(r[`image_${i}`] || r[`image${i}`] || '');
    if (v) images.push(v);
  }
  // fallback: image (เดิม) หรือ image_1 ว่างก็ลอง 'image'
  if (images.length === 0) {
    const v = driveUrl(r.image || '');
    if (v) images.push(v);
  }

  const name      = r.name      || r.name_th    || '';
  const sku       = r.sku       || r.model      || r.id || '';
  const brand     = r.brand     || '';
  const brandFull = r.brand_full || r.brandfull || BRAND_NAMES[brand.toLowerCase()] || brand || '';
  const cat       = r.category  || r.cat        || 'ทั่วไป';
  const menuGroup = r.menu_group || r.menu_brand || r.group || '';
  const menuCat   = r.menu_category || r.menu_cat || '';
  const short     = r.short     || r.short_desc || r.details_short || '';
  const details   = r.details   || r.desc_th    || r.desc || '';
  const specs     = r.specs     || r.spec       || '';
  const tags      = r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const price     = Number((r.price || '0').replace(/,/g, '')) || 0;
  const badge     = r.badge     || '';
  const rating    = Number(r.rating || '0') || 0;
  const reviews   = Number(r.reviews || '0') || 0;
  const pdf       = driveUrl(r.pdf || r.datasheet || '');

  return {
    id: r.id || sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    sku,
    name,
    model: r.model || sku,
    brand,
    brandFull,
    cat,
    menuGroup,
    menuCat,
    price,
    images,
    short: short || details.slice(0, 180),
    details,
    specs,
    tags,
    badge,
    rating,
    reviews,
    pdf,
    visible: r.visible !== 'FALSE' && r.visible !== 'false' && r.visible !== '0',
  };
}

// ── 5. FETCH FROM SHEET ─────────────────────────────────────
async function fetchFromSheet() {
  // cache-buster ?_t= กัน Google CDN + browser HTTP cache เอาของเก่ามาให้
  const sep = CSV_URL.includes('?') ? '&' : '?';
  const url = `${CSV_URL}${sep}_t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sheet fetch failed (${res.status}) — ตรวจสอบว่า Sheet ถูก Publish แล้ว`);
  const text = await res.text();
  if (!text.trim()) throw new Error('Sheet ส่งข้อมูลว่างเปล่า — ตรวจสอบว่า Sheet มีข้อมูลและ Publish แล้ว');
  const rows = parseCSV(text);
  const objs = csvToObjects(rows);
  const products = objs.map(mapRow).filter(p => p.visible && p.name);
  return products;
}

// ── 6. PUBLIC API ───────────────────────────────────────────
async function loadProducts() {
  // ลองอ่าน cache ก่อน
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (CACHE_TTL > 0 && Date.now() - ts < CACHE_TTL) return data;
    }
  } catch (e) { /* cache miss */ }

  const data = await fetchFromSheet();

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) { /* storage full */ }

  return data;
}

function clearProductsCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('[BGS] Products cache cleared. Reloading…');
  location.reload();
}

// ── 7. CATEGORY / BRAND HELPERS ─────────────────────────────
function getCategories(products) {
  const cats = [...new Set(products.map(p => p.cat).filter(Boolean))].sort();
  return cats;
}
function getBrands(products) {
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  return brands;
}
function findProduct(products, id) {
  if (!id) return null;
  return products.find(p => p.id === id || p.sku === id) || null;
}

// ── 8. MOCK DATA (fallback ถ้า Sheet ไม่พร้อม) ──────────────
const MOCK_PRODUCTS = [
  {
    id: 'rg-rap2200', sku: 'RG-RAP2200(F)', model: 'RG-RAP2200(F)',
    brand: 'Reyee', brandFull: 'Ruijie Networks', cat: 'Access Point',
    name: 'RG-RAP2200(F) Reyee Wireless Access Point AC Wave 2, Port 100Mbps, Cloud Control',
    price: 1690, badge: 'In Stock', rating: 0, reviews: 0,
    images: [],  // จะ fallback ไป SVG ใน product-svg.js
    short: 'Reyee RG-RAP2200(F) Wireless Access Point มาตรฐาน ac Wave 2 ความเร็ว 1.267Gbps, Port Lan 100Mbps, รองรับการ Managed ผ่าน Ruijie Cloud Controller',
    details: '• ปล่อยสัญญาณ 2 ความถี่ 2.4/5GHz ความเร็วสูงสุด 1.267Gbps\n• มาตรฐาน WIFI 802.11ac MU-MIMO Wave 2\n• รองรับการ Optimize สัญญาณ WIFI เพียง Click เดียว\n• Config ได้ง่ายผ่าน Ruijie Cloud ใช้เวลาเพียง 3 นาที\n• รองรับการทำ L2/L3 Roaming\n• บริหารจัดการ Remote ผ่าน Cloud ง่ายต่อการ Maintenance\n• 2 Port Lan ความเร็ว 10/100Mbps รองรับ POE ใช้ไฟ 13W (802.3af)\n• เหมาะสำหรับงานหอพัก, โรงแรมที่ต้องการอุปกรณ์ Access Point ราคาประหยัด',
    specs: 'มาตรฐาน Wi-Fi: WiFi 5 (802.11ac)\nความเร็วไร้สายสูงสุด: AC1300 (Up to 1.3Gbps)\nMIMO: 2x2 MIMO\nผู้ใช้งานที่แนะนำ: 20 Devices\nพื้นที่ครอบคลุม: 50 sqm\nย่านความถี่: Dual-band 2.4 / 5 GHz\nManagement: Cloud Managed / Controller / Standalone\nพอร์ต LAN: 1x 100Mbps\nการติดตั้ง: Indoor Ceiling / Wall\nPower: 12 VDC / PoE (802.3af)\nWarranty: รับประกันศูนย์ประเทศไทย 3 ปี',
    tags: ['WiFi 5', 'Ceiling', 'Cloud Managed', 'PoE'], visible: true,
  },
  {
    id: 'rg-rap2260', sku: 'RG-RAP2260(G)', model: 'RG-RAP2260(G)',
    brand: 'Reyee', brandFull: 'Ruijie Networks', cat: 'Access Point',
    name: 'RG-RAP2260(G) Reyee Wi-Fi 6 Ceiling Access Point AX1800 Dual Band',
    price: 2890, badge: 'New', rating: 4.8, reviews: 12, images: [],
    short: 'Reyee RG-RAP2260(G) Wi-Fi 6 AX1800 Ceiling AP ความเร็วสูงสุด 1.775Gbps · Gigabit Port · รองรับ Ruijie Cloud Managed',
    details: '• Wi-Fi 6 (802.11ax) มาตรฐานใหม่ล่าสุด\n• ความเร็วสูงสุด 1.775Gbps (574+1201 Mbps)\n• 1x Gigabit Ethernet Port (10/100/1000)\n• รองรับ PoE 802.3at (PoE+)\n• ผู้ใช้งานที่แนะนำ 30+ devices\n• Cloud Managed ผ่าน Ruijie Cloud',
    specs: 'มาตรฐาน Wi-Fi: WiFi 6 (802.11ax)\nความเร็วไร้สายสูงสุด: AX1800 (Up to 1.775Gbps)\nMIMO: 2x2 MU-MIMO + OFDMA\nผู้ใช้งานที่แนะนำ: 30 Devices\nพื้นที่ครอบคลุม: 80 sqm\nย่านความถี่: Dual-band 2.4 / 5 GHz\nManagement: Cloud Managed / Controller / Standalone\nพอร์ต LAN: 1x Gigabit\nPower: 12VDC / PoE 802.3at\nWarranty: 3 ปี',
    tags: ['Wi-Fi 6', 'AX1800', 'Gigabit', 'Cloud'], visible: true,
  },
  {
    id: 'rg-rap1200f', sku: 'RG-RAP1200(F)', model: 'RG-RAP1200(F)',
    brand: 'Reyee', brandFull: 'Ruijie Networks', cat: 'Access Point',
    name: 'RG-RAP1200(F) Reyee Wireless Access Point N300 Wall Mount',
    price: 990, rating: 4.5, reviews: 8, images: [],
    short: 'Reyee RG-RAP1200(F) Wireless Access Point 802.11n 300Mbps · Wall Plate · เหมาะกับห้องพักโรงแรม',
    details: '• 802.11n 2.4GHz, 300Mbps\n• ติดตั้งแบบ Wall Plate (กล่อง switch มาตรฐาน)\n• 3 พอร์ต Ethernet ด้านล่าง (Pass-through)\n• PoE 802.3af\n• Cloud Managed',
    specs: 'มาตรฐาน: 802.11n (2.4GHz)\nความเร็ว: 300Mbps\nพอร์ต: 1 Uplink + 3 Downlink\nPower: PoE 802.3af\nWarranty: 3 ปี',
    tags: ['Wall Plate', 'PoE', 'Hotel'], visible: true,
  },
];

// ── EXPORT ──────────────────────────────────────────────────
window.BGS = {
  loadProducts,
  clearProductsCache,
  getCategories,
  getBrands,
  findProduct,
  MOCK_PRODUCTS,
  driveUrl,
};
