'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Star, CheckCircle2, EyeOff } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  quote: string;
  rating: string;
  status: 'HIDDEN' | 'PUBLISHED';
}

const STATUS_META: Record<Testimonial['status'], { label: string; category: StatusCategory }> = {
  HIDDEN: { label: 'Hidden', category: 'default' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Testimonial[] = [
  { id: '1', name: 'Anjali Mehta', company: 'HealthTrack', quote: 'TheWebHero delivered ahead of schedule with great quality.', rating: '5', status: 'PUBLISHED' },
  { id: '2', name: 'Vikram Desai', company: 'UrbanNest', quote: 'Our conversion rate doubled after the redesign.', rating: '5', status: 'PUBLISHED' },
  { id: '3', name: 'Ritu Bansal', company: 'ShopEase', quote: 'Responsive team, solid communication throughout.', rating: '4', status: 'HIDDEN' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Client Name', required: true },
  { key: 'company', label: 'Company' },
  { key: 'quote', label: 'Testimonial', type: 'textarea', required: true },
  { key: 'rating', label: 'Rating (1-5)' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function TestimonialsPage() {
  const columns: Column<Testimonial>[] = [
    { key: 'name', header: 'Client' },
    { key: 'company', header: 'Company' },
    { key: 'rating', header: 'Rating' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total', value: DATA.length, icon: Star, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Hidden', value: DATA.filter((d) => d.status === 'HIDDEN').length, icon: EyeOff, color: '#64748b' },
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
      searchKey="name"
      emptyMessage="No testimonials yet."
    />
  );
}
