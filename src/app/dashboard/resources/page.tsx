'use client';

import { toast } from 'sonner';
import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

// One shared shape covering every resource sub-type's fields (blog-like,
// FAQ, glossary, whitepaper, webinar). Each tab's form only shows the
// fields relevant to it — see FIELD_SETS below.
interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  topics: string[];
  difficulty: string;
  estimatedTime: string;
  downloadUrl: string;
  fileSize: string;
  pageCount: string;
  eventDate: string;
  eventTime: string;
  duration: string;
  speakerName: string;
  speakerTitle: string;
  registrationUrl: string;
  recordingUrl: string;
  term: string;
  definition: string;
  relatedTerms: string[];
  question: string;
  answer: string;
  featured: 'yes' | 'no';
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
}

const STATUS_META: Record<ResourceItem['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const FEATURED_OPT = { key: 'featured', label: 'Featured', type: 'select' as const, options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] };
const STATUS_OPT: ModuleField = { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) };
const SEO_FIELDS: ModuleField[] = [
  { key: 'seoTitle', label: 'SEO Title' },
  { key: 'seoDescription', label: 'SEO Description', type: 'richtext' },
];

const ARTICLE_FIELDS: ModuleField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'excerpt', label: 'Excerpt (card/listing)', type: 'textarea' },
  { key: 'content', label: 'Full Content', type: 'richtext', required: true },
  { key: 'category', label: 'Category' },
  { key: 'topics', label: 'Topics / Tags (one per line)', type: 'stringlist' },
  { key: 'publishedAt', label: 'Published Date', type: 'date' },
  ...SEO_FIELDS, FEATURED_OPT, STATUS_OPT,
];

const GUIDE_TUTORIAL_FIELDS: ModuleField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'excerpt', label: 'Excerpt (card/listing)', type: 'textarea' },
  { key: 'content', label: 'Full Content', type: 'richtext', required: true },
  { key: 'category', label: 'Category' },
  { key: 'topics', label: 'Topics / Tags (one per line)', type: 'stringlist' },
  { key: 'difficulty', label: 'Difficulty', type: 'select', options: [{ value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }] },
  { key: 'estimatedTime', label: 'Estimated Time', placeholder: 'e.g. 15 min' },
  { key: 'publishedAt', label: 'Published Date', type: 'date' },
  ...SEO_FIELDS, FEATURED_OPT, STATUS_OPT,
];

const WHITEPAPER_FIELDS: ModuleField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'excerpt', label: 'Excerpt (card/listing)', type: 'textarea' },
  { key: 'content', label: 'Summary Content', type: 'richtext' },
  { key: 'category', label: 'Category' },
  { key: 'downloadUrl', label: 'Download URL' },
  { key: 'fileSize', label: 'File Size', placeholder: 'e.g. 2.4 MB' },
  { key: 'pageCount', label: 'Page Count', type: 'number' },
  { key: 'publishedAt', label: 'Published Date', type: 'date' },
  ...SEO_FIELDS, FEATURED_OPT, STATUS_OPT,
];

const WEBINAR_FIELDS: ModuleField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'excerpt', label: 'Excerpt (card/listing)', type: 'textarea' },
  { key: 'content', label: 'Full Description', type: 'richtext' },
  { key: 'category', label: 'Category' },
  { key: 'eventDate', label: 'Event Date', type: 'date' },
  { key: 'eventTime', label: 'Event Time', placeholder: 'e.g. 5:00 PM IST' },
  { key: 'duration', label: 'Duration', placeholder: 'e.g. 45 min' },
  { key: 'speakerName', label: 'Speaker Name' },
  { key: 'speakerTitle', label: 'Speaker Title' },
  { key: 'registrationUrl', label: 'Registration URL' },
  { key: 'recordingUrl', label: 'Recording URL (after event)' },
  ...SEO_FIELDS, FEATURED_OPT, STATUS_OPT,
];

const GLOSSARY_FIELDS: ModuleField[] = [
  { key: 'term', label: 'Term', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'definition', label: 'Definition', type: 'richtext', required: true },
  { key: 'category', label: 'Category' },
  { key: 'relatedTerms', label: 'Related Terms (one per line)', type: 'stringlist' },
  STATUS_OPT,
];

const FAQ_FIELDS: ModuleField[] = [
  { key: 'question', label: 'Question', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'answer', label: 'Answer', type: 'richtext', required: true },
  { key: 'category', label: 'Category' },
  STATUS_OPT,
];

function standardColumns(): Column<ResourceItem>[] {
  return [
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];
}

