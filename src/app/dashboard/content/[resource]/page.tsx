'use client';

import { use } from 'react';
import { ContentListScreen } from '@/components/cms/ContentListScreen';

export default function ContentListPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  return <ContentListScreen key={resource} resource={resource} />;
}
