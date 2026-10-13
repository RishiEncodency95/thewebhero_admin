'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { BookOpen, CheckCircle2, PenLine } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  result: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<CaseStudy['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: CaseStudy[] = [
  { id: '1', title: 'How HealthTrack Cut Load Time by 60%', slug: 'healthtrack-load-time', client: 'HealthTrack', result: '+60% faster, +35% signups', status: 'PUBLISHED' },
  { id: '2', title: 'ShopEase 3x Conversion Redesign', slug: 'shopease-conversion-redesign', client: 'ShopEase', result: '3x conversion rate', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Case Study Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'client', label: 'Client' },
  { key: 'result', label: 'Key Result' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function CaseStudiesPage() {
  const columns: Column<CaseStudy>[] = [
    { key: 'title', header: 'Case Study' },
    { key: 'client', header: 'Client' },
    { key: 'result', header: 'Key Result' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Case Studies', value: DATA.length, icon: BookOpen, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<CaseStudy>
      title="Case Studies"
      description="In-depth results-driven write-ups linked from Portfolio."
      addLabel="Add Case Study"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No case studies yet."
    />
  );
}
