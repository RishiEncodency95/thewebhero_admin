'use client';

import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Plus } from 'lucide-react';

interface FormDialogProps {
  triggerLabel: string;
  title: string;
  description?: string;
  // Overrides the default "+ triggerLabel" button (e.g. a per-row icon-only
  // Edit button) — triggerLabel is still used for accessibility/title context.
  triggerElement?: ReactNode;
  // Extra classes for the default trigger button (ignored when triggerElement is set).
  triggerClassName?: string;
  // Render-prop so the form inside can call close() itself on a successful
  // mutation, without FormDialog needing to know anything about the mutation.
  children: (close: () => void) => ReactNode;
}

// Shared "Add X" popup modal shell — every create/edit flow across the admin
// panel uses this instead of each page reimplementing its own dialog chrome.
export function FormDialog({ triggerLabel, title, description, triggerElement, triggerClassName, children }: FormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {triggerElement ? (
        <span onClick={() => setOpen(true)}>{triggerElement}</span>
      ) : (
        <Button onClick={() => setOpen(true)} className={triggerClassName}>
          <Plus className="h-4 w-4 mr-2" />
          {triggerLabel}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children(() => setOpen(false))}
        </DialogContent>
      </Dialog>
    </>
  );
}
