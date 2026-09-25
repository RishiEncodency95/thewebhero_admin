'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Search, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SeoEntry {
  id: string;
  page: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  status: 'OPTIMIZED' | 'NEEDS_REVIEW';
}

const STATUS_META: Record<SeoEntry['status'], { label: string; category: StatusCategory }> = {
  OPTIMIZED: { label: 'Optimized', category: 'success' },
  NEEDS_REVIEW: { label: 'Needs Review', category: 'warning' },
};

const DATA: SeoEntry[] = [
  { id: '1', page: '/', metaTitle: 'TheWebHero — Web Design & Development Agency', metaDescription: 'We build fast, dynamic, SEO-first websites that convert.', canonicalUrl: 'https://thewebhero.com/', status: 'OPTIMIZED' },
  { id: '2', page: '/services', metaTitle: 'Services', metaDescription: 'Our services.', canonicalUrl: 'https://thewebhero.com/services', status: 'NEEDS_REVIEW' },
  { id: '3', page: '/portfolio', metaTitle: 'Portfolio — Case Studies & Projects', metaDescription: 'Explore our recent projects and results across industries.', canonicalUrl: 'https://thewebhero.com/portfolio', status: 'OPTIMIZED' },
  { id: '4', page: '/company/careers', metaTitle: 'Careers', metaDescription: '', canonicalUrl: 'https://thewebhero.com/company/careers', status: 'NEEDS_REVIEW' },
];

const FIELDS: ModuleField[] = [
  { key: 'page', label: 'Page Path', required: true, placeholder: '/services' },
  { key: 'metaTitle', label: 'Meta Title' },
  { key: 'metaDescription', label: 'Meta Description', type: 'richtext' },
  { key: 'canonicalUrl', label: 'Canonical URL', type: 'url' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function SeoPage() {
  const columns: Column<SeoEntry>[] = [
    { key: 'page', header: 'Page' },
    { key: 'metaTitle', header: 'Meta Title' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Pages Tracked', value: DATA.length, icon: Search, color: '#7c3aed' },
    { title: 'Optimized', value: DATA.filter((d) => d.status === 'OPTIMIZED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Needs Review', value: DATA.filter((d) => d.status === 'NEEDS_REVIEW').length, icon: AlertTriangle, color: '#d97706' },
  ];

  return (
    <ModulePage<SeoEntry>
      title="SEO"
      description="Meta titles, descriptions and canonical URLs per page — keep every page 100% search-ready."
      addLabel="Add Page SEO"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="page"
      emptyMessage="No SEO entries yet."
    />
  );
}
