// ============================================================
//  BGS WEBSITE — Product Data Layer  v2
//  ดึงข้อมูลสินค้าจาก Google Sheets (CSV) + cache localStorage
// ============================================================

// ── 1. CONFIG ──────────────────────────────────────────────
const CSV_URL   = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBNJ_Y-rOU6R4dqcuipcEGNH5H_1nY0OGAquQ_jt6X7mTJaa235d51-KFCXmwposBI_cP6jHnutfEh/pub?output=csv';
const CACHE_KEY = 'bgs_products_v2';
const CACHE_TTL = 0; // 0 = ไม่ cache (dev) → เปลี่ยนเป็น 5 * 60 * 1000 (5 นาที) ตอน production

// ── 2. CSV PARSER ──────────────────────────────────────────
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

// ── 3. Google Drive URL → direct image URL ────────────────
function driveUrl(url) {
  if (!url) return '';
  url = url.trim();
  // รูปแบบ: https://drive.google.com/file/d/FILE_ID/view
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
  // รูปแบบ: https://drive.google.com/open?id=FILE_ID
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  return url; // ถ้าไม่ใช่ Drive link ส่งคืน URL เดิม
}

// ── 4. ROW → PRODUCT OBJECT ────────────────────────────────
//  รองรับทั้ง column ชื่อใหม่ (name, image, details)
//  และชื่อเก่า (name_th, image_1, desc_th) เพื่อ backward compat
function mapRow(r) {
  const name    = r.name    || r.name_th    || '';
  const image   = driveUrl(r.image || r.image_1 || '');
  const details = r.details || r.desc_th    || r.desc || '';
  const specs   = r.specs   || r.details    || '';

  return {
    id:      r.id       || '',
    name,
    model:   r.model    || '',
    brand:   r.brand    || '',
    cat:     r.category || r.cat || 'ทั่วไป',
    price:   r.price    || '0',
    image,
    details,
    specs,
    tags:    r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    visible: r.visible !== 'FALSE' && r.visible !== 'false' && r.visible !== '0',
  };
}

// ── 5. FETCH FROM SHEET ────────────────────────────────────
async function fetchFromSheet() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed (${res.status}) — ตรวจสอบว่า Sheet ถูก Publish แล้ว`);
  const text = await res.text();
  if (!text.trim()) throw new Error('Sheet ส่งข้อมูลว่างเปล่า — ตรวจสอบว่า Sheet มีข้อมูลและ Publish แล้ว');
  const rows = parseCSV(text);
  const objs = csvToObjects(rows);
  const products = objs.map(mapRow).filter(p => p.visible && p.name);
  return products;
}

// ── 6. PUBLIC API ──────────────────────────────────────────
async function loadProducts() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return data;
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
  console.log('[BGS] Products cache cleared.');
}
