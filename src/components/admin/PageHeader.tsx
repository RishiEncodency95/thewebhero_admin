import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Breadcrumb trail above the title, e.g. [{ label: 'Services', href: '/dashboard/content/services' }]. */
  crumbs?: { label: string; href?: string }[];
  /** Buttons on the right. */
  actions?: React.ReactNode;
}

/** The single header style used at the top of every admin screen. */
export function PageHeader({ title, description, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1 text-[12.5px] text-slate-500">
            {crumbs.map((c, i) => (
              <React.Fragment key={`${c.label}-${i}`}>
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-violet-700">
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700">{c.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="truncate text-[24px] font-extrabold tracking-[-0.02em] text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
