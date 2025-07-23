"use client"

// app/scanResults.tsx
import ResultTemplate from "@/components/scanner/Results";
import type { ParsedQRContent, QRContentType } from "@/utils/qrParser"; // Import parseQrContent and types

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native"; // Corrected import for Alert

export default function ScanResultScreen() {
  const router = useRouter()
  // Update useLocalSearchParams to receive all new params
  const { type, originalContent, contentType, parsedData } = useLocalSearchParams<{
    type: string
    originalContent: string
    contentType: QRContentType // Use the imported type
    parsedData: string // It will be a stringified JSON
  }>()

  const [canPerformAction, setCanPerformAction] = useState(false) // Renamed from validURL
  const [userAcknowledge, setUserAcknowledge] = useState(false)

  // Parse parsedData back into an object
  let parsedContentData: ParsedQRContent["data"] | undefined
  try {
    if (parsedData) {
      parsedContentData = JSON.parse(parsedData)
    }
  } catch (e) {
    console.error("Failed to parse parsedData JSON:", e)
  }

  useEffect(() => {
    if (!originalContent || !contentType) {
      setCanPerformAction(false)
      return
    }

    // All these types are considered "actionable" to show a button
    const actionableTypes: QRContentType[] = ["url", "sms", "tel", "mailto", "wifi", "text"]

    if (actionableTypes.includes(contentType)) {
      if (contentType === "url") {
        // For URLs, still check if Linking can open it as it's an external navigation
        Linking.canOpenURL(originalContent)
          .then(setCanPerformAction)
          .catch(() => setCanPerformAction(false))
      } else {
        // For SMS, Tel, Mailto, Wifi, and Text, the button should always appear.
        // The actual action attempt will be handled in handlePerformAction.
        setCanPerformAction(true)
      }
    } else {
      setCanPerformAction(false)
    }
  }, [originalContent, contentType])

  const handleBack = () => setTimeout(() => router.replace("/"), 0) // Wrap in setTimeout

  const handleAcknowledge = () => setUserAcknowledge(true)

  const handlePerformAction = async () => {
    if (!originalContent || !contentType || !parsedContentData) return

    switch (contentType) {
      case "url":
        const supportedUrl = await Linking.canOpenURL(originalContent)
        if (supportedUrl) {
          await Linking.openURL(originalContent)
        } else {
          Alert.alert("Error", "URL not valid.")
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
        // For Wi-Fi, provide details as Linking.openURL doesn't directly connect to Wi-Fi networks
        Alert.alert(
          "Wi-Fi Details",
          `SSID: ${parsedContentData.ssid || "N/A"}\nSecurity: ${parsedContentData.authentication || "N/A"}\nPassword: ${parsedContentData.password || "None"}\n\nPlease connect manually using these details.`,
        )
        break
      case "text":
        // This case is handled directly in ResultTemplate for "Copy Text"
        // No action needed here as ResultTemplate calls handleCopyText directly for 'text' type
        break
      default:
        Alert.alert("Error", "Unsupported content type for direct action.")
    }
  }

  if (!type || !originalContent || !contentType || !parsedContentData) return null

  return (
    <ResultTemplate
      status={type as "safe" | "malicious" | "suspicious"}
      originalContent={originalContent}
      contentType={contentType}
      parsedContent={parsedContentData} // Pass the parsed object
      canPerformAction={canPerformAction} // Pass the state variable
      acknowledged={userAcknowledge}
      onAcknowledge={handleAcknowledge}
      onBack={handleBack}
      onPerformAction={handlePerformAction} // Pass the new generic action handler
    />
  )
}
