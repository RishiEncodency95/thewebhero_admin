'use client';

import React, { useRef, useState } from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormDialog } from '@/components/ui/FormDialog';
import { AppFormField, AppFormTextarea, AppFormSelect, AppFormRichText } from '@/components/ui/AppFormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search } from 'lucide-react';

// Generic, config-driven "content module" page: stat cards + searchable
// table + add/edit popup form + delete. Every website content module
// (Services, Pages, Blog, Resources, ...) is a thin config wrapper around
// this instead of a bespoke page. State is local/demo — wire `initialData`
// and the CRUD handlers below to your own API when the backend is ready.
//
// Visual language matches the dashboard home page exactly (rounded-2xl
// white cards, slate-100 borders, violet/fuchsia gradient primary actions)
// so every module feels like one product instead of 20 different ones.

export const PRIMARY_BUTTON_CLASS =
  'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white! shadow-sm shadow-violet-200 hover:opacity-90 hover:text-white!';

export interface ModuleStat {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface ModuleField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'textarea' | 'richtext' | 'select' | 'date' | 'number' | 'url';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

interface ModulePageProps<T extends { id: string }> {
  title: string;
  description: string;
  addLabel: string;
  columns: Column<T>[];
  fields: ModuleField[];
  initialData: T[];
  stats?: ModuleStat[];
  emptyMessage?: string;
  searchKey?: keyof T & string;
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export function StatCard({ title, value, icon: Icon, color }: ModuleStat) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-slate-500">{title}</p>
        <p className="mt-0.5 text-2xl leading-none font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export function ModulePage<T extends { id: string }>({
  title,
  description,
  addLabel,
  columns,
  fields,
  initialData,
  stats,
  emptyMessage = 'No records found.',
  searchKey,
  allowAdd = true,
  allowEdit = true,
  allowDelete = true,
}: ModulePageProps<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [query, setQuery] = useState('');
  const nextId = useRef(initialData.length + 1);

  const filtered = searchKey && query
    ? items.filter((it) => String(it[searchKey] ?? '').toLowerCase().includes(query.toLowerCase()))
    : items;

  function buildItemFromForm(form: HTMLFormElement, existing?: T): T {
    const data = new FormData(form);
    const base: Record<string, unknown> = existing ? { ...existing } : { id: `new-${nextId.current++}` };
    for (const f of fields) {
      base[f.key] = data.get(f.key) ?? '';
    }
    return base as T;
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault();
    const item = buildItemFromForm(e.currentTarget);
    setItems((prev) => [item, ...prev]);
    close();
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>, existing: T, close: () => void) {
    e.preventDefault();
    const updated = buildItemFromForm(e.currentTarget, existing);
    setItems((prev) => prev.map((it) => (it.id === existing.id ? updated : it)));
    close();
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function renderFields(existing?: T) {
    return fields.map((f) => {
      const defaultValue = existing ? String((existing as Record<string, unknown>)[f.key] ?? '') : f.defaultValue;
      if (f.type === 'richtext') {
        return (
          <AppFormRichText key={f.key} name={f.key} label={f.label} required={f.required} placeholder={f.placeholder} defaultValue={defaultValue} />
        );
      }
      if (f.type === 'textarea') {
        return (
          <AppFormTextarea key={f.key} name={f.key} label={f.label} required={f.required} placeholder={f.placeholder} defaultValue={defaultValue} rows={4} />
        );
      }
      if (f.type === 'select') {
        return (
          <AppFormSelect key={f.key} name={f.key} label={f.label} required={f.required} options={f.options ?? []} defaultValue={defaultValue} />
        );
      }
      return (
        <AppFormField key={f.key} name={f.key} label={f.label} type={f.type ?? 'text'} required={f.required} placeholder={f.placeholder} defaultValue={defaultValue} />
      );
    });
  }

  const columnsWithActions: Column<T>[] = (allowEdit || allowDelete)
    ? [
        ...columns,
        {
          key: '__actions',
          header: '',
          render: (item) => (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              {allowEdit && (
                <FormDialog
                  triggerLabel="Edit"
                  title={`Edit ${title.replace(/s$/, '')}`}
                  triggerElement={
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:bg-violet-50 hover:text-violet-700">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                >
                  {(close) => (
                    <form className="space-y-4 pt-2" onSubmit={(e) => handleEdit(e, item, close)}>
                      {renderFields(item)}
                      <Button type="submit" className={`w-full ${PRIMARY_BUTTON_CLASS}`}>Save Changes</Button>
                    </form>
                  )}
                </FormDialog>
              )}
              {allowDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete((item as { id: string }).id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ),
        },
      ]
    : columns;

  return (
    <div className="animate-in fade-in max-w-[1600px] mx-auto space-y-5 pb-8 duration-500">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {allowAdd && (
          <FormDialog
            triggerLabel={addLabel}
            title={addLabel}
            description={`Create a new ${title.toLowerCase()} record.`}
            triggerClassName={PRIMARY_BUTTON_CLASS}
          >
            {(close) => (
              <form className="space-y-4 pt-2" onSubmit={(e) => handleAdd(e, close)}>
                {renderFields()}
                <Button type="submit" className={`w-full ${PRIMARY_BUTTON_CLASS}`}>{addLabel}</Button>
              </form>
            )}
          </FormDialog>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>
      )}

      {searchKey && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border-slate-200 pl-8 shadow-sm"
            />
          </div>
          <p className="hidden text-[13px] text-slate-400 sm:block">
            {filtered.length} of {items.length} {items.length === 1 ? 'record' : 'records'}
          </p>
        </div>
      )}

      <DataTable data={filtered} columns={columnsWithActions} emptyMessage={emptyMessage} pageSize={10} />
    </div>
  );
}
