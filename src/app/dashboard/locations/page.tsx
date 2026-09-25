'use client';

import { ModulePage, ModuleField } from '@/components/admin/ModulePage';
import { Column } from '@/components/ui/DataTable';
import { StatusBadge, StatusCategory } from '@/components/ui/StatusBadge';
import { MapPin, CheckCircle2, PenLine } from 'lucide-react';

interface LocationPage {
  id: string;
  name: string;
  type: 'CITY' | 'COUNTRY' | 'REGION';
  slug: string;
  metaDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const TYPE_LABEL: Record<LocationPage['type'], string> = { CITY: 'City', COUNTRY: 'Country', REGION: 'Region' };

const STATUS_META: Record<LocationPage['status'], { label: string; category: StatusCategory }> = {
  DRAFT: { label: 'Draft', category: 'warning' },
  PUBLISHED: { label: 'Published', category: 'success' },
};

const DATA: LocationPage[] = [
  { id: '1', name: 'Mumbai', type: 'CITY', slug: 'city/mumbai', metaDescription: 'Web design & development services in Mumbai.', status: 'PUBLISHED' },
  { id: '2', name: 'Delhi', type: 'CITY', slug: 'city/delhi', metaDescription: 'Web design & development services in Delhi.', status: 'PUBLISHED' },
  { id: '3', name: 'India', type: 'COUNTRY', slug: 'country/india', metaDescription: 'Web design & development services across India.', status: 'PUBLISHED' },
  { id: '4', name: 'United States', type: 'COUNTRY', slug: 'country/united-states', metaDescription: 'Web design & development services in the USA.', status: 'DRAFT' },
];

const FIELDS: ModuleField[] = [
  { key: 'name', label: 'Location Name', required: true, placeholder: 'Mumbai' },
  { key: 'type', label: 'Type', type: 'select', options: [{ value: 'CITY', label: 'City' }, { value: 'COUNTRY', label: 'Country' }, { value: 'REGION', label: 'Region' }] },
  { key: 'slug', label: 'Slug', required: true, placeholder: 'city/mumbai' },
  { key: 'metaDescription', label: 'Meta Description (SEO)', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
];

export default function LocationsPage() {
  const columns: Column<LocationPage>[] = [
    { key: 'name', header: 'Location' },
    { key: 'type', header: 'Type', render: (r) => TYPE_LABEL[r.type] },
    { key: 'slug', header: 'Slug' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge label={STATUS_META[r.status].label} category={STATUS_META[r.status].category} /> },
  ];

  const stats = [
    { title: 'Total Locations', value: DATA.length, icon: MapPin, color: '#7c3aed' },
    { title: 'Published', value: DATA.filter((d) => d.status === 'PUBLISHED').length, icon: CheckCircle2, color: '#16a34a' },
    { title: 'Drafts', value: DATA.filter((d) => d.status === 'DRAFT').length, icon: PenLine, color: '#d97706' },
  ];

  return (
    <ModulePage<LocationPage>
      title="Locations"
      description="City/country landing pages for local SEO."
      addLabel="Add Location"
      columns={columns}
      fields={FIELDS}
      initialData={DATA}
      stats={stats}
      searchKey="name"
      emptyMessage="No locations yet."
    />
  );
}
