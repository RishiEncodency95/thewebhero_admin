'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { FolderOpen, CheckCircle2, PenLine, Star } from 'lucide-react';

interface ServiceRef { title: string; slug: string; category?: string }
interface TechRef { name: string; slug?: string; category?: string; iconName?: string }
interface SolutionRef { title: string; slug: string }
interface IndustryRef { title: string; slug: string }
interface FeatureRef { title: string; description: string; iconName?: string }
interface GalleryItem { url: string; alt: string; caption?: string; category?: string }
interface ProcessStepRow { step: string; title: string; description: string }

interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  coverImageAlt: string;
  featured: 'yes' | 'no';
  status: 'active' | 'draft';
  projectType: string;
  industry: string;
  industrySlug: string;
  platforms: string[];
  liveUrl: string;
  clientVisibility: 'public' | 'confidential' | 'generic';
  clientName: string;
  services: ServiceRef[];
  technologies: TechRef[];
  solutions: SolutionRef[];
  industries: IndustryRef[];
  challengeTitle: string;
  challengeDescription: string;
  challengeKeyPoints: string[];
  objectivesTitle: string;
  objectivesItems: string[];
  solutionSummary: string;
  solutionDeliverables: string[];
  architectureNote: string;
  features: FeatureRef[];
  gallery: GalleryItem[];
  process: ProcessStepRow[];
  integrations: string[];
  relatedProjectSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

const STATUS_META: Record<Project['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Published', category: 'success' },
  draft: { label: 'Draft', category: 'warning' },
};

