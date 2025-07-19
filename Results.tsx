// components/Results.tsx
import type { ParsedQRContent, QRContentType } from "@/utils/qrParser"
import { Ionicons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type Props = {
  status: "safe" | "malicious" | "suspicious"
  originalContent: string
  contentType: QRContentType
  parsedContent: ParsedQRContent["data"]
  flaggedBy?: "google" | "ml" | "both" // New prop to track detection source
  canPerformAction?: boolean
  acknowledged?: boolean
  onAcknowledge?: () => void
  onPerformAction?: () => void
  onBack: () => void
}

const statusConfig = {
  safe: {
    icon: "checkmark-circle" as const,
    color: "#2ecc71",
    title: "Safe Content Detected",
    message: "You can safely proceed with this content.",
    buttonColor: "#2ecc71",
  },
  malicious: {
    icon: "warning" as const,
    color: "#e74c3c",
    title: "WARNING!\nMalicious Content Detected",
    message: (flaggedBy?: string) => 
      `The QR you scanned leads to malicious content.\n\n` +
      (flaggedBy === "both" 
        ? "Detected by both Google Safe Browsing and AI analysis."
        : flaggedBy === "google"
          ? "Detected by Google Safe Browsing."
          : "Detected by AI security analysis."),
    buttonColor: "#e74c3c",
  },
  suspicious: {
    icon: "alert-circle" as const,
    color: "#f39c12",
    title: "WARNING!\nPotential Security Risk",
    message: (flaggedBy?: string) =>
      `The QR content may be suspicious.\n\n` +
      (flaggedBy === "ml" 
        ? "AI analysis detected potential risks (Score: ${mlScore})."
        : "Proceed with caution."),
    buttonColor: "#f39c12",
  },
}

export default function ResultTemplate({
  status,
  originalContent,
  contentType,
  parsedContent,
  flaggedBy,
  canPerformAction,
  acknowledged,
  onAcknowledge,
  onBack,
  onPerformAction,
}: Props) {
  const config = statusConfig[status]
  const isSafe = status === "safe"

  // Dynamic message with detection source
  const message = typeof config.message === 'function' 
    ? config.message(flaggedBy)
    : config.message

  const getContentTypeDisplay = (type: QRContentType) => {
    switch (type) {
      case "url": return "URL"
      case "sms": return "SMS Message"
      case "tel": return "Phone Number"
      case "mailto": return "Email Address"
      case "wifi": return "Wi-Fi Network"
      case "text": return "Plain Text"
      default: return "Unknown"
    }
  }

  const getContentDetailsDisplay = (type: QRContentType, data: ParsedQRContent["data"]) => {
    switch (type) {
      case "url": return data.url
      case "sms": return `Number: ${data.number || "N/A"}\nMessage: ${data.body || "N/A"}`
      case "tel": return data.number
      case "mailto": return `Email: ${data.email || "N/A"}\nSubject: ${data.subject || "N/A"}\nBody: ${data.body || "N/A"}`
      case "wifi": return `SSID: ${data.ssid || "N/A"}\nSecurity: ${data.authentication || "N/A"}\nPassword: ${data.password ? "********" : "None"}`
      case "text": return data.text
      default: return data.originalContent
    }
  }

  const getActionButtonText = (type: QRContentType) => {
    switch (type) {
      case "url": return "Open Link"
      case "sms": return "Send SMS"
      case "tel": return "Call Number"
      case "mailto": return "Send Email"
      case "wifi": return "Show Wi-Fi Details"
      case "text": return "Copy Text"
      default: return "Proceed"
    }
  }

  const handlePrimaryAction = () => {
    if (contentType === "text") {
      Clipboard.setStringAsync(originalContent)
        .then(() => Alert.alert("Copied", "Content copied to clipboard!"))
        .catch(() => Alert.alert("Error", "Failed to copy content."))
    } else if (contentType === "url") {
      Linking.openURL(parsedContent.url).catch(() => 
        Alert.alert("Error", "Could not open URL")
      )
    } else if (onPerformAction) {
      onPerformAction()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SCANNING COMPLETE</Text>

      <View style={styles.resultBox}>
        <Ionicons 
          name={config.icon} 
          size={isSafe ? 60 : 80} 
          color={config.color} 
          style={styles.icon} 
        />
        <Text style={[styles.title, { color: config.color }]}>
          {config.title}
        </Text>
        <Text style={styles.message}>
          {message}
          {!isSafe && (
            <Text style={styles.detectionSource}>
              {"\n\n"}Detection: {flaggedBy === "both" ? "Google + AI" : flaggedBy?.toUpperCase() || "System"}
            </Text>
          )}
        </Text>
      </View>

      <Text style={styles.contentTypeLabel}>
        Content Type: {getContentTypeDisplay(contentType)}
      </Text>
      <Text style={styles.contentPreview}>
        {getContentDetailsDisplay(contentType, parsedContent)}
      </Text>

      {!isSafe && !acknowledged && (
        <TouchableOpacity
          style={[styles.warningButton, { backgroundColor: config.buttonColor }]}
          onPress={onAcknowledge}
        >
          <Text style={styles.buttonText}>I Understand These Risks{"\n"}And Wish To Proceed</Text>
        </TouchableOpacity>
      )}

      {canPerformAction && (isSafe || acknowledged) && (
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: config.buttonColor }]}
          onPress={handlePrimaryAction}
        >
          <Text style={styles.buttonText}>{getActionButtonText(contentType)}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backButton}>Back to Scanner</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },
  resultBox: {
    width: "100%",
    minHeight: 280,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    fontSize: 22,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  detectionSource: {
    fontSize: 13,
    color: "#777",
    fontStyle: "italic",
  },
  contentTypeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  contentPreview: {
    width: "100%",
    fontSize: 15,
    color: "#2980b9",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 20,
  },
  warningButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    color: "#444",
    fontSize: 16,
    marginTop: 8,
  },
})