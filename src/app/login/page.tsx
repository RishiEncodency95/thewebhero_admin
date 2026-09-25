'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginSchema, LoginFormValues } from '@/lib/validation/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Wire this up to your own auth API — this is just the UI/validation flow.
  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      console.log('login submit', { ...values, rememberMe });
      router.push('/dashboard');
    } catch {
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-6">
      {/* Soft brand-colored glows on a white backdrop */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-violet-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-pink-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-orange-400/15 blur-[110px]" />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-3 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-xl duration-500">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-full.png" alt="Logo" width={2172} height={724} priority className="h-12 w-auto object-contain" />
        </div>

        <div className="mb-8 space-y-1.5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to your admin console to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className={errors.identifier ? 'text-destructive' : 'text-slate-700'}>
              Email or Mobile
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="identifier"
                autoFocus
                placeholder="e.g. admin@example.com"
                className={`h-11 border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-400/20 ${errors.identifier ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                {...register('identifier')}
              />
            </div>
            {errors.identifier && <p className="text-[0.8rem] font-medium text-red-500">{errors.identifier.message}</p>}
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
                placeholder="••••••••"
                className={`h-11 border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-400/20 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded accent-violet-600"
            />
            Remember me
          </label>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full gap-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 text-base font-semibold text-white hover:opacity-90 transition-opacity"
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

        <div className="mt-6 flex items-start gap-2.5 border-t border-slate-200 pt-6 text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <p className="text-xs leading-relaxed">
            Secure, role-based access to your dashboard. Wire this form up to your own auth API.
          </p>
        </div>
      </div>
    </main>
  );
}
