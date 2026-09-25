'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppFormField, AppFormTextarea } from '@/components/ui/AppFormField';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog } from '@/components/ui/FormDialog';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/ModulePage';
import { Save, GripVertical, ArrowUp, ArrowDown, Trash2, Plus, Pencil } from 'lucide-react';

// A section is either:
// - 'hero'    → its content lives in the Hero Section card above; here it's
//               just a visibility toggle.
// - 'listing' → pulls items from another module (Services, Portfolio,
//               Testimonials, Technologies, Blog). You choose the section's
//               own heading/subheading and how many items to auto-show, or
//               hand-pick specific ones by slug to override the automatic list.
// - 'cta'     → a standalone banner with its own heading/subheading/button.
interface Section {
  id: string;
  name: string;
  kind: 'hero' | 'listing' | 'cta';
  visible: boolean;
  heading?: string;
  subheading?: string;
  itemCount?: number;
  itemSlugs?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

const INITIAL_SECTIONS: Section[] = [
  { id: '1', name: 'Hero Banner', kind: 'hero', visible: true },
  {
    id: '2', name: 'Services Overview', kind: 'listing', visible: true,
    heading: 'What We Do', subheading: 'Explore our core services.', itemCount: 6, itemSlugs: '',
  },
  {
    id: '3', name: 'Featured Portfolio', kind: 'listing', visible: true,
    heading: 'Our Work', subheading: 'Recent projects and case studies.', itemCount: 6, itemSlugs: '',
  },
  {
    id: '4', name: 'Testimonials', kind: 'listing', visible: true,
    heading: 'What Clients Say', subheading: '', itemCount: 4, itemSlugs: '',
  },
  {
    id: '5', name: 'Technology Stack', kind: 'listing', visible: true,
    heading: 'Technologies We Use', subheading: '', itemCount: 8, itemSlugs: '',
  },
  {
    id: '6', name: 'Blog Highlights', kind: 'listing', visible: false,
    heading: 'Latest from the Blog', subheading: '', itemCount: 3, itemSlugs: '',
  },
  {
    id: '7', name: 'Call To Action', kind: 'cta', visible: true,
    heading: 'Ready to start your project?', subheading: "Let's build something fast, dynamic and SEO-ready.",
    ctaLabel: 'Get a Quote', ctaLink: '/get-a-quote',
  },
];

const KIND_LABEL: Record<Section['kind'], string> = {
  hero: 'Hero',
  listing: 'Content listing',
  cta: 'Call to action',
};

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
    setSections((prev) => [...prev, { id: `new-${nextId.current++}`, name, kind: 'listing', visible: true, heading: name, itemCount: 6, itemSlugs: '' }]);
    setNewSectionName('');
  }

  function handleSectionDataSave(e: React.FormEvent<HTMLFormElement>, section: Section, close: () => void) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSections((prev) => prev.map((s) => (s.id === section.id ? {
      ...s,
      heading: String(data.get('heading') ?? s.heading ?? ''),
      subheading: String(data.get('subheading') ?? s.subheading ?? ''),
      itemCount: data.get('itemCount') ? Number(data.get('itemCount')) : s.itemCount,
      itemSlugs: data.has('itemSlugs') ? String(data.get('itemSlugs') ?? '') : s.itemSlugs,
      ctaLabel: data.has('ctaLabel') ? String(data.get('ctaLabel') ?? '') : s.ctaLabel,
      ctaLink: data.has('ctaLink') ? String(data.get('ctaLink') ?? '') : s.ctaLink,
    } : s)));
    toast.success(`${section.name} content updated.`);
    close();
  }

  return (
    <div className="animate-in fade-in max-w-[900px] mx-auto space-y-5 pb-8 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Home Page</h1>
        <p className="mt-1 text-sm text-slate-500">Edit the hero content and add data to each homepage section.</p>
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
            <CardDescription>
              Reorder, hide, or click <Pencil className="inline h-3 w-3 -mt-0.5" /> to add each section&apos;s own heading, copy and which items it shows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section, index) => (
              <div key={section.id} className="rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-slate-700">{section.name}</span>
                    <span className="block text-[11px] text-slate-400">
                      {KIND_LABEL[section.kind]}
                      {section.kind === 'listing' && section.itemCount ? ` · showing ${section.itemCount} items` : ''}
                    </span>
                  </div>
                  <Label className="flex items-center gap-2 text-[12px] text-slate-500">
                    Visible
                    <Switch checked={section.visible} onChange={() => toggleSection(section.id)} />
                  </Label>

                  {section.kind !== 'hero' && (
                    <FormDialog
                      triggerLabel="Edit"
                      title={`Edit: ${section.name}`}
                      description={
                        section.kind === 'listing'
                          ? 'Set this section’s heading and how many items to pull in automatically, or hand-pick specific ones.'
                          : 'Set this section’s heading, copy and button.'
                      }
                      triggerElement={
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:bg-violet-50 hover:text-violet-700">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                    >
                      {(close) => (
                        <form className="space-y-4 pt-2" onSubmit={(e) => handleSectionDataSave(e, section, close)}>
                          <AppFormField name="heading" label="Section Heading" defaultValue={section.heading} required />
                          <AppFormTextarea name="subheading" label="Section Subheading" rows={2} defaultValue={section.subheading} />
                          {section.kind === 'listing' && (
                            <>
                              <AppFormField name="itemCount" label="Number of Items to Show" type="number" min={1} max={12} defaultValue={String(section.itemCount ?? 6)} />
                              <AppFormField
                                name="itemSlugs"
                                label="Or Hand-pick by Slug (optional, comma-separated)"
                                placeholder="e.g. web-development, seo, ui-ux-design"
                                defaultValue={section.itemSlugs}
                              />
                            </>
                          )}
                          {section.kind === 'cta' && (
                            <div className="grid grid-cols-2 gap-4">
                              <AppFormField name="ctaLabel" label="Button Label" defaultValue={section.ctaLabel} />
                              <AppFormField name="ctaLink" label="Button Link" defaultValue={section.ctaLink} />
                            </div>
                          )}
                          <Button type="submit" className={`w-full ${PRIMARY_BUTTON_CLASS}`}>Save Section</Button>
                        </form>
                      )}
                    </FormDialog>
                  )}

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
