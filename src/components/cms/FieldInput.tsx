'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowDown, ArrowUp, ChevronDown, ChevronRight, ImageIcon, Loader2, Plus, Search, Trash2, Upload, Wand2, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api, apiUpload, ApiRequestError, Paginated } from '@/lib/api';
import { Doc, emptyRecord, FieldDef, setIn, isWideField } from '@/lib/cms';
import { SeoPanel } from './SeoPanel';

export interface FieldProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  /** The whole record, for fields that read siblings (slug from title, SEO preview). */
  doc: Doc;
  resource: string;
}

const inputClass = 'h-10 rounded-xl border-slate-200 bg-white focus-visible:border-violet-400 focus-visible:ring-violet-400/20';

/** Label, help text, character counter and error around an input. */
export function FieldShell({ field, error, count, children }: { field: FieldDef; error?: string; count?: number; children: React.ReactNode }) {
  const over = field.max !== undefined && count !== undefined && count > field.max;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-semibold text-slate-700">
          {field.label}
          {field.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {count !== undefined && field.max !== undefined && (
          <span className={`text-[11px] tabular-nums ${over ? 'font-semibold text-red-600' : 'text-slate-400'}`}>
            {count}/{field.max}
          </span>
        )}
      </div>
      {children}
      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : field.help ? <p className="text-[12px] text-slate-500">{field.help}</p> : null}
    </div>
  );
}

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 150);

// ── Simple inputs ───────────────────────────────────────────────────────

