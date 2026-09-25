'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Building2, CheckCircle2, PenLine, Star } from 'lucide-react';

interface RefItem { title: string; description: string }
interface ChallengeRef { title: string; description: string; techNeed: string }
interface IntegrationRef { name: string; type: string; description: string }
interface ProcessStepRow { step: string; title: string; description: string }
interface FaqRow { question: string; answer: string }
interface RelatedRef { title: string; slug: string; shortDescription: string; category?: string }
interface RelatedIndustryRef { name: string; slug: string; shortDescription: string; category?: string }

interface Industry {
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
  challenges: ChallengeRef[];
  capabilities: RefItem[];
  features: RefItem[];
  integrations: IntegrationRef[];
  process: ProcessStepRow[];
  security: string[];
  compliance: string[];
  scalability: string[];
  relatedServices: RelatedRef[];
  relatedSolutions: RelatedRef[];
  relatedTechnologies: RelatedRef[];
  relatedIndustries: RelatedIndustryRef[];
  faqs: FaqRow[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  status: 'active' | 'draft';
  featured: 'yes' | 'no';
}

const STATUS_META: Record<Industry['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Active', category: 'success' },
  draft: { label: 'Draft', category: 'warning' },
};

const DATA: Industry[] = [
  {
    id: '1', slug: 'healthcare', name: 'Healthcare', category: 'Healthcare', categorySlug: 'healthcare',
    shortDescription: 'Digital solutions for healthcare providers.', description: 'HIPAA-aware patient portals, scheduling and telehealth platforms.',
    iconName: 'HeartPulse', heroImage: '', overview: 'We help clinics and hospitals modernize patient experience with secure, compliant software.',
    challenges: [{ title: 'Legacy patient records', description: 'Paper-based systems slow down care.', techNeed: 'Digital EHR integration' }],
    capabilities: [{ title: 'Patient Portals', description: 'Self-service appointment booking.' }],
    features: [{ title: 'Telehealth Video', description: 'Secure video consultations.' }],
    integrations: [{ name: 'HL7/FHIR', type: 'Health Data Standard', description: 'Interoperability with existing EHR systems.' }],
    process: [{ step: '1', title: 'Compliance Review', description: 'HIPAA/GDPR requirements gathering.' }],
    security: ['End-to-end encrypted patient data'],
    compliance: ['HIPAA', 'GDPR'],
    scalability: ['Handles multi-clinic deployments'],
    relatedServices: [{ title: 'Web Development', slug: 'website-development', shortDescription: 'Custom, responsive websites.' }],
    relatedSolutions: [{ title: 'SaaS Product Development', slug: 'saas-product-development', shortDescription: 'From MVP to scale.' }],
    relatedTechnologies: [],
    relatedIndustries: [],
    faqs: [{ question: 'Is the platform HIPAA compliant?', answer: 'Yes, all builds follow HIPAA data-handling guidelines.' }],
    seoTitle: 'Healthcare Software Solutions | TheWebHero', seoDescription: 'Digital solutions for healthcare providers — patient portals, telehealth and more.',
    ogImage: '', status: 'active', featured: 'yes',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Industry Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'category', label: 'Category' },
  { key: 'categorySlug', label: 'Category Slug' },
  { key: 'iconName', label: 'Icon Name (Lucide)' },
  { key: 'heroImage', label: 'Hero Image URL' },
  { key: 'shortDescription', label: 'Short Description (card/listing)', type: 'textarea', required: true },
  { key: 'description', label: 'Full Description', type: 'richtext', required: true },
  { key: 'overview', label: 'Overview', type: 'richtext' },
  {
    key: 'challenges', label: 'Industry Challenges', type: 'repeater', repeaterAddLabel: 'Add Challenge',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'techNeed', label: 'Tech Need' }],
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
    key: 'integrations', label: 'Integrations', type: 'repeater', repeaterAddLabel: 'Add Integration',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'process', label: 'Process Steps', type: 'repeater', repeaterAddLabel: 'Add Step',
    repeaterFields: [{ key: 'step', label: 'Step #' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  { key: 'security', label: 'Security Notes (one per line)', type: 'stringlist' },
  { key: 'compliance', label: 'Compliance Standards (one per line)', type: 'stringlist' },
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
    repeaterFields: [{ key: 'title', label: 'Name' }, { key: 'slug', label: 'Slug' }, { key: 'shortDescription', label: 'Short Description', type: 'textarea' }],
  },
  {
    key: 'relatedIndustries', label: 'Related Industries', type: 'repeater', repeaterAddLabel: 'Add Related Industry',
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

export default function IndustriesPage() {
  const columns: Column<Industry>[] = [
    { key: 'name', header: 'Industry' },
    { key: 'category', header: 'Category' },
    { key: 'slug', header: 'Slug' },
    { key: 'featured', header: 'Featured', render: (r) => r.featured === 'yes' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Industries', value: DATA.length, icon: Building2, color: '#7c3aed' },
    { title: 'Active', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'draft').length, icon: PenLine, color: '#d97706' },
    { title: 'Featured', value: DATA.filter((d) => d.featured === 'yes').length, icon: Star, color: '#f59e0b' },
  ];

  return (
    <ModulePage<Industry>
      title="Industries"
      description="Industry pages — challenges, compliance, integrations, FAQs and SEO, all in one place."
      addLabel="Add Industry"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No industries yet."
    />
  );
}
