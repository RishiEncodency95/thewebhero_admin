'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Target, Clock, TrendingUp, XCircle } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  stage: 'NEW' | 'FOLLOW_UP' | 'CONVERTED' | 'LOST';
  followUpDate: string;
}

const STAGE_META: Record<Lead['stage'], { label: string; category: StatusCategory }> = {
  NEW: { label: 'New', category: 'default' },
  FOLLOW_UP: { label: 'Follow-up', category: 'warning' },
  CONVERTED: { label: 'Converted', category: 'success' },
  LOST: { label: 'Lost', category: 'error' },
};

const DATA: Lead[] = [
  { id: '1', name: 'Ananya Verma', phone: '+91 98765 43210', source: 'Website', stage: 'NEW', followUpDate: '24 Sep' },
  { id: '2', name: 'Kabir Singh', phone: '+91 91234 56780', source: 'Referral', stage: 'FOLLOW_UP', followUpDate: '25 Sep' },
  { id: '3', name: 'Ishita Rao', phone: '+91 90000 11122', source: 'Walk-in', stage: 'FOLLOW_UP', followUpDate: '25 Sep' },
  { id: '4', name: 'Vivaan Mehta', phone: '+91 99887 66554', source: 'Facebook Ads', stage: 'CONVERTED', followUpDate: '—' },
  { id: '5', name: 'Saanvi Nair', phone: '+91 98123 45678', source: 'Website', stage: 'NEW', followUpDate: '26 Sep' },
  { id: '6', name: 'Aryan Kapoor', phone: '+91 97654 32109', source: 'Google Ads', stage: 'LOST', followUpDate: '—' },
  { id: '7', name: 'Diya Malhotra', phone: '+91 96543 21098', source: 'Referral', stage: 'FOLLOW_UP', followUpDate: '27 Sep' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Name', required: true, placeholder: 'Full name' },
  { key: 'phone', label: 'Phone', required: true, placeholder: '+91 90000 00000' },
  { key: 'source', label: 'Source', placeholder: 'e.g. Website, Referral' },
  { key: 'followUpDate', label: 'Follow-up Date', placeholder: 'e.g. 28 Sep' },
  { key: 'stage', label: 'Stage', type: 'select', options: Object.entries(STAGE_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function LeadsPage() {
  const columns: Column<Lead>[] = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'source', header: 'Source' },
    { key: 'stage', header: 'Stage', render: (r) => <StatusBadge label={STAGE_META[r.stage].label} category={STAGE_META[r.stage].category} /> },
    { key: 'followUpDate', header: 'Follow-up' },
  ];

  const stats = [
    { title: 'Total Leads', value: DATA.length, icon: Target, color: '#7c3aed' },
    { title: 'Need Follow-up', value: DATA.filter((d) => d.stage === 'FOLLOW_UP').length, icon: Clock, color: '#d97706' },
    { title: 'Converted', value: DATA.filter((d) => d.stage === 'CONVERTED').length, icon: TrendingUp, color: '#16a34a' },
    { title: 'Lost', value: DATA.filter((d) => d.stage === 'LOST').length, icon: XCircle, color: '#dc2626' },
  ];

  return (
    <ModulePage<Lead>
      title="Leads"
      description="Leads captured from the website — website form fills, referrals and ad campaigns."
      addLabel="Add Lead"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No leads yet."
    />
  );
}
