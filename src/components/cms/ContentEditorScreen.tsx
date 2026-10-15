'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { api, ApiRequestError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Doc, emptyRecord, publicPath, SITE_URL, toPayload, lowerLabel } from '@/lib/cms';
import { ContentForm } from './ContentForm';
import { FieldInput } from './FieldInput';
import { useContentType } from './useContentType';

const PUBLISH_GROUP = 'Publish';

const formatDate = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/** Warns before leaving the page with unsaved edits. */
function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

/** Full-page create/edit screen for one record of a CMS collection. */
export function ContentEditorScreen({ resource, id, initialTab }: { resource: string; id: string; initialTab?: string }) {
  const isNew = id === 'new';
  const router = useRouter();
  const { can } = useAuth();
  const { def, error: defError } = useContentType(resource);

  const [saved, setSaved] = useState<Doc | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!def) return;
    let alive = true;
    const load: Promise<Doc> = isNew ? Promise.resolve({}) : api<Doc>(`/${resource}/${id}`, { query: { populate: 'false' } });
    load
      .then((d) => {
        if (!alive) return;
        // Fill fields added to the schema after this record was created.
        const full = { ...emptyRecord(def.fields), ...d };
        setSaved(full);
        setDoc(full);
      })
      .catch((err) => alive && setLoadError(err instanceof ApiRequestError ? err.message : 'Could not load this item'));
    return () => {
      alive = false;
    };
  }, [def, resource, id, isNew]);

  const dirty = useMemo(() => !!doc && !!saved && JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);
  useUnsavedGuard(dirty);

  const canSave = can(resource, isNew ? 'create' : 'update');

  const save = useCallback(async () => {
    if (!doc || !def || saving || !canSave) return;
    setSaving(true);
    setErrors({});
    try {
      const result = await api<Doc>(isNew ? `/${resource}` : `/${resource}/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: toPayload(doc),
      });
      toast.success(isNew ? `${def.label} created` : 'Changes saved', {
        description: result.status === 'published' ? 'The website updates within a few seconds.' : 'Saved as a draft — not visible on the website.',
      });
      const full = { ...emptyRecord(def.fields), ...result };
      setSaved(full);
      setDoc(full);
      if (isNew) router.replace(`/dashboard/content/${resource}/${result.id ?? result._id}`);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.fieldErrors);
        const count = Object.keys(err.fieldErrors).length;
        toast.error(count ? `Please fix ${count} field${count > 1 ? 's' : ''} before saving` : err.message);
      } else {
        toast.error('Save failed');
      }
    } finally {
      setSaving(false);
    }
  }, [doc, def, saving, canSave, isNew, resource, id, router]);

  // Cmd/Ctrl + S saves.
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

  const remove = async () => {
    setDeleting(true);
    try {
      await api(`/${resource}/${id}`, { method: 'DELETE' });
      toast.success(`${def?.label ?? 'Item'} deleted`);
      setSaved(doc);
      router.push(`/dashboard/content/${resource}`);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Delete failed');
      setDeleting(false);
    }
  };

  const error = defError ?? loadError;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!def || !doc) return <div className="flex h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;

  const listHref = `/dashboard/content/${resource}`;
  const title = String(doc[def.titleField] || '') || (isNew ? `New ${lowerLabel(def.label)}` : 'Untitled');
  const publishFields = def.fields.filter((f) => f.group === PUBLISH_GROUP);
  const path = publicPath(resource, saved ?? doc);
  const livePublished = !isNew && saved?.status === 'published';

  return (
    <div className="pb-24">
      <PageHeader
        title={title}
        crumbs={[{ label: def.labelPlural, href: listHref }, { label: isNew ? 'New' : 'Edit' }]}
        actions={
          <>
            <Button variant="outline" className="h-10 rounded-xl px-4" onClick={() => router.push(listHref)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            {path && livePublished && (
              <a href={`${SITE_URL}${path}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-10 rounded-xl px-4">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> View on site
                </Button>
              </a>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ContentForm resource={resource} fields={def.fields} value={doc} onChange={setDoc} errors={errors} hideGroups={[PUBLISH_GROUP]} initialGroup={initialTab} />

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          {publishFields.length > 0 && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-slate-500">Publish</h2>
              <div className="space-y-4">
                {publishFields.map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    value={doc[field.key]}
                    error={errors[field.key]}
                    doc={doc}
                    resource={resource}
                    onChange={(v) => setDoc({ ...doc, [field.key]: v })}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 text-[13px] shadow-sm">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-slate-500">Details</h2>
            <dl className="space-y-2.5">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-semibold text-slate-800">{isNew ? 'Not saved yet' : livePublished ? 'Live on website' : 'Draft'}</dd>
              </div>
              {path && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">URL</dt>
                  <dd className="truncate font-mono text-[12px] text-slate-700" title={path}>{path}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-700">{formatDate(saved?.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="text-slate-700">{formatDate(saved?.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {!isNew && can(resource, 'delete') && (
            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-red-600">Danger zone</h2>
              <p className="mt-1.5 text-[13px] text-slate-500">Removes this {lowerLabel(def.label)} from the website and the admin.</p>
              <Button variant="outline" className="mt-4 h-10 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete {lowerLabel(def.label)}
              </Button>
            </section>
          )}
        </aside>
      </div>

      {canSave && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
          <div className="flex h-16 items-center justify-between gap-3 px-6">
            <span className="flex items-center gap-2 text-[13px] text-slate-500">
              <span className={`h-2 w-2 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {dirty ? 'Unsaved changes' : isNew ? 'Fill in the details and save' : 'All changes saved'}
              <span className="hidden text-slate-400 sm:inline">· ⌘S to save</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 rounded-xl px-4" disabled={!dirty || saving} onClick={() => { setDoc(saved); setErrors({}); }}>
                Discard
              </Button>
              <Button className="h-10 min-w-32 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 text-white shadow-md shadow-violet-500/25 hover:opacity-95" disabled={saving || (!dirty && !isNew)} onClick={save}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                {isNew ? `Create ${lowerLabel(def.label)}` : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete this ${lowerLabel(def.label)}?`}
        description={`"${title}" will be removed from the website and the admin. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