function TextInput({ field, value, onChange, error, doc }: FieldProps) {
  const str = (value as string) ?? '';
  const type = field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text';
  return (
    <FieldShell field={field} error={error} count={field.type === 'text' ? str.length : undefined}>
      <div className="flex gap-2">
        <Input
          type={type}
          value={field.type === 'date' ? str.slice(0, 10) : str}
          placeholder={field.placeholder ?? (field.type === 'icon' ? 'e.g. Code2' : undefined)}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} ${field.type === 'slug' ? 'font-mono text-[13px]' : ''}`}
        />
        {field.type === 'slug' && field.from && (
          <Button type="button" variant="outline" className="h-10 shrink-0 rounded-xl" onClick={() => onChange(slugify(String(doc[field.from!] ?? '')))}>
            <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Generate
          </Button>
        )}
      </div>
    </FieldShell>
  );
}

function TextareaInput({ field, value, onChange, error }: FieldProps) {
  const str = (value as string) ?? '';
  return (
    <FieldShell field={field} error={error} count={str.length}>
      <Textarea rows={field.rows ?? 3} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className="rounded-xl border-slate-200 bg-white focus-visible:border-violet-400 focus-visible:ring-violet-400/20" />
    </FieldShell>
  );
}

function NumberInput({ field, value, onChange, error }: FieldProps) {
  return (
    <FieldShell field={field} error={error}>
      <Input
        type="number"
        value={value === null || value === undefined ? '' : String(value)}
        min={field.min}
        max={field.max}
        step="any"
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={`${inputClass} max-w-[200px]`}
      />
    </FieldShell>
  );
}

function BooleanInput({ field, value, onChange }: FieldProps) {
  const on = Boolean(value);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-violet-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
      <span>
        <span className="block text-[13px] font-semibold text-slate-700">{field.label}</span>
        {field.help && <span className="block text-[12px] text-slate-500">{field.help}</span>}
      </span>
    </label>
  );
}

function SelectInput({ field, value, onChange, error }: FieldProps) {
  return (
    <FieldShell field={field} error={error}>
      <select
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
      >
        {!field.required && <option value="">— None —</option>}
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

// ── Markdown ────────────────────────────────────────────────────────────

/** Minimal preview of the Markdown subset the website renders (## / ### / - / ``` / ** / `). */
function renderMarkdownPreview(md: string) {
  const html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/```[a-z]*\n([\s\S]*?)```/g, (_m, code) => `<pre class="rounded-lg bg-slate-900 p-3 text-xs text-slate-100 overflow-x-auto">${code}</pre>`)
    .replace(/^### (.*)$/gm, '<h3 class="mt-4 text-base font-semibold">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="mt-5 text-lg font-bold">$1</h2>')
    .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 text-violet-700">$1</code>')
    .replace(/\n{2,}/g, '<br/><br/>');
  return { __html: html };
}

function MarkdownInput({ field, value, onChange, error }: FieldProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const str = (value as string) ?? '';
  const words = str.split(/\s+/).filter(Boolean).length;
  return (
    <FieldShell field={field} error={error}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-2 py-1.5">
          <div className="flex gap-1">
            {(['write', 'preview'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-lg px-3 py-1 text-[12px] font-semibold capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                {t}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400">
            {words} words · ~{Math.max(1, Math.round(words / 220))} min read · ## heading, - list, **bold**, ```code```
          </span>
        </div>
        {tab === 'write' ? (
          <textarea value={str} onChange={(e) => onChange(e.target.value)} rows={22} className="block w-full resize-y p-4 font-mono text-[13px] leading-relaxed outline-none" />
        ) : (
          <div className="prose-sm max-h-[560px] overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-700" dangerouslySetInnerHTML={renderMarkdownPreview(str)} />
        )}
      </div>
    </FieldShell>
  );
}

// ── Image (upload or URL) ───────────────────────────────────────────────

export function ImageInput({ field, value, onChange, error, resource }: Pick<FieldProps, 'field' | 'value' | 'onChange' | 'error' | 'resource'>) {
  const url = (value as string) ?? '';
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) return toast.error('Image is larger than 10 MB.');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', resource);
      const media = await apiUpload<{ url: string }>('/media', form);
      onChange(media.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <FieldShell field={field} error={error}>
      <div className="flex gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Input value={url} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} className={inputClass} />
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" className="rounded-lg" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
              Upload
            </Button>
            {url && (
              <Button type="button" variant="ghost" size="sm" className="rounded-lg text-red-600 hover:bg-red-50" onClick={() => onChange('')}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </FieldShell>
  );
}

// ── String list (tags) ──────────────────────────────────────────────────

function StringListInput({ field, value, onChange, error }: FieldProps) {
  const items = (value as string[]) ?? [];
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft('');
  };
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <FieldShell field={field} error={error}>
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-2">
        {items.map((item, i) => (
          <div key={i} className="group flex items-center gap-2">
            <Input value={item} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className="h-9 rounded-lg border-slate-200" />
            <div className="flex shrink-0 opacity-60 group-hover:opacity-100">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-600" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder="Type and press Enter…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            className="h-9 rounded-lg border-dashed border-slate-300"
          />
          <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" onClick={add}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </FieldShell>
  );
}

// ── Repeatable groups ───────────────────────────────────────────────────

function ListInput({ field, value, onChange, error, doc, resource }: FieldProps) {
  const rows = (value as Doc[]) ?? [];
  const [open, setOpen] = useState<number | null>(null);
  const sub = field.of ?? [];
  const labelOf = (row: Doc, i: number) => String((field.itemLabel && row[field.itemLabel]) || row[sub[0]?.key] || `Item ${i + 1}`);

  const move = (i: number, d: number) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    setOpen(open === i ? i + d : open);
  };

  return (
    <FieldShell field={field} error={error}>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                {open === i ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                <span className="font-mono text-[11px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate text-[13px] font-medium text-slate-800">{labelOf(row, i)}</span>
              </button>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => { onChange(rows.filter((_, j) => j !== i)); setOpen(null); }} className="p-1 text-slate-400 hover:text-red-600" aria-label="Remove item"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {open === i && (
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 border-t border-slate-100 bg-slate-50/50 p-4 md:grid-cols-2">
                {sub.map((sf) => (
                  <div key={sf.key} className={isWideField(sf) ? 'md:col-span-2' : ''}>
                    <FieldInput field={sf} value={row[sf.key]} doc={doc} resource={resource} onChange={(v) => onChange(setIn(rows, [i, sf.key], v))} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-dashed"
          onClick={() => {
            const row = emptyRecord(sub);
            if ('step' in row) row.step = rows.length + 1;
            onChange([...rows, row]);
            setOpen(rows.length);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add {field.label.replace(/s$/, '').toLowerCase()}
        </Button>
      </div>
    </FieldShell>
  );
}

function ObjectInput({ field, value, onChange, error, doc, resource }: FieldProps) {
  const obj = (value as Doc) ?? {};
  return (
    <fieldset className="grid grid-cols-1 gap-x-5 gap-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
      <legend className="px-1 text-[13px] font-semibold text-slate-700">{field.label}</legend>
      {error && <p className="text-[12px] font-medium text-red-600 md:col-span-2">{error}</p>}
      {(field.of ?? []).map((sf) => (
        <div key={sf.key} className={isWideField(sf) ? 'md:col-span-2' : ''}>
          <FieldInput field={sf} value={obj[sf.key]} doc={doc} resource={resource} onChange={(v) => onChange({ ...obj, [sf.key]: v })} />
        </div>
      ))}
    </fieldset>
  );
}

// ── References (related items) ──────────────────────────────────────────

interface RefOption {
  slug: string;
  title?: string;
  name?: string;
  needTitle?: string;
}
const refLabel = (o: RefOption) => o.title || o.name || o.slug;

function RefsInput({ field, value, onChange, error }: FieldProps) {
  const slugs = (value as string[]) ?? [];
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<RefOption[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});

  // Titles for the already-selected slugs.
  useEffect(() => {
    if (!field.resource) return;
    let alive = true;
    api<Paginated<RefOption>>(`/${field.resource}`, { query: { limit: 200, view: 'summary' } })
      .then((d) => alive && setLabels(Object.fromEntries(d.items.map((o) => [o.slug, refLabel(o)]))))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [field.resource]);

  useEffect(() => {
    if (!field.resource || !query.trim()) return;
    let alive = true;
    const t = setTimeout(() => {
      api<Paginated<RefOption>>(`/${field.resource}`, { query: { search: query.trim(), limit: 10, view: 'summary' } })
        .then((d) => alive && setOptions(d.items))
        .catch(() => {});
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, field.resource]);

  const add = (o: RefOption) => {
    if (!slugs.includes(o.slug)) onChange([...slugs, o.slug]);
    setLabels((l) => ({ ...l, [o.slug]: refLabel(o) }));
    setQuery('');
    setOptions([]);
  };
  const move = (i: number, d: number) => {
    const next = [...slugs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <FieldShell field={field} error={error}>
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-2">
        {slugs.map((s, i) => (
          <div key={s} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">
              {labels[s] ?? s}
              <span className="ml-2 font-mono text-[11px] text-slate-400">{s}</span>
            </span>
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button type="button" disabled={i === slugs.length - 1} onClick={() => move(i, 1)} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => onChange(slugs.filter((x) => x !== s))} className="p-1 text-slate-400 hover:text-red-600" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${field.resource} to add…`} className="h-9 rounded-lg border-dashed border-slate-300 pl-8" />
          {query.trim() && options.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {options.map((o) => (
                <button key={o.slug} type="button" onClick={() => add(o)} disabled={slugs.includes(o.slug)} className="block w-full px-3 py-2 text-left text-[13px] hover:bg-violet-50 disabled:opacity-40">
                  {refLabel(o)} <span className="font-mono text-[11px] text-slate-400">{o.slug}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </FieldShell>
  );
}

/** Renders the right input for a CMS field definition. */
export function FieldInput(props: FieldProps) {
  switch (props.field.type) {
    case 'textarea':
      return <TextareaInput {...props} />;
    case 'markdown':
      return <MarkdownInput {...props} />;
    case 'number':
      return <NumberInput {...props} />;
    case 'boolean':
      return <BooleanInput {...props} />;
    case 'select':
      return <SelectInput {...props} />;
    case 'image':
      return <ImageInput {...props} />;
    case 'stringList':
      return <StringListInput {...props} />;
    case 'list':
      return <ListInput {...props} />;
    case 'object':
      return <ObjectInput {...props} />;
    case 'refs':
      return <RefsInput {...props} />;
    case 'seo':
      return <SeoPanel {...props} />;
    default:
      return <TextInput {...props} />;
  }
}
