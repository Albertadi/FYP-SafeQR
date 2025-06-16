// hooks/useColorScheme.ts
import { useColorScheme as useRNColorScheme } from 'react-native';

// Force the return type to only 'light' or 'dark'
export function useColorScheme(): 'light' | 'dark' {
  // RN hook may be null on some platforms; default to 'light'
  return (useRNColorScheme() ?? 'light') as 'light' | 'dark';
}
