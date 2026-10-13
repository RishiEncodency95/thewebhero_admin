'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/admin/StatCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/buttons';
import { api, ApiRequestError, Paginated } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export const LEAD_STATUSES = ['new', 'in-progress', 'resolved', 'closed', 'spam'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; category: StatusCategory }> = {
  new: { label: 'New', category: 'info' },
  'in-progress': { label: 'In progress', category: 'warning' },
  resolved: { label: 'Resolved', category: 'success' },
  closed: { label: 'Closed', category: 'default' },
  spam: { label: 'Spam', category: 'error' },
};

export interface Lead {
  _id: string;
  referenceId?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  meta?: { ip?: string; userAgent?: string; pageUrl?: string; referrer?: string };
  [key: string]: unknown;
}

export interface LeadField {
  key: string;
  label: string;
  format?: 'text' | 'longtext' | 'list' | 'url' | 'email' | 'phone' | 'bool';
}

export interface LeadsPageProps {
  /** API path + permission resource, e.g. "quote-requests". */
  resource: string;
  title: string;
  description: string;
  /** Field holding the person's name ("fullName" or "name"). */
  nameKey: string;
  /** Short line under the name in the detail panel, e.g. the service. */
  headlineKey?: string;
  columns: Column<Lead>[];
  sections: { title: string; fields: LeadField[] }[];
}

const PAGE_SIZE = 20;

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function FieldValue({ value, format = 'text' }: { value: unknown; format?: LeadField['format'] }) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-slate-400">—</span>;
  }
  if (format === 'list' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <span key={String(v)} className="rounded-md bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-700">
            {String(v)}
          </span>
        ))}
      </div>
    );
  }
  if (format === 'bool') return <span>{value ? 'Yes' : 'No'}</span>;
  if (format === 'email') return <a className="text-violet-700 hover:underline" href={`mailto:${value}`}>{String(value)}</a>;
  if (format === 'phone') return <a className="text-violet-700 hover:underline" href={`tel:${value}`}>{String(value)}</a>;
  if (format === 'url') {
    const href = /^https?:\/\//i.test(String(value)) ? String(value) : `https://${value}`;
    return (
      <a className="break-all text-violet-700 hover:underline" href={href} target="_blank" rel="noopener noreferrer">
        {String(value)}
      </a>
    );
  }
  return <span className={format === 'longtext' ? 'whitespace-pre-wrap' : ''}>{String(value)}</span>;
}

