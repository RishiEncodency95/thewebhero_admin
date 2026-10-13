'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, FileText, FolderOpen, Gauge, Headphones, Inbox, LayoutGrid, Mail, Newspaper, PenSquare, Send, Settings, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { cardClass, formatDateTime, StatTile } from '@/components/admin/kit';
import { api, Paginated } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type LeadStatus = 'new' | 'in-progress' | 'resolved' | 'closed' | 'spam';
interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}
interface RecentLead {
  _id: string;
  kind: 'quote-requests' | 'contact-enquiries' | 'support-requests';
  name: string;
  headline: string;
  status: LeadStatus;
  createdAt: string;
}

const LEAD_TYPES = [
  { resource: 'quote-requests', label: 'Quote requests', icon: FileText, tone: 'violet', nameKey: 'fullName', headlineKey: 'service' },
  { resource: 'contact-enquiries', label: 'Contact enquiries', icon: Mail, tone: 'blue', nameKey: 'name', headlineKey: 'subject' },
  { resource: 'support-requests', label: 'Support requests', icon: Headphones, tone: 'amber', nameKey: 'name', headlineKey: 'subject' },
] as const;

const CONTENT = [
  { resource: 'services', label: 'Services', icon: LayoutGrid },
  { resource: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { resource: 'blog', label: 'Blog posts', icon: Newspaper },
];

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-violet-50 text-violet-700 ring-violet-200',
  'in-progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200',
  spam: 'bg-red-50 text-red-700 ring-red-200',
};

