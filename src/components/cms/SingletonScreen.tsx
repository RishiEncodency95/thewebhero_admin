'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { api, ApiRequestError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Doc, emptyRecord, toPayload } from '@/lib/cms';
import { ContentForm } from './ContentForm';
import { useContentType } from './useContentType';
import { UsedOn } from './UsedOn';

interface SingletonScreenProps {
  resource: string;
  /** Show only these field groups (tabs); the rest of the document is kept as is. */
  groups?: string[];
  /** Hide these field groups because another screen edits them. */
  hideGroups?: string[];
  title?: string;
  description?: string;
}

/** Edit screen for a one-off document such as site settings or the home page. */
export function SingletonScreen({ resource, groups, hideGroups = [], title, description }: SingletonScreenProps) {
  const { can } = useAuth();
  const { def, error: defError } = useContentType(resource);
  const [saved, setSaved] = useState<Doc | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!def) return;
    let alive = true;
    api<Doc | null>(`/${resource}/admin`)
      .then((d) => {
        if (!alive) return;
        const full = { ...emptyRecord(def.fields), ...(d ?? {}) };
        setSaved(full);
        setDoc(full);
      })
      .catch((err) => alive && setLoadError(err instanceof ApiRequestError ? err.message : 'Could not load'));
    return () => {
      alive = false;
    };
  }, [def, resource]);

  const dirty = useMemo(() => !!doc && !!saved && JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);
  const canSave = can(resource, 'update');

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!doc || !def || saving || !canSave) return;
    setSaving(true);
    setErrors({});
    try {
      const result = await api<Doc>(`/${resource}`, { method: 'PUT', body: toPayload(doc) });
      const full = { ...emptyRecord(def.fields), ...result };
      setSaved(full);
      setDoc(full);
      toast.success(`${def.label} saved`, { description: 'The website updates within a few seconds.' });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.fieldErrors);
        const count = Object.keys(err.fieldErrors).length;
        toast.error(count ? `Please fix ${count} field${count > 1 ? 's' : ''} before saving` : err.message);
      } else toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [doc, def, saving, canSave, resource]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const error = defError ?? loadError;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!def || !doc) return <div className="flex h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;

  const hidden = groups ? [...new Set(def.fields.map((f) => f.group ?? 'General'))].filter((g) => !groups.includes(g)) : hideGroups;

  return (
    <div className="pb-24">
      <PageHeader title={title ?? def.label} description={description ?? def.description} crumbs={[{ label: 'Site' }, { label: title ?? def.label }]} />
      <div className="mb-4">
        <UsedOn resource={resource} />
      </div>
      <ContentForm resource={resource} fields={def.fields} value={doc} onChange={setDoc} errors={errors} hideGroups={hidden} />

      {canSave && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
          <div className="flex h-16 items-center justify-between gap-3 px-6">
            <span className="flex items-center gap-2 text-[13px] text-slate-500">
              <span className={`h-2 w-2 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {dirty ? 'Unsaved changes' : 'All changes saved'}
              <span className="hidden text-slate-400 sm:inline">· ⌘S to save</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 rounded-xl px-4" disabled={!dirty || saving} onClick={() => { setDoc(saved); setErrors({}); }}>
                Discard
              </Button>
              <Button className="h-10 min-w-32 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 text-white shadow-md shadow-violet-500/25 hover:opacity-95" disabled={saving || !dirty} onClick={save}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
