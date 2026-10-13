'use client';

import { useEffect, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { ContentTypeDef } from '@/lib/cms';

// Definitions only change on a backend deploy, so one fetch per session is enough.
const cache = new Map<string, Promise<ContentTypeDef>>();

export function loadContentType(resource: string): Promise<ContentTypeDef> {
  let p = cache.get(resource);
  if (!p) {
    p = api<ContentTypeDef>(`/content-types/${resource}`);
    p.catch(() => cache.delete(resource));
    cache.set(resource, p);
  }
  return p;
}

/** The form/table definition of a CMS content type. */
export function useContentType(resource: string) {
  const [state, setState] = useState<{ resource: string; def: ContentTypeDef | null; error: string | null }>({ resource, def: null, error: null });

  useEffect(() => {
    let alive = true;
    loadContentType(resource)
      .then((def) => alive && setState({ resource, def, error: null }))
      .catch((err) => alive && setState({ resource, def: null, error: err instanceof ApiRequestError ? err.message : 'Could not load this section' }));
    return () => {
      alive = false;
    };
  }, [resource]);

  // Ignore a stale result while switching between resources.
  return state.resource === resource ? { def: state.def, error: state.error } : { def: null, error: null };
}
