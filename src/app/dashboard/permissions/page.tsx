'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Lock, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/buttons';
import { cardClass, ErrorBlock, errorMessage, LoadingBlock } from '@/components/admin/kit';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

const ACTIONS = ['read', 'create', 'update', 'delete'] as const;
const ACTION_LABEL = { read: 'View', create: 'Add', update: 'Edit', delete: 'Delete' };

// Same grouping as the sidebar, so the matrix reads like the admin itself.
const GROUPS: { label: string; resources: string[] }[] = [
  { label: 'Leads', resources: ['quote-requests', 'contact-enquiries', 'support-requests', 'newsletter'] },
  {
    label: 'Website content',
    resources: ['services', 'solutions', 'technologies', 'industries', 'categories', 'business-needs', 'portfolio', 'blog', 'team', 'careers', 'testimonials', 'faqs', 'locations'],
  },
  { label: 'Site & SEO', resources: ['seo-pages', 'home-page', 'company', 'settings', 'media'] },
  { label: 'System', resources: ['users', 'roles', 'audit-logs', 'notifications'] },
];

const SUPER_ADMIN = 'super-admin';

const label = (s: string) =>
  s
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace('Seo', 'SEO')
    .replace('Faqs', 'FAQs');

function NewRoleDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (r: Role) => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-xl">{open && <NewRoleForm onClose={onClose} onCreated={onCreated} saving={saving} setSaving={setSaving} />}</DialogContent>
    </Dialog>
  );
}

function NewRoleForm({ onClose, onCreated, saving, setSaving }: { onClose: () => void; onCreated: (r: Role) => void; saving: boolean; setSaving: (v: boolean) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const role = await api<Role>('/roles', { method: 'POST', body: { name: name.trim().toLowerCase().replace(/\s+/g, '-'), description, permissions: [] } });
      toast.success('Role created — now choose its permissions');
      onCreated(role);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create role'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-2">
      <DialogTitle className="text-[20px] font-bold text-slate-900">New role</DialogTitle>
      <DialogDescription className="mt-1 text-[14px] text-slate-500">For example “Content writer” or “Sales”.</DialogDescription>
      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={50} className="h-11 rounded-xl" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Description</span>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} className="h-11 rounded-xl" />
        </label>
      </div>
      <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="outline" className="h-10 rounded-xl px-5" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className={`h-10 rounded-xl px-5 ${PRIMARY_BUTTON_CLASS}`} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create role
        </Button>
      </div>
    </form>
  );
}

