'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Trophy, CheckCircle2, Clock } from 'lucide-react';

interface Award {
  id: string;
  name: string;
  organization: string;
  year: string;
  category: string;
  description: string;
  verificationUrl: string;
  approvalStatus: 'approved' | 'pending';
}

const STATUS_META: Record<Award['approvalStatus'], { label: string; category: StatusCategory }> = {
  approved: { label: 'Approved', category: 'success' },
  pending: { label: 'Pending', category: 'warning' },
};

const DATA: Award[] = [
  { id: '1', name: 'Top Web Development Agency', organization: 'Clutch', year: '2026', category: 'Agency Ranking', description: 'Ranked as a top web development agency in India.', verificationUrl: '', approvalStatus: 'approved' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Award Name', required: true },
  { key: 'organization', label: 'Awarding Organization' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description', type: 'richtext' },
  { key: 'verificationUrl', label: 'Verification URL' },
  { key: 'approvalStatus', label: 'Approval Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function AwardsPage() {
  const columns: Column<Award>[] = [
    { key: 'name', header: 'Award' },
    { key: 'organization', header: 'Organization' },
    { key: 'year', header: 'Year' },
    { key: 'approvalStatus', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.approvalStatus].label} category={STATUS_META[r.approvalStatus].category} /> },
  ];

  const stats = [
    { title: 'Total Awards', value: DATA.length, icon: Trophy, color: '#7c3aed' },
    { title: 'Approved', value: DATA.filter((d) => d.approvalStatus === 'approved').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Pending', value: DATA.filter((d) => d.approvalStatus === 'pending').length, icon: Clock, color: '#d97706' },
  ];

  return (
    <ModulePage<Award>
      title="Awards"
      description="Awards and recognitions shown on the Awards page."
      addLabel="Add Award"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No awards yet."
    />
  );
}
