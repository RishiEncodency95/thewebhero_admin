'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bell, CheckCheck, ChevronRight, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PAGE_SIZE, Pagination } from '@/components/admin/kit';
import { Button } from '@/components/ui/button';
import { api, ApiRequestError, Paginated } from '@/lib/api';
import { formatDate } from '@/components/leads/LeadsPage';

interface AppNotification {
  _id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

type NotificationsResponse = Paginated<AppNotification> & { unreadCount: number };

export default function NotificationsPage() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<NotificationsResponse>('/notifications', { query: { page, limit: PAGE_SIZE, unreadOnly: unreadOnly || undefined } })
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((err) => alive && setError(err instanceof ApiRequestError ? err.message : 'Failed to load'));
    return () => {
      alive = false;
    };
  }, [page, unreadOnly, tick]);

  const open = async (n: AppNotification) => {
    if (!n.isRead) await api(`/notifications/${n._id}/read`, { method: 'PUT' }).catch(() => {});
    if (n.link) router.push(n.link);
    else setTick((t) => t + 1);
  };

  const markAll = async () => {
    try {
      await api('/notifications/read-all', { method: 'PUT' });
      toast.success('All notifications marked as read');
      setTick((t) => t + 1);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Failed');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Notifications"
        description="New leads and enquiries from the website appear here."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {[
                { label: 'All', value: false },
                { label: `Unread${data ? ` (${data.unreadCount})` : ''}`, value: true },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    setUnreadOnly(t.value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-medium ${unreadOnly === t.value ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Button variant="outline" className="rounded-xl" onClick={markAll} disabled={!data?.unreadCount}>
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {!data ? (
            <p className="p-10 text-center text-sm text-slate-400">Loading…</p>
          ) : data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-slate-400">
              <Inbox className="h-6 w-6" />
              <span className="text-sm">{unreadOnly ? 'You are all caught up.' : 'No notifications yet.'}</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.items.map((n) => (
                <li key={n._id}>
                  <button onClick={() => open(n)} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-slate-50">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.isRead ? 'bg-slate-100 text-slate-400' : 'bg-violet-100 text-violet-600'}`}
                    >
                      <Bell className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm ${n.isRead ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>{n.title}</span>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-fuchsia-500" />}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-slate-500">{n.message}</span>
                      <span className="mt-1 block text-[12px] text-slate-400">{formatDate(n.createdAt)}</span>
                    </span>
                    {n.link && <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {data && <Pagination meta={data.meta} onPage={setPage} noun="notifications" />}
    </div>
  );
}
