'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, ExternalLink, Inbox, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/buttons';
import { api, ApiRequestError, Paginated } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { analyseSeo, ContentTypeDef, Doc, FieldDef, publicPath, scoreTone, SeoValue, SITE_URL, lowerLabel } from '@/lib/cms';
import { useContentType } from './useContentType';
import { PAGE_SIZE, Pagination } from '@/components/admin/kit';


const SCORE_STYLE = { good: 'bg-emerald-50 text-emerald-700 ring-emerald-200', warn: 'bg-amber-50 text-amber-700 ring-amber-200', bad: 'bg-red-50 text-red-700 ring-red-200' };

function Cell({ field, value }: { field?: FieldDef; value: unknown }) {
  if (field?.key === 'status') {
    const published = value === 'published';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ${published ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {published ? 'Published' : 'Draft'}
      </span>
    );
  }
  if (field?.type === 'boolean') return value ? <Check className="h-4 w-4 text-violet-600" /> : <span className="text-slate-300">—</span>;
  if (Array.isArray(value)) return <span className="text-slate-500">{value.length}</span>;
  if (field?.type === 'select') return <span className="text-slate-700">{field.options?.find((o) => o.value === value)?.label ?? String(value ?? '—')}</span>;
  if (field?.type === 'date' && value) return <span className="whitespace-nowrap text-slate-500">{new Date(String(value)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
  if (value === undefined || value === null || value === '') return <span className="text-slate-300">—</span>;
  return <span className="line-clamp-1 text-slate-700">{String(value)}</span>;
}

function ListTable({ def, items, onDelete, canDelete, canEdit }: { def: ContentTypeDef; items: Doc[]; onDelete: (d: Doc) => void; canDelete: boolean; canEdit: boolean }) {
  const router = useRouter();
  const byKey = new Map(def.fields.map((f) => [f.key, f]));
  const hasSeo = def.fields.some((f) => f.type === 'seo');
  const editHref = (d: Doc) => `/dashboard/content/${def.resource}/${d.id ?? d._id}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {def.listColumns.map((col, i) => (
                <th key={col} className={`h-11 px-4 ${i === 0 ? 'pl-5' : ''}`}>
                  {byKey.get(col)?.label ?? col}
                </th>
              ))}
              {hasSeo && <th className="h-11 px-4">SEO</th>}
              <th className="h-11 px-4 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((d) => {
              const path = publicPath(def.resource, d);
              const { score } = analyseSeo({
                seo: d.seo as SeoValue,
                title: String(d[def.titleField] ?? ''),
                summary: def.summaryField ? String(d[def.summaryField] ?? '') : '',
              });
              return (
                <tr key={String(d.id ?? d._id)} onClick={() => canEdit && router.push(editHref(d))} className={`h-[60px] ${canEdit ? 'cursor-pointer hover:bg-violet-50/40' : ''}`}>
                  {def.listColumns.map((col, i) => (
                    <td key={col} className={`max-w-[320px] px-4 ${i === 0 ? 'pl-5 font-semibold text-slate-900' : ''}`}>
                      {i === 0 ? (
                        <div className="flex items-center gap-3">
                          {def.imageField && (
                            <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                              {d[def.imageField] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={String(d[def.imageField])} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50 text-[13px] font-bold text-violet-600">
                                  {String(d[col] ?? '?').trim().charAt(0).toUpperCase()}
                                </span>
                              )}
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="line-clamp-1">{String(d[col] ?? '—')}</span>
                            {typeof d.slug === 'string' && <span className="block truncate font-mono text-[11px] font-normal text-slate-400">/{d.slug}</span>}
                          </span>
                        </div>
                      ) : (
                        <Cell field={byKey.get(col)} value={d[col]} />
                      )}
                    </td>
                  ))}
                  {hasSeo && (
                    <td className="px-4">
                      <span className={`inline-flex h-7 min-w-9 items-center justify-center rounded-lg px-2 text-[12px] font-bold ring-1 ${SCORE_STYLE[scoreTone(score)]}`}>{score}</span>
                    </td>
                  )}
                  <td className="px-4 pr-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {path && d.status === 'published' && (
                        <a href={`${SITE_URL}${path}`} target="_blank" rel="noopener noreferrer" title="View on website" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {canEdit && (
                        <Link href={editHref(d)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <button type="button" title="Delete" onClick={() => onDelete(d)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Listing screen for any CMS collection, driven by its content-type definition. */
export function ContentListScreen({ resource }: { resource: string }) {
  const { def, error: defError } = useContentType(resource);
  const { can } = useAuth();
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<Paginated<Doc> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Doc | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let alive = true;
    api<Paginated<Doc>>(`/${resource}`, { query: { page, limit: PAGE_SIZE, search, status: status === 'all' ? undefined : status } })
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoadError(null);
      })
      .catch((err) => alive && setLoadError(err instanceof ApiRequestError ? err.message : 'Failed to load'));
    return () => {
      alive = false;
    };
  }, [resource, page, search, status, tick]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/${resource}/${toDelete.id ?? toDelete._id}`, { method: 'DELETE' });
      toast.success(`${def?.label ?? 'Item'} deleted`);
      setToDelete(null);
      setTick((t) => t + 1);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (defError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{defError}</div>;
  if (!def) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;

  return (
    <div>
      <PageHeader
        title={def.labelPlural}
        description={def.description}
        actions={
          can(resource, 'create') && (
            <Link href={`/dashboard/content/${resource}/new`}>
              <Button className={`h-10 rounded-xl px-4 ${PRIMARY_BUTTON_CLASS}`}>
                <Plus className="mr-1.5 h-4 w-4" /> New {lowerLabel(def.label)}
              </Button>
            </Link>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`h-8 rounded-lg px-4 text-[13px] font-semibold capitalize transition-colors ${status === s ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:w-80">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={`Search ${lowerLabel(def.labelPlural)}…`} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError}</div>
      ) : !data ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>
      ) : data.items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
          <Inbox className="h-7 w-7" />
          <span className="text-sm">{search || status !== 'all' ? 'Nothing matches these filters.' : `No ${lowerLabel(def.labelPlural)} yet.`}</span>
        </div>
      ) : (
        <ListTable def={def} items={data.items} onDelete={setToDelete} canDelete={can(resource, 'delete')} canEdit={can(resource, 'update')} />
      )}

      {data && <Pagination meta={data.meta} onPage={setPage} noun={lowerLabel(def.labelPlural)} />}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete this ${lowerLabel(def.label)}?`}
        description={`"${String(toDelete?.[def.titleField] ?? '')}" will be removed from the website and the admin. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
