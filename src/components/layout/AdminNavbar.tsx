'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, ChevronDown, LogOut, Search } from 'lucide-react';
import { navItems } from './AdminSidebar';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

/** "super-admin" -> "Super Admin" */
function roleLabel(role: string) {
  return role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AdminNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  // Poll unread notifications (new leads etc.) once a minute.
  useEffect(() => {
    let alive = true;
    const load = () =>
      api<{ unreadCount: number }>('/notifications', { query: { unreadOnly: true, limit: 1 } })
        .then((d) => alive && setUnread(d.unreadCount ?? 0))
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const CURRENT_USER = { name: user?.name ?? '', email: user?.email ?? '', role: roleLabel(user?.role ?? '') };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur-xl">
      <SidebarTrigger className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
      <QuickSearch />

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/dashboard/notifications"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-violet-200 hover:text-violet-700"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>

        <div className="group relative">
          <button className="flex items-center gap-2.5 rounded-xl border border-transparent p-1 pr-3 transition-colors hover:border-slate-200 hover:bg-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-xs font-bold text-white">
              {initials(CURRENT_USER.name || CURRENT_USER.email || '?')}
            </span>
            <span className="hidden flex-col items-start leading-tight lg:flex">
              <span className="text-[13.5px] font-semibold text-slate-800">{CURRENT_USER.name}</span>
              <span className="text-[11.5px] text-slate-500">{CURRENT_USER.role}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
          </button>

          <div className="invisible absolute right-0 top-full z-50 w-64 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">{CURRENT_USER.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{CURRENT_USER.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <span>Sign out</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Jump to any admin section by name (Cmd/Ctrl+K). */
function QuickSearch() {
  const router = useRouter();
  const { can } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(
    () => navItems.flatMap((g) => g.items.filter((i) => !i.resource || can(i.resource, 'read')).map((i) => ({ ...i, group: g.group }))),
    [can],
  );
  const q = query.trim().toLowerCase();
  const results = (q ? items.filter((i) => i.title.toLowerCase().includes(q) || i.group.toLowerCase().includes(q)) : items).slice(0, 8);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (url: string) => {
    router.push(url);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 transition-colors focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && results[index]) {
              go(results[index].url);
            } else if (e.key === 'Escape') {
              inputRef.current?.blur();
            }
          }}
          placeholder="Search sections…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <kbd className="hidden shrink-0 items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 lg:inline-flex">⌘K</kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-400">No section matches “{query}”.</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.url}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(r.url)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === index ? 'bg-violet-50' : ''}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === index ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <r.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[13.5px] font-medium text-slate-800">{r.title}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{r.group}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
