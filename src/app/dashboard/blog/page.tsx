'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Newspaper, CheckCircle2, PenLine } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishDate: string;
}

const STATUS_META: Record<BlogPost['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: BlogPost[] = [
  { id: '1', title: '10 Ways to Speed Up Your Next.js Site', slug: '10-ways-speed-up-nextjs', author: 'Rohit Kumar', category: 'Performance', status: 'PUBLISHED', publishDate: '18 Sep' },
  { id: '2', title: 'A Complete Guide to Technical SEO', slug: 'complete-guide-technical-seo', author: 'Rohit Kumar', category: 'SEO', status: 'PUBLISHED', publishDate: '10 Sep' },
  { id: '3', title: 'Why Core Web Vitals Matter in 2026', slug: 'core-web-vitals-2026', author: 'Rohit Kumar', category: 'Performance', status: 'DRAFT', publishDate: '—' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Post Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'author', label: 'Author' },
  { key: 'category', label: 'Category' },
  { key: 'publishDate', label: 'Publish Date' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function BlogPage() {
  const columns: Column<BlogPost>[] = [
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
    { key: 'publishDate', header: 'Published' },
  ];

  const stats = [
    { title: 'Total Posts', value: DATA.length, icon: Newspaper, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<BlogPost>
      title="Blog"
      description="Blog posts published on the website's Resources > Blog section."
      addLabel="Add Post"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No blog posts yet."
    />
  );
}
