'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/buttons';
import {
  cardClass,
  docId,
  EmptyState,
  ErrorBlock,
  errorMessage,
  formatDateTime,
  iconButtonClass,
  LoadingBlock,
  Pagination,
  rowClass,
  SearchBox,
  tdClass,
  thClass,
  useDebounced,
  usePaginated,
} from '@/components/admin/kit';
import { api, ApiRequestError, Paginated } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

interface UserRow {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  role?: { _id: string; name: string } | null;
}

const roleLabel = (name?: string) => (name ? name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

interface UserDialogProps {
  open: boolean;
  user: UserRow | null;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}

function UserDialog(props: UserDialogProps) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && !saving && props.onClose()}>
      <DialogContent className="max-w-2xl">
        {/* Mounted fresh on every open, so the form starts from the selected user. */}
        {props.open && <UserForm {...props} saving={saving} setSaving={setSaving} />}
      </DialogContent>
    </Dialog>
  );
}

function UserForm({ user, roles, onClose, onSaved, saving, setSaving }: UserDialogProps & { saving: boolean; setSaving: (v: boolean) => void }) {
  const isNew = !user;
  const [form, setForm] = useState(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role?._id ?? roles.find((r) => r.name === 'editor')?._id ?? roles[0]?._id ?? '',
    isActive: user?.isActive ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isNew) await api('/users', { method: 'POST', body: { name: form.name, email: form.email, password: form.password, role: form.role } });
      else await api(`/users/${user._id}`, { method: 'PUT', body: { name: form.name, role: form.role, isActive: form.isActive } });
      toast.success(isNew ? 'User created' : 'User updated');
      onSaved();
    } catch (err) {
      if (err instanceof ApiRequestError) setErrors(err.fieldErrors);
      toast.error(errorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: 'name' | 'email' | 'password', label: string, type = 'text', disabled = false, help?: string) => (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      <Input type={type} value={form[key]} disabled={disabled} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-11 rounded-xl" required={!disabled} />
      {errors[key] ? <span className="mt-1 block text-[12px] text-red-600">{errors[key]}</span> : help && <span className="mt-1 block text-[12px] text-slate-400">{help}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="p-2">
      <DialogTitle className="text-[20px] font-bold text-slate-900">{isNew ? 'Add team member' : 'Edit user'}</DialogTitle>
      <DialogDescription className="mt-1 text-[14px] text-slate-500">
        {isNew ? 'They sign in to the admin with this email and password.' : 'Change the name, role or access of this user.'}
      </DialogDescription>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {field('name', 'Full name')}
        {field('email', 'Email', 'email', !isNew, isNew ? undefined : 'Email cannot be changed.')}
        {isNew && field('password', 'Password', 'password', false, 'At least 8 characters.')}
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Role</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400"
          >
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {roleLabel(r.name)}
              </option>
            ))}
          </select>
          {errors.role && <span className="mt-1 block text-[12px] text-red-600">{errors.role}</span>}
        </label>
        {!isNew && (
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 sm:col-span-2 h-14">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-violet-600" />
            <span>
              <span className="block text-[14px] font-semibold text-slate-800">Account active</span>
              <span className="block text-[12px] text-slate-500">Turn off to block sign-in without deleting the user.</span>
            </span>
          </label>
        )}
      </div>

      <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="outline" className="h-10 rounded-xl px-5" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className={`h-10 min-w-32 rounded-xl px-5 ${PRIMARY_BUTTON_CLASS}`} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? 'Create user' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { can, user: me } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounced(searchInput.trim());
  const [page, setPage] = useState(1);
  const { data, error, reload } = usePaginated<UserRow>('/users', { page, limit: 20, search });
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<UserRow | null | 'new'>(null);
  const [toDelete, setToDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api<Paginated<Role> | Role[]>('/roles', { query: { limit: 100 } })
      .then((r) => setRoles(Array.isArray(r) ? r : r.items))
      .catch(() => {});
  }, []);

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/users/${toDelete._id}`, { method: 'DELETE' });
      toast.success('User deleted');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="People who can sign in to this admin. What each person can do is set by their role."
        actions={
          can('users', 'create') && (
            <Button className={`h-10 rounded-xl px-4 ${PRIMARY_BUTTON_CLASS}`} onClick={() => setEditing('new')}>
              <Plus className="mr-1.5 h-4 w-4" /> Add user
            </Button>
          )
        }
      />

      <div className="mb-4 flex justify-end">
        <SearchBox
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v);
            setPage(1);
          }}
          placeholder="Search by name or email…"
        />
      </div>

      {error ? (
        <ErrorBlock message={error} />
      ) : !data ? (
        <LoadingBlock />
      ) : data.items.length === 0 ? (
        <EmptyState icon={UserCog} message={search ? 'No users match this search.' : 'No users yet.'} />
      ) : (
        <div className={`overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className={thClass}>User</th>
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Last sign-in</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u._id} className={rowClass}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[12px] font-bold text-white">
                          {initials(u.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">
                            {u.name}
                            {docId(u) === me?.id && <span className="ml-2 text-[11px] font-medium text-violet-600">(you)</span>}
                          </span>
                          <span className="block truncate text-[12px] text-slate-500">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">{roleLabel(u.role?.name)}</span>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ${u.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}</td>
                    <td className={tdClass}>
                      <div className="flex justify-end gap-1">
                        {can('users', 'update') && (
                          <button type="button" title="Edit" className={iconButtonClass} onClick={() => setEditing(u)}>
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {can('users', 'delete') && docId(u) !== me?.id && (
                          <button type="button" title="Delete" className={`${iconButtonClass} hover:bg-red-50! hover:text-red-600!`} onClick={() => setToDelete(u)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}

      <UserDialog
        open={editing !== null}
        user={editing === 'new' ? null : editing}
        roles={roles}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this user?"
        description={`${toDelete?.name ?? ''} (${toDelete?.email ?? ''}) will lose access to the admin immediately.`}
        confirmLabel="Delete user"
        destructive
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
