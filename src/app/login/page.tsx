'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginSchema, LoginFormValues } from '@/lib/validation/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ApiRequestError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      // Only follow same-site paths from ?next= to avoid open redirects.
      const next = searchParams.get('next');
      router.replace(next && next.startsWith('/dashboard') ? next : '/dashboard');
    } catch (err) {
      setErrorMessage(err instanceof ApiRequestError ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Brand panel - same palette as the admin sidebar */}
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#0f0b24_0%,#160f36_50%,#0b1020_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/20 blur-[120px]" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
            <Image src="/logo-icon.png" alt="" width={64} height={64} className="h-8 w-8 object-contain" priority />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold">TheWebHero</span>
            <span className="block text-xs font-medium text-violet-300/80">Admin console</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Run your website from <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">one place</span>.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">Content, SEO and every enquiry from thewebhero.in — updated live on the site the moment you save.</p>
          <ul className="mt-8 space-y-3 text-[14px] text-slate-200">
            {['Edit every page, service and blog post', 'SEO scores with AI-written meta tags', 'Quote, contact and support leads in real time'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Check className="h-3.5 w-3.5 text-violet-200" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} TheWebHero · Ghaziabad, India</p>
      </aside>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="mb-8 lg:hidden">
            <Image src="/logo-full.png" alt="TheWebHero" width={2172} height={724} priority className="h-11 w-auto object-contain" />
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-[14.5px] text-slate-500">Sign in to the admin console to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className={errors.email ? 'text-destructive' : 'text-slate-700'}>
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="e.g. admin@thewebhero.com"
                  className={`h-11 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-400/20 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-[0.8rem] font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={errors.password ? 'text-destructive' : 'text-slate-700'}>
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm font-medium text-violet-600 hover:underline underline-offset-4">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-400/20 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[0.8rem] font-medium text-red-500">{errors.password.message}</p>}
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-[15px] font-semibold text-white shadow-lg shadow-violet-500/25 transition-opacity hover:opacity-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <p className="text-xs leading-relaxed">Secure, role-based access. Your session stays signed in on this device.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
