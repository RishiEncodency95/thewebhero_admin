'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, EyeOff, FileSearch, Gauge, Loader2, Search, Sparkles, Square, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { cardClass, EmptyState, ErrorBlock, errorMessage, rowClass, SearchBox, Segmented, StatTile, tdClass, thClass } from '@/components/admin/kit';
import { api, Paginated } from '@/lib/api';
import { analyseSeo, ContentTypeDef, Doc, publicPath, scoreTone, SeoCheck, SeoValue } from '@/lib/cms';
import { loadContentType } from '@/components/cms/useContentType';
import { useAuth } from '@/lib/auth';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/buttons';

interface AuditRow {
  resource: string;
  sectionLabel: string;
  id: string;
  title: string;
  path: string | null;
  status: string;
  score: number;
  issues: SeoCheck[];
  noindex: boolean;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
}

type Filter = 'all' | 'bad' | 'warn' | 'good';

const SCORE_STYLE = { good: 'bg-emerald-50 text-emerald-700 ring-emerald-200', warn: 'bg-amber-50 text-amber-700 ring-amber-200', bad: 'bg-red-50 text-red-700 ring-red-200' };

async function fetchAll(resource: string): Promise<Doc[]> {
  const out: Doc[] = [];
  for (let page = 1; ; page++) {
    const res = await api<Paginated<Doc>>(`/${resource}`, { query: { page, limit: 200 } });
    out.push(...res.items);
    if (page >= res.meta.totalPages) return out;
  }
}

function audit(def: ContentTypeDef, d: Doc): AuditRow {
  const seo = (d.seo ?? {}) as SeoValue;
  const title = String(d[def.titleField] ?? '');
  const { checks, score } = analyseSeo({
    seo,
    title,
    summary: def.summaryField ? String(d[def.summaryField] ?? '') : '',
    slug: typeof d.slug === 'string' ? d.slug : undefined,
  });
  return {
    resource: def.resource,
    sectionLabel: def.labelPlural,
    id: String(d.id ?? d._id),
    title: title || 'Untitled',
    path: publicPath(def.resource, d),
    status: String(d.status ?? 'published'),
    score,
    issues: checks.filter((c) => c.level !== 'good'),
    noindex: Boolean(seo.noindex),
    hasMetaTitle: Boolean(seo.title),
    hasMetaDescription: Boolean(seo.description),
  };
}

