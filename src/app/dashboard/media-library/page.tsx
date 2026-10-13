'use client';

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Copy, ExternalLink, FileText, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/buttons';
import { cardClass, EmptyState, ErrorBlock, errorMessage, formatDate, LoadingBlock, Pagination, SearchBox, Segmented, useDebounced, usePaginated } from '@/components/admin/kit';
import { api, apiUpload } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface MediaItem {
  _id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  folder?: string;
  createdAt: string;
}

type Kind = 'all' | 'image' | 'application/pdf';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf';

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

export default function MediaLibraryPage() {
  const { can } = useAuth();
  const [kind, setKind] = useState<Kind>('all');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounced(searchInput.trim());
  const [page, setPage] = useState(1);
  const { data, error, reload } = usePaginated<MediaItem>('/media', { page, limit: 24, search, mimeType: kind === 'all' ? undefined : kind });
  const [uploading, setUploading] = useState(0);
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files];
    setUploading(list.length);
    let ok = 0;
    for (const file of list) {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'library');
      try {
        await apiUpload('/media', form);
        ok++;
      } catch (err) {
        toast.error(`${file.name}: ${errorMessage(err, 'upload failed')}`);
      }
      setUploading((n) => n - 1);
    }
    if (ok) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded`);
    if (fileRef.current) fileRef.current.value = '';
    setPage(1);
    reload();
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied');
    } catch {
      toast.error('Could not copy — select the URL manually');
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/media/${toDelete._id}`, { method: 'DELETE' });
      toast.success('File deleted');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onDragOver={(e) => can('media', 'create') && e.preventDefault()}
      onDrop={(e) => {
        if (!can('media', 'create')) return;
        e.preventDefault();
        uploadFiles(e.dataTransfer.files);
      }}
    >
      <PageHeader
        title="Media library"
        description="Images and PDFs used on the website. Drop files anywhere on this page to upload."
        actions={
          can('media', 'create') && (
            <>
              <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => uploadFiles(e.target.files)} />
              <Button className={`h-10 rounded-xl px-4 ${PRIMARY_BUTTON_CLASS}`} disabled={uploading > 0} onClick={() => fileRef.current?.click()}>
                {uploading > 0 ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                {uploading > 0 ? `Uploading ${uploading}…` : 'Upload files'}
              </Button>
            </>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Kind>
          value={kind}
          onChange={(v) => { setKind(v); setPage(1); }}
          options={[{ value: 'all', label: 'All files' }, { value: 'image', label: 'Images' }, { value: 'application/pdf', label: 'PDFs' }]}
        />
        <SearchBox value={searchInput} onChange={(v) => { setSearchInput(v); setPage(1); }} placeholder="Search file name…" />
      </div>

      {error ? (
        <ErrorBlock message={error} />
      ) : !data ? (
        <LoadingBlock className="h-80" />
      ) : data.items.length === 0 ? (
        <EmptyState icon={ImageIcon} message={search || kind !== 'all' ? 'No files match these filters.' : 'No files yet — upload your first image.'} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {data.items.map((m) => {
            const isImage = m.mimeType.startsWith('image/');
            return (
              <figure key={m._id} className={`group overflow-hidden ${cardClass}`}>
                <div className="relative aspect-[4/3] bg-[conic-gradient(#f1f5f9_25%,#fff_0_50%,#f1f5f9_0_75%,#fff_0)] bg-[length:16px_16px]">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.originalName} loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" title="Copy URL" onClick={() => copy(m.url)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 hover:text-violet-700">
                      <Copy className="h-4 w-4" />
                    </button>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" title="Open" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 hover:text-violet-700">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {can('media', 'delete') && (
                      <button type="button" title="Delete" onClick={() => setToDelete(m)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <figcaption className="border-t border-slate-100 px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium text-slate-800" title={m.originalName}>{m.originalName}</p>
                  <p className="text-[11.5px] text-slate-400">{formatSize(m.size)} · {formatDate(m.createdAt)}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this file?"
        description={`“${toDelete?.originalName ?? ''}” will be removed from storage. Any page still using its URL will show a broken image.`}
        confirmLabel="Delete file"
        destructive
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