const STATUS_BAR: Record<LeadStatus, string> = { new: 'bg-violet-500', 'in-progress': 'bg-blue-500', resolved: 'bg-emerald-500', closed: 'bg-slate-400', spam: 'bg-red-400' };

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function DashboardPage() {
  const { user, can } = useAuth();
  const [leadStats, setLeadStats] = useState<Record<string, LeadStats | null>>({});
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [recent, setRecent] = useState<RecentLead[] | null>(null);

  useEffect(() => {
    let alive = true;
    const allowedLeads = LEAD_TYPES.filter((t) => can(t.resource, 'read'));

    Promise.all(allowedLeads.map((t) => api<LeadStats>(`/${t.resource}/stats`).catch(() => null))).then(
      (stats) => alive && setLeadStats(Object.fromEntries(allowedLeads.map((t, i) => [t.resource, stats[i]]))),
    );

    const countOf = (path: string, query: Record<string, string | number> = {}) =>
      api<Paginated<unknown>>(path, { query: { limit: 1, ...query } }).then((r) => r.meta.total).catch(() => null);
    Promise.all([
      ...CONTENT.map((c) => (can(c.resource, 'read') ? countOf(`/${c.resource}`, { status: 'published', view: 'summary' }) : Promise.resolve(null))),
      can('newsletter', 'read') ? countOf('/newsletter', { isActive: 'true' }) : Promise.resolve(null),
    ]).then((values) => alive && setCounts(Object.fromEntries([...CONTENT.map((c) => c.resource), 'newsletter'].map((k, i) => [k, values[i]]))));

    Promise.all(
      allowedLeads.map((t) =>
        api<Paginated<Record<string, unknown>>>(`/${t.resource}`, { query: { limit: 6 } })
          .then((r) =>
            r.items.map<RecentLead>((l) => ({
              _id: String(l._id),
              kind: t.resource,
              name: String(l[t.nameKey] ?? ''),
              headline: String(l[t.headlineKey] ?? ''),
              status: l.status as LeadStatus,
              createdAt: String(l.createdAt),
            })),
          )
          .catch(() => []),
      ),
    ).then((lists) => alive && setRecent(lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8)));

    return () => {
      alive = false;
    };
  }, [can]);

  const newLeads = Object.values(leadStats).reduce((n, s) => n + (s?.byStatus.new ?? 0), 0);
  const totals = (Object.values(leadStats).filter(Boolean) as LeadStats[]).reduce(
    (acc, s) => {
      (Object.keys(s.byStatus) as LeadStatus[]).forEach((k) => (acc[k] = (acc[k] ?? 0) + s.byStatus[k]));
      return acc;
    },
    {} as Record<LeadStatus, number>,
  );
  const totalLeads = Object.values(totals).reduce((a, b) => a + b, 0);
  const typeLabel = (k: RecentLead['kind']) => LEAD_TYPES.find((t) => t.resource === k)?.label.replace(/s$/, '') ?? k;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description={newLeads ? `You have ${newLeads} new lead${newLeads > 1 ? 's' : ''} waiting for a reply.` : 'Here is what is happening on thewebhero.in.'}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {LEAD_TYPES.map((t) => {
          const s = leadStats[t.resource];
          return (
            <Link key={t.resource} href={`/dashboard/${t.resource}`} className="transition-transform hover:-translate-y-0.5">
              <StatTile label={t.label} value={s ? s.total : '—'} icon={t.icon} tone={t.tone} hint={s ? `${s.byStatus.new} new` : undefined} />
            </Link>
          );
        })}
        <Link href="/dashboard/newsletter" className="transition-transform hover:-translate-y-0.5">
          <StatTile label="Newsletter subscribers" value={counts.newsletter ?? '—'} icon={Send} tone="emerald" hint="Active" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className={`overflow-hidden xl:col-span-2 ${cardClass}`}>
          <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
            <h2 className="text-[15px] font-bold text-slate-900">Latest enquiries</h2>
            <Link href="/dashboard/quote-requests" className="flex items-center gap-1 text-[13px] font-semibold text-violet-700 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-400">
              <Inbox className="h-7 w-7" />
              <span className="text-sm">No enquiries yet — they appear here as soon as someone submits a form.</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((l) => (
                <li key={`${l.kind}-${l._id}`}>
                  <Link href={`/dashboard/${l.kind}?id=${l._id}`} className="flex h-[64px] items-center gap-4 px-5 hover:bg-slate-50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                      {l.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-slate-900">{l.name || 'Unknown'}</span>
                      <span className="block truncate text-[12.5px] text-slate-500">{typeLabel(l.kind)}{l.headline && ` · ${l.headline}`}</span>
                    </span>
                    <span className={`hidden rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold capitalize ring-1 sm:inline ${STATUS_STYLE[l.status] ?? STATUS_STYLE.closed}`}>{l.status?.replace('-', ' ')}</span>
                    <span className="hidden w-36 text-right text-[12px] text-slate-400 md:block">{formatDateTime(l.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className={`p-5 ${cardClass}`}>
            <h2 className="text-[15px] font-bold text-slate-900">Lead pipeline</h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">All forms combined · {totalLeads} total</p>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              {totalLeads > 0 && (Object.keys(STATUS_BAR) as LeadStatus[]).map((k) => (totals[k] ? <div key={k} className={STATUS_BAR[k]} style={{ width: `${(totals[k] / totalLeads) * 100}%` }} /> : null))}
            </div>
            <ul className="mt-4 space-y-2.5">
              {(Object.keys(STATUS_BAR) as LeadStatus[]).map((k) => (
                <li key={k} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 capitalize text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_BAR[k]}`} /> {k.replace('-', ' ')}
                  </span>
                  <span className="font-semibold text-slate-900">{totals[k] ?? 0}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`p-5 ${cardClass}`}>
            <h2 className="text-[15px] font-bold text-slate-900">Published content</h2>
            <ul className="mt-3 space-y-1">
              {CONTENT.map((c) => (
                <li key={c.resource}>
                  <Link href={`/dashboard/content/${c.resource}`} className="flex h-11 items-center gap-3 rounded-xl px-2 hover:bg-slate-50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><c.icon className="h-4 w-4" /></span>
                    <span className="flex-1 text-[13.5px] text-slate-700">{c.label}</span>
                    <span className="text-[14px] font-bold text-slate-900">{counts[c.resource] ?? '—'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className={`p-5 ${cardClass}`}>
        <h2 className="mb-4 text-[15px] font-bold text-slate-900">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: '/dashboard/content/blog/new', label: 'Write a blog post', icon: PenSquare },
            { href: '/dashboard/content/portfolio/new', label: 'Add a portfolio project', icon: Sparkles },
            { href: '/dashboard/seo', label: 'Review SEO scores', icon: Gauge },
            { href: '/dashboard/site/settings', label: 'Site settings', icon: Settings },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="flex h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 text-[13.5px] font-semibold text-slate-700 transition-colors hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700">
              <a.icon className="h-4.5 w-4.5" /> {a.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
