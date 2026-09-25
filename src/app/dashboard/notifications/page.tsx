'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Bell, MailWarning, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  type: 'LEAD' | 'SYSTEM' | 'CONTENT';
  date: string;
  status: 'UNREAD' | 'READ';
}

const STATUS_META: Record<Notification['status'], { label: string; category: StatusCategory }> = {
  UNREAD: { label: 'Unread', category: 'warning' },
  READ: { label: 'Read', category: 'default' },
};

const DATA: Notification[] = [
  { id: '1', title: 'New lead: Ananya Verma submitted a quote request', type: 'LEAD', date: '24 Sep, 10:12 AM', status: 'UNREAD' },
  { id: '2', title: 'Blog post "10 Ways to Speed Up Your Next.js Site" published', type: 'CONTENT', date: '18 Sep, 4:30 PM', status: 'READ' },
  { id: '3', title: 'Weekly backup completed successfully', type: 'SYSTEM', date: '17 Sep, 2:00 AM', status: 'READ' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'type', label: 'Type', type: 'select', options: [{ value: 'LEAD', label: 'Lead' }, { value: 'CONTENT', label: 'Content' }, { value: 'SYSTEM', label: 'System' }] },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function NotificationsPage() {
  const columns: Column<Notification>[] = [
    { key: 'title', header: 'Notification' },
    { key: 'type', header: 'Type' },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total', value: DATA.length, icon: Bell, color: '#7c3aed' },
    { title: 'Unread', value: DATA.filter((d) => d.status === 'UNREAD').length, icon: MailWarning, color: '#d97706' },
    { title: 'Read', value: DATA.filter((d) => d.status === 'READ').length, icon: CheckCheck, color: '#16a34a' },
  ];

  return (
    <ModulePage<Notification>
      title="Notifications"
      description="System and activity notifications for the admin team."
      addLabel="Add Notification"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No notifications yet."
    />
  );
}