function LeadsPageInner({ resource, title, description, nameKey, headlineKey, columns, sections }: LeadsPageProps) {
  const { can } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openId = searchParams.get('id');

  const [status, setStatus] = useState<LeadStatus | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Lead> | null>(null);
  const [stats, setStats] = useState<{ total: number; byStatus: Record<LeadStatus, number> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  // `loading` is derived: the current request key differs from the last one answered.
  const requestKey = `${page}|${status}|${search}|${reloadTick}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey;
  const load = useCallback(() => setReloadTick((t) => t + 1), []);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api<Paginated<Lead>>(`/${resource}`, {
        query: { page, limit: PAGE_SIZE, status: status === 'all' ? undefined : status, search },
      }),
      api<{ total: number; byStatus: Record<LeadStatus, number> }>(`/${resource}/stats`),
    ])
      .then(([list, s]) => {
        if (!alive) return;
        setData(list);
        setStats(s);
        setError(null);
      })
      .catch((err) => alive && setError(err instanceof ApiRequestError ? err.message : 'Failed to load'))
      .finally(() => alive && setLoadedKey(requestKey));
    return () => {
      alive = false;
    };
  }, [resource, page, status, search, requestKey]);

  // Deep link from a notification: /dashboard/<resource>?id=...
  useEffect(() => {
    if (!openId || selected?._id === openId) return;
    api<Lead>(`/${resource}/${openId}`)
      .then((lead) => {
        setSelected(lead);
        setNotes(lead.notes ?? '');
      })
      .catch(() => toast.error('That lead could not be found.'));
  }, [openId, resource, selected?._id]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setNotes(lead.notes ?? '');
    router.replace(`${pathname}?id=${lead._id}`, { scroll: false });
  };

  const closeLead = () => {
    setSelected(null);
    router.replace(pathname, { scroll: false });
  };

  const update = async (patch: { status?: LeadStatus; notes?: string }) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api<Lead>(`/${resource}/${selected._id}`, { method: 'PATCH', body: patch });
      setSelected(updated);
      setData((d) => (d ? { ...d, items: d.items.map((i) => (i._id === updated._id ? updated : i)) } : d));
      toast.success(patch.status ? `Marked as ${LEAD_STATUS_META[patch.status].label}` : 'Notes saved');
      if (patch.status) api<typeof stats>(`/${resource}/stats`).then(setStats).catch(() => {});
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected || !window.confirm('Delete this lead permanently? This cannot be undone.')) return;
    try {
      await api(`/${resource}/${selected._id}`, { method: 'DELETE' });
      toast.success('Lead deleted');
      closeLead();
      load();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Delete failed');
    }
  };

  const canUpdate = can(resource, 'update');
  const canDelete = can(resource, 'delete');

  const statusColumn: Column<Lead> = {
    key: 'status',
    header: 'Status',
    render: (l) => <StatusBadge label={LEAD_STATUS_META[l.status]?.label ?? l.status} category={LEAD_STATUS_META[l.status]?.category} />,
  };
  const dateColumn: Column<Lead> = {
    key: 'createdAt',
    header: 'Received',
    render: (l) => <span className="whitespace-nowrap text-slate-500">{formatDate(l.createdAt)}</span>,
  };

  const statCards = [
    { title: 'Total', value: stats?.total ?? '—', icon: Inbox, color: '#7c3aed' },
    { title: 'New', value: stats?.byStatus.new ?? '—', icon: Clock, color: '#3b82f6' },
    { title: 'In progress', value: stats?.byStatus['in-progress'] ?? '—', icon: RefreshCw, color: '#f59e0b' },
    { title: 'Resolved', value: stats?.byStatus.resolved ?? '—', icon: CheckCircle2, color: '#16a34a' },
    { title: 'Spam', value: stats?.byStatus.spam ?? '—', icon: AlertOctagon, color: '#dc2626' },
  ];

  const name = selected ? String(selected[nameKey] ?? '') : '';
  const email = selected ? String(selected.email ?? '') : '';
  const phone = selected ? String(selected.phone ?? '') : '';
  const whatsapp = phone.replace(/[^\d]/g, '');

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        crumbs={[{ label: 'Leads' }, { label: title }]}
        actions={
          <Button variant="outline" className="h-10 rounded-xl px-4" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {(['all', ...LEAD_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                status === s ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'All' : LEAD_STATUS_META[s].label}
              {stats && (
                <span className={`ml-1.5 text-[11px] ${status === s ? 'text-violet-100' : 'text-slate-400'}`}>
                  {s === 'all' ? stats.total : stats.byStatus[s]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:w-72">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, reference…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}{' '}
          <button onClick={load} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : (
        <>
          <DataTable<Lead>
            data={data?.items ?? []}
            columns={[...columns, statusColumn, dateColumn]}
            onRowClick={openLead}
            emptyMessage={loading ? 'Loading…' : search || status !== 'all' ? 'No leads match these filters.' : 'No leads yet.'}
          />
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-[13px] text-slate-500">
              <span>
                Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} leads
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && closeLead()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl data-[side=right]:sm:max-w-2xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <StatusBadge label={LEAD_STATUS_META[selected.status].label} category={LEAD_STATUS_META[selected.status].category} />
                  {selected.referenceId && <span className="font-mono text-[12px] text-slate-500">{selected.referenceId}</span>}
                </div>
                <SheetTitle className="text-xl">{name || 'Lead'}</SheetTitle>
                <SheetDescription>
                  {headlineKey && selected[headlineKey] ? `${String(selected[headlineKey])} · ` : ''}
                  Received {formatDate(selected.createdAt)}
                </SheetDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {email && (
                    <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                  )}
                  {phone && (
                    <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  )}
                  {whatsapp.length >= 8 && (
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                {/* Status + notes */}
                <div className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {LEAD_STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={!canUpdate || saving || selected.status === s}
                        onClick={() => update({ status: s })}
                        className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-default ${
                          selected.status === s ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                        }`}
                      >
                        {LEAD_STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                  <label htmlFor="lead-notes" className="block pt-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                    Internal notes
                  </label>
                  <textarea
                    id="lead-notes"
                    rows={3}
                    value={notes}
                    disabled={!canUpdate}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Call summary, next steps, quoted amount…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  />
                  {canUpdate && (
                    <Button
                      size="sm"
                      className={`rounded-lg ${PRIMARY_BUTTON_CLASS}`}
                      disabled={saving || notes === (selected.notes ?? '')}
                      onClick={() => update({ notes })}
                    >
                      {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Save notes
                    </Button>
                  )}
                </div>

                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{section.title}</h3>
                    <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                      {section.fields.map((f) => (
                        <div key={f.key} className="grid grid-cols-3 gap-3 px-4 py-2.5 text-[13px]">
                          <dt className="text-slate-500">{f.label}</dt>
                          <dd className="col-span-2 text-slate-800">
                            <FieldValue value={selected[f.key]} format={f.format} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}

                <div>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Submission details</h3>
                  <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                    {[
                      { label: 'Submitted from', value: selected.meta?.pageUrl, format: 'url' as const },
                      { label: 'Referrer', value: selected.meta?.referrer, format: 'url' as const },
                      { label: 'IP address', value: selected.meta?.ip },
                      { label: 'Browser', value: selected.meta?.userAgent },
                    ].map((row) => (
                      <div key={row.label} className="grid grid-cols-3 gap-3 px-4 py-2.5 text-[13px]">
                        <dt className="text-slate-500">{row.label}</dt>
                        <dd className="col-span-2 break-words text-slate-800">
                          <FieldValue value={row.value} format={row.format} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {canDelete && (
                  <Button variant="outline" className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={remove}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete lead
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Generic admin page for a lead-capture module, backed by twh_backend's lead API. */
export function LeadsPage(props: LeadsPageProps) {
  return (
    <Suspense>
      <LeadsPageInner {...props} />
    </Suspense>
  );
}
