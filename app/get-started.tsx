"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { router } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface GetStartedProps {
  onProceedAsGuest: () => void
}

export default function GetStartedScreen({ onProceedAsGuest }: GetStartedProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const handleLoginPress = () => {
    // Navigate to register tab which handles auth
    router.push("/(tabs)/register")
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoSection}>
          <IconSymbol name="qrcode.viewfinder" size={80} color={colors.tint} />
          <Text style={[styles.appTitle, { color: colors.text }]}>QR Scanner</Text>
          <Text style={[styles.appSubtitle, { color: colors.secondaryText }]}>Scan QR codes safely and securely</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <IconSymbol name="shield.checkered" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>Security scanning</Text>
          </View>
          <View style={styles.feature}>
            <IconSymbol name="clock.fill" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>Scan history</Text>
          </View>
          <View style={styles.feature}>
            <IconSymbol name="link" size={24} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.text }]}>Link management</Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.tint }]} onPress={handleLoginPress}>
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>Login / Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton]} onPress={onProceedAsGuest}>
            <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>Proceed as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 60,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresSection: {
    gap: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonsSection: {
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})
