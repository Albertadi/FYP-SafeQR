// utils/scanner.ts
import { recordScan } from "./api"
import { supabase } from "./supabase"

import { Camera } from "expo-camera"
import { launchImageLibraryAsync } from "expo-image-picker"

import { checkUrlSafety } from "./GoogleSafeAPI"
import { parseQrContent, type ParsedQRContent, type QRContentType } from "./qrParser"

export type ScanResult =
  | { status: string; originalContent: string; contentType: QRContentType; parsedData: ParsedQRContent["data"] }
  | undefined

export async function handleQRScanned({ type, data }: { type: string; data: string }): Promise<ScanResult> {
  try {
    // 1. Validate input
    if (typeof type !== "string" || typeof data !== "string" || data.trim() === "") {
      console.warn("Invalid QR scan data received, ignoring.")
      return
    }

    const trimmedData = data.trim()
    const parsedContent = parseQrContent(trimmedData) // Use the new parser

    // 2. Determine security status
    let securityStatus: "Safe" | "Malicious" | "Suspicious"
    if (parsedContent.contentType === "url") {
      securityStatus = await checkUrlSafety(parsedContent.data.url)
    } else {
      // For non-URL types, assume safe unless specific checks are added later
      // Or if the content itself contains a URL that can be checked
      const embeddedUrlMatch = trimmedData.match(/(https?:\/\/[^\s]+)/i)
      if (embeddedUrlMatch && embeddedUrlMatch[0]) {
        securityStatus = await checkUrlSafety(embeddedUrlMatch[0])
      } else {
        securityStatus = "Safe" // Default for non-URL content
      }
    }

    // 3. Check if user is logged in
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // 4. If user is not logged in, return result without storing
    if (sessionError || !session?.user?.id) {
      console.warn("No authenticated user, skipping recordScan")
      return {
        status: securityStatus,
        originalContent: trimmedData, // Changed from url to originalContent
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
      }
    }

    // 5. Prepare data to store
    const payload = {
      user_id: session.user.id,
      decoded_content: trimmedData,
      security_status: securityStatus,
      content_type: parsedContent.contentType, // Pass the detected content type
    }

    try {
      const inserted = await recordScan(payload)
      console.log("Scan recorded:", inserted)
      return {
        status: securityStatus,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
      }
    } catch (insertError) {
      console.error("Failed to record scan:", insertError)
      // Still return the scan result even if DB insert fails
      return {
        status: securityStatus,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
      }
    }
  } catch (err) {
    console.error("Error in handleQRScanned:", err)
    return
  }
}

export async function pickImageAndScan(
  handleQRScanned: (result: { type: string; data: string }) => Promise<ScanResult>,
): Promise<ScanResult> {
  const result = await launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  })

  if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
    const uri = result.assets[0].uri
    if (!uri || typeof uri !== "string") {
      console.warn("Invalid image URI")
      return
    }
    try {
      const scanResult = await Camera.scanFromURLAsync(uri, ["qr"])
      console.log("Gallery Scan")
      if (Array.isArray(scanResult) && scanResult.length > 0) {
        const { type, data } = scanResult[0]
        if (type.toString() === "256" && typeof data === "string") {
          // QR Codes will always return type 256
          const type = "qr"
          return handleQRScanned({ type, data })
        } else {
          console.warn("Invalid QR scan result data")
        }
      } else {
        console.warn("No QR code found in the image")
      }
    } catch (err) {
      console.error("Failed to scan image:", err)
    }
  }
}
