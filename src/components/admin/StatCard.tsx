import React from 'react';

export interface ModuleStat {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function StatCard({ title, value, icon: Icon, color }: ModuleStat) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-slate-500">{title}</p>
        <p className="mt-0.5 text-2xl leading-none font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
