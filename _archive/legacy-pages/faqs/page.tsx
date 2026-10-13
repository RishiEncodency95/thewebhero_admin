'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { HelpCircle, CheckCircle2, PenLine } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<Faq['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: Faq[] = [
  { id: '1', question: 'How long does a typical project take?', answer: '4-12 weeks depending on scope.', category: 'General', status: 'PUBLISHED' },
  { id: '2', question: 'Do you offer post-launch support?', answer: 'Yes, monthly maintenance plans are available.', category: 'Support', status: 'PUBLISHED' },
  { id: '3', question: 'What is your pricing model?', answer: 'Fixed-price for defined scope, hourly for ongoing work.', category: 'Pricing', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'question', label: 'Question', required: true },
  { key: 'answer', label: 'Answer', type: 'textarea', required: true },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function FaqsPage() {
  const columns: Column<Faq>[] = [
    { key: 'question', header: 'Question' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total FAQs', value: DATA.length, icon: HelpCircle, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<Faq>
      title="FAQs"
      description="Frequently asked questions shown on the website."
      addLabel="Add FAQ"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="question"
      emptyMessage="No FAQs yet."
    />
  );
}
