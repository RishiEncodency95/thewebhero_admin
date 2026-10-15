'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Globe, Loader2, Sparkles, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api, ApiRequestError } from '@/lib/api';
import { analyseSeo, Doc, publicPath, scoreTone, SeoValue, SITE_URL } from '@/lib/cms';
import { FieldShell, ImageInput, type FieldProps } from './FieldInput';

/** Text the website falls back to when the SEO fields are empty. */
function fallbacks(doc: Doc) {
  const title = String(doc.title ?? doc.name ?? doc.label ?? doc.needTitle ?? '');
  const summary = String(doc.shortDescription ?? doc.excerpt ?? doc.description ?? doc.bio ?? '');
  const body = String(doc.content ?? doc.description ?? doc.overview ?? '');
  return { title, summary, body };
}

const TONE = {
  good: { ring: 'ring-emerald-200 bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', Icon: CheckCircle2 },
  warn: { ring: 'ring-amber-200 bg-amber-50 text-amber-700', bar: 'bg-amber-500', Icon: AlertTriangle },
  bad: { ring: 'ring-red-200 bg-red-50 text-red-700', bar: 'bg-red-500', Icon: XCircle },
};

function Counter({ value, ideal }: { value: string; ideal: [number, number] }) {
  const n = value.length;
  const tone = n === 0 ? 'text-slate-400' : n < ideal[0] ? 'text-amber-600' : n > ideal[1] ? 'text-red-600' : 'text-emerald-600';
  return (
    <span className={`text-[11px] font-semibold tabular-nums ${tone}`}>
      {n} / {ideal[0]}–{ideal[1]}
    </span>
  );
}

/**
 * Full on-page SEO editor: Google preview, social preview, score with checks,
 * meta tags, focus keyword, canonical, robots and custom JSON-LD, plus AI suggestions.
 */
