'use client';

import { LeadsPage, Lead } from '@/components/leads/LeadsPage';

// Detail sections mirror the 5 steps of the website's Get a Quote form.
export default function QuoteRequestsPage() {
  return (
    <LeadsPage
      resource="quote-requests"
      title="Quote Requests"
      description="Project requests submitted through the website's Get a Quote form."
      nameKey="fullName"
      headlineKey="service"
      columns={[
        {
          key: 'fullName',
          header: 'Client',
          render: (l: Lead) => (
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">{String(l.fullName)}</p>
              <p className="truncate text-[12px] text-slate-500">{String(l.email)}</p>
            </div>
          ),
        },
        { key: 'service', header: 'Service' },
        { key: 'budget', header: 'Budget' },
        {
          key: 'priority',
          header: 'Priority',
          render: (l: Lead) => (
            <span className={l.priority === 'Urgent' ? 'font-semibold text-red-600' : 'text-slate-600'}>{String(l.priority ?? '—')}</span>
          ),
        },
      ]}
      sections={[
        {
          title: 'Contact',
          fields: [
            { key: 'fullName', label: 'Full name' },
            { key: 'companyName', label: 'Company' },
            { key: 'email', label: 'Email', format: 'email' },
            { key: 'phone', label: 'Phone', format: 'phone' },
            { key: 'country', label: 'Country' },
            { key: 'preferredContactMethod', label: 'Preferred contact' },
          ],
        },
        {
          title: 'Project',
          fields: [
            { key: 'service', label: 'Service' },
            { key: 'projectType', label: 'Project type' },
            { key: 'industry', label: 'Industry' },
            { key: 'projectStatus', label: 'Project status' },
            { key: 'existingUrl', label: 'Existing URL', format: 'url' },
          ],
        },
        {
          title: 'Requirements',
          fields: [
            { key: 'summary', label: 'Summary', format: 'longtext' },
            { key: 'goals', label: 'Goals', format: 'longtext' },
            { key: 'features', label: 'Features', format: 'list' },
            { key: 'platforms', label: 'Platforms', format: 'list' },
            { key: 'technologyPreferences', label: 'Tech preferences', format: 'list' },
            { key: 'referenceLinks', label: 'Reference links', format: 'longtext' },
          ],
        },
        {
          title: 'Budget & timeline',
          fields: [
            { key: 'budget', label: 'Budget' },
            { key: 'timeline', label: 'Timeline' },
            { key: 'priority', label: 'Priority' },
            { key: 'preferredStartDate', label: 'Preferred start' },
          ],
        },
        {
          title: 'Additional',
          fields: [
            { key: 'additionalNotes', label: 'Notes from client', format: 'longtext' },
            { key: 'attachmentName', label: 'Attachment name' },
            { key: 'consent', label: 'Privacy consent', format: 'bool' },
          ],
        },
      ]}
    />
  );
}
