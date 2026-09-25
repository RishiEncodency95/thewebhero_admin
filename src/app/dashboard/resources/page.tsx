'use client';

import { toast } from 'sonner';
import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<ResourceItem['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

function resourceColumns(): Column<ResourceItem>[] {
  return [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];
}

const TABS: { key: string; label: string; addLabel: string; data: ResourceItem[] }[] = [
  {
    key: 'guides', label: 'Guides', addLabel: 'Add Guide', data: [
      { id: '1', title: 'Beginner’s Guide to Website Performance', slug: 'guide-website-performance', status: 'PUBLISHED' },
      { id: '2', title: 'The Complete SEO Checklist', slug: 'guide-seo-checklist', status: 'PUBLISHED' },
    ]
  },
  {
    key: 'tutorials', label: 'Tutorials', addLabel: 'Add Tutorial', data: [
      { id: '1', title: 'Setting Up Next.js ISR', slug: 'tutorial-nextjs-isr', status: 'DRAFT' },
    ]
  },
  {
    key: 'webinars', label: 'Webinars', addLabel: 'Add Webinar', data: [
      { id: '1', title: 'Scaling Web Apps in 2026', slug: 'webinar-scaling-2026', status: 'PUBLISHED' },
    ]
  },
  {
    key: 'whitepapers', label: 'Whitepapers', addLabel: 'Add Whitepaper', data: [
      { id: '1', title: 'The State of Web Performance', slug: 'whitepaper-web-performance', status: 'PUBLISHED' },
    ]
  },
  {
    key: 'glossary', label: 'Glossary', addLabel: 'Add Term', data: [
      { id: '1', title: 'Core Web Vitals', slug: 'glossary-core-web-vitals', status: 'PUBLISHED' },
      { id: '2', title: 'Server-Side Rendering', slug: 'glossary-ssr', status: 'PUBLISHED' },
    ]
  },
  {
    key: 'industry-insights', label: 'Industry Insights', addLabel: 'Add Insight', data: [
      { id: '1', title: 'Healthcare Digital Trends 2026', slug: 'insight-healthcare-2026', status: 'DRAFT' },
    ]
  },
  {
    key: 'technology-insights', label: 'Technology Insights', addLabel: 'Add Insight', data: [
      { id: '1', title: 'Why Edge Rendering Wins', slug: 'insight-edge-rendering', status: 'PUBLISHED' },
    ]
  },
  {
    key: 'company-updates', label: 'Company Updates', addLabel: 'Add Update', data: [
      { id: '1', title: 'TheWebHero Launches New Portal', slug: 'update-new-portal', status: 'PUBLISHED' },
    ]
  },
  {
    key: 'faqs', label: 'FAQs', addLabel: 'Add FAQ', data: [
      { id: '1', title: 'How long does a project take?', slug: 'faq-project-timeline', status: 'PUBLISHED' },
    ]
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
              columns={resourceColumns()}
              fields={FIELDS}
              initialData={t.data}
              searchKey="title"
              emptyMessage={`No ${t.label.toLowerCase()} yet.`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
