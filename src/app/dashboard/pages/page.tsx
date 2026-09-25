'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { FileText, CheckCircle2, PenLine } from 'lucide-react';

interface SitePage {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
}

const STATUS_META: Record<SitePage['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: SitePage[] = [
  { id: '1', title: 'About Us', slug: '/company/about', metaTitle: 'About TheWebHero', metaDescription: 'Learn about our team and mission.', status: 'PUBLISHED', updatedAt: '18 Sep' },
  { id: '2', title: 'Culture', slug: '/company/culture', metaTitle: 'Our Culture', metaDescription: 'What it is like to work with us.', status: 'DRAFT', updatedAt: '10 Sep' },
  { id: '3', title: 'Partners', slug: '/company/partners', metaTitle: 'Our Partners', metaDescription: 'Technology and channel partners.', status: 'PUBLISHED', updatedAt: '5 Sep' },
  { id: '4', title: 'Process', slug: '/company/process', metaTitle: 'Our Process', metaDescription: 'How we deliver projects end to end.', status: 'PUBLISHED', updatedAt: '3 Sep' },
  { id: '5', title: 'Why Us', slug: '/company/why-us', metaTitle: 'Why Choose Us', metaDescription: 'What sets us apart.', status: 'DRAFT', updatedAt: '28 Aug' },
  { id: '6', title: 'Awards', slug: '/company/awards', metaTitle: 'Awards & Recognition', metaDescription: 'Recognitions we have earned.', status: 'PUBLISHED', updatedAt: '25 Aug' },
  { id: '7', title: 'Privacy Policy', slug: '/privacy-policy', metaTitle: 'Privacy Policy', metaDescription: 'How we handle your data.', status: 'PUBLISHED', updatedAt: '20 Aug' },
  { id: '8', title: 'Terms & Conditions', slug: '/terms-and-conditions', metaTitle: 'Terms & Conditions', metaDescription: 'Terms of using our website and services.', status: 'PUBLISHED', updatedAt: '20 Aug' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Page Title', required: true },
  { key: 'slug', label: 'Slug (URL)', required: true, placeholder: '/company/about' },
  { key: 'metaTitle', label: 'Meta Title (SEO)' },
  { key: 'metaDescription', label: 'Meta Description (SEO)', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function PagesPage() {
  const columns: Column<SitePage>[] = [
    { key: 'title', header: 'Page' },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
    { key: 'updatedAt', header: 'Updated' },
  ];

  const stats = [
    { title: 'Total Pages', value: DATA.length, icon: FileText, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<SitePage>
      title="Pages"
      description="Static company & legal pages — About, Culture, Partners, Process, Why Us, Awards, Privacy, Terms."
      addLabel="Add Page"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No pages yet."
    />
  );
}
