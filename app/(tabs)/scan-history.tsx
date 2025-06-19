"use client"

import ScanDetailsModal from "@/components/ScanDetailsModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { getScanHistory, type QRScan } from "@/utils/api"
import { supabase } from "@/utils/supabase"
import { router } from "expo-router"
import React, { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function ScanHistoryScreen() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [session, setSession] = useState<any>(null)
  const [history, setHistory] = useState<QRScan[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sortAsc, setSortAsc] = useState(false)

  const [selectedScan, setSelectedScan] = useState<QRScan | null>(null)
  const [showScanDetails, setShowScanDetails] = useState(false)

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      setSession(session)

      if (!session?.user?.id || sessionError) {
        setLoading(false)
        return
      }

      // If logged in, fetch scan history
      try {
        const result = await getScanHistory(session.user.id)
        setHistory(result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.id) {
        // Refetch history when user logs in
        getScanHistory(session.user.id).then(setHistory).catch(console.error)
      } else {
        // Clear history when user logs out
        setHistory([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const filtered = useMemo(() => {
    const arr = history.filter((item) => item.decoded_content.toLowerCase().includes(query.toLowerCase()))
    return arr.sort((a, b) =>
      sortAsc
        ? new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()
        : new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime(),
    )
  }, [history, query, sortAsc])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  const handleScanPress = (scan: QRScan) => {
    setSelectedScan(scan)
    setShowScanDetails(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    )
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.screenBackground, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Login Required Message */}
        <View style={styles.loginPromptContainer}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={64} color={colors.secondaryText} />
          <Text style={[styles.loginPromptTitle, { color: colors.text }]}>Login Required</Text>
          <Text style={[styles.loginPromptMessage, { color: colors.secondaryText }]}>
            You need to be logged in to view your scan history.
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.tint }]}
            onPress={() => {
              router.push("/(tabs)/register")
            }}
          >
            <Text style={[styles.loginButtonText, { color: colors.background }]}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <>
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.screenBackground, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.searchBackground }]}>
            <IconSymbol name="magnifyingglass" size={18} color={colors.placeholderText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search"
              placeholderTextColor={colors.placeholderText}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <IconSymbol name="xmark" size={16} color={colors.placeholderText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sort Controls */}
        <View style={[styles.sortContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.sortButton} onPress={() => setSortAsc((s) => !s)}>
            <Text style={[styles.sortText, { color: colors.secondaryText }]}>sort by date</Text>
            <IconSymbol name="chevron.down" size={14} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.scan_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.text }]}>No scan history available.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{formatDateTime(item.scanned_at)}</Text>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleScanPress(item)}
              >
                <View style={styles.iconContainer}>
                  <IconSymbol name="link" size={24} color={colors.text} />
                </View>
                <View style={styles.contentContainer}>
                  <Text style={[styles.urlLabel, { color: colors.secondaryText }]}>URL:</Text>
                  <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={1}>
                    {item.decoded_content}
                  </Text>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.statusLabel, { color: colors.secondaryText }]}>Status: </Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: item.security_status.toLowerCase() === "safe" ? "#4CAF50" : "#F44336" },
                      ]}
                    >
                      {item.security_status}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>

      {/* Scan Details Modal */}
      <ScanDetailsModal
        visible={showScanDetails}
        scan={selectedScan}
        onClose={() => {
          setShowScanDetails(false)
          setSelectedScan(null)
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 32,
  },

  // Login prompt styles
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  loginPromptMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },

  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: "flex-end",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortText: {
    fontSize: 14,
    marginRight: 4,
  },

  listContainer: {
    padding: 16,
  },

  itemContainer: {
    marginBottom: 16,
  },

  timestamp: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },

  iconContainer: {
    marginRight: 12,
  },

  contentContainer: {
    flex: 1,
  },

  urlLabel: {
    fontSize: 12,
    marginBottom: 2,
  },

  urlText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
})
