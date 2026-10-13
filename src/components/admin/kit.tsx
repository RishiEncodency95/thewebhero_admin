'use client';

// Small building blocks shared by every admin screen so tables, empty states,
// search boxes and pagination look and size the same everywhere.

import React, { useEffect, useState } from 'react';
import { Inbox, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiRequestError, Paginated } from '@/lib/api';

export const cardClass = 'rounded-2xl border border-slate-200/80 bg-white shadow-sm';
export const thClass = 'h-11 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 first:pl-5 last:pr-5';
export const tdClass = 'px-4 first:pl-5 last:pr-5';
export const rowClass = 'h-[60px] border-t border-slate-100';
export const iconButtonClass = 'flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40';

export function LoadingBlock({ className = 'h-64' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${cardClass} ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{message}</div>;
}

export function EmptyState({ message, icon: Icon = Inbox }: { message: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
      <Icon className="h-7 w-7" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-violet-400 sm:w-80">
      <Search className="h-4 w-4 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-8 rounded-lg px-4 text-[13px] font-semibold transition-colors ${value === o.value ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ meta, onPage }: { meta: Paginated<unknown>['meta']; onPage: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-[13px] text-slate-500">
      <span>
        {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="rounded-lg" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</Button>
        <Button size="sm" variant="outline" className="rounded-lg" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function StatTile({ label, value, icon: Icon, tone = 'violet', hint }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: 'violet' | 'blue' | 'amber' | 'emerald' | 'rose'; hint?: React.ReactNode }) {
  const tones = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className={`flex h-[92px] items-center gap-4 p-5 ${cardClass}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-slate-500">{label}</p>
        <p className="mt-0.5 text-[24px] font-bold leading-tight text-slate-900">{value}</p>
        {hint && <p className="truncate text-[12px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export const errorMessage = (err: unknown, fallback = 'Something went wrong') => (err instanceof ApiRequestError ? err.message : fallback);

export const formatDateTime = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const formatDate = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const docId = (d: { _id?: unknown; id?: unknown }) => String(d.id ?? d._id);

/** Debounced search text: returns the value to query with. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Loads one page of a paginated endpoint; `reload()` refetches. */
export function usePaginated<T>(path: string, query: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<Paginated<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(query);

  useEffect(() => {
    let alive = true;
    api<Paginated<T>>(path, { query: JSON.parse(key) })
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((err) => alive && setError(errorMessage(err, 'Failed to load')));
    return () => {
      alive = false;
    };
  }, [path, key, tick]);

  return { data, error, reload: () => setTick((t) => t + 1) };
}
