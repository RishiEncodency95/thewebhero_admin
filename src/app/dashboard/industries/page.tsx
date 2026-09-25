'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Building2, CheckCircle2, PenLine } from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  slug: string;
  metaDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<Industry['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Industry[] = [
  { id: '1', name: 'Healthcare', slug: 'healthcare', metaDescription: 'Digital solutions for healthcare providers.', status: 'PUBLISHED' },
  { id: '2', name: 'Real Estate', slug: 'real-estate', metaDescription: 'Websites and CRMs for real estate.', status: 'PUBLISHED' },
  { id: '3', name: 'E-commerce & Retail', slug: 'ecommerce-retail', metaDescription: 'Online stores that convert.', status: 'PUBLISHED' },
  { id: '4', name: 'Education', slug: 'education', metaDescription: 'EdTech platforms and LMS.', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Industry Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'metaDescription', label: 'Meta Description (SEO)', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function IndustriesPage() {
  const columns: Column<Industry>[] = [
    { key: 'name', header: 'Industry' },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Industries', value: DATA.length, icon: Building2, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<Industry>
      title="Industries"
      description="Industry-specific pages showcased on the website."
      addLabel="Add Industry"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No industries yet."
    />
  );
}
