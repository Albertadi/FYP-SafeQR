// hooks/useColorScheme.web.ts
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Same signature: always return 'light' | 'dark'
export function useColorScheme(): 'light' | 'dark' {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // on web, RN hook may also return null before hydration
  const scheme = useRNColorScheme() ?? 'light';
  return hydrated ? (scheme as 'light' | 'dark') : 'light';
}
