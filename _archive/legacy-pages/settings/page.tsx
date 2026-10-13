'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppFormField, AppFormTextarea, AppFormRichText } from '@/components/ui/AppFormField';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PRIMARY_BUTTON_CLASS } from '@/components/admin/ModulePage';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [indexable, setIndexable] = useState(true);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success('Settings saved.');
  }

  return (
    <div className="animate-in fade-in max-w-[900px] mx-auto space-y-5 pb-8 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">General site, SEO defaults and system settings.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSave}>
        <Card className="rounded-2xl border border-slate-100 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">General</CardTitle>
            <CardDescription>Basic site identity used across the website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AppFormField name="siteName" label="Site Name" defaultValue="TheWebHero" required />
            <AppFormField name="siteUrl" label="Site URL" type="url" defaultValue="https://thewebhero.com" required />
            <AppFormField name="contactEmail" label="Contact Email" type="email" defaultValue="kumarrohitji89@gmail.com" />
            <AppFormField name="contactPhone" label="Contact Phone" defaultValue="+91 90000 00000" />
            <AppFormTextarea name="address" label="Office Address" rows={3} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">SEO Defaults</CardTitle>
            <CardDescription>Fallback SEO used when a page has no custom meta data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AppFormField name="defaultMetaTitle" label="Default Meta Title" defaultValue="TheWebHero — Web Design & Development Agency" />
            <AppFormRichText name="defaultMetaDescription" label="Default Meta Description" defaultValue="We build fast, dynamic, SEO-first websites that convert." />
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div>
                <Label>Search Engine Indexing</Label>
                <p className="text-[12px] text-slate-500">Allow search engines to index the site.</p>
              </div>
              <Switch checked={indexable} onChange={(e) => setIndexable(e.target.checked)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 shadow-sm ring-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">System</CardTitle>
            <CardDescription>Controls that affect the live website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-[12px] text-slate-500">Show a maintenance page to visitors instead of the site.</p>
              </div>
              <Switch checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className={`w-full sm:w-auto ${PRIMARY_BUTTON_CLASS}`}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}
