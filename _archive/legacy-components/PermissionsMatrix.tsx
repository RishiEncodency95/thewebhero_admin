'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/ModulePage';
import { ShieldCheck, Save, ArrowDown } from 'lucide-react';

type Action = 'view' | 'add' | 'edit' | 'delete';
type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

interface ModuleDef {
  key: string;
  label: string;
  group: string;
}

const ACTIONS: { key: Action; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
];

// Delegation chain, top to bottom: each role can only grant permissions at
// or below its own level. Super Admin is the one fixed, unrestricted root.
const ROLES: { key: Role; label: string }[] = [
  { key: 'SUPER_ADMIN', label: 'Super Admin' },
  { key: 'ADMIN', label: 'Admin' },
  { key: 'EDITOR', label: 'Editor' },
  { key: 'VIEWER', label: 'Viewer' },
];

// Every content/business module in the sidebar, grouped the same way the
// sidebar groups them, so this matrix maps 1:1 onto what a role will
// actually see once real auth checks read from it.
const MODULES: ModuleDef[] = [
  { key: 'dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'leads', label: 'Leads', group: 'Business' },
  { key: 'quote-requests', label: 'Quote Requests', group: 'Business' },
  { key: 'contact-enquiries', label: 'Contact Enquiries', group: 'Business' },
  { key: 'support-requests', label: 'Support Requests', group: 'Business' },
  { key: 'home-page', label: 'Home Page', group: 'Website' },
  { key: 'pages', label: 'Pages', group: 'Website' },
  { key: 'services', label: 'Services', group: 'Website' },
  { key: 'solutions', label: 'Solutions', group: 'Website' },
  { key: 'technologies', label: 'Technologies', group: 'Website' },
  { key: 'industries', label: 'Industries', group: 'Website' },
  { key: 'portfolio', label: 'Portfolio', group: 'Website' },
  { key: 'case-studies', label: 'Case Studies', group: 'Website' },
  { key: 'locations', label: 'Locations', group: 'Website' },
  { key: 'careers', label: 'Careers', group: 'Company' },
  { key: 'team', label: 'Team', group: 'Company' },
  { key: 'partners', label: 'Partners', group: 'Company' },
  { key: 'awards', label: 'Awards', group: 'Company' },
  { key: 'blog', label: 'Blog', group: 'Content' },
  { key: 'resources', label: 'Resources', group: 'Content' },
  { key: 'testimonials', label: 'Testimonials', group: 'Content' },
  { key: 'faqs', label: 'FAQs', group: 'Content' },
  { key: 'media-library', label: 'Media Library', group: 'Content' },
  { key: 'newsletter', label: 'Newsletter', group: 'Marketing' },
  { key: 'seo', label: 'SEO', group: 'Marketing' },
  { key: 'users', label: 'Users & Roles', group: 'System' },
  { key: 'permissions', label: 'Permissions', group: 'System' },
  { key: 'notifications', label: 'Notifications', group: 'System' },
  { key: 'audit-logs', label: 'Audit Logs', group: 'System' },
  { key: 'settings', label: 'Settings', group: 'System' },
];

const GROUPS = Array.from(new Set(MODULES.map((m) => m.group)));

type Grants = Record<Action, boolean>;
type RoleGrants = Record<string, Grants>; // moduleKey -> Grants

function defaultGrants(role: Role, moduleKey: string): Grants {
  if (role === 'SUPER_ADMIN') {
    return { view: true, add: true, edit: true, delete: true };
  }
  const moduleDef = MODULES.find((m) => m.key === moduleKey);
  const isSystem = moduleDef?.group === 'System';

  if (role === 'ADMIN') {
    // Admin can run the whole site and manage Editor/Viewer accounts, but
    // only Super Admin can change the permission structure itself.
    if (moduleKey === 'permissions') return { view: true, add: false, edit: false, delete: false };
    return { view: true, add: true, edit: true, delete: true };
  }

  if (role === 'VIEWER') {
    return { view: !isSystem, add: false, edit: false, delete: false };
  }

  // EDITOR: full access to content, view-only on Business leads, none on System
  if (isSystem) return { view: false, add: false, edit: false, delete: false };
  if (moduleDef?.group === 'Business') return { view: true, add: true, edit: true, delete: false };
  return { view: true, add: true, edit: true, delete: true };
}

function initialState(): Record<Role, RoleGrants> {
  const state = {} as Record<Role, RoleGrants>;
  for (const { key: role } of ROLES) {
    state[role] = {};
    for (const m of MODULES) {
      state[role][m.key] = defaultGrants(role, m.key);
    }
  }
  return state;
}

function HierarchyTree() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Access Delegation</p>
      <div className="flex flex-col items-center gap-1.5">
        <RoleNode label="Super Admin" sub="Rohit Kumar · full access to everything" tone="violet" />
        <ArrowDown className="h-4 w-4 text-slate-300" />
        <RoleNode label="Admin" sub="Granted by Super Admin · manages Editor & Viewer" tone="fuchsia" />
        <ArrowDown className="h-4 w-4 text-slate-300" />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <RoleNode label="Editor" sub="Granted by Admin or Super Admin" tone="blue" />
          <RoleNode label="Viewer" sub="Granted by Admin or Super Admin" tone="slate" />
        </div>
      </div>
    </div>
  );
}

