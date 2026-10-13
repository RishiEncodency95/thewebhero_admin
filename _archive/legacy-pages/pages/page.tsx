'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { FileText, CheckCircle2, PenLine } from 'lucide-react';

interface ItemRow { title: string; description: string }

interface SitePage {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  content: string;
  items: ItemRow[];
  highlights: string[];
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
  {
    id: '1', title: 'About Us', slug: '/company/about', tagline: 'Building websites that perform.',
    content: 'TheWebHero is a web design and development agency focused on fast, dynamic, SEO-first websites.',
    items: [{ title: 'Our Mission', description: 'Help businesses grow through performant, dynamic websites.' }, { title: 'Our Vision', description: 'Be the most trusted web partner for growing businesses.' }],
    highlights: ['50+ projects delivered', '4.9/5 average client rating'],
    metaTitle: 'About TheWebHero', metaDescription: 'Learn about our team and mission.', status: 'PUBLISHED', updatedAt: '18 Sep',
  },
  {
    id: '2', title: 'Culture', slug: '/company/culture', tagline: 'How we work together.',
    content: 'Our culture is built on ownership, craft and transparent communication.',
    items: [{ title: 'Ownership', description: 'Everyone owns outcomes, not just tasks.' }, { title: 'Craft', description: 'We sweat the details that matter.' }],
    highlights: [], metaTitle: 'Our Culture', metaDescription: 'What it is like to work with us.', status: 'DRAFT', updatedAt: '10 Sep',
  },
  {
    id: '3', title: 'Process', slug: '/company/process', tagline: 'How we deliver projects.',
    content: 'A clear, collaborative process from discovery to launch and beyond.',
    items: [{ title: '1. Discovery', description: 'Understand goals, audience and scope.' }, { title: '2. Design', description: 'Wireframes and UI design.' }, { title: '3. Build', description: 'Development and QA.' }, { title: '4. Launch', description: 'Deploy, monitor and support.' }],
    highlights: [], metaTitle: 'Our Process', metaDescription: 'How we deliver projects end to end.', status: 'PUBLISHED', updatedAt: '3 Sep',
  },
  {
    id: '4', title: 'Why Us', slug: '/company/why-us', tagline: 'What sets us apart.',
    content: 'Deep technical expertise combined with a focus on measurable business outcomes.',
    items: [{ title: 'Performance-first', description: 'Every build is optimized for Core Web Vitals.' }],
    highlights: [], metaTitle: 'Why Choose Us', metaDescription: 'What sets us apart.', status: 'DRAFT', updatedAt: '28 Aug',
  },
  {
    id: '5', title: 'Privacy Policy', slug: '/privacy-policy', tagline: '',
    content: 'How we collect, use and protect your data.',
    items: [], highlights: [], metaTitle: 'Privacy Policy', metaDescription: 'How we handle your data.', status: 'PUBLISHED', updatedAt: '20 Aug',
  },
  {
    id: '6', title: 'Terms & Conditions', slug: '/terms-and-conditions', tagline: '',
    content: 'Terms governing use of our website and services.',
    items: [], highlights: [], metaTitle: 'Terms & Conditions', metaDescription: 'Terms of using our website and services.', status: 'PUBLISHED', updatedAt: '20 Aug',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Page Title', required: true },
  { key: 'slug', label: 'Slug (URL)', required: true, placeholder: '/company/about' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'content', label: 'Page Content', type: 'richtext' },
  {
    key: 'items', label: 'Values / Principles / Process Steps', type: 'repeater', repeaterAddLabel: 'Add Item',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  { key: 'highlights', label: 'Highlight Stats (one per line)', type: 'stringlist', placeholder: '50+ projects delivered' },
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
      description="Static company & legal pages — About, Culture, Process, Why Us, Privacy, Terms."
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
