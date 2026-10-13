'use client';

import React, { useState } from 'react';
import { History } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { cardClass, EmptyState, ErrorBlock, formatDateTime, LoadingBlock, Pagination, rowClass, Segmented, tdClass, thClass, usePaginated } from '@/components/admin/kit';

interface AuditLog {
  _id: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource: string;
  resourceId?: string;
  userEmail?: string;
  user?: { name: string; email: string } | null;
  ip?: string;
  createdAt: string;
}

type ActionFilter = 'all' | AuditLog['action'];

const ACTION_STYLE: Record<AuditLog['action'], string> = {
  create: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  update: 'bg-blue-50 text-blue-700 ring-blue-200',
  delete: 'bg-red-50 text-red-700 ring-red-200',
  login: 'bg-violet-50 text-violet-700 ring-violet-200',
  logout: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const label = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AuditLogsPage() {
  const [action, setAction] = useState<ActionFilter>('all');
  const [page, setPage] = useState(1);
  const { data, error } = usePaginated<AuditLog>('/audit-logs', { page, limit: 30, action: action === 'all' ? undefined : action });

  return (
    <div>
      <PageHeader title="Audit log" description="Every change made in the admin — who did it, what, and when." />

      <div className="mb-4">
        <Segmented<ActionFilter>
          value={action}
          onChange={(v) => { setAction(v); setPage(1); }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'create', label: 'Created' },
            { value: 'update', label: 'Updated' },
            { value: 'delete', label: 'Deleted' },
            { value: 'login', label: 'Sign-ins' },
          ]}
        />
      </div>

      {error ? (
        <ErrorBlock message={error} />
      ) : !data ? (
        <LoadingBlock />
      ) : data.items.length === 0 ? (
        <EmptyState icon={History} message="Nothing logged yet." />
      ) : (
        <div className={`overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className={thClass}>When</th>
                  <th className={thClass}>User</th>
                  <th className={thClass}>Action</th>
                  <th className={thClass}>Section</th>
                  <th className={thClass}>Record</th>
                  <th className={thClass}>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l._id} className={rowClass}>
                    <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{formatDateTime(l.createdAt)}</td>
                    <td className={tdClass}>
                      <span className="block font-semibold text-slate-900">{l.user?.name ?? '—'}</span>
                      <span className="block text-[12px] text-slate-500">{l.user?.email ?? l.userEmail ?? ''}</span>
                    </td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold capitalize ring-1 ${ACTION_STYLE[l.action]}`}>{l.action}</span>
                    </td>
                    <td className={`${tdClass} text-slate-700`}>{label(l.resource)}</td>
                    <td className={`${tdClass} font-mono text-[12px] text-slate-400`}>{l.resourceId ?? '—'}</td>
                    <td className={`${tdClass} font-mono text-[12px] text-slate-400`}>{l.ip ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}
