'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Lightbulb, CheckCircle2, PenLine, Star } from 'lucide-react';

interface RefItem { title: string; description: string }
interface TechRef { name: string; category?: string }
interface IntegrationRef { name: string; type: string; description: string }
interface ProcessStepRow { step: string; title: string; description: string }
interface FaqRow { question: string; answer: string }
interface RelatedRef { title: string; slug: string; shortDescription: string; category?: string }

interface Solution {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  iconName: string;
  heroImage: string;
  challenges: RefItem[];
  capabilities: RefItem[];
  audience: RefItem[];
  features: RefItem[];
  technologies: TechRef[];
  integrations: IntegrationRef[];
  process: ProcessStepRow[];
  benefits: RefItem[];
  security: string[];
  scalability: string[];
  relatedServices: RelatedRef[];
  relatedSolutions: RelatedRef[];
  faqs: FaqRow[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  status: 'active' | 'draft';
  featured: 'yes' | 'no';
}

const STATUS_META: Record<Solution['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Active', category: 'success' },
  draft: { label: 'Draft', category: 'warning' },
};

const DATA: Solution[] = [
  {
    id: '1', slug: 'e-commerce-solutions', title: 'E-commerce Solutions', category: 'Retail', categorySlug: 'retail',
    shortDescription: 'End-to-end online store builds.', description: 'Full-featured storefronts with checkout, inventory and payments built in.',
    iconName: 'ShoppingCart', heroImage: '',
    challenges: [{ title: 'Cart abandonment', description: 'Slow checkout flows lose sales.' }],
    capabilities: [{ title: 'Custom Storefronts', description: 'Tailored shopping experiences.' }],
    audience: [{ title: 'D2C Brands', description: 'Direct-to-consumer retailers scaling online.' }],
    features: [{ title: 'One-page Checkout', description: 'Reduces drop-off at payment.' }],
    technologies: [{ name: 'Next.js', category: 'Frontend' }, { name: 'Stripe', category: 'Payments' }],
    integrations: [{ name: 'Shopify', type: 'Platform', description: 'Headless Shopify integration.' }],
    process: [{ step: '1', title: 'Discovery', description: 'Map catalog and checkout flow.' }],
    benefits: [{ title: 'Higher conversion', description: 'Faster, simpler checkout.' }],
    security: ['PCI-DSS compliant payment handling'],
    scalability: ['Handles seasonal traffic spikes via CDN caching'],
    relatedServices: [{ title: 'Web Development', slug: 'website-development', shortDescription: 'Custom, responsive websites.' }],
    relatedSolutions: [],
    faqs: [{ question: 'Can you migrate my existing store?', answer: 'Yes, we handle full data migration.' }],
    seoTitle: 'E-commerce Solutions | TheWebHero', seoDescription: 'End-to-end e-commerce store builds that convert.',
    ogImage: '', status: 'active', featured: 'yes',
  },
  {
    id: '2', slug: 'saas-product-development', title: 'SaaS Product Development', category: 'Software', categorySlug: 'software',
    shortDescription: 'From MVP to scale.', description: 'Full-cycle SaaS product design and engineering.',
    iconName: 'Cloud', heroImage: '',
    challenges: [], capabilities: [], audience: [], features: [], technologies: [], integrations: [], process: [], benefits: [],
    security: [], scalability: [], relatedServices: [], relatedSolutions: [], faqs: [],
    seoTitle: 'SaaS Product Development | TheWebHero', seoDescription: 'From MVP to scale — SaaS product design and engineering.',
    ogImage: '', status: 'draft', featured: 'no',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Solution Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'category', label: 'Category' },
  { key: 'categorySlug', label: 'Category Slug' },
  { key: 'iconName', label: 'Icon Name (Lucide)' },
  { key: 'heroImage', label: 'Hero Image URL' },
  { key: 'shortDescription', label: 'Short Description (card/listing)', type: 'textarea', required: true },
  { key: 'description', label: 'Full Description', type: 'richtext', required: true },
  {
    key: 'challenges', label: 'Challenges Solved', type: 'repeater', repeaterAddLabel: 'Add Challenge',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'capabilities', label: 'Capabilities', type: 'repeater', repeaterAddLabel: 'Add Capability',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'audience', label: 'Target Audience', type: 'repeater', repeaterAddLabel: 'Add Audience',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'features', label: 'Features', type: 'repeater', repeaterAddLabel: 'Add Feature',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'technologies', label: 'Technologies Used', type: 'repeater', repeaterAddLabel: 'Add Technology',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'category', label: 'Category (optional)' }],
  },
  {
    key: 'integrations', label: 'Integrations', type: 'repeater', repeaterAddLabel: 'Add Integration',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'process', label: 'Process Steps', type: 'repeater', repeaterAddLabel: 'Add Step',
    repeaterFields: [{ key: 'step', label: 'Step #' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'benefits', label: 'Benefits', type: 'repeater', repeaterAddLabel: 'Add Benefit',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  { key: 'security', label: 'Security Notes (one per line)', type: 'stringlist' },
  { key: 'scalability', label: 'Scalability Notes (one per line)', type: 'stringlist' },
  {
    key: 'relatedServices', label: 'Related Services', type: 'repeater', repeaterAddLabel: 'Add Related Service',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }],
  },
  {
    key: 'relatedSolutions', label: 'Related Solutions', type: 'repeater', repeaterAddLabel: 'Add Related Solution',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }, { key: 'category', label: 'Category (optional)' }],
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

export default function SolutionsPage() {
  const columns: Column<Solution>[] = [
    { key: 'title', header: 'Solution' },
    { key: 'category', header: 'Category' },
    { key: 'slug', header: 'Slug' },
    { key: 'featured', header: 'Featured', render: (r) => r.featured === 'yes' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Solutions', value: DATA.length, icon: Lightbulb, color: '#7c3aed' },
    { title: 'Active', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'draft').length, icon: PenLine, color: '#d97706' },
    { title: 'Featured', value: DATA.filter((d) => d.featured === 'yes').length, icon: Star, color: '#f59e0b' },
  ];

  return (
    <ModulePage<Solution>
      title="Solutions"
      description="Business solutions — challenges, capabilities, integrations, FAQs and SEO, all in one place."
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
