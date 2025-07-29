"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { getUserReports, type Report } from "@/controllers/reportController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { supabase } from "@/utils/supabase"
import React, { useEffect, useMemo, useState } from "react"
import { TextInput } from "react-native"

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface ReportHistoryScreenProps {
  onBack: () => void
}

type SortKey = "decoded" | "reason" | "status" | null
type SortDirection = "asc" | "desc" | null

export default function ReportHistoryScreen({ onBack }: ReportHistoryScreenProps) {
  const insets = useSafeAreaInsets()
  const scheme = useColorScheme() || "light"
  const colors = Colors[scheme]

  const [session, setSession] = useState<any>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  // Sort state with combined key and direction
  const [sortIndex, setSortIndex] = useState(0)

  // Define sort states cycle
  const sortStates: { key: SortKey; direction: SortDirection }[] = [
    { key: null, direction: null }, // no sort
    { key: "decoded", direction: "asc" },
    { key: "decoded", direction: "desc" },
    { key: "reason", direction: "asc" },
    { key: "reason", direction: "desc" },
    { key: "status", direction: "asc" },
    { key: "status", direction: "desc" },
  ]

  const currentSort = sortStates[sortIndex]

  // Filter and sort reports memoized
  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const reasonMatch = report.reason.toLowerCase().includes(query.toLowerCase())

      let decodedContents = ""
      if (Array.isArray(report.qr_scans)) {
        decodedContents = report.qr_scans.map(scan => scan.decoded_content).join(" ").toLowerCase()
      } else if (report.qr_scans?.decoded_content) {
        decodedContents = report.qr_scans.decoded_content.toLowerCase()
      }

      const decodedMatch = decodedContents.includes(query.toLowerCase())
      return reasonMatch || decodedMatch
    })

    if (!currentSort.key || !currentSort.direction) return filtered

    const sorted = [...filtered].sort((a, b) => {
      const getDecoded = (r: Report) => {
        if (Array.isArray(r.qr_scans)) {
          return r.qr_scans.map(s => s.decoded_content).join(" ").toLowerCase()
        } else if (r.qr_scans?.decoded_content) {
          return r.qr_scans.decoded_content.toLowerCase()
        }
        return ""
      }

      let valA = ""
      let valB = ""

      switch (currentSort.key) {
        case "decoded":
          valA = getDecoded(a)
          valB = getDecoded(b)
          break
        case "reason":
          valA = a.reason.toLowerCase()
          valB = b.reason.toLowerCase()
          break
        case "status":
          valA = a.status.toLowerCase()
          valB = b.status.toLowerCase()
          break
      }

      const comp = valA.localeCompare(valB)
      return currentSort.direction === "asc" ? comp : -comp
    })

    return sorted
  }, [reports, query, currentSort])

  useEffect(() => {
    const fetchReports = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      setSession(session)

      if (!session?.user?.id || sessionError) {
        setLoading(false)
        return
      }

      try {
        const result = await getUserReports(session.user.id)
        setReports(result)
      } catch (err) {
        console.error("Failed to fetch user reports:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  // Cycle sort index on button press
  function handleSortPress() {
    setSortIndex((prev) => (prev + 1) % sortStates.length)
  }

  // Display text label for current sort state
  function getSortLabel() {
    if (!currentSort.key) return "Sort: None"
    const keyMap = {
      decoded: "Decoded Content",
      reason: "Reason",
      status: "Status",
    }
    const dirLabel = currentSort.direction === "asc" ? "↑" : "↓"
    return `Sort: ${keyMap[currentSort.key]} ${dirLabel}`
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.screenBackground, paddingTop: insets.top }]}
    >
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderColor }]}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: 8, marginRight: 8 }}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Reports</Text>
        </View>
      </View>

      {/* Search Box */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.searchBackground || "#f0f0f0" }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.placeholderText || "#999"} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search reports"
            placeholderTextColor={colors.placeholderText || "#999"}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <IconSymbol name="xmark" size={16} color={colors.placeholderText || "#999"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Single Sort Button */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={handleSortPress}
        >
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Report List */}
      <FlatList
        data={filteredAndSortedReports}
        keyExtractor={(item) => item.report_id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>No reports submitted yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
              {formatDateTime(item.created_at)}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.contentContainer}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Decoded Content:</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {Array.isArray(item.qr_scans)
                    ? item.qr_scans.map(scan => scan.decoded_content).join(", ")
                    : item.qr_scans?.decoded_content || "N/A"}
                </Text>

                <Text style={[styles.label, { color: colors.secondaryText }]}>Reason:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{item.reason}</Text>

                <View style={styles.statusContainer}>
                  <Text style={[styles.statusLabel, { color: colors.secondaryText }]}>Status: </Text>
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.status.toLowerCase() === "pending" ? "#FFA500" : "#4CAF50" },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.secondaryText} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
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
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
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

  contentContainer: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    marginBottom: 2,
  },

  value: {
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
    backgroundColor:"#000"
  },
  sortText: {
    fontSize: 14,
    marginRight: 4,
    backgroundColor: "#000",
    color:"#fff"
    },
})
