'use client';

import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { cardClass } from '@/components/admin/kit';
import { SITE_URL, USED_ON } from '@/lib/cms';

/** "Where this appears on the website" with links to open each page. */
export function UsedOn({ resource, compact = false }: { resource: string; compact?: boolean }) {
  const places = USED_ON[resource];
  if (!places?.length) return null;
  return (
    <section className={`${compact ? 'p-4' : 'p-5'} ${cardClass}`}>
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-500">
        <Globe className="h-4 w-4 text-violet-600" /> Shown on the website
      </h3>
      <ul className={`mt-3 ${compact ? 'space-y-1.5' : 'grid gap-x-6 gap-y-1.5 sm:grid-cols-2'}`}>
        {places.map(({ label, href }) => (
          <li key={label} className="text-[13px] text-slate-600">
            {href ? (
              <a href={`${SITE_URL}${href}`} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1.5 font-medium text-slate-700 hover:text-violet-700">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>{label}</span>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-violet-600" />
              </a>
            ) : (
              <span className="inline-flex items-start gap-1.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                {label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
