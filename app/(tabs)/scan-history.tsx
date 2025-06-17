// app/(tabs)/scan-history.tsx
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getScanHistory, QRScan } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type SectionData = { title: string; data: QRScan[] };

export default function ScanHistoryScreen() {
  const insets = useSafeAreaInsets();
  const rawScheme = useColorScheme();
  const scheme    = rawScheme || 'light';
  const { background, text, tint, tabIconDefault } = Colors[scheme];

  const [history, setHistory] = useState<QRScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!session?.user?.id || sessionError) {
        setLoading(false);
        return;
      }
      try {
        const result = await getScanHistory(session.user.id);
        setHistory(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let arr = history.filter(item =>
      item.decoded_content.toLowerCase().includes(query.toLowerCase())
    );
    return arr.sort((a, b) =>
      sortAsc
        ? new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()
        : new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()
    );
  }, [history, query, sortAsc]);

  const sections: SectionData[] = useMemo(() => {
    const groups: Record<string, QRScan[]> = {};
    filtered.forEach(item => {
      const d = new Date(item.scanned_at).toLocaleDateString();
      (groups[d] = groups[d] || []).push(item);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: text }]}>History</Text>
      </View>

      {/* Search + Sort */}
      <View style={styles.controls}>
        <View style={[styles.searchBox, { borderColor: tint }]}>
          <IconSymbol name="magnifyingglass" size={20} color={tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: text }]}
            placeholder="Search"
            placeholderTextColor={tabIconDefault}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={18} color={tabIconDefault} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortAsc(s => !s)}>
          <Text style={{ color: tint, marginRight: 4 }}>Sort by date</Text>
          <IconSymbol name={sortAsc ? 'chevron.up' : 'chevron.down'} size={18} color={tint} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.scan_id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: text }]}>No scan history available.</Text>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: text }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: background, borderColor: tint }]}
            onPress={() => {}}
          >
            <IconSymbol name="link" size={24} color={tint} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.urlText, { color: text }]} numberOfLines={1}>
                {item.decoded_content}
              </Text>
              <Text style={styles.statusLine}>
                Status:{' '}
                <Text style={{ color: item.security_status.toLowerCase() === 'safe' ? 'green' : 'red' }}>
                  {item.security_status}
                </Text>
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={tabIconDefault} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  searchInput: { flex: 1, marginHorizontal: 6, height: 32 },

  sortButton: { flexDirection: 'row', alignItems: 'center' },

  sectionHeader: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 8,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  urlText: { fontSize: 16, fontWeight: '500' },
  statusLine: { fontSize: 12, marginTop: 4 },

  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
});
