'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Send, UserCheck, UserX } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
}

const STATUS_META: Record<Subscriber['status'], { label: string; category: StatusCategory }> = {
  ACTIVE: { label: 'Active', category: 'success' },
  UNSUBSCRIBED: { label: 'Unsubscribed', category: 'default' },
};

const DATA: Subscriber[] = [
  { id: '1', email: 'ananya.verma@mail.com', subscribedAt: '18 Sep', status: 'ACTIVE' },
  { id: '2', email: 'kabir.singh@mail.com', subscribedAt: '15 Sep', status: 'ACTIVE' },
  { id: '3', email: 'ishita.rao@mail.com', subscribedAt: '1 Sep', status: 'UNSUBSCRIBED' },
];

const FIELDS: ModuleField[] = [
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'subscribedAt', label: 'Subscribed On' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function NewsletterPage() {
  const columns: Column<Subscriber>[] = [
    { key: 'email', header: 'Email' },
    { key: 'subscribedAt', header: 'Subscribed' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Subscribers', value: DATA.length, icon: Send, color: '#7c3aed' },
    { title: 'Active', value: DATA.filter((d) => d.status === 'ACTIVE').length, icon: UserCheck, color: '#16a34a' },
    { title: 'Unsubscribed', value: DATA.filter((d) => d.status === 'UNSUBSCRIBED').length, icon: UserX, color: '#64748b' },
  ];

  return (
    <ModulePage<Subscriber>
      title="Newsletter"
      description="Email subscribers collected from the website."
      addLabel="Add Subscriber"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="email"
      emptyMessage="No subscribers yet."
    />
  );
}
