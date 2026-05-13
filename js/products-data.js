// ============================================================
//  BGS WEBSITE — Product Data Layer
//  ดึงข้อมูลสินค้าจาก Google Sheets (CSV) + cache localStorage
// ============================================================

// ── 1. CONFIG ──────────────────────────────────────────────
// CSV_URL: copy จาก File → Share → Publish to web → CSV
// (รูปแบบ .../pub?output=csv หรือ ...&sheet=Products)
const CSV_URL   = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBNJ_Y-rOU6R4dqcuipcEGNH5H_1nY0OGAquQ_jt6X7mTJaa235d51-KFCXmwposBI_cP6jHnutfEh/pub?output=csv';
const CACHE_KEY = 'bgs_products_v1';
const CACHE_TTL = 10 * 60 * 1000; // 10 นาที

// ── 2. CSV PARSER ──────────────────────────────────────────
function parseCSV(text) {
  const lines = [];
  let line = [];
  let field = '';
  let inQ = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

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

// ── 3. ROW → PRODUCT OBJECT ────────────────────────────────
function mapRow(r) {
  // รูปสินค้า: image_1 ถึง image_5
  const images = ['image_1','image_2','image_3','image_4','image_5']
    .map(k => r[k] || '')
    .filter(Boolean);

  // Spec: เก็บเป็น JSON string ใน Sheet เช่น {"Radio":"Wi-Fi 6","Speed":"5.4Gbps"}
  let specs = {};
  try { specs = r.specs ? JSON.parse(r.specs) : {}; } catch (e) {}

  return {
    id:      r.id      || '',
    name:    r.name_th || r.name || '',
    model:   r.model   || '',
    brand:   r.brand   || '',
    cat:     r.category    || 'all',
    subcat:  r.subcategory || '',
    price:   r.price   || '0',
    desc:    r.desc_th || r.desc || '',
    images,
    pdf:     r.pdf_url || '',
    specs,
    tags:    r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    visible: r.visible !== 'FALSE' && r.visible !== 'false' && r.visible !== '0',
  };
}

// ── 4. FETCH FROM SHEET ────────────────────────────────────
async function fetchFromSheet() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed (${res.status})`);
  const text = await res.text();
  const rows = parseCSV(text);
  const objs = csvToObjects(rows);
  return objs.map(mapRow).filter(p => p.visible && p.name);
}

// ── 5. PUBLIC API ──────────────────────────────────────────
async function loadProducts() {
  // ลอง cache ก่อน
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
  } catch (e) { /* storage full — ข้าม */ }

  return data;
}

// เคลียร์ cache เพื่อบังคับ reload (เรียกจาก console: clearProductsCache())
function clearProductsCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('[BGS] Products cache cleared.');
}
