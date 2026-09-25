'use client';

import {
  Users, FileText, Mail, Headphones, Send, LayoutGrid, FolderOpen, Newspaper,
  Calendar, ChevronDown, ArrowUp, ArrowDown, UserPlus, FilePlus, FolderPlus, BookOpen, Settings,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// --- Demo data — replace every constant below with your own API/data calls. ---
const CURRENT_USER = { name: 'Admin' };

const STAT_CARDS = [
  { title: 'Total Leads', value: 128, delta: '12%', trend: 'up', icon: Users, color: '#7c3aed', bg: '#f3e8ff' },
  { title: 'Quote Requests', value: 34, delta: '8%', trend: 'up', icon: FileText, color: '#f59e0b', bg: '#fef3c7' },
  { title: 'Contact Enquiries', value: 26, delta: '5%', trend: 'up', icon: Mail, color: '#3b82f6', bg: '#dbeafe' },
  { title: 'Support Requests', value: 12, delta: '4%', trend: 'down', icon: Headphones, color: '#f43f5e', bg: '#ffe4e6' },
  { title: 'Newsletter Subscribers', value: 172, delta: '18%', trend: 'up', icon: Send, color: '#10b981', bg: '#d1fae5' },
  { title: 'Total Services', value: 11, delta: null, trend: 'none', icon: LayoutGrid, color: '#3b82f6', bg: '#dbeafe' },
  { title: 'Portfolio Projects', value: 24, delta: '20%', trend: 'up', icon: FolderOpen, color: '#8b5cf6', bg: '#ede9fe' },
  { title: 'Blog Posts', value: 36, delta: '9%', trend: 'up', icon: Newspaper, color: '#f59e0b', bg: '#fef3c7' },
];

const LEADS_OVERVIEW = [
  6, 8, 7, 9, 8, 11, 10, 9, 12, 14, 16, 19, 15, 17, 13, 14, 16, 18, 20, 22,
  19, 21, 18, 20, 23, 25, 22, 24, 27, 30,
].map((v, i) => ({ day: i + 1, leads: v }));

const LEADS_BY_SOURCE = [
  { name: 'Website', value: 35, color: '#7c3aed' },
  { name: 'Referral', value: 20, color: '#f97316' },
  { name: 'Facebook Ads', value: 18, color: '#3b82f6' },
  { name: 'Google Ads', value: 12, color: '#10b981' },
  { name: 'Walk-in', value: 8, color: '#ec4899' },
  { name: 'Others', value: 7, color: '#cbd5e1' },
];

const STAGE_STYLES: Record<string, string> = {
  New: 'bg-violet-100 text-violet-700',
  'Follow-up': 'bg-amber-100 text-amber-700',
  Converted: 'bg-emerald-100 text-emerald-700',
};

const RECENT_LEADS = [
  { name: 'Ananya Verma', phone: '+91 98765 43210', source: 'Website', stage: 'New', date: '24 Sep' },
  { name: 'Kabir Singh', phone: '+91 91234 56780', source: 'Referral', stage: 'Follow-up', date: '25 Sep' },
  { name: 'Ishita Rao', phone: '+91 90000 11122', source: 'Walk-in', stage: 'Follow-up', date: '25 Sep' },
  { name: 'Vivaan Mehta', phone: '+91 99887 66554', source: 'Facebook Ads', stage: 'Converted', date: '23 Sep' },
  { name: 'Saanvi Nair', phone: '+91 98123 45678', source: 'Website', stage: 'New', date: '26 Sep' },
];

const RECENT_ACTIVITIES = [
  { icon: UserPlus, iconColor: '#7c3aed', iconBg: '#f3e8ff', title: 'New lead received from website', subtitle: 'Ananya Verma', time: '10:30 AM' },
  { icon: FilePlus, iconColor: '#f59e0b', iconBg: '#fef3c7', title: 'New quote request submitted', subtitle: 'Rohit Sharma', time: '09:15 AM' },
  { icon: FolderPlus, iconColor: '#10b981', iconBg: '#d1fae5', title: 'New portfolio project added', subtitle: 'CityCalls Mobile App', time: 'Yesterday' },
  { icon: BookOpen, iconColor: '#3b82f6', iconBg: '#dbeafe', title: 'Blog post published', subtitle: 'Top Web Development Trends 2026', time: 'Yesterday' },
  { icon: Settings, iconColor: '#ef4444', iconBg: '#fee2e2', title: 'Service updated', subtitle: 'AI Solutions', time: '22 Sep' },
];

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function StatCard({
  title, value, delta, trend, icon: Icon, color, bg,
}: (typeof STAT_CARDS)[number]) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-slate-500 truncate">{title}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-bold text-slate-800 leading-none">{value}</span>
        </div>
        {trend !== 'none' ? (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {trend === 'up' ? (
              <ArrowUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <ArrowDown className="w-3 h-3 text-rose-500" />
            )}
            <span className={trend === 'up' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{delta}</span>
            <span className="text-slate-400">vs last month</span>
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-400">No change</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const totalLeadsBySource = LEADS_BY_SOURCE.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">Dashboard</p>
          <h1 className="text-2xl font-bold text-slate-800">Good Morning, {CURRENT_USER.name}! 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s what&apos;s happening with your website today.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>01 Sep 2025 - 30 Sep 2025</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Leads Overview</h2>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              Last 30 Days
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={LEADS_OVERVIEW} margin={{ left: -20, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="leadsBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickFormatter={(d: number) => (d === 1 || d % 5 === 0 ? `${d} Sep` : '')}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#f1f5f9' }}
                tickLine={false}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} labelFormatter={(d) => `${d} Sep`} />
              <Bar dataKey="leads" fill="url(#leadsBar)" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Leads by Source</h2>
          <div className="relative w-full h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={LEADS_BY_SOURCE} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                  {LEADS_BY_SOURCE.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{totalLeadsBySource}</span>
              <span className="text-xs text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-2.5 mt-4">
            {LEADS_BY_SOURCE.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="truncate text-slate-600">{d.name}</span>
                </span>
                <span className="font-semibold text-slate-700 shrink-0">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-800">Recent Leads</h2>
            <a href="#" className="text-sm font-medium text-violet-600 hover:text-violet-700">View All</a>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-slate-500">Name</TableHead>
                <TableHead className="text-slate-500">Phone</TableHead>
                <TableHead className="text-slate-500">Source</TableHead>
                <TableHead className="text-slate-500">Stage</TableHead>
                <TableHead className="text-slate-500">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_LEADS.map((lead) => (
                <TableRow key={lead.name}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm" className="bg-violet-100">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-[11px] font-semibold">
                          {initials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">{lead.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{lead.phone}</TableCell>
                  <TableCell className="text-slate-500">{lead.source}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[lead.stage]}`}>
                      {lead.stage}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{lead.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-800">Recent Activities</h2>
            <a href="#" className="text-sm font-medium text-violet-600 hover:text-violet-700">View All</a>
          </div>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: a.iconBg, color: a.iconColor }}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 leading-tight">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{a.subtitle}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
