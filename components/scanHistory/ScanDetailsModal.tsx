"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import type { QRScan } from "@/controllers/scanController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { parseQrContent, type ParsedQRContent, type QRContentType } from "@/utils/qrParser"; // Import parseQrContent and types
import * as Clipboard from "expo-clipboard"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Linking, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import ReportScanModal from "./ReportScanModal"

interface ScanDetailsModalProps {
  visible: boolean
  scan: QRScan | null
  onClose: () => void
}

export default function ScanDetailsModal({ visible, scan, onClose }: ScanDetailsModalProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [parsedContentData, setParsedContentData] = useState<ParsedQRContent["data"] | undefined>(undefined)

  useEffect(() => {
    if (scan?.decoded_content) {
      const parsed = parseQrContent(scan.decoded_content)
      setParsedContentData(parsed.data)
    } else {
      setParsedContentData(undefined)
    }
  }, [scan])

  if (!scan || !parsedContentData) return null


  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getSecurityStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "safe":
        return "#4CAF50"
      case "malicious":
        return "#F44336"
      case "suspicious":
        return "#FF9800"
      default:
        return colors.secondaryText
    }
  }

  const getSecurityStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "safe":
        return "No threats found"
      case "malicious":
        return "Malicious content detected"
      case "suspicious":
        return "Suspicious activity detected"
      default:
        return status
    }
  }

  const getContentTypeDisplay = (type: QRContentType) => {
    switch (type) {
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
        return "Unknown"
    }
  }

  const getContentDetailsDisplay = (type: QRContentType, data: ParsedQRContent["data"]) => {
    switch (type) {
      case "url":
        return data.url
      case "sms":
        return `Number: ${data.number || "N/A"}\nMessage: ${data.body || "N/A"}`
      case "tel":
        return data.number
      case "mailto":
        return `Email: ${data.email || "N/A"}\nSubject: ${data.subject || "N/A"}\nBody: ${data.body || "N/A"}`
      case "wifi":
        return `SSID: ${data.ssid || "N/A"}\nSecurity: ${data.authentication || "N/A"}\nPassword: ${data.password ? "********" : "None"}`
      case "text":
        return data.text
      default:
        return data.originalContent
    }
  }

  const getActionButtonText = (type: QRContentType, securityStatus?: string) => {
    switch (type) {
      case "url":
        if (securityStatus?.toLowerCase() === "malicious") {
          return "Open in Sandbox"
        }
        else {
          return "Open Link"
        }
      case "sms":
        return "Send SMS"
      case "tel":
        return "Call Number"
      case "mailto":
        return "Send Email"
      case "wifi":
        return "Show Wi-Fi Details"
      case "text":
        return "Copy Text"
      default:
        return "Perform Action"
    }
  }

  const handlePerformAction = async () => {
    if (!scan || !parsedContentData) return

    try {
      switch (scan.content_type) {
        case "url":
          if (scan.security_status?.toLowerCase() === "malicious") {
            router.push({
              pathname: "/sandboxPreview",
              params: { url: scan.decoded_content },
            });
          }
          else {
            await Linking.openURL(scan.decoded_content)
          }
          break
        case "sms":
          const smsUrl = `sms:${parsedContentData.number}${parsedContentData.body ? `?body=${encodeURIComponent(parsedContentData.body)}` : ""}`
          await Linking.openURL(smsUrl)
          break
        case "tel":
          const telUrl = `tel:${parsedContentData.number}`
          await Linking.openURL(telUrl)
          break
        case "mailto":
          const mailtoUrl = `mailto:${parsedContentData.email}${parsedContentData.subject ? `?subject=${encodeURIComponent(parsedContentData.subject)}` : ""}${parsedContentData.body ? `${parsedContentData.subject ? "&" : "?"}body=${encodeURIComponent(parsedContentData.body)}` : ""}`
          await Linking.openURL(mailtoUrl)
          break
        case "wifi":
          Alert.alert(
            "Wi-Fi Details",
            `SSID: ${parsedContentData.ssid || "N/A"}\nSecurity: ${parsedContentData.authentication || "N/A"}\nPassword: ${parsedContentData.password || "None"}\n\nPlease connect manually using these details.`,
          )
          break
        case "text":
          await Clipboard.setStringAsync(scan.decoded_content)
          Alert.alert("Copied", "Content copied to clipboard!")
          break
        default:
          Alert.alert("Unsupported Action", "This content type does not support a direct action.")
      }
    } catch (error) {
      console.error("Failed to perform action:", error)
      Alert.alert("Error", "Failed to perform action.")
    }
  }

  const handleCopyText = async () => {
      console.log("Copying:", scan.decoded_content)
      try {
        await Clipboard.setStringAsync(scan.decoded_content)
        Alert.alert("Copied", "Content copied to clipboard!")
      } catch (error) {
        Alert.alert("Error", "Failed to copy content.")
      }
    }
  

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: scan.decoded_content,
        url: scan.decoded_content, // For non-URL types, this might not be a valid URL, but it's the closest option for sharing.
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share content")
    }
  }

  const handleReportSubmitted = () => {
    setShowReportModal(false)
    Alert.alert("Report Submitted", "Thank you for your report. We will review it shortly.")
  }

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Details</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Scan Result Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Scan Result</Text>

              <View style={styles.scanResultContainer}>
                <View style={[styles.qrCodeIcon, { backgroundColor: colors.cardBackground }]}>
                  <IconSymbol name="qrcode.viewfinder" size={40} color={colors.text} />
                </View>
                <View style={styles.scanInfo}>
                  <Text style={[styles.typeLabel, { color: colors.secondaryText }]}>Type</Text>
                  <Text style={[styles.typeValue, { color: colors.text }]}>
                    {getContentTypeDisplay(scan.content_type)}
                  </Text>
                  <Text
                    style={[styles.urlText, { color: colors.text }]}
                    numberOfLines={scan.content_type === "text" ? 5 : 2}
                  >
                    {getContentDetailsDisplay(scan.content_type, parsedContentData)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.borderColor }]} />

            {/* Scan Details */}
            <View style={styles.section}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>
                Scanned on:{" "}
                <Text style={[styles.detailValue, { color: colors.secondaryText }]}>
                  {formatDateTime(scan.scanned_at)}
                </Text>
              </Text>

              <View style={styles.securitySection}>
                <Text style={[styles.securityLabel, { color: colors.text }]}>Security Scan result:</Text>
                <Text style={[styles.securityStatus, { color: getSecurityStatusColor(scan.security_status) }]}>
                  {getSecurityStatusText(scan.security_status)}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsSection}>
  {scan.security_status.toLowerCase() === "safe" ? (
    <>
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={handleCopyText}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Copy URL</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={handleShareLink}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Share URL</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={handlePerformAction}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Open Link</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.reportButton, { backgroundColor: "#F44336" }]} onPress={() => setShowReportModal(true)}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Report Scan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={onClose}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Back to Scan</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#F44336" }]} onPress={handlePerformAction}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Open in Sandbox</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={onClose}>
        <Text style={[styles.actionButtonText, { color: "#fff" }]}>Back to Scan History</Text>
      </TouchableOpacity>
    </>
  )}
</View>
           
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Report Modal */}
      <ReportScanModal
        visible={showReportModal}
        scan={scan}
        onClose={() => setShowReportModal(false)}
        onReportSubmitted={handleReportSubmitted}
      />
    </>
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
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  scanResultContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  qrCodeIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  scanInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  typeValue: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  urlText: {
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  detailValue: {
    fontWeight: "normal",
  },
  securitySection: {
    marginTop: 8,
  },
  securityLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  securityStatus: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonsSection: {
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  reportButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
