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

        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f5f6fb]">
          <AdminNavbar />
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 lg:px-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
