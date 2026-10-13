'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Newspaper, CheckCircle2, PenLine, Star } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  categorySlug: string;
  topics: string[];
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  readingTime: string;
  featured: 'yes' | 'no';
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

const STATUS_META: Record<BlogPost['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: BlogPost[] = [
  {
    id: '1', title: '10 Ways to Speed Up Your Next.js Site', slug: '10-ways-speed-up-nextjs',
    subtitle: 'Practical performance wins for production apps', excerpt: 'Ten practical techniques to cut load times on Next.js sites.',
    content: 'Full article body covering image optimization, caching, bundle analysis and more.',
    coverImage: '', coverImageAlt: 'Next.js performance dashboard', category: 'Performance', categorySlug: 'performance',
    topics: ['Next.js', 'Performance', 'Core Web Vitals'], authorName: 'Rohit Kumar', authorRole: 'Founder & CEO', authorAvatar: '',
    readingTime: '6 min read', featured: 'yes', status: 'PUBLISHED', publishedAt: '2026-09-18',
    seoTitle: '10 Ways to Speed Up Your Next.js Site | TheWebHero', seoDescription: 'Practical, production-tested techniques to speed up Next.js apps.', ogImage: '',
  },
  {
    id: '2', title: 'A Complete Guide to Technical SEO', slug: 'complete-guide-technical-seo',
    subtitle: '', excerpt: 'Everything you need to know about technical SEO in 2026.',
    content: 'Full article body.', coverImage: '', coverImageAlt: '', category: 'SEO', categorySlug: 'seo',
    topics: ['SEO', 'Technical SEO'], authorName: 'Rohit Kumar', authorRole: 'Founder & CEO', authorAvatar: '',
    readingTime: '9 min read', featured: 'no', status: 'PUBLISHED', publishedAt: '2026-09-10',
    seoTitle: 'A Complete Guide to Technical SEO | TheWebHero', seoDescription: 'Everything you need to know about technical SEO in 2026.', ogImage: '',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Post Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'coverImage', label: 'Cover Image URL' },
  { key: 'coverImageAlt', label: 'Cover Image Alt Text (SEO)' },
  { key: 'excerpt', label: 'Excerpt (card/listing)', type: 'textarea' },
  { key: 'content', label: 'Full Article Content', type: 'richtext', required: true },
  { key: 'category', label: 'Category' },
  { key: 'categorySlug', label: 'Category Slug' },
  { key: 'topics', label: 'Topics / Tags (one per line)', type: 'stringlist' },
  { key: 'authorName', label: 'Author Name' },
  { key: 'authorRole', label: 'Author Role' },
  { key: 'authorAvatar', label: 'Author Avatar URL' },
  { key: 'readingTime', label: 'Reading Time', placeholder: 'e.g. 6 min read' },
  { key: 'publishedAt', label: 'Published Date', type: 'date' },
  { key: 'seoTitle', label: 'SEO Title' },
  { key: 'seoDescription', label: 'SEO Description', type: 'richtext' },
  { key: 'ogImage', label: 'Open Graph Image URL' },
  { key: 'featured', label: 'Featured', type: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function BlogPage() {
  const columns: Column<BlogPost>[] = [
    { key: 'title', header: 'Title' },
    { key: 'authorName', header: 'Author' },
    { key: 'category', header: 'Category' },
    { key: 'featured', header: 'Featured', render: (r) => r.featured === 'yes' && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
    { key: 'publishedAt', header: 'Published' },
  ];

  const stats = [
    { title: 'Total Posts', value: DATA.length, icon: Newspaper, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
    { title: 'Featured', value: DATA.filter((d) => d.featured === 'yes').length, icon: Star, color: '#f59e0b' },
  ];

  return (
    <ModulePage<BlogPost>
      title="Blog"
      description="Blog posts — content, author, topics and SEO, all in one place."
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
