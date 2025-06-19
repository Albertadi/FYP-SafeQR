"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { type QRScan } from "@/controllers/scanController"
import { useColorScheme } from "@/hooks/useColorScheme"
import * as Clipboard from "expo-clipboard"
import React, { useState } from "react"
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

  const [loading, setLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  if (!scan) return null

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

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(scan.decoded_content)
      Alert.alert("Copied", "URL copied to clipboard")
    } catch (error) {
      Alert.alert("Error", "Failed to copy URL")
    }
  }

  const handleOpenLink = async () => {
    try {
      const canOpen = await Linking.canOpenURL(scan.decoded_content)
      if (canOpen) {
        await Linking.openURL(scan.decoded_content)
      } else {
        Alert.alert("Error", "Cannot open this URL")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open URL")
    }
  }

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: scan.decoded_content,
        url: scan.decoded_content,
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share URL")
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
                  <Text style={[styles.typeValue, { color: colors.text }]}>URL</Text>
                  <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={2}>
                    {scan.decoded_content}
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
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={handleCopy}>
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={handleOpenLink}>
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>Open Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#000" }]} onPress={handleShareLink}>
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>Share Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.reportButton, { backgroundColor: "#F44336" }]}
                onPress={() => setShowReportModal(true)}
              >
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>Report Scan</Text>
              </TouchableOpacity>
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
