import { parseQrContent, type ParsedQRContent, type QRContentType } from "@/utils/qrParser"
import { supabase } from "@/utils/supabase"
import { checkUrlSafetyComprehensive, type SafetyCheckResult } from "@/utils/urlSafetyChecker"
import { Camera } from "expo-camera"
import { launchImageLibraryAsync } from "expo-image-picker"

export type ScanResult =
  | {
      status: string
      originalContent: string
      contentType: QRContentType
      parsedData: ParsedQRContent["data"]
      scan_id?: string
      googleResult?: "Safe" | "Suspicious" | "Malicious"
      mlResult?: { prediction: "Safe" | "Suspicious" | "Malicious"; score: number }
    }
  | undefined

export interface QRScan {
  scan_id: string
  user_id: string
  decoded_content: string
  security_status: string
  content_type: QRContentType
  scanned_at: string
  google_result?: string
  ml_result?: string
  ml_score?: number
}

// -------------------------------
// QR SCAN APIs
// -------------------------------

export async function recordScan(
  payload: Pick<QRScan, "user_id" | "decoded_content" | "security_status" | "content_type">,
): Promise<QRScan> {
  const { data, error } = await supabase.from("qr_scans").insert([payload]).select().single()

  if (error) throw error
  return data
}

export async function getScanByID(scan_id: string): Promise<QRScan> {
  const { data, error } = await supabase.from("qr_scans").select("*").eq("scan_id", scan_id).single()

  if (error) throw error
  return data
}

// Get scan history for a user
export async function getScanHistory(
  user_id: string,
  sortField: "scanned_at" | "decoded_content" = "scanned_at",
<<<<<<< HEAD
  sortOrder: "asc" | "desc" = "desc"
=======
  sortOrder: "asc" | "desc" = "desc",
>>>>>>> c54c43c52f3206b1ef0cfe2ba8c35cff0e0f42cb
): Promise<QRScan[]> {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("user_id", user_id)
<<<<<<< HEAD
    .order(sortField, { ascending: sortOrder === "asc" });
=======
    .order(sortField, { ascending: sortOrder === "asc" })
>>>>>>> c54c43c52f3206b1ef0cfe2ba8c35cff0e0f42cb

  if (error) throw error;
  return data;
}


export async function handleQRScanned({ type, data }: { type: string; data: string }): Promise<ScanResult> {
  try {
    // 1. Validate input
    if (typeof type !== "string" || typeof data !== "string" || data.trim() === "") {
      console.warn("Invalid QR scan data received, ignoring.")
      return undefined // Return undefined for invalid data
    }

    const trimmedData = data.trim()
    const parsedContent = parseQrContent(trimmedData)

    // 2. Determine security status using comprehensive checking
    let securityStatus: "Safe" | "Malicious" | "Suspicious"
    let safetyResult: SafetyCheckResult | null = null

    if (parsedContent.contentType === "url") {
      try {
        safetyResult = await checkUrlSafetyComprehensive(parsedContent.data.url)
        securityStatus = safetyResult.overallStatus
        console.log("URL safety check result:", safetyResult)
      } catch (error) {
        console.error("Error during comprehensive URL safety check:", error)
        securityStatus = "Suspicious" // Default to suspicious on error
      }
    } else {
      // For non-URL types, check for embedded URLs
      const embeddedUrlMatch = trimmedData.match(/(https?:\/\/[^\s]+)/i)
      if (embeddedUrlMatch && embeddedUrlMatch[0]) {
        try {
          safetyResult = await checkUrlSafetyComprehensive(embeddedUrlMatch[0])
          securityStatus = safetyResult.overallStatus
          console.log("Embedded URL safety check result:", safetyResult)
        } catch (error) {
          console.error("Error checking embedded URL:", error)
          securityStatus = "Suspicious" // Default to suspicious on error
        }
      } else {
        securityStatus = "Safe" // Default for non-URL content without embedded URLs
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
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        scan_id: undefined,
        googleResult: safetyResult?.googleResult,
        mlResult: safetyResult?.mlResult,
      }
    }

    // 5. Prepare data to store and record scan
    const payload = {
      user_id: session.user.id,
      decoded_content: trimmedData,
      security_status: securityStatus,
      content_type: parsedContent.contentType,
    }

    try {
      const inserted = await recordScan(payload)
      console.log("Scan recorded:", inserted)
      return {
        status: securityStatus,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        scan_id: inserted.scan_id,
        googleResult: safetyResult?.googleResult,
        mlResult: safetyResult?.mlResult,
      }
    } catch (insertError) {
      console.error("Failed to record scan:", insertError)
      // Still return the scan result even if DB insert fails
      return {
        status: securityStatus,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        scan_id: undefined, // Indicate that scan was not recorded
        googleResult: safetyResult?.googleResult,
        mlResult: safetyResult?.mlResult,
      }
    }
  } catch (err) {
    console.error("Error in handleQRScanned (outer catch):", err)
    return undefined // Return undefined for any unhandled errors
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
          const qrType = "qr"
          return handleQRScanned({ type: qrType, data })
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

// -------------------------------
// Webpage APIs
// -------------------------------

export async function fetchSanitizedHTML(url: string): Promise<string> {
  try {
    const res = await fetch("https://piixwjacgfuymsdixbiw.supabase.co/functions/v1/sanitize-webpage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Fetch failed with status ${res.status}: ${errorText}`)
    }
    return await res.text()
  } catch (error) {
    console.error("Error fetching sanitized HTML:", error)
    throw error
  }
}

// -------------------------------
// Additional utility functions
// -------------------------------

/**
 * Get scan statistics for a user
 */
export async function getScanStatistics(user_id: string): Promise<{
  total: number
  safe: number
  suspicious: number
  malicious: number
}> {
  const { data, error } = await supabase.from("qr_scans").select("security_status").eq("user_id", user_id)

  if (error) throw error

  const stats = {
    total: data.length,
    safe: 0,
    suspicious: 0,
    malicious: 0,
  }

  data.forEach((scan) => {
    switch (scan.security_status.toLowerCase()) {
      case "safe":
        stats.safe++
        break
      case "suspicious":
        stats.suspicious++
        break
      case "malicious":
        stats.malicious++
        break
    }
  })

  return stats
}

/**
 * Delete a scan record
 */
export async function deleteScan(scan_id: string, user_id: string): Promise<void> {
  const { error } = await supabase.from("qr_scans").delete().eq("scan_id", scan_id).eq("user_id", user_id)

  if (error) throw error
}

/**
 * Update scan security status (for admin purposes)
 */
export async function updateScanSecurityStatus(
  scan_id: string,
  new_status: "Safe" | "Suspicious" | "Malicious",
): Promise<QRScan> {
  const { data, error } = await supabase
    .from("qr_scans")
    .update({ security_status: new_status })
    .eq("scan_id", scan_id)
    .select()
    .single()

  if (error) throw error
  return data
}
