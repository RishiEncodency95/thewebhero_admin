'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { UserCog, ShieldCheck, Crown, UserX } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
}

const ROLE_LABEL: Record<AdminUser['role'], string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', EDITOR: 'Editor', VIEWER: 'Viewer' };

const STATUS_META: Record<AdminUser['status'], { label: string; category: StatusCategory }> = {
  ACTIVE: { label: 'Active', category: 'success' },
  INVITED: { label: 'Invited', category: 'warning' },
  DISABLED: { label: 'Disabled', category: 'error' },
};

const DATA: AdminUser[] = [
  { id: '1', name: 'Rohit Kumar', email: 'kumarrohitji89@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
  { id: '2', name: 'Sara Fernandes', email: 'sara@thewebhero.com', role: 'ADMIN', status: 'ACTIVE' },
  { id: '3', name: 'Dev Patel', email: 'dev@thewebhero.com', role: 'EDITOR', status: 'ACTIVE' },
  { id: '4', name: 'Priya Nair', email: 'priya@thewebhero.com', role: 'VIEWER', status: 'INVITED' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'role', label: 'Role', type: 'select', options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })) },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function UsersPage() {
  const columns: Column<AdminUser>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'role', header: 'Role', render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {r.role === 'SUPER_ADMIN' && <Crown className="h-3.5 w-3.5 text-amber-500" />}
          {ROLE_LABEL[r.role]}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Users', value: DATA.length, icon: UserCog, color: '#7c3aed' },
    { title: 'Super Admins', value: DATA.filter((d) => d.role === 'SUPER_ADMIN').length, icon: Crown, color: '#f59e0b' },
    { title: 'Active', value: DATA.filter((d) => d.status === 'ACTIVE').length, icon: ShieldCheck, color: '#16a34a' },
    { title: 'Disabled', value: DATA.filter((d) => d.status === 'DISABLED').length, icon: UserX, color: '#dc2626' },
  ];

  return (
    <ModulePage<AdminUser>
      title="Users & Roles"
      description="Admin panel users and their assigned role. Manage what each role can access under Permissions."
      addLabel="Invite User"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No users yet."
    />
  );
}
