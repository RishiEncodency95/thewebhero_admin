'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, Search, Bell } from 'lucide-react';

// Swap this for your real logged-in user (from your auth/session of choice).
const CURRENT_USER = { name: 'Admin User', email: 'admin@example.com', role: 'Super Admin' };

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

  const handleLogout = () => {
    // Wire this up to your own auth logic (clear token/session, call API, etc.)
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-slate-200 sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
      <SidebarTrigger className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" />

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-full max-w-xl focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-colors">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent outline-none text-sm text-slate-600 placeholder:text-slate-400 w-full"
        />
        <kbd className="hidden lg:inline-flex items-center text-[11px] font-medium text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shrink-0">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-fuchsia-500 text-white text-[10px] font-semibold flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative group ml-1">
          <button className="flex items-center gap-2.5 p-1 pr-2 rounded-full transition-colors hover:bg-slate-100">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 flex items-center justify-center text-white text-xs font-semibold shrink-0 ring-2 ring-white">
              {initials(CURRENT_USER.name)}
            </span>
            <span className="hidden lg:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-slate-800">{CURRENT_USER.name}</span>
              <span className="text-[11px] text-slate-500">{CURRENT_USER.role}</span>
            </span>
          </button>

          <div className="absolute top-full right-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
              <div className="px-4 py-3 border-b border-slate-100 mb-1">
                <p className="text-sm text-slate-900 font-semibold truncate">{CURRENT_USER.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{CURRENT_USER.email}</p>
              </div>
              <div className="px-2 pb-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span>Logout</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
