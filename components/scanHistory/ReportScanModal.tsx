"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { submitReport } from "@/controllers/reportController"
import { type QRScan } from "@/controllers/scanController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useEffect, useState } from "react"
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface ReportScanModalProps {
  visible: boolean
  scan: QRScan | null
  onClose: () => void
  onReportSubmitted: () => void
}

export default function ReportScanModal({ visible, scan, onClose, onReportSubmitted }: ReportScanModalProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    setIsModalVisible(visible)
  }, [visible])

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  const handleSubmitReport = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for reporting this scan")
      return
    }

    setLoading(true)
    try {
      if (!scan) {
        throw new Error("No scan data available")
      }
      await submitReport({
        user_id: scan.user_id,
        scan_id: scan.scan_id,
        reason: reason.trim(),
      })

      setReason("")
      onReportSubmitted()
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit report")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason("")
    Keyboard.dismiss()
    onClose()
  }

  const reportReasons = [
    "Malicious content",
    "Phishing attempt",
    "Spam or unwanted content",
    "Inappropriate content",
    "Suspicious activity",
    "Other",
  ]

  const handleReasonSelect = (selectedReason: string) => {
    setReason(selectedReason)
  }

  if (!scan) return null

  return (
    <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <IconSymbol name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Report Scan</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(keyboardHeight, 20) }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Scan Info */}
            <View style={styles.scanInfoSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reporting scan for:</Text>
              <View style={[styles.scanInfoCard, { backgroundColor: colors.cardBackground }]}>
                <IconSymbol name="qrcode.viewfinder" size={20} color={colors.text} />
                <Text style={[styles.scanUrl, { color: colors.text }]} numberOfLines={2}>
                  {scan.decoded_content}
                </Text>
              </View>
            </View>

            {/* Quick Reason Selection */}
            <View style={styles.reasonSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Select a reason:</Text>
              <View style={styles.reasonButtons}>
                {reportReasons.map((reasonOption, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.reasonButton,
                      {
                        backgroundColor: reason === reasonOption ? colors.tint : colors.cardBackground,
                        borderColor: colors.borderColor,
                      },
                    ]}
                    onPress={() => handleReasonSelect(reasonOption)}
                  >
                    <Text
                      style={[
                        styles.reasonButtonText,
                        {
                          color: reason === reasonOption ? colors.background : colors.text,
                        },
                      ]}
                    >
                      {reasonOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Reason Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional details (optional):</Text>
              <TextInput
                style={[
                  styles.reasonInput,
                  {
                    borderColor: colors.borderColor,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="Please provide more details about why you're reporting this scan..."
                placeholderTextColor={colors.placeholderText}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                scrollEnabled={false}
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: reason.trim() ? "#F44336" : colors.borderColor,
                    opacity: reason.trim() ? 1 : 0.6,
                  },
                ]}
                onPress={handleSubmitReport}
                disabled={loading || !reason.trim()}
              >
                <Text style={[styles.submitButtonText, { color: "#fff" }]}>
                  {loading ? "Submitting..." : "Submit Report"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scanInfoSection: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  scanInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  scanUrl: {
    flex: 1,
    fontSize: 14,
  },
  reasonSection: {
    paddingVertical: 16,
  },
  reasonButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reasonButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  reasonButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputSection: {
    paddingVertical: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
  },
  buttonSection: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
  },
})
