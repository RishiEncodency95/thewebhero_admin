'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Handshake, CheckCircle2, Clock } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  websiteUrl: string;
  approvalStatus: 'approved' | 'pending';
}

const STATUS_META: Record<Partner['approvalStatus'], { label: string; category: StatusCategory }> = {
  approved: { label: 'Approved', category: 'success' },
  pending: { label: 'Pending', category: 'warning' },
};

const DATA: Partner[] = [
  { id: '1', name: 'Vercel', logo: '', category: 'Hosting', description: 'Deployment and hosting partner for our Next.js builds.', websiteUrl: 'https://vercel.com', approvalStatus: 'approved' },
  { id: '2', name: 'Stripe', logo: '', category: 'Payments', description: 'Payments infrastructure partner for e-commerce projects.', websiteUrl: 'https://stripe.com', approvalStatus: 'approved' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Partner Name', required: true },
  { key: 'logo', label: 'Logo URL' },
  { key: 'category', label: 'Category', placeholder: 'Hosting, Payments, Technology...' },
  { key: 'description', label: 'Description', type: 'richtext' },
  { key: 'websiteUrl', label: 'Website URL' },
  { key: 'approvalStatus', label: 'Approval Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function PartnersPage() {
  const columns: Column<Partner>[] = [
    { key: 'name', header: 'Partner' },
    { key: 'category', header: 'Category' },
    { key: 'approvalStatus', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.approvalStatus].label} category={STATUS_META[r.approvalStatus].category} /> },
  ];

  const stats = [
    { title: 'Total Partners', value: DATA.length, icon: Handshake, color: '#7c3aed' },
    { title: 'Approved', value: DATA.filter((d) => d.approvalStatus === 'approved').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Pending', value: DATA.filter((d) => d.approvalStatus === 'pending').length, icon: Clock, color: '#d97706' },
  ];

  return (
    <ModulePage<Partner>
      title="Partners"
      description="Technology and channel partners shown on the Partners page."
      addLabel="Add Partner"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No partners yet."
    />
  );
}
