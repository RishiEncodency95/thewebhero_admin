'use client';

import { use } from 'react';
import { SingletonScreen } from '@/components/cms/SingletonScreen';

export default function SitePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  // Contact details live on their own screen (Site & SEO → Contact & Social).
  return <SingletonScreen key={resource} resource={resource} hideGroups={resource === 'settings' ? ['Contact', 'Notifications'] : []} />;
}
