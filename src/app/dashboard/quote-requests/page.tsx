'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  service: string;
  budget: string;
  status: 'NEW' | 'QUOTED' | 'WON' | 'LOST';
}

const STATUS_META: Record<QuoteRequest['status'], { label: string; category: StatusCategory }> = {
  NEW: { label: 'New', category: 'default' },
  QUOTED: { label: 'Quoted', category: 'warning' },
  WON: { label: 'Won', category: 'success' },
  LOST: { label: 'Lost', category: 'error' },
};

const DATA: QuoteRequest[] = [
  { id: '1', name: 'Rohan Gupta', email: 'rohan@acme.com', service: 'Web Development', budget: '₹1L - 3L', status: 'NEW' },
  { id: '2', name: 'Priya Shah', email: 'priya@zeta.io', service: 'Mobile App', budget: '₹5L+', status: 'QUOTED' },
  { id: '3', name: 'Amit Joshi', email: 'amit@nova.co', service: 'SEO', budget: '₹50K - 1L', status: 'WON' },
  { id: '4', name: 'Neha Kulkarni', email: 'neha@bright.com', service: 'UI/UX Design', budget: '₹1L - 3L', status: 'LOST' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'service', label: 'Service' },
  { key: 'budget', label: 'Budget' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function QuoteRequestsPage() {
  const columns: Column<QuoteRequest>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'service', header: 'Service' },
    { key: 'budget', header: 'Budget' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Requests', value: DATA.length, icon: FileText, color: '#7c3aed' },
    { title: 'New', value: DATA.filter((d) => d.status === 'NEW').length, icon: Clock, color: '#3b82f6' },
    { title: 'Won', value: DATA.filter((d) => d.status === 'WON').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Lost', value: DATA.filter((d) => d.status === 'LOST').length, icon: XCircle, color: '#dc2626' },
  ];

  return (
    <ModulePage<QuoteRequest>
      title="Quote Requests"
      description="Requests submitted through the Get a Quote form."
      addLabel="Add Request"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No quote requests yet."
    />
  );
}
