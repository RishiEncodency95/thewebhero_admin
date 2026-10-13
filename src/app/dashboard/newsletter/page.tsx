'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download, Loader2, Mail, Trash2, UserCheck, UserMinus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  cardClass, EmptyState, ErrorBlock, errorMessage, formatDateTime, iconButtonClass, LoadingBlock, Pagination, rowClass, SearchBox, Segmented, StatTile, tdClass, thClass, useDebounced, usePaginated,
} from '@/components/admin/kit';
import { api, Paginated } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

type Filter = 'all' | 'true' | 'false';

export default function NewsletterPage() {
  const { can } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounced(searchInput.trim());
  const [page, setPage] = useState(1);
  const { data, error, reload } = usePaginated<Subscriber>('/newsletter', { page, limit: 25, search, isActive: filter === 'all' ? undefined : filter });
  const totals = {
    all: usePaginated<Subscriber>('/newsletter', { limit: 1 }).data?.meta.total,
    active: usePaginated<Subscriber>('/newsletter', { limit: 1, isActive: 'true' }).data?.meta.total,
  };
  const [toDelete, setToDelete] = useState<Subscriber | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/newsletter/${toDelete._id}`, { method: 'DELETE' });
      toast.success('Subscriber removed');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  // Pulls every active subscriber page by page and downloads a CSV.
  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: Subscriber[] = [];
      for (let p = 1; ; p++) {
        const res = await api<Paginated<Subscriber>>('/newsletter', { query: { page: p, limit: 100, isActive: 'true' } });
        rows.push(...res.items);
        if (p >= res.meta.totalPages) break;
      }
      const csv = ['email,subscribed_at', ...rows.map((r) => `${r.email},${new Date(r.createdAt).toISOString()}`)].join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} subscribers`);
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Newsletter"
        description="Email addresses collected by the subscribe form in the website footer."
        actions={
          <Button variant="outline" className="h-10 rounded-xl px-4" onClick={exportCsv} disabled={exporting}>
            {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />} Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total sign-ups" value={totals.all ?? '—'} icon={Users} tone="violet" />
        <StatTile label="Active subscribers" value={totals.active ?? '—'} icon={UserCheck} tone="emerald" />
        <StatTile label="Unsubscribed" value={totals.all !== undefined && totals.active !== undefined ? totals.all - totals.active : '—'} icon={UserMinus} tone="rose" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={(v) => { setFilter(v); setPage(1); }}
          options={[{ value: 'all', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Unsubscribed' }]}
        />
        <SearchBox value={searchInput} onChange={(v) => { setSearchInput(v); setPage(1); }} placeholder="Search email…" />
      </div>

      {error ? (
        <ErrorBlock message={error} />
      ) : !data ? (
        <LoadingBlock />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Mail} message={search || filter !== 'all' ? 'No subscribers match these filters.' : 'No subscribers yet.'} />
      ) : (
        <div className={`overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Subscribed</th>
                  {can('newsletter', 'delete') && <th className={`${thClass} text-right`}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.items.map((s) => (
                  <tr key={s._id} className={rowClass}>
                    <td className={`${tdClass} font-medium text-slate-900`}>
                      <a href={`mailto:${s.email}`} className="hover:text-violet-700">{s.email}</a>
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ${s.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {s.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{formatDateTime(s.createdAt)}</td>
                    {can('newsletter', 'delete') && (
                      <td className={tdClass}>
                        <div className="flex justify-end">
                          <button type="button" title="Remove" className={`${iconButtonClass} hover:bg-red-50! hover:text-red-600!`} onClick={() => setToDelete(s)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}

      <ConfirmDialog
        open={!!toDelete}
        title="Remove this subscriber?"
        description={`${toDelete?.email ?? ''} will be deleted permanently. To just stop emails, they can unsubscribe themselves.`}
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
