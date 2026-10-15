// Types and helpers for the schema-driven CMS screens. Content type
// definitions come from the API (GET /content-types), so adding a field in
// twh_backend/src/content/*.ts automatically adds it to these forms.

export type FieldType =
  | 'text' | 'textarea' | 'markdown' | 'number' | 'boolean' | 'select' | 'slug' | 'url' | 'email'
  | 'image' | 'icon' | 'date' | 'stringList' | 'list' | 'object' | 'refs' | 'seo';

export interface FieldDef {
  key: string;
  type: FieldType;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  group?: string;
  options?: { value: string; label: string }[];
  from?: string;
  resource?: string;
  itemLabel?: string;
  rows?: number;
  max?: number;
  min?: number;
  of?: FieldDef[];
}

export interface ContentTypeDef {
  resource: string;
  kind: 'collection' | 'singleton';
  label: string;
  labelPlural: string;
  description?: string;
  titleField: string;
  slugField: string | null;
  summaryField?: string;
  imageField?: string;
  listColumns: string[];
  hasPublicPage: boolean;
  fields: FieldDef[];
}

export type Doc = Record<string, unknown>;

// Wide inputs take a full form row; short ones sit two per row.
const WIDE_TYPES = new Set<FieldType>(['textarea', 'markdown', 'list', 'object', 'stringList', 'refs', 'seo', 'image']);
export const isWideField = (f: FieldDef) => WIDE_TYPES.has(f.type);

/** "Blog post" → "blog post", but acronyms stay: "FAQ" → "FAQ". */
export const lowerLabel = (label: string) => label.split(' ').map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase())).join(' ');

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thewebhero.in').replace(/\/+$/, '');

/** Where a record lives on the website (mirrors publicPath in the backend content modules). */
export function publicPath(resource: string, doc: Doc): string | null {
  const slug = doc.slug as string | undefined;
  if (resource === 'seo-pages') return (doc.path as string) || null;
  if (!slug) return null;
  const prefixes: Record<string, string> = {
    services: '/services/',
    solutions: '/solutions/',
    technologies: '/technologies/',
    industries: '/industries/',
    portfolio: '/portfolio/',
    blog: '/blog/',
    team: '/company/team/',
    careers: '/company/careers/',
  };
  if (resource === 'locations') return doc.type ? `/locations/${doc.type}/${slug}` : null;
  return prefixes[resource] ? `${prefixes[resource]}${slug}` : null;
}

/** Empty value for a field, used for new records and new list rows. */
export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case 'boolean':
      return false;
    case 'number':
      return null;
    case 'stringList':
    case 'list':
    case 'refs':
      return [];
    case 'object':
      return emptyRecord(field.of ?? []);
    case 'seo':
      return {};
    case 'select':
      return field.key === 'status' ? 'draft' : field.required ? field.options?.[0]?.value ?? '' : '';
    default:
      return '';
  }
}

export function emptyRecord(fields: FieldDef[]): Doc {
  return Object.fromEntries(fields.map((f) => [f.key, emptyValue(f)]));
}

/** Immutable set by path, e.g. setIn(doc, ['seo', 'title'], 'x'). */
export function setIn(obj: unknown, path: (string | number)[], value: unknown): unknown {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[head as number] = setIn(copy[head as number], rest, value);
    return copy;
  }
  const base = (obj && typeof obj === 'object' ? obj : {}) as Doc;
  return { ...base, [head]: setIn(base[head as string], rest, value) };
}

/** Fields the API owns and that must not be sent back on save. */
const SERVER_FIELDS = ['_id', 'id', 'createdAt', 'updatedAt', 'key'];
export function toPayload(doc: Doc): Doc {
  const out = { ...doc };
  for (const k of SERVER_FIELDS) delete out[k];
  return out;
}

// ── SEO scoring (shared by the editor and the SEO Center) ─────────────────

export interface SeoValue {
  title?: string;
  description?: string;
  focusKeyword?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: string;
}

export interface SeoCheck {
  level: 'good' | 'warn' | 'bad';
  message: string;
}

/** Checks in the spirit of Yoast/RankMath. Content title/summary are the fallbacks the site uses. */
export function analyseSeo(input: { seo?: SeoValue; title?: string; summary?: string; slug?: string; body?: string }): { checks: SeoCheck[]; score: number } {
  const seo = input.seo ?? {};
  const title = (seo.title || input.title || '').trim();
  const description = (seo.description || input.summary || '').trim();
  const kw = (seo.focusKeyword ?? '').trim().toLowerCase();
  const checks: SeoCheck[] = [];

  if (seo.noindex) checks.push({ level: 'bad', message: 'Hidden from search engines (noindex is on).' });

  if (!seo.title) checks.push({ level: 'warn', message: 'No custom meta title — the page title is used.' });
  if (title.length < 30) checks.push({ level: 'bad', message: `Title is too short (${title.length} chars). Aim for 50–60.` });
  else if (title.length > 60) checks.push({ level: 'warn', message: `Title is ${title.length} chars — Google may cut it after ~60.` });
  else checks.push({ level: 'good', message: `Title length is good (${title.length} chars).` });

  if (!description) checks.push({ level: 'bad', message: 'No meta description.' });
  else if (description.length < 110) checks.push({ level: 'warn', message: `Description is short (${description.length} chars). Aim for 140–160.` });
  else if (description.length > 160) checks.push({ level: 'warn', message: `Description is ${description.length} chars — Google may cut it after ~160.` });
  else checks.push({ level: 'good', message: `Description length is good (${description.length} chars).` });

  if (!kw) {
    checks.push({ level: 'warn', message: 'No focus keyword set.' });
  } else {
    const kwSlug = kw.replace(/[^a-z0-9]+/g, '-');
    checks.push(title.toLowerCase().includes(kw) ? { level: 'good', message: 'Focus keyword appears in the title.' } : { level: 'bad', message: 'Focus keyword is missing from the title.' });
    checks.push(description.toLowerCase().includes(kw) ? { level: 'good', message: 'Focus keyword appears in the description.' } : { level: 'warn', message: 'Focus keyword is missing from the description.' });
    if (input.slug !== undefined) {
      checks.push((input.slug ?? '').includes(kwSlug) ? { level: 'good', message: 'Focus keyword appears in the URL.' } : { level: 'warn', message: 'Focus keyword is not in the URL slug.' });
    }
    if (input.body) {
      checks.push(input.body.toLowerCase().includes(kw) ? { level: 'good', message: 'Focus keyword appears in the content.' } : { level: 'warn', message: 'Focus keyword does not appear in the content.' });
    }
  }

  checks.push(seo.ogImage ? { level: 'good', message: 'Custom social share image set.' } : { level: 'good', message: 'Branded share image is generated from the title.' });

  const weight = { good: 1, warn: 0.5, bad: 0 };
  const score = checks.length ? Math.round((checks.reduce((n, c) => n + weight[c.level], 0) / checks.length) * 100) : 0;
  return { checks, score: seo.noindex ? Math.min(score, 40) : score };
}

export const scoreTone = (score: number) => (score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad');
