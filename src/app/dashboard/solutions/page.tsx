'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Lightbulb, CheckCircle2, PenLine } from 'lucide-react';

interface Solution {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<Solution['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Solution[] = [
  { id: '1', title: 'E-commerce Solutions', slug: 'e-commerce-solutions', metaDescription: 'End-to-end online store builds.', status: 'PUBLISHED' },
  { id: '2', title: 'SaaS Product Development', slug: 'saas-product-development', metaDescription: 'From MVP to scale.', status: 'PUBLISHED' },
  { id: '3', title: 'Enterprise Solutions', slug: 'enterprise-solutions', metaDescription: 'Large-scale internal systems.', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Solution Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'metaDescription', label: 'Meta Description (SEO)', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function SolutionsPage() {
  const columns: Column<Solution>[] = [
    { key: 'title', header: 'Solution' },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Solutions', value: DATA.length, icon: Lightbulb, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<Solution>
      title="Solutions"
      description="Industry/business solutions showcased on the website."
      addLabel="Add Solution"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No solutions yet."
    />
  );
}
