'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { LayoutGrid, CheckCircle2, PenLine } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  metaDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<Service['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Service[] = [
  { id: '1', title: 'Web Development', slug: 'web-development', category: 'Development', metaDescription: 'Custom, fast, and scalable websites.', status: 'PUBLISHED' },
  { id: '2', title: 'Mobile App Development', slug: 'mobile-app-development', category: 'Development', metaDescription: 'Native and cross-platform apps.', status: 'PUBLISHED' },
  { id: '3', title: 'UI/UX Design', slug: 'ui-ux-design', category: 'Design', metaDescription: 'User-centric interface design.', status: 'PUBLISHED' },
  { id: '4', title: 'SEO', slug: 'seo', category: 'Marketing', metaDescription: 'Rank higher, get found faster.', status: 'DRAFT' },
  { id: '5', title: 'Digital Marketing', slug: 'digital-marketing', category: 'Marketing', metaDescription: 'Full-funnel growth marketing.', status: 'PUBLISHED' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Service Title', required: true },
  { key: 'slug', label: 'Slug', required: true, placeholder: 'web-development' },
  { key: 'category', label: 'Category' },
  { key: 'metaDescription', label: 'Meta Description (SEO)', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function ServicesPage() {
  const columns: Column<Service>[] = [
    { key: 'title', header: 'Service' },
    { key: 'category', header: 'Category' },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Services', value: DATA.length, icon: LayoutGrid, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<Service>
      title="Services"
      description="Services listed on the website's Services section."
      addLabel="Add Service"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No services yet."
    />
  );
}