const TONE_CLASSES: Record<string, string> = {
  violet: 'border-violet-200 bg-violet-50 text-violet-800',
  fuchsia: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
};

function RoleNode({ label, sub, tone }: { label: string; sub: string; tone: string }) {
  return (
    <div className={`rounded-xl border px-4 py-2 text-center ${TONE_CLASSES[tone]}`}>
      <p className="text-[13px] font-semibold">{label}</p>
      <p className="text-[11px] opacity-80">{sub}</p>
    </div>
  );
}

export function PermissionsMatrix() {
  const [permissions, setPermissions] = useState<Record<Role, RoleGrants>>(initialState);
  const [activeRole, setActiveRole] = useState<Role>('SUPER_ADMIN');

  function toggle(role: Role, moduleKey: string, action: Action) {
    if (role === 'SUPER_ADMIN') return;
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleKey]: { ...prev[role][moduleKey], [action]: !prev[role][moduleKey][action] },
      },
    }));
  }

  function toggleColumnForGroup(role: Role, group: string, action: Action) {
    if (role === 'SUPER_ADMIN') return;
    setPermissions((prev) => {
      const groupModules = MODULES.filter((m) => m.group === group);
      const allOn = groupModules.every((m) => prev[role][m.key][action]);
      const next = { ...prev[role] };
      groupModules.forEach((m) => {
        next[m.key] = { ...next[m.key], [action]: !allOn };
      });
      return { ...prev, [role]: next };
    });
  }

  function handleSave() {
    toast.success('Permissions saved.');
  }

  return (
    <div className="space-y-4">
      <HierarchyTree />

      <div className="flex items-center gap-2.5 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5 text-[13px] text-violet-800">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>
          <strong>Super Admin</strong> (Rohit Kumar) always has full access to every section and page — it grants Admin&apos;s access.
          {' '}<strong>Admin</strong> can then grant access to <strong>Editor</strong> and <strong>Viewer</strong>. All three are configurable below.
        </span>
      </div>

      <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as Role)}>
        <TabsList className="flex-wrap h-auto rounded-xl bg-slate-100/80 p-1">
          {ROLES.map((r) => (
            <TabsTrigger key={r.key} value={r.key}>{r.label}</TabsTrigger>
          ))}
        </TabsList>

        {ROLES.map((r) => (
          <TabsContent key={r.key} value={r.key}>
            <div className="space-y-4 pt-2">
              {GROUPS.map((group) => (
                <div key={group} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group}</p>
                  </div>
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="w-[40%] px-4 py-2 font-medium text-slate-500">Module</th>
                        {ACTIONS.map((a) => (
                          <th key={a.key} className="px-2 py-2 text-center font-medium text-slate-500">
                            {r.key === 'SUPER_ADMIN' ? (
                              <span>{a.label}</span>
                            ) : (
                              <button
                                type="button"
                                className="hover:text-violet-600"
                                onClick={() => toggleColumnForGroup(r.key, group, a.key)}
                                title={`Toggle all ${a.label} in ${group}`}
                              >
                                {a.label}
                              </button>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.filter((m) => m.group === group).map((m) => (
                        <tr key={m.key} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                          <td className="px-4 py-2 text-slate-700">{m.label}</td>
                          {ACTIONS.map((a) => (
                            <td key={a.key} className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                disabled={r.key === 'SUPER_ADMIN'}
                                className="h-4 w-4 rounded border-slate-300 accent-violet-600 disabled:opacity-60"
                                checked={permissions[r.key][m.key][a.key]}
                                onChange={() => toggle(r.key, m.key, a.key)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Button className={PRIMARY_BUTTON_CLASS} onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Save Permissions
      </Button>
    </div>
  );
}
