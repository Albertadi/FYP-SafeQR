"use client"

// app/scanResults.tsx
import ReportScanModal from "@/components/scanHistory/ReportScanModal";
import ResultTemplate from "@/components/scanner/Results";
import { getScanByID, type QRScan } from "@/controllers/scanController";
import type { ParsedQRContent, QRContentType } from "@/utils/qrParser"; // Import parseQrContent and types
import { supabase } from "@/utils/supabase";

import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Share } from "react-native"; // Corrected import for Alert

export default function ScanResultScreen() {
  const router = useRouter()
  // Update useLocalSearchParams to receive all new params including API results
  const { type, originalContent, contentType, parsedData, scan_id, googleResult, mlResult } = useLocalSearchParams<{
    type: string
    originalContent: string
    contentType: QRContentType // Use the imported type
    parsedData: string // It will be a stringified JSON
    scan_id: string
    googleResult?: string
    mlResult?: string // JSON stringified ML result
  }>()

  const [canPerformAction, setCanPerformAction] = useState(false) // Renamed from validURL
  const [userAcknowledge, setUserAcknowledge] = useState(false)
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [selectedScan, setSelectedScan] = useState<QRScan | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Parse parsedData back into an object
  let parsedContentData: ParsedQRContent["data"] | undefined
  try {
    if (parsedData) {
      parsedContentData = JSON.parse(parsedData)
    }
  } catch (e) {
    console.error("Failed to parse parsedData JSON:", e)
  }

  // Parse API results
  let parsedGoogleResult: "Safe" | "Suspicious" | "Malicious" | undefined
  let parsedMLResult: { prediction: "Safe" | "Suspicious" | "Malicious"; score: number } | undefined

  try {
    if (googleResult) {
      parsedGoogleResult = googleResult as "Safe" | "Suspicious" | "Malicious"
    }
    if (mlResult) {
      parsedMLResult = JSON.parse(mlResult)
    }
  } catch (e) {
    console.error("Failed to parse API results:", e)
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

  const handleOpenInSandbox = () => {
    router.push({ pathname: "/sandboxPreview", params: { url: encodeURIComponent(originalContent) } })
  }

  const handleCopyText = async () => {
    console.log("Copying:", originalContent)
    try {
      await Clipboard.setStringAsync(originalContent)
      Alert.alert("Copied", "Content copied to clipboard!")
    } catch (error) {
      Alert.alert("Error", "Failed to copy content.")
    }
  }

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: originalContent,
        url: originalContent, // For non-URL types, this might not be a valid URL, but it's the closest option for sharing.
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share content")
    }
  }

  const handleReport = async () => {
    if (!scan_id) {
      Alert.alert("Error", "No scan ID available to report. Please try again.")
      return
    }
    try {
      const scan = await getScanByID(scan_id)
      setSelectedScan(scan)
      setReportModalVisible(true)
    } catch (error) {
      console.error("Failed to fetch scan details:", error)
      Alert.alert("Error", "Failed to load scan details. Please try again.")
    }
  }

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
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, backgroundColor: "#FFF" }}>
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
        onOpenSandbox={handleOpenInSandbox}
        onCopyText={handleCopyText}
        onShareLink={handleShareLink}
        onReport={session ? handleReport : undefined}
        googleResult={parsedGoogleResult}
        mlResult={parsedMLResult}
      />

      <ReportScanModal
        visible={reportModalVisible}
        scan={selectedScan}
        onClose={() => setReportModalVisible(false)}
        onReportSubmitted={() => {
          setReportModalVisible(false)
          Alert.alert("Report Submitted", "Thank you for reporting this content.")
        }}
      />
    </ScrollView>
  )
}
