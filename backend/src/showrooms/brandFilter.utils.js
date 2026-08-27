export const BRAND_KEYWORDS = {
  Toyota: ['toyota', 'auto2000', 'astra', 'trd'],
  Honda: ['honda'],
  Mitsubishi: ['mitsubishi'],
  Wuling: ['wuling'],
  Suzuki: ['suzuki'],
  Daihatsu: ['daihatsu'],
  Hyundai: ['hyundai'],
  Nissan: ['nissan'],
  BMW: ['bmw'],
  'Mercedes-Benz': ['mercedes', 'mercedes-benz', 'benz'],
};

export function normalizeBrand(brand) {
  return String(brand ?? '').trim();
}

export function getBrandKeywords(brand) {
  const normalized = normalizeBrand(brand);
  if (!normalized) return [];

  const direct = BRAND_KEYWORDS[normalized];
  if (direct) return direct;

  // fallback: pakai nama brand itu sendiri
  return [normalized.toLowerCase()];
}

export function inferBrandFromName(name) {
  const lower = String(name ?? '').toLowerCase();

  for (const [brand, keywords] of Object.entries(BRAND_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return brand;
    }
  }

  return null;
}

export function matchesBrand(item, brand) {
  const keywords = getBrandKeywords(brand);
  if (keywords.length === 0) return true;

  const haystack = `${item.name ?? ''} ${item.address ?? ''}`.toLowerCase();

  if (item.brand) {
    return normalizeBrand(item.brand).toLowerCase() === normalizeBrand(brand).toLowerCase();
  }

  return keywords.some((kw) => haystack.includes(kw));
}

export function filterShowroomsByBrand(items, brand) {
  if (!normalizeBrand(brand)) return items;
  return (items || []).filter((item) => matchesBrand(item, brand));
}