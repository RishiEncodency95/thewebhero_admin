'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Users, CheckCircle2, EyeOff } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  status: 'HIDDEN' | 'PUBLISHED';
}

const STATUS_META: Record<TeamMember['status'], { label: string; category: StatusCategory }> = {
  HIDDEN: { label: 'Hidden', category: 'default' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: TeamMember[] = [
  { id: '1', name: 'Rohit Kumar', slug: 'rohit-kumar', role: 'Founder & CEO', bio: 'Leads product and engineering.', status: 'PUBLISHED' },
  { id: '2', name: 'Sara Fernandes', slug: 'sara-fernandes', role: 'Head of Design', bio: 'Leads the design team.', status: 'PUBLISHED' },
  { id: '3', name: 'Dev Patel', slug: 'dev-patel', role: 'Lead Developer', bio: 'Full-stack engineer.', status: 'HIDDEN' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'role', label: 'Role / Designation' },
  { key: 'bio', label: 'Short Bio', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function TeamPage() {
  const columns: Column<TeamMember>[] = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Members', value: DATA.length, icon: Users, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Hidden', value: DATA.filter((d) => d.status === 'HIDDEN').length, icon: EyeOff, color: '#64748b' },
  ];

  return (
    <ModulePage<TeamMember>
      title="Team"
      description="Team member profiles shown on the Team page."
      addLabel="Add Member"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No team members yet."
    />
  );
}
