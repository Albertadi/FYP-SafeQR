"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface GetStartedProps {
  onProceedAsGuest: () => void
}

export default function GetStarted({ onProceedAsGuest }: GetStartedProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const handleLoginPress = () => {
    // Navigate to register tab which handles auth
    router.push("/(tabs)/register")
  }

  // Background decorative icons data
  const backgroundIcons = [
    { name: "shield.checkered", top: 80, left: 30, size: 20 },
    { name: "qrcode.viewfinder", top: 120, right: 40, size: 18 },
    { name: "link", top: 160, left: 50, size: 16 },
    { name: "shield.checkered", top: 200, right: 60, size: 22 },
    { name: "qrcode.viewfinder", top: 240, left: 20, size: 19 },
    { name: "link", top: 280, right: 30, size: 17 },
    { name: "shield.checkered", top: 320, left: 70, size: 21 },
    { name: "qrcode.viewfinder", top: 360, right: 50, size: 18 },
    { name: "link", top: 400, left: 40, size: 16 },
    { name: "shield.checkered", top: 440, right: 70, size: 20 },
    { name: "qrcode.viewfinder", top: 480, left: 60, size: 19 },
    { name: "link", top: 520, right: 40, size: 17 },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Background decorative icons */}
      {backgroundIcons.map((icon, index) => (
        <View
          key={index}
          style={[
            styles.backgroundIcon,
            {
              top: icon.top,
              left: icon.left,
              right: icon.right,
            },
          ]}
        >
          <IconSymbol name={icon.name as any} size={icon.size} color={colors.placeholderText} />
        </View>
      ))}

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.cardBackground }]}>
            <Image
              source={require("@/assets/images/branding/safeQR-logo.png")}
              style={{ width: 100, height: 100, resizeMode: "contain" }}
              accessibilityLabel="SafeQR Logo"
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.textSection}>
          <Text style={[styles.title, { color: colors.text }]}>Get Started</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Scan smart. Stay safe. We've got your back.
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: "#000" }]} onPress={onProceedAsGuest}>
            <Text style={[styles.primaryButtonText, { color: "#fff" }]}>Proceed as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleLoginPress}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Login/Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundIcon: {
    position: "absolute",
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingVertical: 40,
    zIndex: 1,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 100,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "500",
  },
  textSection: {
    alignItems: "center",
    marginTop: -50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonsSection: {
    gap: 16,
    marginBottom: 40,
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
    fontWeight: "400",
  },
})
