'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Mail, MailOpen, CheckCircle2 } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'REPLIED' | 'CLOSED';
}

const STATUS_META: Record<Enquiry['status'], { label: string; category: StatusCategory }> = {
  NEW: { label: 'New', category: 'default' },
  REPLIED: { label: 'Replied', category: 'info' },
  CLOSED: { label: 'Closed', category: 'success' },
};

const DATA: Enquiry[] = [
  { id: '1', name: 'Simran Kaur', email: 'simran@mail.com', subject: 'Partnership enquiry', message: 'Interested in a reseller partnership.', status: 'NEW' },
  { id: '2', name: 'Arjun Nair', email: 'arjun@mail.com', subject: 'Pricing question', message: 'What are your maintenance plan rates?', status: 'REPLIED' },
  { id: '3', name: 'Fatima Sheikh', email: 'fatima@mail.com', subject: 'Support', message: 'Site is down since morning.', status: 'CLOSED' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'subject', label: 'Subject', required: true },
  { key: 'message', label: 'Message', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function ContactEnquiriesPage() {
  const columns: Column<Enquiry>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'subject', header: 'Subject' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total', value: DATA.length, icon: Mail, color: '#7c3aed' },
    { title: 'New', value: DATA.filter((d) => d.status === 'NEW').length, icon: MailOpen, color: '#3b82f6' },
    { title: 'Closed', value: DATA.filter((d) => d.status === 'CLOSED').length, icon: CheckCircle2, color: '#16a34a' },
  ];

  return (
    <ModulePage<Enquiry>
      title="Contact Enquiries"
      description="Messages submitted through the website contact form."
      addLabel="Add Enquiry"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No contact enquiries yet."
    />
  );
}
