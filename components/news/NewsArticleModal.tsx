// components/news/NewsArticleModal.tsx
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import React from "react"
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"

interface Props {
  visible: boolean
  onClose: () => void
  headline: string | null
  content: string | null
  loading: boolean
  originalUrl?: string | null
}

const { height: screenHeight } = Dimensions.get('window')

export default function NewsArticleModal({
  visible,
  onClose,
  headline,
  content,
  loading,
  originalUrl,
}: Props) {
  const scheme = useColorScheme() || "light"
  const colors = Colors[scheme]

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay with tap-to-dismiss */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        {/* Card container */}
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          {/* Header with improved styling */}
          <View style={[styles.header, { 
            backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            borderBottomColor: colors.borderColor 
          }]}>
            <View style={styles.headerTop}>
              <View style={styles.dragIndicator} />
              <TouchableOpacity 
                onPress={onClose}
                style={[styles.closeButton, { 
                  backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                }]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol name="xmark" size={18} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            
            {headline && (
              <Text 
                style={[styles.title, { color: colors.text }]}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {headline}
              </Text>
            )}
          </View>

          {/* Body with improved layout */}
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
                Loading article...
              </Text>
            </View>
          ) : content ? (
            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={true}
              indicatorStyle={scheme === 'dark' ? 'white' : 'black'}
              bounces={true}
            >
              <Text style={[styles.contentText, { color: colors.text }]}>
                {content}
              </Text>

              {originalUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(originalUrl)}
                  style={[styles.linkWrapper, { 
                    backgroundColor: scheme === 'dark' 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(0,0,0,0.04)',
                    borderColor: colors.tint + '20', // 20% opacity
                  }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.linkContent}>
                    <View style={[styles.linkIcon, { backgroundColor: colors.tint + '15' }]}>
                      <IconSymbol name="globe" size={16} color={colors.tint} />
                    </View>
                    <View style={styles.linkTextContainer}>
                      <Text style={[styles.linkTitle, { color: colors.text }]}>
                        Read Full Article
                      </Text>
                      <Text style={[styles.linkSubtitle, { color: colors.secondaryText }]}>
                        CSA.gov.sg
                      </Text>
                    </View>
                  </View>
                  <IconSymbol name="arrow.up.right" size={18} color={colors.tint} />
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { 
                backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' 
              }]}>
                <IconSymbol name="doc.text" size={32} color={colors.secondaryText} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Content Available
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                This article couldn't be loaded at the moment.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    maxHeight: screenHeight * 0.95,
    minHeight: screenHeight * 0.7,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    opacity: 0.6,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  scrollContainer: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  contentText: {
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.1,
    textAlign: 'left',
  },
  linkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
})