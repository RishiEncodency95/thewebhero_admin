# Admin UI Template

A reusable Next.js admin dashboard **UI template**, cloned from the CityCalls admin panel's layout and design system — with all API calls, auth logic, and business-specific pages stripped out. Only the shell and reusable pieces remain.

## What's included

- `src/components/layout/` — `AdminLayout`, `AdminSidebar`, `AdminNavbar` (sidebar nav is a sample list — edit `AdminSidebar.tsx` to add your own sections)
- `src/components/ui/` — shadcn-based UI kit (button, card, table, sidebar, sheet, tabs, dropdown, `DataTable`, `AppFormField`, `FormSheet`, `StatusBadge`, etc.)
- `src/app/login`, `forgot-password`, `reset-password` — auth page UIs with client-side validation (zod + react-hook-form), `onSubmit` just logs to console — wire up your own API call
- `src/app/dashboard` — a sample dashboard page with stat cards + charts (recharts) built on static demo data
- `src/app/design-system` — a live showcase of the UI kit
- `src/app/providers.tsx` — empty passthrough; drop in React Query/SWR/whatever you use for data-fetching

## What's NOT included (by design)

- No API client, no `lib/hooks/use*` data hooks, no auth/session logic, no RBAC/`PermissionGate`
- No CityCalls business pages (calls, leads, vendors, finance, etc.)
- No `axios`, `@tanstack/react-query`, or `socket.io-client` dependencies

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

## Using this in another project

1. Copy the pieces you need (`components/layout`, `components/ui`, `app/design-system`, auth pages) into your project, or just build on this repo directly.
2. Replace `public/logo.png` and the auth page background/wordmark with your own branding.
3. Edit the `navItems` array in `src/components/layout/AdminSidebar.tsx` to match your app's sections.
4. Add your own data-fetching (in `src/app/providers.tsx` and wherever pages need data) and hook up the `onSubmit` handlers in the auth pages to your real API.
