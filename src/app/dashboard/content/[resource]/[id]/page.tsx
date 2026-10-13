'use client';

import { use } from 'react';
import { ContentEditorScreen } from '@/components/cms/ContentEditorScreen';

export default function ContentEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { resource, id } = use(params);
  const { tab } = use(searchParams);
  return <ContentEditorScreen key={`${resource}/${id}`} resource={resource} id={id} initialTab={tab} />;
}