const GLOSSARY_COLUMNS: Column<ResourceItem>[] = [
  { key: 'term', header: 'Term' },
  { key: 'category', header: 'Category' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
];

const FAQ_COLUMNS: Column<ResourceItem>[] = [
  { key: 'question', header: 'Question' },
  { key: 'category', header: 'Category' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
];

function blank(over: Partial<ResourceItem>): ResourceItem {
  return {
    id: '', title: '', slug: '', excerpt: '', content: '', category: '', topics: [], difficulty: '', estimatedTime: '',
    downloadUrl: '', fileSize: '', pageCount: '', eventDate: '', eventTime: '', duration: '', speakerName: '', speakerTitle: '',
    registrationUrl: '', recordingUrl: '', term: '', definition: '', relatedTerms: [], question: '', answer: '',
    featured: 'no', status: 'PUBLISHED', publishedAt: '', seoTitle: '', seoDescription: '', ...over,
  };
}

const TABS: { key: string; label: string; addLabel: string; fields: ModuleField[]; columns: Column<ResourceItem>[]; searchKey: keyof ResourceItem & string; data: ResourceItem[] }[] = [
  {
    key: 'guides', label: 'Guides', addLabel: 'Add Guide', fields: GUIDE_TUTORIAL_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'Beginner’s Guide to Website Performance', slug: 'guide-website-performance', category: 'Performance', difficulty: 'Beginner', estimatedTime: '10 min' }),
      blank({ id: '2', title: 'The Complete SEO Checklist', slug: 'guide-seo-checklist', category: 'SEO', difficulty: 'Intermediate', estimatedTime: '15 min' }),
    ],
  },
  {
    key: 'tutorials', label: 'Tutorials', addLabel: 'Add Tutorial', fields: GUIDE_TUTORIAL_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'Setting Up Next.js ISR', slug: 'tutorial-nextjs-isr', category: 'Development', difficulty: 'Advanced', estimatedTime: '20 min', status: 'DRAFT' }),
    ],
  },
  {
    key: 'webinars', label: 'Webinars', addLabel: 'Add Webinar', fields: WEBINAR_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'Scaling Web Apps in 2026', slug: 'webinar-scaling-2026', category: 'Engineering', speakerName: 'Rohit Kumar', eventDate: '2026-10-05' }),
    ],
  },
  {
    key: 'whitepapers', label: 'Whitepapers', addLabel: 'Add Whitepaper', fields: WHITEPAPER_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'The State of Web Performance', slug: 'whitepaper-web-performance', category: 'Performance', fileSize: '2.1 MB', pageCount: '18' }),
    ],
  },
  {
    key: 'glossary', label: 'Glossary', addLabel: 'Add Term', fields: GLOSSARY_FIELDS, columns: GLOSSARY_COLUMNS, searchKey: 'term', data: [
      blank({ id: '1', term: 'Core Web Vitals', slug: 'glossary-core-web-vitals', category: 'Performance' }),
      blank({ id: '2', term: 'Server-Side Rendering', slug: 'glossary-ssr', category: 'Development' }),
    ],
  },
  {
    key: 'industry-insights', label: 'Industry Insights', addLabel: 'Add Insight', fields: ARTICLE_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'Healthcare Digital Trends 2026', slug: 'insight-healthcare-2026', category: 'Healthcare', status: 'DRAFT' }),
    ],
  },
  {
    key: 'technology-insights', label: 'Technology Insights', addLabel: 'Add Insight', fields: ARTICLE_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'Why Edge Rendering Wins', slug: 'insight-edge-rendering', category: 'Engineering' }),
    ],
  },
  {
    key: 'company-updates', label: 'Company Updates', addLabel: 'Add Update', fields: ARTICLE_FIELDS, columns: standardColumns(), searchKey: 'title', data: [
      blank({ id: '1', title: 'TheWebHero Launches New Portal', slug: 'update-new-portal', category: 'Announcements' }),
    ],
  },
  {
    key: 'faqs', label: 'FAQs', addLabel: 'Add FAQ', fields: FAQ_FIELDS, columns: FAQ_COLUMNS, searchKey: 'question', data: [
      blank({ id: '1', question: 'How long does a project take?', slug: 'faq-project-timeline', category: 'General' }),
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="animate-in fade-in max-w-[1600px] mx-auto space-y-5 pb-8 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
        <p className="mt-1 text-sm text-slate-500">Guides, tutorials, webinars, whitepapers, glossary and insight content.</p>
      </div>

      <Card size="sm" className="rounded-2xl border border-slate-100 shadow-sm ring-0">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Search className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Site Search Index</p>
              <p className="text-[12px] text-slate-500">
                {TABS.reduce((sum, t) => sum + t.data.length, 0)} documents indexed · Last synced 2 hours ago
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success('Reindex started — this may take a few minutes.')}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Reindex Now
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue={TABS[0].key}>
        <TabsList className="flex-wrap h-auto rounded-xl bg-slate-100/80 p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            <ModulePage<ResourceItem>
              title={t.label}
              description={`Manage ${t.label.toLowerCase()} entries.`}
              addLabel={t.addLabel}
              columns={t.columns}
              fields={t.fields}
              initialData={t.data}
              searchKey={t.searchKey}
              emptyMessage={`No ${t.label.toLowerCase()} yet.`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
