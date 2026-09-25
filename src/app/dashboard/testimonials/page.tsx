'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Star, CheckCircle2, Clock } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  clientImage: string;
  projectTitle: string;
  rating: string;
  approvalStatus: 'approved' | 'pending';
}

const STATUS_META: Record<Testimonial['approvalStatus'], { label: string; category: StatusCategory }> = {
  approved: { label: 'Approved', category: 'success' },
  pending: { label: 'Pending', category: 'warning' },
};

const DATA: Testimonial[] = [
  {
    id: '1', quote: 'TheWebHero delivered ahead of schedule with great quality.', authorName: 'Anjali Mehta', authorRole: 'CTO',
    companyName: 'HealthTrack', clientImage: '', projectTitle: 'HealthTrack Patient Portal', rating: '5', approvalStatus: 'approved',
  },
  {
    id: '2', quote: 'Our conversion rate doubled after the redesign.', authorName: 'Vikram Desai', authorRole: 'Founder',
    companyName: 'UrbanNest', clientImage: '', projectTitle: 'UrbanNest Property Platform', rating: '5', approvalStatus: 'approved',
  },
  {
    id: '3', quote: 'Responsive team, solid communication throughout.', authorName: 'Ritu Bansal', authorRole: 'Marketing Lead',
    companyName: 'ShopEase', clientImage: '', projectTitle: 'ShopEase Storefront', rating: '4', approvalStatus: 'pending',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'authorName', label: 'Client Name', required: true },
  { key: 'authorRole', label: 'Client Role' },
  { key: 'companyName', label: 'Company' },
  { key: 'clientImage', label: 'Client Photo URL' },
  { key: 'projectTitle', label: 'Related Project' },
  { key: 'quote', label: 'Testimonial Quote', type: 'richtext', required: true },
  { key: 'rating', label: 'Rating (1-5)', type: 'number' },
  { key: 'approvalStatus', label: 'Approval Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function TestimonialsPage() {
  const columns: Column<Testimonial>[] = [
    { key: 'authorName', header: 'Client' },
    { key: 'companyName', header: 'Company' },
    { key: 'rating', header: 'Rating' },
    { key: 'approvalStatus', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.approvalStatus].label} category={STATUS_META[r.approvalStatus].category} /> },
  ];

  const stats = [
    { title: 'Total', value: DATA.length, icon: Star, color: '#7c3aed' },
    { title: 'Approved', value: DATA.filter((d) => d.approvalStatus === 'approved').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Pending', value: DATA.filter((d) => d.approvalStatus === 'pending').length, icon: Clock, color: '#d97706' },
  ];

  return (
    <ModulePage<Testimonial>
      title="Testimonials"
      description="Client testimonials shown across the website."
      addLabel="Add Testimonial"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="authorName"
      emptyMessage="No testimonials yet."
    />
  );
}
