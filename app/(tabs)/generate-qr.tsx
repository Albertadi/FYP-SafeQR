"use client"

import QrDisplayModal from "@/components/qr/QrDisplayModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { checkUrlSafetyComprehensive } from "@/utils/urlSafetyChecker"
import { useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function GenerateQRScreen() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      return urlPattern.test(inputUrl)
    } catch {
      return false
    }
  }

  const normalizeUrl = (inputUrl: string): string => {
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      return `https://${inputUrl}`
    }
    return inputUrl
  }

  const handleGenerateQR = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a URL")
      return
    }

    if (!validateUrl(url.trim())) {
      Alert.alert("Error", "Please enter a valid URL")
      return
    }

    const normalizedUrl = normalizeUrl(url.trim())
    setLoading(true)

    try {
      // Check with comprehensive URL safety checker
      const safetyResult = await checkUrlSafetyComprehensive(normalizedUrl)
      console.log("Comprehensive safety check result:", safetyResult)

      if (safetyResult.overallStatus !== "Safe") {
        let errorMessage = "Our security systems have detected suspicious content in this URL:\n\n"

        if (safetyResult.googleResult !== "Safe") {
          errorMessage += `• Google Safe Browsing API: ${safetyResult.googleResult}\n`
        }

        if (safetyResult.mlResult.prediction !== "Safe") {
          errorMessage += `• Our ML system: ${safetyResult.mlResult.prediction} (Score: ${safetyResult.mlResult.score.toFixed(2)})\n`
        }

        errorMessage += "\nQR code generation has been declined for your safety."

        Alert.alert("Security Warning", errorMessage)
        setShowQR(false)
        return
      }

      // URL is safe, generate QR code
      setQrValue(normalizedUrl)
      setShowQR(true)
      setShowQrModal(true) // Show the modal
    } catch (error: any) {
      console.error("Error during security check:", error)
      Alert.alert("Error", error.message || "Failed to verify URL safety")
      setShowQR(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClearQR = () => {
    setShowQR(false)
    setQrValue("")
    setUrl("")
    setShowQrModal(false) // Close the modal
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Generate QR Code</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Enter URL</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
            We'll verify the URL's safety before generating your QR code
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              placeholder="https://example.com"
              placeholderTextColor={colors.placeholderText}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: loading ? colors.borderColor : "#000",
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleGenerateQR}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.generateButtonText, { color: "#fff", marginLeft: 8 }]}>Verifying URL...</Text>
              </View>
            ) : (
              <Text style={[styles.generateButtonText, { color: "#fff" }]}>Generate QR Code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Info Section */}
        <View style={styles.securitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security Features</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol name="shield.checkered" size={20} color="#4CAF50" />
              <Text style={[styles.featureText, { color: colors.text }]}>Google Safe Browsing verification</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="shield.checkered" size={20} color="#4CAF50" />
              <Text style={[styles.featureText, { color: colors.text }]}>AI-powered malicious content detection</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol name="shield.checkered" size={20} color="#4CAF50" />
              <Text style={[styles.featureText, { color: colors.text }]}>SafeQR branded for authenticity</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* QR Code Display Modal */}
      <QrDisplayModal visible={showQrModal} qrValue={qrValue} onClose={handleClearQR} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputSection: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qrSection: {
    paddingVertical: 24,
    alignItems: "center",
  },
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  urlDisplay: {
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  urlLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  urlText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  securitySection: {
    paddingVertical: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
})
