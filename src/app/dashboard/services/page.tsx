'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { LayoutGrid, CheckCircle2, PenLine, Star } from 'lucide-react';

interface RefItem { title: string; description: string; iconName?: string }
interface TechRef { name: string; category?: string; iconName?: string }
interface SubService { title: string; slug: string; description: string }
interface ProcessStepRow { step: string; title: string; description: string }
interface FaqRow { question: string; answer: string }
interface RelatedRef { title: string; slug: string; shortDescription: string; category?: string }

interface Service {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  problemStatement: string;
  iconName: string;
  heroImage: string;
  capabilities: RefItem[];
  subServices: SubService[];
  technologies: TechRef[];
  deliverables: string[];
  process: ProcessStepRow[];
  benefits: RefItem[];
  faqs: FaqRow[];
  relatedServices: RelatedRef[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  status: 'active' | 'draft';
  featured: 'yes' | 'no';
}

const STATUS_META: Record<Service['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Active', category: 'success' },
  draft: { label: 'Draft', category: 'warning' },
};

const DATA: Service[] = [
  {
    id: '1', slug: 'website-development', title: 'Website Development', category: 'Web Development', categorySlug: 'web-development',
    shortDescription: 'Custom, responsive websites tailored for business growth.',
    description: 'We design and build fast, secure, SEO-first websites using modern frameworks.',
    problemStatement: 'Outdated or slow websites lose visitors and rankings.',
    iconName: 'Globe', heroImage: '',
    capabilities: [{ title: 'Responsive Design', description: 'Looks great on every device.' }, { title: 'SEO-first Build', description: 'Structured for search from day one.' }],
    subServices: [{ title: 'Landing Pages', slug: 'landing-pages', description: 'High-converting campaign pages.' }],
    technologies: [{ name: 'Next.js', category: 'Framework' }, { name: 'Tailwind CSS', category: 'Styling' }],
    deliverables: ['Fully responsive website', 'SEO-optimized pages', 'Analytics setup'],
    process: [{ step: '1', title: 'Discovery', description: 'Understand goals and audience.' }, { step: '2', title: 'Design', description: 'Wireframes and UI design.' }],
    benefits: [{ title: 'Faster load times', description: 'Better rankings and conversions.' }],
    faqs: [{ question: 'How long does a website take?', answer: 'Typically 4-8 weeks depending on scope.' }],
    relatedServices: [{ title: 'SEO', slug: 'seo', shortDescription: 'Rank higher, get found faster.' }],
    seoTitle: 'Website Development Services | TheWebHero',
    seoDescription: 'Custom, responsive, SEO-first website development services.',
    ogImage: '', status: 'active', featured: 'yes',
  },
  {
    id: '2', slug: 'seo', title: 'SEO', category: 'Marketing', categorySlug: 'marketing',
    shortDescription: 'Rank higher, get found faster.', description: 'Technical and content SEO to grow organic traffic.',
    problemStatement: '', iconName: 'Search', heroImage: '',
    capabilities: [], subServices: [], technologies: [], deliverables: [], process: [], benefits: [], faqs: [], relatedServices: [],
    seoTitle: 'SEO Services | TheWebHero', seoDescription: 'Technical and content SEO services that grow organic traffic.',
    ogImage: '', status: 'draft', featured: 'no',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Service Title', required: true },
  { key: 'slug', label: 'Slug', required: true, placeholder: 'website-development' },
  { key: 'category', label: 'Category', placeholder: 'Web Development' },
  { key: 'categorySlug', label: 'Category Slug', placeholder: 'web-development' },
  { key: 'iconName', label: 'Icon Name (Lucide)', placeholder: 'Globe' },
  { key: 'heroImage', label: 'Hero Image URL' },
  { key: 'shortDescription', label: 'Short Description (card/listing)', type: 'textarea', required: true },
  { key: 'description', label: 'Full Description', type: 'richtext', required: true },
  { key: 'problemStatement', label: 'Problem Statement', type: 'textarea' },
  {
    key: 'capabilities', label: 'Capabilities', type: 'repeater', repeaterAddLabel: 'Add Capability',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'iconName', label: 'Icon Name (optional)' }],
  },
  {
    key: 'subServices', label: 'Sub-services', type: 'repeater', repeaterAddLabel: 'Add Sub-service',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'technologies', label: 'Technologies Used', type: 'repeater', repeaterAddLabel: 'Add Technology',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'category', label: 'Category (optional)' }, { key: 'iconName', label: 'Icon Name (optional)' }],
  },
  { key: 'deliverables', label: 'Deliverables (one per line)', type: 'stringlist' },
  {
    key: 'process', label: 'Process Steps', type: 'repeater', repeaterAddLabel: 'Add Step',
    repeaterFields: [{ key: 'step', label: 'Step #' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'benefits', label: 'Benefits', type: 'repeater', repeaterAddLabel: 'Add Benefit',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'faqs', label: 'FAQs', type: 'repeater', repeaterAddLabel: 'Add FAQ',
    repeaterFields: [{ key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer', type: 'textarea' }],
  },
  {
    key: 'relatedServices', label: 'Related Services', type: 'repeater', repeaterAddLabel: 'Add Related Service',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }, { key: 'category', label: 'Category (optional)' }],
  },
  { key: 'seoTitle', label: 'SEO Title' },
  { key: 'seoDescription', label: 'SEO Description', type: 'richtext' },
  { key: 'ogImage', label: 'Open Graph Image URL' },
  { key: 'featured', label: 'Featured on Homepage', type: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function ServicesPage() {
  const columns: Column<Service>[] = [
    { key: 'title', header: 'Service' },
    { key: 'category', header: 'Category' },
    { key: 'slug', header: 'Slug' },
    { key: 'featured', header: 'Featured', render: (r) => r.featured === 'yes' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Services', value: DATA.length, icon: LayoutGrid, color: '#7c3aed' },
    { title: 'Active', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'draft').length, icon: PenLine, color: '#d97706' },
    { title: 'Featured', value: DATA.filter((d) => d.featured === 'yes').length, icon: Star, color: '#f59e0b' },
  ];

  return (
    <ModulePage<Service>
      title="Services"
      description="Full service pages — capabilities, process, technologies, FAQs and SEO, all in one place."
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
