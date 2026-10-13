'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Layers, CheckCircle2, PenLine, Star } from 'lucide-react';

interface RefItem { title: string; description: string }
interface EcosystemRef { name: string; category: string; description: string }
interface IntegrationRef { name: string; type: string; description: string }
interface ProcessStepRow { step: string; title: string; description: string }
interface FaqRow { question: string; answer: string }
interface RelatedRef { title: string; slug: string; shortDescription: string; category?: string }
interface RelatedTechRef { name: string; slug: string; shortDescription: string; category?: string }

interface Technology {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  iconName: string;
  heroImage: string;
  overview: string;
  useCases: RefItem[];
  capabilities: RefItem[];
  features: RefItem[];
  ecosystem: EcosystemRef[];
  integrations: IntegrationRef[];
  process: ProcessStepRow[];
  security: string[];
  scalability: string[];
  relatedServices: RelatedRef[];
  relatedSolutions: RelatedRef[];
  relatedTechnologies: RelatedTechRef[];
  faqs: FaqRow[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  status: 'active' | 'draft';
  featured: 'yes' | 'no';
}

const STATUS_META: Record<Technology['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Active', category: 'success' },
  draft: { label: 'Draft', category: 'warning' },
};

const DATA: Technology[] = [
  {
    id: '1', slug: 'nextjs', name: 'Next.js', category: 'Frontend', categorySlug: 'frontend',
    shortDescription: 'The React framework we use for fast, SEO-ready sites.',
    description: 'Next.js powers our SSR/SSG/ISR builds for maximum performance and SEO.',
    iconName: 'Layers', heroImage: '', overview: 'A production-grade React framework with built-in routing, rendering strategies and optimizations.',
    useCases: [{ title: 'Marketing Sites', description: 'SEO-first static/ISR pages.' }],
    capabilities: [{ title: 'Server Components', description: 'Faster, lighter client bundles.' }],
    features: [{ title: 'Image Optimization', description: 'Automatic responsive images.' }],
    ecosystem: [{ name: 'Vercel', category: 'Hosting', description: 'First-party deployment platform.' }],
    integrations: [{ name: 'Tailwind CSS', type: 'Styling', description: 'Utility-first CSS integration.' }],
    process: [{ step: '1', title: 'Architecture Setup', description: 'App Router structure and rendering strategy.' }],
    security: ['Automatic CSRF-safe server actions'],
    scalability: ['Edge and CDN caching out of the box'],
    relatedServices: [{ title: 'Web Development', slug: 'website-development', shortDescription: 'Custom, responsive websites.' }],
    relatedSolutions: [],
    relatedTechnologies: [{ name: 'React', slug: 'react', shortDescription: 'The UI library Next.js is built on.' }],
    faqs: [{ question: 'Why Next.js over plain React?', answer: 'Built-in SSR/SSG/ISR and routing for better SEO and performance.' }],
    seoTitle: 'Next.js Development | TheWebHero', seoDescription: 'SEO-optimized, lightning-fast SSR & SSG web solutions with Next.js.',
    ogImage: '', status: 'active', featured: 'yes',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Technology Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'category', label: 'Category' },
  { key: 'categorySlug', label: 'Category Slug' },
  { key: 'iconName', label: 'Icon Name (Lucide)' },
  { key: 'heroImage', label: 'Hero Image URL' },
  { key: 'shortDescription', label: 'Short Description (card/listing)', type: 'textarea', required: true },
  { key: 'description', label: 'Full Description', type: 'richtext', required: true },
  { key: 'overview', label: 'Overview', type: 'richtext' },
  {
    key: 'useCases', label: 'Use Cases', type: 'repeater', repeaterAddLabel: 'Add Use Case',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'capabilities', label: 'Capabilities', type: 'repeater', repeaterAddLabel: 'Add Capability',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'features', label: 'Features', type: 'repeater', repeaterAddLabel: 'Add Feature',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'ecosystem', label: 'Ecosystem', type: 'repeater', repeaterAddLabel: 'Add Ecosystem Item',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'category', label: 'Category' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'integrations', label: 'Integrations', type: 'repeater', repeaterAddLabel: 'Add Integration',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'process', label: 'Process Steps', type: 'repeater', repeaterAddLabel: 'Add Step',
    repeaterFields: [{ key: 'step', label: 'Step #' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  { key: 'security', label: 'Security Notes (one per line)', type: 'stringlist' },
  { key: 'scalability', label: 'Scalability Notes (one per line)', type: 'stringlist' },
  {
    key: 'relatedServices', label: 'Related Services', type: 'repeater', repeaterAddLabel: 'Add Related Service',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }],
  },
  {
    key: 'relatedSolutions', label: 'Related Solutions', type: 'repeater', repeaterAddLabel: 'Add Related Solution',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }],
  },
  {
    key: 'relatedTechnologies', label: 'Related Technologies', type: 'repeater', repeaterAddLabel: 'Add Related Technology',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }, { key: 'category', label: 'Category (optional)' }],
  },
  {
    key: 'faqs', label: 'FAQs', type: 'repeater', repeaterAddLabel: 'Add FAQ',
    repeaterFields: [{ key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer', type: 'textarea' }],
  },
  { key: 'seoTitle', label: 'SEO Title' },
  { key: 'seoDescription', label: 'SEO Description', type: 'richtext' },
  { key: 'ogImage', label: 'Open Graph Image URL' },
  { key: 'featured', label: 'Featured on Homepage', type: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function TechnologiesPage() {
  const columns: Column<Technology>[] = [
    { key: 'name', header: 'Technology' },
    { key: 'category', header: 'Category' },
    { key: 'slug', header: 'Slug' },
    { key: 'featured', header: 'Featured', render: (r) => r.featured === 'yes' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Technologies', value: DATA.length, icon: Layers, color: '#7c3aed' },
    { title: 'Active', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'draft').length, icon: PenLine, color: '#d97706' },
    { title: 'Featured', value: DATA.filter((d) => d.featured === 'yes').length, icon: Star, color: '#f59e0b' },
  ];

  return (
    <ModulePage<Technology>
      title="Technologies"
      description="Tech stack pages — use cases, ecosystem, integrations, FAQs and SEO, all in one place."
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