const DATA: Project[] = [
  {
    id: '1', slug: 'healthtrack-patient-portal', title: 'HealthTrack Patient Portal', subtitle: 'A secure telehealth platform',
    shortDescription: 'A HIPAA-aware patient portal with scheduling and telehealth.', description: 'Full case study of the HealthTrack patient portal build.',
    coverImage: '', coverImageAlt: 'HealthTrack patient portal dashboard screenshot',
    featured: 'yes', status: 'active', projectType: 'Web Application', industry: 'Healthcare', industrySlug: 'healthcare',
    platforms: ['Web', 'Mobile Web'], liveUrl: '', clientVisibility: 'public', clientName: 'HealthTrack',
    services: [{ title: 'Web Development', slug: 'website-development' }],
    technologies: [{ name: 'Next.js' }, { name: 'MongoDB' }],
    solutions: [], industries: [{ title: 'Healthcare', slug: 'healthcare' }],
    challengeTitle: 'Fragmented patient records', challengeDescription: 'Patients had no single place to view appointments and records.',
    challengeKeyPoints: ['Multiple disconnected systems', 'No self-service booking'],
    objectivesTitle: 'Project Goals', objectivesItems: ['Unify patient records', 'Enable self-service booking'],
    solutionSummary: 'Built a unified portal with secure login, booking and telehealth.',
    solutionDeliverables: ['Patient portal', 'Telehealth video module', 'Admin dashboard'],
    architectureNote: 'Next.js frontend, Node.js API, MongoDB, HL7/FHIR integration.',
    features: [{ title: 'Telehealth Video', description: 'Secure video consultations.' }],
    gallery: [{ url: '', alt: 'Dashboard overview' }],
    process: [{ step: '1', title: 'Discovery', description: 'Stakeholder interviews and compliance review.' }],
    integrations: ['HL7/FHIR', 'Twilio Video'],
    relatedProjectSlugs: [],
    seoTitle: 'HealthTrack Patient Portal Case Study | TheWebHero', seoDescription: 'How we built a secure, HIPAA-aware patient portal for HealthTrack.',
    ogImage: '',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Project Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'coverImage', label: 'Cover Image URL' },
  { key: 'coverImageAlt', label: 'Cover Image Alt Text (SEO)' },
  { key: 'shortDescription', label: 'Short Description (card/listing)', type: 'textarea', required: true },
  { key: 'description', label: 'Full Description', type: 'richtext', required: true },
  { key: 'projectType', label: 'Project Type', placeholder: 'Web Application' },
  { key: 'industry', label: 'Industry' },
  { key: 'industrySlug', label: 'Industry Slug' },
  { key: 'platforms', label: 'Platforms (one per line)', type: 'stringlist', placeholder: 'Web' },
  { key: 'liveUrl', label: 'Live URL' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'clientVisibility', label: 'Client Visibility', type: 'select', options: [{ value: 'public', label: 'Public' }, { value: 'confidential', label: 'Confidential' }, { value: 'generic', label: 'Generic' }] },
  {
    key: 'services', label: 'Related Services', type: 'repeater', repeaterAddLabel: 'Add Service',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'category', label: 'Category (optional)' }],
  },
  {
    key: 'technologies', label: 'Technologies Used', type: 'repeater', repeaterAddLabel: 'Add Technology',
    repeaterFields: [{ key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug (optional)' }, { key: 'category', label: 'Category (optional)' }],
  },
  {
    key: 'solutions', label: 'Related Solutions', type: 'repeater', repeaterAddLabel: 'Add Solution',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }],
  },
  {
    key: 'industries', label: 'Related Industries', type: 'repeater', repeaterAddLabel: 'Add Industry',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }],
  },
  { key: 'challengeTitle', label: 'Challenge — Title' },
  { key: 'challengeDescription', label: 'Challenge — Description', type: 'textarea' },
  { key: 'challengeKeyPoints', label: 'Challenge — Key Points (one per line)', type: 'stringlist' },
  { key: 'objectivesTitle', label: 'Objectives — Title' },
  { key: 'objectivesItems', label: 'Objectives — Items (one per line)', type: 'stringlist' },
  { key: 'solutionSummary', label: 'Solution — Summary', type: 'textarea' },
  { key: 'solutionDeliverables', label: 'Solution — Deliverables (one per line)', type: 'stringlist' },
  { key: 'architectureNote', label: 'Solution — Architecture Note', type: 'textarea' },
  {
    key: 'features', label: 'Key Features', type: 'repeater', repeaterAddLabel: 'Add Feature',
    repeaterFields: [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  {
    key: 'gallery', label: 'Gallery Images', type: 'repeater', repeaterAddLabel: 'Add Image',
    repeaterFields: [{ key: 'url', label: 'Image URL' }, { key: 'alt', label: 'Alt Text' }, { key: 'caption', label: 'Caption (optional)' }],
  },
  {
    key: 'process', label: 'Process Steps', type: 'repeater', repeaterAddLabel: 'Add Step',
    repeaterFields: [{ key: 'step', label: 'Step #' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }],
  },
  { key: 'integrations', label: 'Integrations (one per line)', type: 'stringlist' },
  { key: 'relatedProjectSlugs', label: 'Related Project Slugs (one per line)', type: 'stringlist' },
  { key: 'seoTitle', label: 'SEO Title' },
  { key: 'seoDescription', label: 'SEO Description', type: 'richtext' },
  { key: 'ogImage', label: 'Open Graph Image URL' },
  { key: 'featured', label: 'Featured on Homepage', type: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function PortfolioPage() {
  const columns: Column<Project>[] = [
    { key: 'title', header: 'Project' },
    { key: 'clientName', header: 'Client' },
    { key: 'industry', header: 'Industry' },
    { key: 'featured', header: 'Featured', render: (r) => r.featured === 'yes' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Projects', value: DATA.length, icon: FolderOpen, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'draft').length, icon: PenLine, color: '#d97706' },
    { title: 'Featured', value: DATA.filter((d) => d.featured === 'yes').length, icon: Star, color: '#f59e0b' },
  ];

  return (
    <ModulePage<Project>
      title="Portfolio"
      description="Case studies — challenge, objectives, solution, gallery, process and SEO, all in one place."
      addLabel="Add Project"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No projects yet."
    />
  );
}
