'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home, ArrowLeft, Users, FileText, LayoutGrid, Mail, Settings, Satellite,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/layout/AdminLayout';

const QUICK_LINKS = [
  { title: 'Dashboard', subtitle: 'Go to home', href: '/dashboard', icon: Home, color: '#7c3aed', bg: '#f3e8ff' },
  { title: 'Leads', subtitle: 'Manage leads', href: '/dashboard/leads', icon: Users, color: '#10b981', bg: '#d1fae5' },
  { title: 'Pages', subtitle: 'Manage content', href: '/dashboard/pages', icon: FileText, color: '#3b82f6', bg: '#dbeafe' },
  { title: 'Services', subtitle: 'Manage services', href: '/dashboard/services', icon: LayoutGrid, color: '#f97316', bg: '#ffedd5' },
  { title: 'Blog', subtitle: 'Manage posts', href: '/dashboard/blog', icon: Mail, color: '#ec4899', bg: '#fce7f3' },
  { title: 'Settings', subtitle: 'System settings', href: '/dashboard/settings', icon: Settings, color: '#7c3aed', bg: '#ede9fe' },
];

const STARS = [
  { top: '10%', left: '8%', size: 2, delay: '0s' },
  { top: '20%', left: '22%', size: 3, delay: '0.4s' },
  { top: '14%', left: '40%', size: 2, delay: '1s' },
  { top: '8%', left: '58%', size: 2, delay: '0.7s' },
  { top: '26%', left: '74%', size: 3, delay: '1.3s' },
  { top: '46%', left: '12%', size: 2, delay: '0.2s' },
  { top: '55%', left: '32%', size: 2, delay: '1.6s' },
  { top: '62%', left: '52%', size: 3, delay: '0.9s' },
  { top: '40%', left: '88%', size: 2, delay: '0.5s' },
  { top: '72%', left: '66%', size: 2, delay: '1.1s' },
  { top: '80%', left: '18%', size: 3, delay: '0.3s' },
  { top: '86%', left: '46%', size: 2, delay: '1.4s' },
  { top: '90%', left: '80%', size: 2, delay: '0.8s' },
  { top: '6%', left: '90%', size: 2, delay: '1.8s' },
  { top: '35%', left: '4%', size: 2, delay: '1.2s' },
  { top: '65%', left: '92%', size: 2, delay: '0.6s' },
];

export default function NotFound() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: relX * 18, y: relY * 14 });
  };

  return (
    <AdminLayout>
      <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-5xl flex-col gap-4 overflow-hidden animate-in fade-in duration-500">
        {/* Space hero panel */}
        <div
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="relative min-h-[190px] flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#581c87] shadow-xl"
        >
          {/* Starfield */}
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute animate-twinkle rounded-full bg-white"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
            />
          ))}

          {/* Shooting star */}
          <div className="absolute right-16 top-10 h-px w-24 animate-shooting-star bg-gradient-to-r from-white to-transparent [animation-delay:1.5s]" />
          <div className="absolute right-24 top-24 h-px w-16 animate-shooting-star bg-gradient-to-r from-white to-transparent [animation-delay:4s]" />

          {/* Moon */}
          <div className="absolute right-6 top-6 h-14 w-14 animate-float rounded-full bg-gradient-to-br from-slate-200 to-slate-400 opacity-90 shadow-[0_0_24px_rgba(255,255,255,0.25)] sm:h-16 sm:w-16">
            <span className="absolute left-3 top-4 h-2 w-2 rounded-full bg-slate-400/60" />
            <span className="absolute left-8 top-2 h-1.5 w-1.5 rounded-full bg-slate-400/50" />
            <span className="absolute left-6 top-8 h-1 w-1 rounded-full bg-slate-400/50" />
          </div>

          {/* Fun status pill */}
          <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
            <Satellite className="h-3 w-3 animate-wiggle" /> Lost in space...
          </div>

          <div
            className="relative flex h-full items-center justify-center transition-transform duration-150 ease-out"
            style={{ transform: `translate(${tilt.x}px, ${tilt.y}px)` }}
          >
            {/* Orbiting dashed ring behind the astronaut */}
            <div className="pointer-events-none absolute h-[80%] w-[36%] animate-[spin_18s_linear_infinite] rounded-full border-2 border-dashed border-white/25" />

            {/* Floating browser card, top-left */}
            <div className="pointer-events-none absolute left-4 top-4 hidden w-20 -rotate-6 animate-float rounded-lg border border-white/15 bg-white/10 p-1.5 shadow-sm backdrop-blur-sm md:block lg:left-12">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              </div>
              <div className="mt-1.5 h-1.5 w-3/4 rounded bg-white/30" />
              <div className="mt-1 h-4 w-full rounded bg-white/15" />
            </div>

            {/* Floating question bubble */}
            <div className="pointer-events-none absolute right-8 top-6 flex h-9 w-9 animate-bounce items-center justify-center rounded-full rounded-bl-none bg-white text-base font-bold text-violet-600 shadow-md md:right-20">
              ?
            </div>

            {/* Floating document cards, right side */}
            <div className="pointer-events-none absolute right-2 top-16 hidden w-14 rotate-6 animate-float rounded-md border border-white/15 bg-white/10 p-1.5 shadow-sm backdrop-blur-sm [animation-delay:-1.2s] md:block lg:right-10">
              <div className="h-1.5 w-full rounded bg-white/30" />
              <div className="mt-1 h-1.5 w-2/3 rounded bg-white/15" />
            </div>
            <div className="pointer-events-none absolute bottom-6 right-8 hidden w-14 rotate-3 animate-float rounded-md border border-white/15 bg-white/10 p-1.5 shadow-sm backdrop-blur-sm [animation-delay:-2s] md:block lg:right-24">
              <div className="h-1.5 w-full rounded bg-white/30" />
              <div className="mt-1 h-1.5 w-1/2 rounded bg-white/15" />
            </div>

            {/* 4 [astronaut] 4 */}
            <div className="relative flex items-center justify-center gap-1 sm:gap-2">
              <span className="text-[9vh] font-black leading-none text-white drop-shadow-[0_0_20px_rgba(167,139,250,0.55)]">4</span>
              <span className="relative animate-float text-[11vh] leading-none drop-shadow-xl" style={{ animationDelay: '-1.5s' }}>
                🧑‍🚀
              </span>
              <span className="text-[9vh] font-black leading-none text-white drop-shadow-[0_0_20px_rgba(167,139,250,0.55)]">4</span>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="shrink-0 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Oops! Page Not Found</h1>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            <br className="hidden sm:block" /> Let&apos;s get you back on track.
          </p>

          <div className="mt-3 flex flex-col-reverse items-center justify-center gap-2.5 sm:flex-row">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="h-9 w-full gap-1.5 border-violet-200 text-sm text-violet-600 transition-all hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md sm:w-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Previous Page
            </Button>
            <Button
              render={<Link href="/dashboard" />}
              className="h-9 w-full gap-1.5 bg-violet-600 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200 sm:w-auto"
            >
              <Home className="h-3.5 w-3.5" /> Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Quick links */}
        <div className="shrink-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          <h2 className="text-sm font-semibold text-slate-800">Or, explore these sections</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 px-2 py-3 text-center transition-all hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: link.bg, color: link.color }}
                >
                  <link.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-slate-800">{link.title}</span>
                <span className="hidden text-[11px] text-slate-400 sm:block">{link.subtitle}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
