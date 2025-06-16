// app/(tabs)/scan-history.tsx

import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { getScanHistory, QRScan } from '@/utils/api';

export default function ScanHistoryScreen() {
  const [history, setHistory] = useState<QRScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error || !session?.user?.id) {
        console.warn('User not logged in');
        return;
      }

      try {
        const result = await getScanHistory(session.user.id);
        setHistory(result);
      } catch (err) {
        console.error('Failed to load scan history:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <FlatList
        data={history}
        keyExtractor={(item) => item.scan_id}
        ListEmptyComponent={<Text>No scan history available.</Text>}
        renderItem={({ item }) => (
          <View className="mb-4 p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm">
            <Text className="font-semibold text-blue-700" numberOfLines={1}>
              {item.decoded_content}
            </Text>
            <Text className="text-xs mt-1 text-gray-600">
              Status:{' '}
              <Text
                className={
                  item.security_status.toLowerCase() === 'safe'
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {item.security_status}
              </Text>
            </Text>
            <Text className="text-xs text-gray-500">
              Scanned: {new Date(item.scanned_at).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// No additional code is needed here to run this screen in Expo Go.
// Make sure your project is set up with Expo and your navigation includes this screen.