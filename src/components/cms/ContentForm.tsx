'use client';

import React, { useMemo, useState } from 'react';
import { Doc, FieldDef, isWideField } from '@/lib/cms';
import { FieldInput } from './FieldInput';

interface ContentFormProps {
  resource: string;
  fields: FieldDef[];
  value: Doc;
  onChange: (value: Doc) => void;
  errors: Record<string, string>;
  /** Groups to leave out (the editor shows "Publish" in its sidebar). */
  hideGroups?: string[];
  /** Tab to open first, e.g. "SEO" when coming from the SEO Center. */
  initialGroup?: string;
}

// Preferred tab order; any other group names follow in definition order.
const GROUP_ORDER = ['Basics', 'General', 'Brand', 'Hero', 'About', 'Content', 'Details', 'Related', 'Stats', 'Values & culture', 'Process', 'Contact', 'SEO defaults', 'Analytics', 'Notifications', 'SEO'];

/** Tabbed form for a CMS content type. Fields are grouped by their `group`. */
export function ContentForm({ resource, fields, value, onChange, errors, hideGroups = [], initialGroup }: ContentFormProps) {
  const groups = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    for (const f of fields) {
      const g = f.group ?? 'General';
      if (hideGroups.includes(g)) continue;
      map.set(g, [...(map.get(g) ?? []), f]);
    }
    return [...map.entries()].sort(([a], [b]) => {
      const ia = GROUP_ORDER.indexOf(a);
      const ib = GROUP_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [fields, hideGroups]);

  const [active, setActive] = useState(groups.find(([g]) => g === initialGroup)?.[0] ?? groups[0]?.[0] ?? '');
  const current = groups.find(([g]) => g === active) ?? groups[0];
  const groupHasError = (g: string) => groups.find(([n]) => n === g)?.[1].some((f) => errors[f.key]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {groups.length > 1 && (
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-3 pt-3">
          {groups.map(([g]) => (
            <button
              key={g}
              type="button"
              onClick={() => setActive(g)}
              className={`relative whitespace-nowrap rounded-t-xl px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${
                g === current?.[0] ? 'bg-white text-violet-700 shadow-[0_-1px_0_0_rgb(226_232_240),1px_0_0_0_rgb(226_232_240),-1px_0_0_0_rgb(226_232_240)]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {g}
              {groupHasError(g) && <span className="absolute right-1.5 top-2 h-2 w-2 rounded-full bg-red-500" aria-label="has errors" />}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-6 md:grid-cols-2">
        {current?.[1].map((field) => (
          <div key={field.key} className={isWideField(field) ? 'md:col-span-2' : ''}>
            <FieldInput
              field={field}
              value={value[field.key]}
              error={errors[field.key]}
              doc={value}
              resource={resource}
              onChange={(v) => onChange({ ...value, [field.key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
