'use client';

import { LeadsPage, Lead } from '@/components/leads/LeadsPage';

export default function ContactEnquiriesPage() {
  return (
    <LeadsPage
      resource="contact-enquiries"
      title="Contact Enquiries"
      description="Messages sent through the website's contact form."
      nameKey="name"
      headlineKey="service"
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
        { key: 'company', header: 'Company' },
        { key: 'service', header: 'Service' },
        {
          key: 'message',
          header: 'Message',
          render: (l: Lead) => <span className="line-clamp-1 max-w-xs text-slate-600">{String(l.message ?? '')}</span>,
        },
      ]}
      sections={[
        {
          title: 'Contact',
          fields: [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email', format: 'email' },
            { key: 'phone', label: 'Phone', format: 'phone' },
            { key: 'company', label: 'Company' },
          ],
        },
        {
          title: 'Enquiry',
          fields: [
            { key: 'service', label: 'Service' },
            { key: 'subject', label: 'Subject' },
            { key: 'message', label: 'Message', format: 'longtext' },
            { key: 'source', label: 'Source' },
            { key: 'consent', label: 'Privacy consent', format: 'bool' },
          ],
        },
      ]}
    />
  );
}
