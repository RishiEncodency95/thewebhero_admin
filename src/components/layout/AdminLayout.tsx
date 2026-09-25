'use client';

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ '--sidebar-width': '17rem' } as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
          <AdminNavbar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
