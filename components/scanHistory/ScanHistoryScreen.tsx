"use client"

import ScanDetailsModal from "@/components/scanHistory/ScanDetailsModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { getScanHistory, type QRScan } from "@/controllers/scanController"
import { useColorScheme } from "@/hooks/useColorScheme"
import type { QRContentType } from "@/utils/qrParser"
import { supabase } from "@/utils/supabase"
import * as Clipboard from "expo-clipboard"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function ScanHistoryList() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [session, setSession] = useState<any>(null)
  const [history, setHistory] = useState<QRScan[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sortAsc, setSortAsc] = useState(false)
  const [sortField, setSortField] = useState<"scanned_at" | "decoded_content">("scanned_at")

  const [selectedScan, setSelectedScan] = useState<QRScan | null>(null)
  const [showScanDetails, setShowScanDetails] = useState(false)

  useEffect(() => {
    // Check authentication state and fetch scan history
    const checkAuthAndFetchHistory = async () => {
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

    checkAuthAndFetchHistory()

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
    return arr.sort((a, b) => {
      const valA = sortField === "scanned_at" ? new Date(a.scanned_at).getTime() : a.decoded_content.toLowerCase()
      const valB = sortField === "scanned_at" ? new Date(b.scanned_at).getTime() : b.decoded_content.toLowerCase()

      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })

  }, [history, query, sortAsc])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  const getScanTypeIcon = (contentType: QRContentType) => {
    switch (contentType) {
      case "url":
        return "link"
      case "sms":
        return "message-square"
      case "tel":
        return "phone"
      case "mailto":
        return "envelope.fill"
      case "wifi":
        return "wifi"
      case "text":
        return "doc.text"
      default:
        return "qrcode.viewfinder" // Default icon
    }
  }

  const getScanTypeDisplayName = (contentType: QRContentType) => {
    switch (contentType) {
      case "url":
        return "URL"
      case "sms":
        return "SMS Message"
      case "tel":
        return "Phone Number"
      case "mailto":
        return "Email Address"
      case "wifi":
        return "Wi-Fi Network"
      case "text":
        return "Plain Text"
      default:
        return "Unknown Type"
    }
  }

  const handleScanPress = (scan: QRScan) => {
    setSelectedScan(scan)
    setShowScanDetails(true)
  }

  const handleCopy = async (content: string) => {
      try {
        await Clipboard.setStringAsync(content)
        Alert.alert("Copied", "URL copied to clipboard")
      } catch (error) {
        Alert.alert("Error", "Failed to copy URL")
      }
    }


  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    )
  }

  return (
    <>
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.screenBackground, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderColor }]}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
          </View>
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
        <View style={[styles.sortContainer, { backgroundColor: colors.background, flexDirection: "row", gap: 12 }]}>
          <TouchableOpacity style={styles.sortButton} onPress={() => setSortAsc((s) => !s)}>
            <Text style={[styles.sortText, { color: colors.secondaryText }]}>
              Sort: {sortAsc ? "Asc" : "Desc"}
            </Text>
            <IconSymbol name="chevron.down" size={14} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sortButton} onPress={() => {
            setSortField((prev) => prev === "scanned_at" ? "decoded_content" : "scanned_at")
          }}>
            <Text style={[styles.sortText, { color: colors.secondaryText }]}>
              By: {sortField === "scanned_at" ? "Date" : "Name"}
            </Text>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={14} color={colors.secondaryText} />
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
                <TouchableOpacity
  style={styles.iconContainer}
  onPress={() => handleCopy(item.decoded_content)} // Or whichever content you want to copy
  activeOpacity={0.7}
>

                  <IconSymbol name={getScanTypeIcon(item.content_type)} size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.contentContainer}>
                  <Text style={[styles.urlLabel, { color: colors.secondaryText }]}>
                    {getScanTypeDisplayName(item.content_type)}:
                  </Text>
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
