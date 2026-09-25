'use client';

import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/admin/ModulePage';
import { FileKey, PlusCircle, Pencil, Trash } from 'lucide-react';

interface AuditLog {
  id: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  timestamp: string;
}

const ACTION_META: Record<AuditLog['action'], { label: string; category: StatusCategory }> = {
  CREATE: { label: 'Create', category: 'success' },
  UPDATE: { label: 'Update', category: 'info' },
  DELETE: { label: 'Delete', category: 'error' },
};

const DATA: AuditLog[] = [
  { id: '1', user: 'Rohit Kumar', action: 'UPDATE', entity: 'Page — About Us', timestamp: '24 Sep, 09:41 AM' },
  { id: '2', user: 'Sara Fernandes', action: 'CREATE', entity: 'Blog Post — Core Web Vitals in 2026', timestamp: '18 Sep, 04:30 PM' },
  { id: '3', user: 'Rohit Kumar', action: 'DELETE', entity: 'Testimonial — Ritu Bansal', timestamp: '15 Sep, 11:02 AM' },
  { id: '4', user: 'Dev Patel', action: 'UPDATE', entity: 'Service — SEO', timestamp: '12 Sep, 03:15 PM' },
];

export default function AuditLogsPage() {
  const columns: Column<AuditLog>[] = [
    { key: 'timestamp', header: 'Time' },
    { key: 'user', header: 'User' },
    { key: 'action', header: 'Action', render: (r) => <StatusBadge label={ACTION_META[r.action].label} category={ACTION_META[r.action].category} /> },
    { key: 'entity', header: 'Entity' },
  ];

  return (
    <div className="animate-in fade-in max-w-[1600px] mx-auto space-y-5 pb-8 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Read-only history of who changed what and when.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard title="Total Events" value={DATA.length} icon={FileKey} color="#7c3aed" />
        <StatCard title="Creates" value={DATA.filter((d) => d.action === 'CREATE').length} icon={PlusCircle} color="#16a34a" />
        <StatCard title="Updates" value={DATA.filter((d) => d.action === 'UPDATE').length} icon={Pencil} color="#3b82f6" />
        <StatCard title="Deletes" value={DATA.filter((d) => d.action === 'DELETE').length} icon={Trash} color="#dc2626" />
      </div>

      <DataTable data={DATA} columns={columns} emptyMessage="No activity recorded yet." pageSize={15} />
    </div>
  );
}
