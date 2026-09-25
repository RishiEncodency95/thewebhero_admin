'use client';

import { PermissionsMatrix } from '@/components/admin/PermissionsMatrix';

export default function PermissionsPage() {
  return (
    <div className="animate-in fade-in max-w-[1600px] mx-auto space-y-5 pb-8 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Permissions</h1>
        <p className="mt-1 text-sm text-slate-500">Choose which sections and pages each role can view, add, edit or delete.</p>
      </div>

      <PermissionsMatrix />
    </div>
  );
}
