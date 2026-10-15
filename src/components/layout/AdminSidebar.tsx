'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { ChevronDown, ExternalLink, Globe } from 'lucide-react';
import {
  LayoutDashboard,
  Bell,
  FileKey,
  FileText,
  Mail,
  Headphones,
  LayoutGrid,
  Lightbulb,
  Layers,
  Building2,
  FolderOpen,
  Newspaper,
  Star,
  HelpCircle,
  Image as ImageIcon,
  Send,
  Gauge,
  FileSearch,
  UserCog,
  Home,
  Briefcase,
  Users,
  MapPin,
  ShieldCheck,
  Tags,
  Target,
  Landmark,
  Settings,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/lib/auth';

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Permission resource that must be readable to see this item. */
  resource?: string;
}

const content = (resource: string, title: string, icon: NavItem['icon']): NavItem => ({ title, url: `/dashboard/content/${resource}`, icon, resource });

export const navItems: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Leads',
    items: [
      { title: 'Quote Requests', url: '/dashboard/quote-requests', icon: FileText, resource: 'quote-requests' },
      { title: 'Contact Enquiries', url: '/dashboard/contact-enquiries', icon: Mail, resource: 'contact-enquiries' },
      { title: 'Support Requests', url: '/dashboard/support-requests', icon: Headphones, resource: 'support-requests' },
      { title: 'Newsletter', url: '/dashboard/newsletter', icon: Send, resource: 'newsletter' },
    ],
  },
  {
    group: 'Website',
    items: [
      content('services', 'Services', LayoutGrid),
      content('categories', 'Service Categories', Tags),
      content('solutions', 'Solutions', Lightbulb),
      content('business-needs', 'Business Needs', Target),
      content('technologies', 'Technologies', Layers),
      content('industries', 'Industries', Building2),
      content('portfolio', 'Portfolio', FolderOpen),
      content('blog', 'Blog', Newspaper),
      content('locations', 'Locations', MapPin),
    ],
  },
  {
    group: 'Company',
    items: [
      { title: 'About Company', url: '/dashboard/site/company', icon: Landmark, resource: 'company' },
      content('team', 'Team', Users),
      content('careers', 'Careers', Briefcase),
      content('testimonials', 'Testimonials', Star),
      content('faqs', 'FAQs', HelpCircle),
    ],
  },
  {
    group: 'Site & SEO',
    items: [
      { title: 'SEO Center', url: '/dashboard/seo', icon: Gauge, resource: 'seo-pages' },
      content('seo-pages', 'Page SEO', FileSearch),
      { title: 'Home Page', url: '/dashboard/site/home-page', icon: Home, resource: 'home-page' },
      { title: 'Site Settings', url: '/dashboard/site/settings', icon: Settings, resource: 'settings' },
      { title: 'Media Library', url: '/dashboard/media-library', icon: ImageIcon, resource: 'media' },
    ],
  },
  {
    group: 'System',
    items: [
      { title: 'Users', url: '/dashboard/users', icon: UserCog, resource: 'users' },
      { title: 'Roles & Permissions', url: '/dashboard/permissions', icon: ShieldCheck, resource: 'roles' },
      { title: 'Notifications', url: '/dashboard/notifications', icon: Bell },
      { title: 'Audit Log', url: '/dashboard/audit-logs', icon: FileKey, resource: 'audit-logs' },
    ],
  },
];

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thewebhero.in').replace(/\/+$/, '');

export function AdminSidebar() {
  const pathname = usePathname();
  const { can } = useAuth();
  const isActive = (url: string) => (url === '/dashboard' ? pathname === url : pathname === url || pathname.startsWith(`${url}/`));

  const groups = navItems
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.resource || can(i.resource, 'read')) }))
    .filter((g) => g.items.length > 0);

  return (
    <Sidebar className="border-r border-slate-200 [&_[data-slot=sidebar-inner]]:bg-[#f8f9fc]">
      <SidebarHeader className="h-16 items-center justify-center border-b border-slate-200 bg-white px-4">
        <Link href="/dashboard" className="flex w-full items-center justify-center">
          <Image src="/logo-full.png" alt="TheWebHero" width={2172} height={724} className="h-[60px] w-auto max-w-full object-contain" priority />
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-3 py-4 [scrollbar-color:rgba(15,23,42,0.15)_transparent] [scrollbar-width:thin]">
        {groups.map((group) => (
          <Collapsible key={group.group} defaultOpen className="group/collapsible">
            <SidebarGroup className="overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <CollapsibleTrigger
                nativeButton={false}
                render={
                  <SidebarGroupLabel className="flex h-9 w-full cursor-pointer items-center justify-between rounded-none border-b border-slate-100 bg-slate-50/80 px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 hover:text-slate-800 in-data-[panel-closed]:border-b-0" />
                }
              >
                {group.group}
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-400 transition-transform in-data-[panel-open]:rotate-0" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="p-1.5">
                  <SidebarMenu className="gap-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.url);
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            render={<Link href={item.url} />}
                            isActive={active}
                            className={`h-9 rounded-lg px-2.5 transition-all ${
                              active
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-500 font-semibold text-white! shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-indigo-500 data-active:bg-transparent data-active:text-white!'
                                : 'font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700!'
                            }`}
                          >
                            <item.icon className={`h-[17px] w-[17px] shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                            <span className="flex-1 truncate text-[13.5px] leading-none">{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white p-3">
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          <span className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-violet-600" /> View website
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
