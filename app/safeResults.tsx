import ResultTemplate from '@/components/Results';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SafeResultsScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams();

  return (
    <ResultTemplate
      status="safe"
      url={url as string}
      onBack={() => router.replace('/')}
      
    />
  );
}
