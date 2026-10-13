'use client';

import { use } from 'react';
import { SingletonScreen } from '@/components/cms/SingletonScreen';

export default function SitePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  return <SingletonScreen key={resource} resource={resource} />;
}
