'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { Users, CheckCircle2, EyeOff } from 'lucide-react';

interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  expertise: string[];
  responsibilities: string[];
  linkedin: string;
  github: string;
  twitter: string;
  sortOrder: string;
  status: 'active' | 'draft';
}

const STATUS_META: Record<TeamMember['status'], { label: string; category: StatusCategory }> = {
  active: { label: 'Published', category: 'success' },
  draft: { label: 'Hidden', category: 'default' },
};

const DATA: TeamMember[] = [
  {
    id: '1', slug: 'rohit-kumar', name: 'Rohit Kumar', role: 'Founder & CEO', photo: '',
    bio: 'Leads product and engineering at TheWebHero.',
    expertise: ['Product Strategy', 'Full-stack Engineering'],
    responsibilities: ['Company vision', 'Client relationships'],
    linkedin: '', github: '', twitter: '', sortOrder: '1', status: 'active',
  },
  {
    id: '2', slug: 'sara-fernandes', name: 'Sara Fernandes', role: 'Head of Design', photo: '',
    bio: 'Leads the design team across all client projects.',
    expertise: ['UI/UX Design', 'Design Systems'],
    responsibilities: ['Design quality', 'Brand consistency'],
    linkedin: '', github: '', twitter: '', sortOrder: '2', status: 'active',
  },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'role', label: 'Role / Designation' },
  { key: 'photo', label: 'Photo URL' },
  { key: 'bio', label: 'Bio', type: 'richtext' },
  { key: 'expertise', label: 'Areas of Expertise (one per line)', type: 'stringlist' },
  { key: 'responsibilities', label: 'Responsibilities (one per line)', type: 'stringlist' },
  { key: 'linkedin', label: 'LinkedIn URL' },
  { key: 'github', label: 'GitHub URL' },
  { key: 'twitter', label: 'Twitter/X URL' },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function TeamPage() {
  const columns: Column<TeamMember>[] = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Members', value: DATA.length, icon: Users, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'active').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Hidden', value: DATA.filter((d) => d.status === 'draft').length, icon: EyeOff, color: '#64748b' },
  ];

  return (
    <ModulePage<TeamMember>
      title="Team"
      description="Team member profiles — bio, expertise, responsibilities and social links."
      addLabel="Add Member"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No team members yet."
    />
  );
}
