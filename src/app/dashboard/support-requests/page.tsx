'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Headphones, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SupportRequest {
  id: string;
  name: string;
  email: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

const STATUS_META: Record<SupportRequest['status'], { label: string; category: StatusCategory }> = {
  OPEN: { label: 'Open', category: 'default' },
  IN_PROGRESS: { label: 'In Progress', category: 'warning' },
  RESOLVED: { label: 'Resolved', category: 'success' },
};

const PRIORITY_META: Record<SupportRequest['priority'], { label: string; category: StatusCategory }> = {
  LOW: { label: 'Low', category: 'info' },
  MEDIUM: { label: 'Medium', category: 'warning' },
  HIGH: { label: 'High', category: 'error' },
};

const DATA: SupportRequest[] = [
  { id: '1', name: 'Karan Malhotra', email: 'karan@client.com', issue: 'Login not working', priority: 'HIGH', status: 'OPEN' },
  { id: '2', name: 'Divya Reddy', email: 'divya@client.com', issue: 'Update product images', priority: 'LOW', status: 'IN_PROGRESS' },
  { id: '3', name: 'Suresh Iyer', email: 'suresh@client.com', issue: 'Payment gateway error', priority: 'HIGH', status: 'RESOLVED' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'issue', label: 'Issue', type: 'textarea', required: true },
  { key: 'priority', label: 'Priority', type: 'select', options: Object.entries(PRIORITY_META).map(([value, m]) => ({ value, label: m.label })) },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function SupportRequestsPage() {
  const columns: Column<SupportRequest>[] = [
    { key: 'name', header: 'Name' },
    { key: 'issue', header: 'Issue' },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge label={PRIORITY_META[r.priority].label} category={PRIORITY_META[r.priority].category} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total', value: DATA.length, icon: Headphones, color: '#7c3aed' },
    { title: 'Open', value: DATA.filter((d) => d.status === 'OPEN').length, icon: AlertTriangle, color: '#dc2626' },
    { title: 'Resolved', value: DATA.filter((d) => d.status === 'RESOLVED').length, icon: CheckCircle2, color: '#16a34a' },
  ];

  return (
    <ModulePage<SupportRequest>
      title="Support Requests"
      description="Client support tickets and issues."
      addLabel="Add Ticket"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No support requests yet."
    />
  );
}
