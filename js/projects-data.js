// ============================================================
//  BGS WEBSITE - Projects Data Layer
//  Reads project portfolio data from Google Sheets CSV.
// ============================================================

const PROJECTS_CFG = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
const PROJECTS_CSV_URL = PROJECTS_CFG.projectsCsvUrl || '';
const PROJECTS_CACHE_TTL = (PROJECTS_CFG.cacheTtl !== undefined) ? PROJECTS_CFG.cacheTtl : 5 * 60 * 1000;
const PROJECTS_CACHE_KEY = `bgs_projects_v4_${PROJECTS_CSV_URL ? PROJECTS_CSV_URL.split('/').slice(-2, -1)[0]?.slice(-12) : 'demo'}`;

function parseProjectsCSV(text) {
  const lines = [];
  let line = [];
  let field = '';
  let inQ = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQ && next === '"') {
        field += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      line.push(field);
      field = '';
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQ) {
      if (ch === '\r') i++;
      line.push(field);
      field = '';
      if (line.some(f => f.trim())) lines.push(line);
      line = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field || line.length) {
    line.push(field);
    if (line.some(f => f.trim())) lines.push(line);
  }

  return lines;
}

function projectsCsvToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || '').trim();
    });
    return obj;
  });
}

function projectDriveUrl(url, width = 1200) {
  if (!url) return '';
  const raw = String(url).trim();
  const m1 = raw.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return `https://lh3.googleusercontent.com/d/${m1[1]}=w${width}`;
  const m2 = raw.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}=w${width}`;
  return raw;
}

function slugifyProject(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
    .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
}

function splitProjectList(value) {
  return String(value || '')
    .split(/\s*[|,]\s*/)
    .map(item => item.trim())
    .filter(Boolean);
}

function mapProjectRow(r, index) {
  const title = r.title || r.project_name || r.name || '';
  const slug = r.slug || r.id || slugifyProject(title);
  const images = [];

  for (let i = 1; i <= 20; i++) {
    const src = projectDriveUrl(r[`image_${i}`] || r[`image${i}`] || '', 1400);
    if (src) images.push(src);
  }

  splitProjectList(r.gallery || r.images).forEach(src => {
    const img = projectDriveUrl(src, 1400);
    if (img) images.push(img);
  });

  const cover = projectDriveUrl(r.cover || r.cover_image || r.image || '', 1400) || images[0] || '';
  const galleryImages = images.filter((src, i) => src && src !== cover && images.indexOf(src) === i);

  const services = splitProjectList(r.services || r.scope || r.work_scope);
  const tags = splitProjectList(r.tags || r.categories);
  const sortOrder = Number(r.sort_order || r.order || r.no || index + 1) || index + 1;
  const visible = !['false', '0', 'no', 'hidden'].includes(String(r.visible || r.publish || 'true').toLowerCase());
  const featured = ['true', '1', 'yes', 'featured'].includes(String(r.featured || '').toLowerCase());

  return {
    id: slug,
    slug,
    title,
    client: r.client || r.customer || '',
    location: r.location || '',
    year: r.year || r.project_year || '',
    category: r.category || r.type || 'IT Solution',
    summary: r.summary || r.short || r.description_short || '',
    detailTitle: r.detail_title || r.title_bar || r.bar_title || r.project_detail_title || '',
    description: r.description || r.details || '',
    solution: r.solution || r.result || '',
    cover,
    images: galleryImages,
    services,
    tags,
    featured,
    sortOrder,
    visible,
  };
}

async function fetchProjectsFromSheet() {
  if (!PROJECTS_CSV_URL) return MOCK_PROJECTS;
  const sep = PROJECTS_CSV_URL.includes('?') ? '&' : '?';
  const res = await fetch(`${PROJECTS_CSV_URL}${sep}_t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Projects sheet fetch failed (${res.status})`);
  const text = await res.text();
  const rows = parseProjectsCSV(text);
  return projectsCsvToObjects(rows)
    .map(mapProjectRow)
    .filter(project => project.visible && project.title)
    .sort((a, b) => a.sortOrder - b.sortOrder || String(b.year).localeCompare(String(a.year), 'th'));
}

async function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (PROJECTS_CACHE_TTL > 0 && Date.now() - ts < PROJECTS_CACHE_TTL) return data;
    }
  } catch (e) {
    // Ignore cache errors.
  }

  let data;
  try {
    data = await fetchProjectsFromSheet();
  } catch (e) {
    console.warn('[BGS] Projects sheet unavailable, using demo data.', e);
    data = MOCK_PROJECTS;
  }

  try {
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {
    // Storage may be unavailable or full.
  }

  return data;
}

function findProject(projects, id) {
  if (!id) return null;
  const needle = decodeURIComponent(String(id)).toLowerCase();
  return projects.find(project =>
    project.slug.toLowerCase() === needle ||
    project.id.toLowerCase() === needle ||
    project.title.toLowerCase() === needle
  ) || null;
}

function clearProjectsCache() {
  localStorage.removeItem(PROJECTS_CACHE_KEY);
  location.reload();
}

const MOCK_PROJECTS = [
  {
    id: 'dib-bangkok',
    slug: 'dib-bangkok',
    title: 'Dib Bangkok',
    cover: 'images/building-pic.png',
    images: ['images/building-pic.png', 'images/customers/1.reignwoordpark.png', 'images/customers/2.mofa.png', 'images/customers/3.bsm.png'],
    sortOrder: 1,
    visible: true,
  },
  {
    id: 'klong-sam-wa-hospital',
    slug: 'klong-sam-wa-hospital',
    title: 'Klong Sam Wa Hospital',
    cover: 'images/customers/22.jpg',
    images: ['images/customers/22.jpg', 'images/customers/23.png', 'images/customers/24.png', 'images/customers/25.jpg'],
    sortOrder: 2,
    visible: true,
  },
  {
    id: 'siam-patumwan',
    slug: 'siam-patumwan',
    title: 'Siam Patumwan',
    cover: 'images/customers/26.jpg',
    images: ['images/customers/26.jpg', 'images/customers/27.png', 'images/customers/28.png', 'images/customers/29.jpg'],
    sortOrder: 3,
    visible: true,
  },
  {
    id: 'one-city-centre',
    slug: 'one-city-centre',
    title: 'ONE CITY CENTRE (OCC)',
    cover: 'images/customers/30.png',
    images: ['images/customers/30.png', 'images/customers/31.png', 'images/customers/32.png', 'images/customers/33.png'],
    sortOrder: 4,
    visible: true,
  },
  {
    id: 'paolo-hospital',
    slug: 'paolo-hospital',
    title: 'Paolo Hospital',
    cover: 'images/customers/34.png',
    images: ['images/customers/34.png', 'images/customers/35.png', 'images/customers/36.png', 'images/customers/37.png'],
    sortOrder: 5,
    visible: true,
  },
  {
    id: 'office-renovation',
    slug: 'office-renovation',
    title: 'Office Renovation',
    cover: 'images/customers/38.png',
    images: ['images/customers/38.png', 'images/customers/39.png', 'images/customers/40.jpg', 'images/customers/41.png'],
    sortOrder: 6,
    visible: true,
  },
  {
    id: 'jcb-building',
    slug: 'jcb-building',
    title: 'JCB Building',
    cover: 'images/customers/42.png',
    images: ['images/customers/42.png', 'images/customers/43.png', 'images/customers/44.png', 'images/customers/45.jpg'],
    sortOrder: 7,
    visible: true,
  },
  {
    id: 'flagship-branch',
    slug: 'flagship-branch',
    title: 'Flagship Branch',
    cover: 'images/customers/46.png',
    images: ['images/customers/46.png', 'images/customers/47.png', 'images/customers/48.png', 'images/customers/49.png'],
    sortOrder: 8,
    visible: true,
  },
];
