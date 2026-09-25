'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Layers, CheckCircle2, PenLine } from 'lucide-react';

interface Technology {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<Technology['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Technology[] = [
  { id: '1', name: 'React', slug: 'react', category: 'Frontend', status: 'PUBLISHED' },
  { id: '2', name: 'Next.js', slug: 'nextjs', category: 'Frontend', status: 'PUBLISHED' },
  { id: '3', name: 'Node.js', slug: 'nodejs', category: 'Backend', status: 'PUBLISHED' },
  { id: '4', name: 'Flutter', slug: 'flutter', category: 'Mobile', status: 'DRAFT' },
  { id: '5', name: 'AWS', slug: 'aws', category: 'Cloud', status: 'PUBLISHED' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Technology Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function TechnologiesPage() {
  const columns: Column<Technology>[] = [
    { key: 'name', header: 'Technology' },
    { key: 'category', header: 'Category' },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Technologies', value: DATA.length, icon: Layers, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<Technology>
      title="Technologies"
      description="Tech stack pages showcased on the website."
      addLabel="Add Technology"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No technologies yet."
    />
  );
}
