// pages/NewsScreen.tsx
"use client"

import NewsArticleModal from "@/components/news/NewsArticleModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import {
    fetchNewsArticle,
    fetchNewsHeadlines,
    NewsArticle,
    NewsHeadline,
} from "@/utils/directScraper"

export default function NewsScreen() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [headlines, setHeadlines] = useState<NewsHeadline[]>([])
  const [loadingHeadlines, setLoadingHeadlines] = useState(true)
  const [errorHeadlines, setErrorHeadlines] = useState<string | null>(null)

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [errorArticle, setErrorArticle] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoadingHeadlines(true)
      setErrorHeadlines(null)
      try {
        const data = await fetchNewsHeadlines()
        setHeadlines(data)
      } catch (err: any) {
        console.error("Error loading headlines:", err)
        setErrorHeadlines("Failed to load news headlines. Please try again later.")
      } finally {
        setLoadingHeadlines(false)
      }
    })()
  }, [])

  const handleHeadlinePress = async (url: string) => {
    setSelectedUrl(url)              // ← remember the URL
    setShowArticleModal(true)
    setLoadingArticle(true)
    setErrorArticle(null)
    setSelectedArticle(null)
    try {
      const article = await fetchNewsArticle(url)
      setSelectedArticle(article)
    } catch (err: any) {
      console.error("Error loading article:", err)
      setErrorArticle("Failed to load article content. Please try again.")
    } finally {
      setLoadingArticle(false)
    }
  }

  const handleCloseModal = () => {
    setShowArticleModal(false)
    setSelectedArticle(null)
    setErrorArticle(null)
    setSelectedUrl(null)             // ← clear URL
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Latest News
        </Text>
      </View>

      {loadingHeadlines ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Loading headlines...
          </Text>
        </View>
      ) : errorHeadlines ? (
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.octagon.fill"
            size={40}
            color={colors.tint}
          />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {errorHeadlines}
          </Text>
        </View>
      ) : (
        <FlatList
          data={headlines}
          keyExtractor={(item) => item.url}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No news headlines found.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.headlineItem,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => handleHeadlinePress(item.url)}
            >
              <View style={styles.headlineContent}>
                <Text style={[styles.headlineTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.headlineDate, { color: colors.secondaryText }]}>
                  {item.date}
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        />
      )}

      <NewsArticleModal
        visible={showArticleModal}
        onClose={handleCloseModal}
        headline={selectedArticle?.headline || null}
        content={selectedArticle?.content || errorArticle}
        loading={loadingArticle}
        originalUrl={selectedUrl}        // ← pass it down
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", flex: 1, textAlign: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: { marginTop: 10, fontSize: 16, textAlign: "center" },
  listContent: { padding: 16 },
  headlineItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headlineContent: { flex: 1, marginRight: 10 },
  headlineTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  headlineDate: { fontSize: 12 },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
})
