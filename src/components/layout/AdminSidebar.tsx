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
import {
  LayoutDashboard,
  Settings,
  Bell,
  FileKey,
  ChevronRight,
  Target,
  FileText,
  Mail,
  Headphones,
  LayoutGrid,
  Lightbulb,
  Layers,
  Building2,
  FolderOpen,
  BookOpen,
  Newspaper,
  FolderKanban,
  Star,
  HelpCircle,
  Image as ImageIcon,
  Send,
  Search,
  UserCog,
  Home,
  Briefcase,
  Users,
  MapPin,
  Handshake,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

// Sample nav structure — replace groups/items with your own app's sections.
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: { group: string; items: NavItem[] }[] = [
  {
    group: 'Main',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Business',
    items: [
      { title: 'Leads', url: '/dashboard/leads', icon: Target },
      { title: 'Quote Requests', url: '/dashboard/quote-requests', icon: FileText },
      { title: 'Contact Enquiries', url: '/dashboard/contact-enquiries', icon: Mail },
      { title: 'Support Requests', url: '/dashboard/support-requests', icon: Headphones },
    ],
  },
  {
    group: 'Website',
    items: [
      { title: 'Home Page', url: '/dashboard/home-page', icon: Home },
      { title: 'Pages', url: '/dashboard/pages', icon: FileText },
      { title: 'Services', url: '/dashboard/services', icon: LayoutGrid },
      { title: 'Solutions', url: '/dashboard/solutions', icon: Lightbulb },
      { title: 'Technologies', url: '/dashboard/technologies', icon: Layers },
      { title: 'Industries', url: '/dashboard/industries', icon: Building2 },
      { title: 'Portfolio', url: '/dashboard/portfolio', icon: FolderOpen },
      { title: 'Case Studies', url: '/dashboard/case-studies', icon: BookOpen },
      { title: 'Locations', url: '/dashboard/locations', icon: MapPin },
    ],
  },
  {
    group: 'Company',
    items: [
      { title: 'Careers', url: '/dashboard/careers', icon: Briefcase },
      { title: 'Team', url: '/dashboard/team', icon: Users },
      { title: 'Partners', url: '/dashboard/partners', icon: Handshake },
      { title: 'Awards', url: '/dashboard/awards', icon: Trophy },
    ],
  },
  {
    group: 'Content',
    items: [
      { title: 'Blog', url: '/dashboard/blog', icon: Newspaper },
      { title: 'Resources', url: '/dashboard/resources', icon: FolderKanban },
      { title: 'Testimonials', url: '/dashboard/testimonials', icon: Star },
      { title: 'FAQs', url: '/dashboard/faqs', icon: HelpCircle },
      { title: 'Media Library', url: '/dashboard/media-library', icon: ImageIcon },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { title: 'Newsletter', url: '/dashboard/newsletter', icon: Send },
      { title: 'SEO', url: '/dashboard/seo', icon: Search },
    ],
  },
  {
    group: 'System',
    items: [
      { title: 'Users & Roles', url: '/dashboard/users', icon: UserCog },
      { title: 'Permissions', url: '/dashboard/permissions', icon: ShieldCheck },
      { title: 'Notifications', url: '/dashboard/notifications', icon: Bell },
      { title: 'Audit Logs', url: '/dashboard/audit-logs', icon: FileKey },
      { title: 'Settings', url: '/dashboard/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="h-16 flex justify-center items-center px-5 border-b border-slate-100 bg-white">
        <Image src="/logo-full.png" alt="Logo" width={2172} height={724} className="h-14 w-auto object-contain" priority />
      </SidebarHeader>
      <SidebarContent className="px-2.5 py-3 gap-1">
        {navItems.map((group, index) => (
          <React.Fragment key={group.group}>
            {index > 0 && <Separator className="my-2 bg-slate-100" />}
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup className="py-0">
                <CollapsibleTrigger
                  nativeButton={false}
                  render={
                    <SidebarGroupLabel
                      className="w-full flex items-center justify-between cursor-pointer px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    />
                  }
                >
                  {group.group}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1 mt-1">
                      {group.items.map((item) => {
                        const active = pathname === item.url;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              render={<Link href={item.url} />}
                              isActive={active}
                              style={active ? { color: '#ffffff' } : undefined}
                              className={
                                active
                                  ? 'h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white! font-medium shadow-sm shadow-violet-200 hover:text-white! data-active:text-white!'
                                  : 'h-10 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }
                            >
                              <span
                                className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                                  }`}
                                style={active ? { color: '#ffffff' } : undefined}
                              >
                                <item.icon className="w-4 h-4" />
                              </span>
                              <span className="text-[13px] flex-1" style={active ? { color: '#ffffff' } : undefined}>
                                {item.title}
                              </span>
                              {!active && (
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </React.Fragment>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
