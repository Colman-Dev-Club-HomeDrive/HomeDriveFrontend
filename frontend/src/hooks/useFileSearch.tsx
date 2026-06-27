import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type FileSearchContextValue = {
  query: string;
  submitSearch: (term: string) => void;
};

const FileSearchContext = createContext<FileSearchContextValue | null>(null);

export function FileSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');

  const submitSearch = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const value = useMemo(() => ({ query, submitSearch }), [query, submitSearch]);

  return <FileSearchContext.Provider value={value}>{children}</FileSearchContext.Provider>;
}

export function useFileSearch() {
  const context = useContext(FileSearchContext);
  if (!context) {
    throw new Error('useFileSearch must be used within a FileSearchProvider');
  }
  return context;
}
