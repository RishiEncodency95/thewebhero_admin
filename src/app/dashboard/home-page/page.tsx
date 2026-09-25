'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppFormField, AppFormTextarea } from '@/components/ui/AppFormField';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/ModulePage';
import { Save, GripVertical, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  visible: boolean;
}

const INITIAL_SECTIONS: Section[] = [
  { id: '1', name: 'Hero Banner', visible: true },
  { id: '2', name: 'Services Overview', visible: true },
  { id: '3', name: 'Featured Portfolio', visible: true },
  { id: '4', name: 'Testimonials', visible: true },
  { id: '5', name: 'Technology Stack', visible: true },
  { id: '6', name: 'Blog Highlights', visible: false },
  { id: '7', name: 'Call To Action', visible: true },
];

export default function HomePageEditor() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [newSectionName, setNewSectionName] = useState('');
  const nextId = useRef(INITIAL_SECTIONS.length + 1);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success('Home page content saved.');
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleSection(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function addSection() {
    const name = newSectionName.trim();
    if (!name) return;
    setSections((prev) => [...prev, { id: `new-${nextId.current++}`, name, visible: true }]);
    setNewSectionName('');
  }

  return (
    <div className="animate-in fade-in max-w-[900px] mx-auto space-y-5 pb-8 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Home Page</h1>
        <p className="mt-1 text-sm text-slate-500">Edit the hero content and reorder/toggle homepage sections.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSave}>
        <Card className="rounded-2xl border border-slate-100 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Hero Section</CardTitle>
            <CardDescription>The first thing visitors see on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AppFormField name="heroHeading" label="Hero Heading" defaultValue="We Build Websites That Perform" required />
            <AppFormTextarea name="heroSubheading" label="Hero Subheading" rows={2} defaultValue="Fast, dynamic and 100% SEO-ready websites for growing businesses." />
            <div className="grid grid-cols-2 gap-4">
              <AppFormField name="heroCtaLabel" label="CTA Button Label" defaultValue="Get a Quote" />
              <AppFormField name="heroCtaLink" label="CTA Button Link" defaultValue="/get-a-quote" />
            </div>
            <AppFormField name="heroImageAlt" label="Hero Image Alt Text (SEO)" placeholder="Describe the hero image" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Page Sections</CardTitle>
            <CardDescription>Reorder or hide sections shown on the homepage below the hero.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2.5">
                <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                <span className="flex-1 text-[13px] font-medium text-slate-700">{section.name}</span>
                <Label className="flex items-center gap-2 text-[12px] text-slate-500">
                  Visible
                  <Switch checked={section.visible} onChange={() => toggleSection(section.id)} />
                </Label>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={index === 0} onClick={() => moveSection(index, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={index === sections.length - 1} onClick={() => moveSection(index, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeSection(section.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {sections.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">No sections yet.</p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <Input placeholder="New section name" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} className="max-w-xs" />
              <Button type="button" variant="outline" className="rounded-lg" onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className={`w-full sm:w-auto ${PRIMARY_BUTTON_CLASS}`}>
          <Save className="h-4 w-4 mr-2" />
          Save Home Page
        </Button>
      </form>
    </div>
  );
}