export function SeoPanel({ value, onChange, doc, resource, error }: FieldProps) {
  const seo = (value as SeoValue) ?? {};
  const set = (patch: Partial<SeoValue>) => onChange({ ...seo, ...patch });
  const [generating, setGenerating] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fb = fallbacks(doc);
  const path = publicPath(resource, doc) ?? '/';
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const shownTitle = seo.title || (fb.title ? `${fb.title} | TheWebHero` : 'Page title');
  const shownDescription = seo.description || fb.summary || 'Add a meta description that makes people want to click.';
  const { checks, score } = analyseSeo({ seo, title: fb.title, summary: fb.summary, slug: doc.slug as string | undefined, body: fb.body });
  const tone = TONE[scoreTone(score)];

  const suggest = async () => {
    if (!fb.title) return toast.error('Add a title first, then generate SEO.');
    setGenerating(true);
    try {
      const s = await api<{ focusKeyword: string; seoTitle: string; seoDescription: string; keywords: string[]; ogImageAlt: string }>('/seo/suggest', {
        method: 'POST',
        body: {
          title: fb.title,
          content: `${fb.summary}\n\n${fb.body}`.slice(0, 15000),
          slug: typeof doc.slug === 'string' && doc.slug ? doc.slug : undefined,
          path,
          pageType: resource,
        },
      });
      set({ title: s.seoTitle, description: s.seoDescription, focusKeyword: s.focusKeyword || seo.focusKeyword, keywords: s.keywords, ogImageAlt: seo.ogImageAlt || s.ogImageAlt });
      toast.success('AI suggestion applied — review it before saving.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not generate SEO. Is an AI key configured on the server?');
    } finally {
      setGenerating(false);
    }
  };

  const card = 'rounded-2xl border border-slate-200 bg-white p-5';

  return (
    <div className="space-y-5">
      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-[13px] font-medium text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Previews */}
        <div className="space-y-5 xl:col-span-3">
          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Google preview</p>
              <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={suggest} disabled={generating}>
                {generating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5 text-violet-600" />}
                Suggest with AI
              </Button>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-[12px] text-slate-600">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                </span>
                <span className="truncate">{url.replace(/^https?:\/\//, '').replace(/\//g, ' › ')}</span>
              </div>
              <p className="mt-1.5 line-clamp-1 text-[19px] leading-snug text-[#1a0dab]">{shownTitle}</p>
              <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-[#4d5156]">{shownDescription}</p>
            </div>
          </div>

          <div className={card}>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-500">Social share preview</p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex aspect-[1200/630] items-center justify-center bg-slate-100">
                {seo.ogImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seo.ogImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[12px] text-slate-400">Branded image generated from the title</span>
                )}
              </div>
              <div className="bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase text-slate-500">{SITE_URL.replace(/^https?:\/\//, '')}</p>
                <p className="line-clamp-1 text-[14px] font-semibold text-slate-900">{seo.ogTitle || shownTitle}</p>
                <p className="line-clamp-1 text-[12.5px] text-slate-500">{seo.ogDescription || shownDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className={`${card} self-start xl:sticky xl:top-20 xl:col-span-2`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ring-1 ${tone.ring}`}>{score}</div>
            <div>
              <p className="text-[15px] font-semibold text-slate-900">SEO score</p>
              <p className="text-[12.5px] text-slate-500">Fix the red and amber items to rank better.</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score}%` }} />
          </div>
          <ul className="mt-4 space-y-2.5">
            {checks.map((c) => {
              const t = TONE[c.level];
              return (
                <li key={c.message} className="flex gap-2 text-[13px] text-slate-700">
                  <t.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c.level === 'good' ? 'text-emerald-500' : c.level === 'warn' ? 'text-amber-500' : 'text-red-500'}`} />
                  {c.message}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Meta fields */}
      <div className={`${card} space-y-5`}>
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Search engine</p>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-[13px] font-semibold text-slate-700">Meta title</label>
            <Counter value={seo.title ?? ''} ideal={[50, 60]} />
          </div>
          <Input value={seo.title ?? ''} placeholder={fb.title ? `${fb.title} | TheWebHero` : ''} onChange={(e) => set({ title: e.target.value })} className="h-10 rounded-xl" />
          <p className="text-[12px] text-slate-500">Leave empty to use the page title. Used exactly as written.</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-[13px] font-semibold text-slate-700">Meta description</label>
            <Counter value={seo.description ?? ''} ideal={[140, 160]} />
          </div>
          <Textarea rows={3} value={seo.description ?? ''} placeholder={fb.summary} onChange={(e) => set({ description: e.target.value })} className="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Focus keyword</label>
            <Input value={seo.focusKeyword ?? ''} placeholder="e.g. web development company in india" onChange={(e) => set({ focusKeyword: e.target.value })} className="h-10 rounded-xl" />
            <p className="text-[12px] text-slate-500">The main search phrase this page should rank for.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Keywords</label>
            <Input
              value={(seo.keywords ?? []).join(', ')}
              placeholder="comma, separated, keywords"
              onChange={(e) => set({ keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 20) })}
              className="h-10 rounded-xl"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700">Canonical URL</label>
          <Input value={seo.canonical ?? ''} placeholder={url} onChange={(e) => set({ canonical: e.target.value })} className="h-10 rounded-xl font-mono text-[13px]" />
          <p className="text-[12px] text-slate-500">Only set this if the same content lives at another URL.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {([
            ['noindex', 'Hide from search engines (noindex)', 'Google will not show this page.'],
            ['nofollow', "Don't follow links (nofollow)", 'Search engines ignore links on this page.'],
          ] as const).map(([key, label, help]) => (
            <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${seo[key] ? 'border-red-200 bg-red-50/60' : 'border-slate-200'}`}>
              <input type="checkbox" checked={Boolean(seo[key])} onChange={(e) => set({ [key]: e.target.checked })} className="mt-0.5 h-4 w-4 accent-violet-600" />
              <span>
                <span className="block text-[13px] font-semibold text-slate-700">{label}</span>
                <span className="block text-[12px] text-slate-500">{help}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Social */}
      <div className={`${card} space-y-5`}>
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Social sharing (Facebook, LinkedIn, WhatsApp, X)</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label className="text-[13px] font-semibold text-slate-700">Share title</label>
              <Counter value={seo.ogTitle ?? ''} ideal={[40, 70]} />
            </div>
            <Input value={seo.ogTitle ?? ''} placeholder={shownTitle} onChange={(e) => set({ ogTitle: e.target.value })} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Image alt text</label>
            <Input value={seo.ogImageAlt ?? ''} onChange={(e) => set({ ogImageAlt: e.target.value })} className="h-10 rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700">Share description</label>
          <Textarea rows={2} value={seo.ogDescription ?? ''} placeholder={shownDescription} onChange={(e) => set({ ogDescription: e.target.value })} className="rounded-xl" />
        </div>
        <ImageInput
          field={{ key: 'ogImage', type: 'image', label: 'Share image', help: '1200 × 630 px. Leave empty to use the site default.' }}
          value={seo.ogImage ?? ''}
          onChange={(v) => set({ ogImage: v as string })}
          resource={resource}
        />
      </div>

      {/* Schema */}
      <div className={card}>
        <FieldShell field={{ key: 'structuredData', type: 'textarea', label: 'Custom JSON-LD schema', help: 'Optional. Breadcrumb, Organization and page schema are added automatically — use this only for extra schema.org markup.' }} error={jsonError ?? undefined}>
          <Textarea
            rows={7}
            value={seo.structuredData ?? ''}
            placeholder='{"@context": "https://schema.org", "@type": "..."}'
            onChange={(e) => {
              const v = e.target.value;
              set({ structuredData: v });
              try {
                if (v.trim()) JSON.parse(v);
                setJsonError(null);
              } catch {
                setJsonError('This is not valid JSON yet.');
              }
            }}
            className="rounded-xl font-mono text-[12.5px]"
          />
        </FieldShell>
      </div>
    </div>
  );
}
