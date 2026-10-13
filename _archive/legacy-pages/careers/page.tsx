'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Briefcase, CheckCircle2, PenLine, XCircle } from 'lucide-react';

interface JobOpening {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experience: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];
  benefits: string[];
  publishedAt: string;
  status: 'active' | 'closed' | 'draft';
}

const STATUS_META: Record<JobOpening['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Published', category: 'success' },
  closed: { label: 'Closed', category: 'error' },
  draft: { label: 'Draft', category: 'warning' },
};

const DATA: JobOpening[] = [
  {
    id: '1', slug: 'senior-frontend-engineer', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote',
    employmentType: 'Full-time', experience: '4+ years', description: 'Build and own core frontend features across client projects.',
    responsibilities: ['Ship production React/Next.js features', 'Review PRs', 'Mentor junior engineers'],
    requiredSkills: ['React', 'TypeScript', 'Next.js'],
    niceToHave: ['Design systems experience'],
    benefits: ['Remote-first', 'Flexible hours', 'Learning budget'],
    publishedAt: '2026-09-01', status: 'active',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'title', label: 'Job Title', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'department', label: 'Department' },
  { key: 'location', label: 'Location' },
  { key: 'employmentType', label: 'Employment Type', type: 'select', options: [{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }, { value: 'Remote', label: 'Remote' }] },
  { key: 'experience', label: 'Experience Required', placeholder: 'e.g. 4+ years' },
  { key: 'description', label: 'Job Description', type: 'richtext', required: true },
  { key: 'responsibilities', label: 'Responsibilities (one per line)', type: 'stringlist' },
  { key: 'requiredSkills', label: 'Required Skills (one per line)', type: 'stringlist' },
  { key: 'niceToHave', label: 'Nice to Have (one per line)', type: 'stringlist' },
  { key: 'benefits', label: 'Benefits (one per line)', type: 'stringlist' },
  { key: 'publishedAt', label: 'Published Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function CareersPage() {
  const columns: Column<JobOpening>[] = [
    { key: 'title', header: 'Role' },
    { key: 'department', header: 'Department' },
    { key: 'location', header: 'Location' },
    { key: 'employmentType', header: 'Type' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Openings', value: DATA.length, icon: Briefcase, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'draft').length, icon: PenLine, color: '#d97706' },
    { title: 'Closed', value: DATA.filter((d) => d.status === 'closed').length, icon: XCircle, color: '#dc2626' },
  ];

  return (
    <ModulePage<JobOpening>
      title="Careers"
      description="Job openings — responsibilities, required skills, benefits and status."
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
