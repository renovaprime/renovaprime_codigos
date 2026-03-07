import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { fetchAllCms } from '../services/cmsService';

type CmsGetter = (key: string, fallback: string) => string;

const CmsContext = createContext<CmsGetter>((_, fallback) => fallback);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllCms().then(setEntries);
  }, []);

  const cms: CmsGetter = useCallback(
    (key, fallback) => entries[key] ?? fallback,
    [entries],
  );

  return <CmsContext.Provider value={cms}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsGetter {
  return useContext(CmsContext);
}
