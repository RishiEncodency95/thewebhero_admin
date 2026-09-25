'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { FolderOpen, CheckCircle2, PenLine } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  client: string;
  industry: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<Project['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Project[] = [
  { id: '1', title: 'HealthTrack Patient Portal', slug: 'healthtrack-patient-portal', client: 'HealthTrack', industry: 'Healthcare', status: 'PUBLISHED' },
  { id: '2', title: 'UrbanNest Property Platform', slug: 'urbannest-property-platform', client: 'UrbanNest', industry: 'Real Estate', status: 'PUBLISHED' },
  { id: '3', title: 'ShopEase Storefront', slug: 'shopease-storefront', client: 'ShopEase', industry: 'E-commerce', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Project Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'client', label: 'Client' },
  { key: 'industry', label: 'Industry' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function PortfolioPage() {
  const columns: Column<Project>[] = [
    { key: 'title', header: 'Project' },
    { key: 'client', header: 'Client' },
    { key: 'industry', header: 'Industry' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Projects', value: DATA.length, icon: FolderOpen, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<Project>
      title="Portfolio"
      description="Projects and case studies shown on the Portfolio page."
      addLabel="Add Project"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No projects yet."
    />
  );
}
