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
} from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
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

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Permission resource that must be readable to see this item. */
  resource?: string;
}

const content = (resource: string, title: string, icon: NavItem['icon']): NavItem => ({ title, url: `/dashboard/content/${resource}`, icon, resource });

const navItems: { group: string; items: NavItem[] }[] = [
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

export function AdminSidebar() {
  const pathname = usePathname();
  const { can } = useAuth();
  const isActive = (url: string) => (url === '/dashboard' ? pathname === url : pathname === url || pathname.startsWith(`${url}/`));

  const groups = navItems
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.resource || can(i.resource, 'read')) }))
    .filter((g) => g.items.length > 0);

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="flex h-16 items-center justify-center border-b border-slate-100 bg-white px-5">
        <Image src="/logo-full.png" alt="TheWebHero" width={2172} height={724} className="h-12 w-auto object-contain" priority />
      </SidebarHeader>
      <SidebarContent className="gap-0 px-3 py-3">
        {groups.map((group) => (
          <Collapsible key={group.group} defaultOpen className="group/collapsible">
            <SidebarGroup className="px-0 py-1.5">
              <CollapsibleTrigger
                nativeButton={false}
                render={<SidebarGroupLabel className="flex h-7 w-full cursor-pointer items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600" />}
              >
                {group.group}
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 transition-transform in-data-[panel-open]:rotate-0" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="mt-0.5 gap-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.url);
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            render={<Link href={item.url} />}
                            isActive={active}
                            className={
                              active
                                ? 'h-9 rounded-lg bg-violet-50 font-semibold text-violet-700! hover:bg-violet-50 data-active:bg-violet-50 data-active:text-violet-700!'
                                : 'h-9 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }
                          >
                            <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-violet-600' : 'text-slate-400'}`} />
                            <span className="flex-1 text-[13.5px]">{item.title}</span>
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />}
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
    </Sidebar>
  );
}
