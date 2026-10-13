'use client';

import { LeadsPage, Lead } from '@/components/leads/LeadsPage';

const PRIORITY_CLASS: Record<string, string> = {
  urgent: 'font-semibold text-red-600',
  high: 'font-semibold text-orange-600',
  medium: 'text-amber-600',
  low: 'text-slate-500',
};

export default function SupportRequestsPage() {
  return (
    <LeadsPage
      resource="support-requests"
      title="Support Requests"
      description="Support tickets raised by existing clients."
      nameKey="name"
      headlineKey="subject"
      columns={[
        {
          key: 'name',
          header: 'From',
          render: (l: Lead) => (
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">{String(l.name)}</p>
              <p className="truncate text-[12px] text-slate-500">{String(l.email)}</p>
            </div>
          ),
        },
        { key: 'subject', header: 'Subject' },
        {
          key: 'priority',
          header: 'Priority',
          render: (l: Lead) => <span className={`capitalize ${PRIORITY_CLASS[String(l.priority)] ?? ''}`}>{String(l.priority ?? '—')}</span>,
        },
      ]}
      sections={[
        {
          title: 'Contact',
          fields: [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email', format: 'email' },
            { key: 'phone', label: 'Phone', format: 'phone' },
          ],
        },
        {
          title: 'Request',
          fields: [
            { key: 'priority', label: 'Priority' },
            { key: 'subject', label: 'Subject' },
            { key: 'description', label: 'Description', format: 'longtext' },
          ],
        },
      ]}
    />
  );
}
