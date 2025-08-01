"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { router } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function LoginRequiredScreen() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.screenBackground, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderColor }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
        </View>
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

const styles = StyleSheet.create({
  screen: { flex: 1 },

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
})