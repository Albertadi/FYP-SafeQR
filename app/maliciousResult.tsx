// app/maliciousResults.tsx
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function MaliciousResults() {
  const { url } = useLocalSearchParams();
  return (
    <View>
      <Text>⚠️ Malicious or Suspicious Link</Text>
      <Text>{url}</Text>
    </View>
    
  );
}

