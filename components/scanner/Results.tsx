// components/Results.tsx
import type { ParsedQRContent, QRContentType } from "@/utils/qrParser"
import { Ionicons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type Props = {
  status: "safe" | "malicious" | "suspicious"
  originalContent: string // The raw decoded content
  contentType: QRContentType
  parsedContent: ParsedQRContent["data"]
  canPerformAction?: boolean // Whether the primary action can be performed
  acknowledged?: boolean // For malicious/suspicious, if user acknowledged risk
  onAcknowledge?: () => void
  onPerformAction?: () => void // Generic action button handler
  onBack: () => void
}

const statusConfig = {
  safe: {
    icon: "checkmark-circle",
    color: "#2ecc71",
    title: "Safe Content Detected",
    message: "You can safely proceed with this content.",
    buttonColor: "#2ecc71",
  },
  malicious: {
    icon: "warning",
    color: "#e74c3c",
    title: "WARNING!\nMalicious Content Detected",
    message: "The QR you scanned leads to malicious content or contains harmful data.",
    buttonColor: "#e74c3c",
  },
  suspicious: {
    icon: "alert-circle",
    color: "#f39c12",
    title: "WARNING!\nPotential Security Risk",
    message:
      "The QR you have scanned may lead to suspicious content or contain potentially harmful data.\nProceed with caution.",
    buttonColor: "#f39c12",
  },
}

export default function ResultTemplate({
  status,
  originalContent,
  contentType,
  parsedContent,
  canPerformAction,
  acknowledged,
  onAcknowledge,
  onBack,
  onPerformAction,
}: Props) {
  const config = statusConfig[status]
  const isSafe = status === "safe"

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
        // Display email, subject, and body
        return `Email: ${data.email || "N/A"}\nSubject: ${data.subject || "N/A"}\nBody: ${data.body || "N/A"}`
      case "wifi":
        return `SSID: ${data.ssid || "N/A"}\nSecurity: ${data.authentication || "N/A"}\nPassword: ${data.password ? "********" : "None"}`
      case "text":
        return data.text
      default:
        return data.originalContent
    }
  }

  const getActionButtonText = (type: QRContentType) => {
    switch (type) {
      case "url":
        return "Open Link"
      case "sms":
        return "Send SMS"
      case "tel":
        return "Call Number"
      case "mailto":
        return "Send Email"
      case "wifi":
        return "Show Wi-Fi Details" // Changed text for Wi-Fi
      case "text":
        return "Copy Text"
      default:
        return "Proceed"
    }
  }

  const handleCopyText = async () => {
    try {
      await Clipboard.setStringAsync(originalContent)
      Alert.alert("Copied", "Content copied to clipboard!")
    } catch (error) {
      Alert.alert("Error", "Failed to copy content.")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SCANNING COMPLETE</Text>

      <View style={styles.resultBox}>
        <Ionicons name={config.icon as any} size={isSafe ? 60 : 120} color={config.color} style={styles.icon} />
        <Text style={[styles.title, { color: config.color, fontSize: isSafe ? 18 : 24 }]}>{config.title}</Text>
        <Text style={styles.message}>{config.message}</Text>
      </View>

      <Text style={styles.contentTypeLabel}>Content Type: {getContentTypeDisplay(contentType)}</Text>
      <Text style={styles.url}>{getContentDetailsDisplay(contentType, parsedContent)}</Text>

      {!isSafe &&
        !acknowledged && ( // Additional confirmation for malicious and suspicious
          <TouchableOpacity
            style={[styles.warningButton, { backgroundColor: config.buttonColor }]}
            onPress={onAcknowledge}
          >
            <Text style={styles.buttonText}>I Understand These Risks{"\n"}And Wish To Proceed</Text>
          </TouchableOpacity>
        )}

      {/* Primary Action Button */}
      {canPerformAction && (isSafe || acknowledged) && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: config.buttonColor }]}
          onPress={contentType === "text" ? handleCopyText : onPerformAction}
        >
          <Text style={styles.buttonText}>{getActionButtonText(contentType)}</Text>
        </TouchableOpacity>
      )}

      {/* Sandbox Button (only for URLs and if not safe) */}
      {contentType === "url" && !isSafe && acknowledged && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#007AFF" }]} // A neutral color for sandbox
          onPress={() => Alert.alert("Sandbox Feature", "Opening in sandbox environment is not yet implemented.")}
        >
          <Text style={styles.buttonText}>Open in Sandbox Environment</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>Back to Scan</Text>
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
    marginTop: 60,
    marginBottom: 30,
  },
  resultBox: {
    width: 300,
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginBottom: 24,
    elevation: 2,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  contentTypeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  url: {
    fontSize: 15,
    color: "#2980b9",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  back: {
    color: "#444",
    fontSize: 15,
    marginTop: 10,
  },
  warningButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    opacity: 0.9,
  },
})
