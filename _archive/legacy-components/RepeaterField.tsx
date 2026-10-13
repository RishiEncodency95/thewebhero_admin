'use client';

import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Plus, Trash2 } from 'lucide-react';

export interface RepeaterSubField {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
}

interface RepeaterFieldProps {
  name: string;
  label: string;
  subFields: RepeaterSubField[];
  defaultValue?: Record<string, string>[];
  addLabel?: string;
}

// Add/remove rows of a fixed shape (e.g. { title, description } for
// capabilities/features/benefits, or { question, answer } for FAQs). Rows
// live in local state and serialize to JSON in a hidden input, so they
// travel through the surrounding <form>'s FormData like any other field —
// ModulePage.buildItemFromForm() JSON.parses it back into a real array.
export function RepeaterField({ name, label, subFields, defaultValue = [], addLabel = 'Add Item' }: RepeaterFieldProps) {
  const [rows, setRows] = useState<Record<string, string>[]>(defaultValue);

  function updateRow(index: number, key: string, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    const empty: Record<string, string> = {};
    subFields.forEach((f) => { empty[f.key] = ''; });
    setRows((prev) => [...prev, empty]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-slate-200 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">#{index + 1}</span>
              <Button type="button" size="icon-xs" variant="ghost" className="text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeRow(index)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            {subFields.map((f) => (
              f.type === 'textarea' ? (
                <Textarea
                  key={f.key}
                  placeholder={f.placeholder || f.label}
                  value={row[f.key] || ''}
                  onChange={(e) => updateRow(index, f.key, e.target.value)}
                  rows={2}
                  className="text-[13px]"
                />
              ) : (
                <Input
                  key={f.key}
                  placeholder={f.placeholder || f.label}
                  value={row[f.key] || ''}
                  onChange={(e) => updateRow(index, f.key, e.target.value)}
                  className="text-[13px]"
                />
              )
            ))}
          </div>
        ))}
        {rows.length === 0 && <p className="py-1 text-[12px] text-slate-400">No items yet.</p>}
      </div>
      <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={addRow}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        {addLabel}
      </Button>
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
    </div>
  );
}
