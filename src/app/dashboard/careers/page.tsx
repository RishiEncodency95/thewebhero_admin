'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Briefcase, CheckCircle2, PenLine } from 'lucide-react';

interface JobOpening {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const STATUS_META: Record<JobOpening['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: JobOpening[] = [
  { id: '1', title: 'Senior Frontend Engineer', slug: 'senior-frontend-engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', status: 'PUBLISHED' },
  { id: '2', title: 'UI/UX Designer', slug: 'ui-ux-designer', department: 'Design', location: 'Mumbai', type: 'Full-time', status: 'PUBLISHED' },
  { id: '3', title: 'SEO Executive', slug: 'seo-executive', department: 'Marketing', location: 'Remote', type: 'Part-time', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Job Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'department', label: 'Department' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Employment Type', type: 'select', options: [{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }, { value: 'Internship', label: 'Internship' }] },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function CareersPage() {
  const columns: Column<JobOpening>[] = [
    { key: 'title', header: 'Role' },
    { key: 'department', header: 'Department' },
    { key: 'location', header: 'Location' },
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Openings', value: DATA.length, icon: Briefcase, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<JobOpening>
      title="Careers"
      description="Job openings listed on the Careers page."
      addLabel="Add Job"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="title"
      emptyMessage="No job openings yet."
    />
  );
}
