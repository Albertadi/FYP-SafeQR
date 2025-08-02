{
  ;('"use client"')
}

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import * as MediaLibrary from "expo-media-library"
import { useRef } from "react"
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import ViewShot from "react-native-view-shot"

interface QrDisplayModalProps {
  visible: boolean
  qrValue: string
  onClose: () => void
}

export default function QrDisplayModal({ visible, qrValue, onClose }: QrDisplayModalProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const qrCodeRef = useRef<ViewShot>(null)

const handleSaveToGallery = async () => {
  try {
    // 1) Request permission
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please grant media library permissions to save the QR code.");
      return;
    }

    // 2) Narrow the ref and ensure `capture` exists
    const viewShotRef = qrCodeRef.current;
    if (!viewShotRef || typeof viewShotRef.capture !== "function") {
      Alert.alert("Error", "Failed to capture QR code image.");
      return;
    }

    // 3) Capture and save
    const uri = await viewShotRef.capture();
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert("Success", "QR code saved to gallery!");
  } catch (error) {
    console.error("Error saving QR code to gallery:", error);
    Alert.alert("Error", "Failed to save QR code to gallery.");
  }
};


return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your QR Code</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
            Security verified ✓ Safe to share
          </Text>

          <ViewShot
            ref={qrCodeRef}
            options={{ format: "png", quality: 1.0 }}
            style={[styles.qrContainer, { backgroundColor: colors.cardBackground }]}
          >
            <QRCode
              value={qrValue}
              size={200}
              color="#000"
              backgroundColor="#fff"
              logo={require("@/assets/images/branding/safeQR-logo.png")}
              logoSize={40}
              logoBackgroundColor="transparent"
              logoMargin={2}
              logoBorderRadius={8}
            />
          </ViewShot>

          <View style={styles.urlDisplay}>
            <Text style={[styles.urlLabel, { color: colors.secondaryText }]}>Generated for:</Text>
            <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={2}>
              {qrValue}
            </Text>
          </View>

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: "#000" }]} onPress={handleSaveToGallery}>
            <Text style={[styles.saveButtonText, { color: "#fff" }]}>Save to Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.closeModalButton, { backgroundColor: colors.cardBackground }]}
            onPress={onClose}
          >
            <Text style={[styles.closeModalButtonText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    paddingVertical: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
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
  saveButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeModalButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
