'use client';

import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/ui/FormDialog';
import { AppFormField } from '@/components/ui/AppFormField';
import { StatCard, PRIMARY_BUTTON_CLASS } from '@/components/admin/ModulePage';
import { Image as ImageIcon, FileText, Upload, Trash2, HardDrive, Files } from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document';
  size: string;
  altText: string;
  uploadedAt: string;
}

const INITIAL: MediaItem[] = [
  { id: '1', name: 'hero-banner.webp', type: 'image', size: '182 KB', altText: 'TheWebHero homepage hero banner', uploadedAt: '20 Sep' },
  { id: '2', name: 'team-photo.webp', type: 'image', size: '210 KB', altText: 'TheWebHero team photo', uploadedAt: '18 Sep' },
  { id: '3', name: 'case-study-healthtrack.webp', type: 'image', size: '156 KB', altText: 'HealthTrack portal case study cover', uploadedAt: '15 Sep' },
  { id: '4', name: 'company-brochure.pdf', type: 'document', size: '1.1 MB', altText: '', uploadedAt: '10 Sep' },
  { id: '5', name: 'og-default.webp', type: 'image', size: '98 KB', altText: 'Default social share image', uploadedAt: '5 Sep' },
];

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>(INITIAL);
  const nextId = useRef(INITIAL.length + 1);

  function handleUpload(e: React.FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? 'untitled-file');
    const altText = String(data.get('altText') ?? '');
    setItems((prev) => [
      { id: `new-${nextId.current++}`, name, type: name.match(/\.(png|jpe?g|webp|svg|gif)$/i) ? 'image' : 'document', size: '—', altText, uploadedAt: 'Just now' },
      ...prev,
    ]);
    close();
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const totalSizeCount = items.length;
  const imageCount = items.filter((i) => i.type === 'image').length;
  const docCount = items.filter((i) => i.type === 'document').length;

  return (
    <div className="animate-in fade-in max-w-[1600px] mx-auto space-y-5 pb-8 duration-500">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Media Library</h1>
          <p className="mt-1 text-sm text-slate-500">Images and documents used across the website. Optimize and add alt text for SEO.</p>
        </div>
        <FormDialog triggerLabel="Upload File" title="Upload File" description="Add a new image or document to the media library." triggerClassName={PRIMARY_BUTTON_CLASS}>
          {(close) => (
            <form className="space-y-4 pt-2" onSubmit={(e) => handleUpload(e, close)}>
              <AppFormField name="name" label="File Name" placeholder="e.g. hero-banner.webp" required />
              <AppFormField name="altText" label="Alt Text (SEO)" placeholder="Describe the image for accessibility & SEO" />
              <Button type="submit" className={`w-full ${PRIMARY_BUTTON_CLASS}`}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </form>
          )}
        </FormDialog>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard title="Total Files" value={totalSizeCount} icon={Files} color="#7c3aed" />
        <StatCard title="Images" value={imageCount} icon={ImageIcon} color="#3b82f6" />
        <StatCard title="Documents" value={docCount} icon={FileText} color="#d97706" />
        <StatCard title="Missing Alt Text" value={items.filter((i) => i.type === 'image' && !i.altText).length} icon={HardDrive} color="#dc2626" />
      </div>

      {items.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-100 bg-white text-sm text-slate-400 shadow-sm">
          No files uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card key={item.id} size="sm" className="group relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm ring-0">
              <div className="flex h-24 items-center justify-center bg-slate-50 text-slate-300">
                {item.type === 'image' ? <ImageIcon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
              </div>
              <CardContent className="space-y-0.5 p-3">
                <p className="truncate text-[13px] font-medium text-slate-700" title={item.name}>{item.name}</p>
                <p className="text-[11px] text-slate-400">{item.size} · {item.uploadedAt}</p>
                {item.type === 'image' && !item.altText && (
                  <p className="text-[10px] font-medium text-red-500">Missing alt text</p>
                )}
              </CardContent>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1.5 right-1.5 h-6 w-6 bg-white/90 text-red-500 opacity-0 shadow-sm transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