export default function RolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = (select?: string) =>
    api<Role[]>('/roles')
      .then((r) => {
        setRoles(r);
        const pick = r.find((x) => x._id === select) ?? r.find((x) => x.name !== SUPER_ADMIN) ?? r[0];
        if (pick) {
          setSelectedId(pick._id);
          setDraft(new Set(pick.permissions));
        }
      })
      .catch((err) => setError(errorMessage(err, 'Could not load roles')));

  useEffect(() => {
    load();
  }, []);

  const selected = roles?.find((r) => r._id === selectedId) ?? null;
  const isSuper = selected?.name === SUPER_ADMIN;
  const locked = !selected || isSuper || !can('roles', 'update');
  const dirty = useMemo(() => {
    if (!selected) return false;
    return selected.permissions.length !== draft.size || selected.permissions.some((p) => !draft.has(p));
  }, [selected, draft]);

  const select = (r: Role) => {
    if (dirty && !window.confirm('Discard unsaved permission changes?')) return;
    setSelectedId(r._id);
    setDraft(new Set(r.permissions));
  };

  const toggle = (perm: string) => {
    if (locked) return;
    const next = new Set(draft);
    if (next.has(perm)) next.delete(perm);
    else next.add(perm);
    // Any write implies being able to see the section.
    const [res, action] = perm.split(':');
    if (action !== 'read' && next.has(perm)) next.add(`${res}:read`);
    if (action === 'read' && !next.has(perm)) ACTIONS.forEach((a) => next.delete(`${res}:${a}`));
    setDraft(next);
  };

  const toggleRow = (res: string) => {
    if (locked) return;
    const all = ACTIONS.every((a) => draft.has(`${res}:${a}`));
    const next = new Set(draft);
    ACTIONS.forEach((a) => (all ? next.delete(`${res}:${a}`) : next.add(`${res}:${a}`)));
    setDraft(next);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/roles/${selected._id}`, { method: 'PUT', body: { permissions: [...draft] } });
      toast.success(`Permissions for ${label(selected.name)} saved`, { description: 'Users with this role get them on their next sign-in or token refresh.' });
      await load(selected._id);
    } catch (err) {
      toast.error(errorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/roles/${toDelete._id}`, { method: 'DELETE' });
      toast.success('Role deleted');
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorBlock message={error} />;
  if (!roles) return <LoadingBlock className="h-96" />;

  return (
    <div className="pb-24">
      <PageHeader
        title="Roles & permissions"
        description="Choose what each role can view, add, edit or delete. Super admin always has full access."
        actions={
          can('roles', 'create') && (
            <Button className={`h-10 rounded-xl px-4 ${PRIMARY_BUTTON_CLASS}`} onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New role
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`h-fit p-2 ${cardClass}`}>
          {roles.map((r) => (
            <button
              key={r._id}
              type="button"
              onClick={() => select(r)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${r._id === selectedId ? 'bg-violet-50 ring-1 ring-violet-200' : 'hover:bg-slate-50'}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${r._id === selectedId ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {r.name === SUPER_ADMIN ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-slate-900">{label(r.name)}</span>
                <span className="block truncate text-[12px] text-slate-500">{r.name === SUPER_ADMIN ? 'Full access · locked' : `${r.permissions.length} permissions${r.isSystem ? ' · built-in' : ''}`}</span>
              </span>
            </button>
          ))}
        </aside>

        {selected && (
          <section className={`overflow-hidden ${cardClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-[17px] font-bold text-slate-900">{label(selected.name)}</h2>
                <p className="text-[13px] text-slate-500">
                  {isSuper ? 'Super admin always has every permission and cannot be changed.' : selected.description || 'Tick what this role is allowed to do.'}
                </p>
              </div>
              {!selected.isSystem && can('roles', 'delete') && (
                <Button variant="outline" className="h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50" onClick={() => setToDelete(selected)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete role
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="h-11 pl-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Section</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="h-11 w-24 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {ACTION_LABEL[a]}
                      </th>
                    ))}
                    <th className="h-11 w-24 pr-5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">All</th>
                  </tr>
                </thead>
                {GROUPS.map((g) => (
                  <tbody key={g.label}>
                    <tr>
                      <td colSpan={6} className="bg-slate-50/40 px-5 pb-2 pt-5 text-[11px] font-bold uppercase tracking-wider text-violet-600">
                        {g.label}
                      </td>
                    </tr>
                    {g.resources.map((res) => {
                      const all = isSuper || ACTIONS.every((a) => draft.has(`${res}:${a}`));
                      return (
                        <tr key={res} className="h-12 border-t border-slate-100">
                          <td className="pl-5 font-medium text-slate-800">{label(res)}</td>
                          {ACTIONS.map((a) => {
                            const perm = `${res}:${a}`;
                            return (
                              <td key={a} className="text-center">
                                <input
                                  type="checkbox"
                                  aria-label={`${ACTION_LABEL[a]} ${label(res)}`}
                                  checked={isSuper || draft.has(perm)}
                                  disabled={locked}
                                  onChange={() => toggle(perm)}
                                  className="h-4 w-4 cursor-pointer accent-violet-600 disabled:cursor-not-allowed"
                                />
                              </td>
                            );
                          })}
                          <td className="pr-5 text-center">
                            <input
                              type="checkbox"
                              aria-label={`All for ${label(res)}`}
                              checked={all}
                              disabled={locked}
                              onChange={() => toggleRow(res)}
                              className="h-4 w-4 cursor-pointer accent-violet-600 disabled:cursor-not-allowed"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
              </table>
            </div>
          </section>
        )}
      </div>

      {!locked && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
          <div className="flex h-16 items-center justify-between gap-3 px-6">
            <span className="flex items-center gap-2 text-[13px] text-slate-500">
              <span className={`h-2 w-2 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 rounded-xl px-4" disabled={!dirty || saving} onClick={() => selected && setDraft(new Set(selected.permissions))}>
                Discard
              </Button>
              <Button className={`h-10 min-w-32 rounded-xl px-5 ${PRIMARY_BUTTON_CLASS}`} disabled={!dirty || saving} onClick={save}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save permissions
              </Button>
            </div>
          </div>
        </div>
      )}

      <NewRoleDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(r) => {
          setCreating(false);
          load(r._id);
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this role?"
        description={`Users who still have the “${toDelete ? label(toDelete.name) : ''}” role must be moved to another role first.`}
        confirmLabel="Delete role"
        destructive
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
