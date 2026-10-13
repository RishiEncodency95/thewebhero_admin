'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** The one confirmation modal used across the admin. */
export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', destructive, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !loading && onCancel()}>
      <DialogContent className="max-w-lg" showCloseButton={false}>
        <div className="flex gap-4 p-2">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${destructive ? 'bg-red-50 text-red-600' : 'bg-violet-50 text-violet-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div className="min-w-0 pt-1">
            <DialogTitle className="text-[18px] font-bold text-slate-900">{title}</DialogTitle>
            {description && <DialogDescription className="mt-2 text-[14px] leading-relaxed text-slate-500">{description}</DialogDescription>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Button variant="outline" className="h-10 rounded-xl px-5" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className={`h-10 rounded-xl px-5 text-white ${destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