export default function SeoCenterPage() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<{ resource: string; label: string }[]>([]);
  const [section, setSection] = useState('all');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const defs = useRef(new Map<string, ContentTypeDef>());
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);
  const stopRef = useRef(false);
  const { can } = useAuth();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const types = await api<ContentTypeDef[]>('/content-types');
        const withSeo = types.filter((t) => t.kind === 'collection' && t.fields.some((f) => f.type === 'seo'));
        // Keep the definitions cached for the editor screens we link to.
        withSeo.forEach((t) => {
          loadContentType(t.resource);
          defs.current.set(t.resource, t);
        });
        const results = await Promise.all(withSeo.map(async (def) => (await fetchAll(def.resource)).map((d) => audit(def, d))));
        if (!alive) return;
        setSections(withSeo.map((t) => ({ resource: t.resource, label: t.labelPlural })));
        setRows(results.flat().sort((a, b) => a.score - b.score));
      } catch (err) {
        if (alive) setError(errorMessage(err, 'Could not run the SEO audit'));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const published = useMemo(() => rows?.filter((r) => r.status === 'published') ?? [], [rows]);
  const stats = useMemo(() => {
    if (!published.length) return null;
    return {
      average: Math.round(published.reduce((n, r) => n + r.score, 0) / published.length),
      needsWork: published.filter((r) => r.score < 50).length,
      missingDescription: published.filter((r) => !r.hasMetaDescription).length,
      noindex: published.filter((r) => r.noindex).length,
    };
  }, [published]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (section === 'all' || r.resource === section) &&
        (filter === 'all' || scoreTone(r.score) === filter) &&
        (!q || r.title.toLowerCase().includes(q) || (r.path ?? '').includes(q)),
    );
  }, [rows, section, filter, search]);

  // Generates and saves AI SEO for every visible page below 100, a few at a time.
  const optimize = async () => {
    const targets = visible.filter((r) => r.score < 100 && can(r.resource, 'update'));
    if (!targets.length) return toast.info('Every page in this view already scores 100.');
    if (!window.confirm(`Write SEO with AI for ${targets.length} page${targets.length > 1 ? 's' : ''}? Existing meta titles and descriptions on these pages are replaced.`)) return;
    stopRef.current = false;
    let done = 0;
    let failed = 0;
    setProgress({ done, total: targets.length, failed });
    const queue = [...targets];
    const worker = async (): Promise<void> => {
      const row = queue.shift();
      if (!row || stopRef.current) return;
      try {
        await api(`/seo/optimize/${row.resource}/${row.id}`, { method: 'POST' });
        const def = defs.current.get(row.resource);
        const fresh = await api<Doc>(`/${row.resource}/${row.id}`, { query: { populate: 'false' } });
        if (def) setRows((rs) => rs?.map((r) => (r.resource === row.resource && r.id === row.id ? audit(def, fresh) : r)) ?? rs);
      } catch {
        failed++;
      }
      done++;
      setProgress({ done, total: targets.length, failed });
      return worker();
    };
    await Promise.all([worker(), worker(), worker()]);
    toast.success(`SEO written for ${done - failed} page${done - failed === 1 ? '' : 's'}${failed ? ` · ${failed} failed` : ''}`);
    setProgress(null);
  };

  return (
    <div>
      <PageHeader
        title="SEO Center"
        description="Every page's meta title, description and search visibility in one place — worst scores first. Optimize with AI fills the SEO of every page in the current view; Fix opens one page's SEO tab."
        actions={
          <>
            <Link href="/dashboard/content/seo-pages">
              <Button variant="outline" className="h-10 rounded-xl px-4">
                <FileSearch className="mr-1.5 h-4 w-4" /> Static page SEO
              </Button>
            </Link>
            {progress ? (
              <Button variant="outline" className="h-10 rounded-xl px-4" onClick={() => (stopRef.current = true)}>
                <Square className="mr-1.5 h-4 w-4" /> Stop ({progress.done}/{progress.total})
              </Button>
            ) : (
              <Button className={`h-10 rounded-xl px-4 ${PRIMARY_BUTTON_CLASS}`} disabled={!rows} onClick={optimize}>
                <Sparkles className="mr-1.5 h-4 w-4" /> Optimize with AI
              </Button>
            )}
          </>
        }
      />

      {progress && (
        <div className={`mb-6 p-5 ${cardClass}`}>
          <div className="mb-2 flex items-center justify-between text-[13.5px]">
            <span className="flex items-center gap-2 font-semibold text-slate-800">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> Writing SEO with AI…
            </span>
            <span className="text-slate-500">
              {progress.done} of {progress.total}
              {progress.failed > 0 && <span className="text-red-600"> · {progress.failed} failed</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Average SEO score" value={stats ? `${stats.average}/100` : '—'} icon={Gauge} tone={stats ? (stats.average >= 80 ? 'emerald' : stats.average >= 50 ? 'amber' : 'rose') : 'violet'} hint="Published pages only" />
        <StatTile label="Need work (score < 50)" value={stats?.needsWork ?? '—'} icon={Wrench} tone="rose" />
        <StatTile label="No meta description" value={stats?.missingDescription ?? '—'} icon={AlertTriangle} tone="amber" hint="Falls back to the summary text" />
        <StatTile label="Hidden (noindex)" value={stats?.noindex ?? '—'} icon={EyeOff} tone="blue" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={section} onChange={(e) => setSection(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13.5px] font-medium text-slate-700 outline-none focus:border-violet-400">
          <option value="all">All sections</option>
          {sections.map((s) => (
            <option key={s.resource} value={s.resource}>{s.label}</option>
          ))}
        </select>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'bad', label: 'Poor' }, { value: 'warn', label: 'OK' }, { value: 'good', label: 'Good' }]}
        />
        <div className="ml-auto w-full sm:w-auto">
          <SearchBox value={search} onChange={setSearch} placeholder="Search title or URL…" />
        </div>
      </div>

      {error ? (
        <ErrorBlock message={error} />
      ) : !rows ? (
        <div className={`flex h-64 flex-col items-center justify-center gap-3 ${cardClass}`}>
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          <span className="text-[13px] text-slate-500">Auditing every page…</span>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={Search} message="Nothing matches these filters." />
      ) : (
        <div className={`overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className={thClass}>Score</th>
                  <th className={thClass}>Page</th>
                  <th className={thClass}>Section</th>
                  <th className={thClass}>Top issue</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.slice(0, 300).map((r) => (
                  <tr key={`${r.resource}/${r.id}`} className={rowClass}>
                    <td className={`${tdClass} w-20`}>
                      <span className={`inline-flex h-8 min-w-10 items-center justify-center rounded-lg px-2 text-[13px] font-bold ring-1 ${SCORE_STYLE[scoreTone(r.score)]}`}>{r.score}</span>
                    </td>
                    <td className={`${tdClass} max-w-[340px]`}>
                      <span className="block truncate font-semibold text-slate-900">{r.title}</span>
                      <span className="flex items-center gap-2 text-[12px]">
                        {r.path && <span className="truncate font-mono text-slate-400">{r.path}</span>}
                        {r.status !== 'published' && <span className="rounded bg-slate-100 px-1.5 text-[11px] font-semibold text-slate-500">Draft</span>}
                        {r.noindex && <span className="rounded bg-blue-50 px-1.5 text-[11px] font-semibold text-blue-600">noindex</span>}
                      </span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-slate-600`}>{r.sectionLabel}</td>
                    <td className={`${tdClass} max-w-[360px]`}>
                      {r.issues.length ? (
                        <span className="line-clamp-2 text-[13px] text-slate-600" title={r.issues.map((i) => i.message).join('\n')}>
                          {r.issues[0].message}
                          {r.issues.length > 1 && <span className="ml-1 text-slate-400">+{r.issues.length - 1} more</span>}
                        </span>
                      ) : (
                        <span className="text-[13px] text-emerald-600">All checks pass</span>
                      )}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <Link href={`/dashboard/content/${r.resource}/${r.id}?tab=SEO`} className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[13px] font-semibold text-violet-700 hover:bg-violet-50">
                        Fix <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visible.length > 300 && <p className="border-t border-slate-100 px-5 py-3 text-[12.5px] text-slate-500">Showing the 300 lowest scores — narrow the filters to see more.</p>}
        </div>
      )}
    </div>
  );
}
