import { checkUrlSafety } from "@/utils/GoogleSafeAPI"
import { parseQrContent, type ParsedQRContent, type QRContentType } from "@/utils/qrParser"
import { supabase } from "@/utils/supabase"
import { Camera } from "expo-camera"
import { launchImageLibraryAsync } from "expo-image-picker"

export type ScanResult =
  | {
    status: string;
    originalContent: string;
    contentType: QRContentType;
    parsedData: ParsedQRContent["data"];
    scan_id?: string
  }
  | undefined

export interface QRScan {
  scan_id: string
  user_id: string
  decoded_content: string
  security_status: string
  content_type: QRContentType // Added content_type
  scanned_at: string
}

// -------------------------------
// QR SCAN APIs
// -------------------------------

export async function recordScan(
  payload: Pick<QRScan, "user_id" | "decoded_content" | "security_status" | "content_type">, // Updated payload type
): Promise<QRScan> {
  const { data, error } = await supabase.from("qr_scans").insert([payload]).select().single()

  if (error) throw error
  return data
}

export async function getScanByID(scan_id: string): Promise<QRScan> {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("scan_id", scan_id)
    .single()

  if (error) throw error
  return data
}

// Get scan history for a user
export async function getScanHistory(
  user_id: string,
  sortField: "scanned_at" | "decoded_content" = "scanned_at",
  sortOrder: "asc" | "desc" = "desc"
): Promise<QRScan[]> {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("user_id", user_id)
    .order(sortField, { ascending: sortOrder === "asc" });

  if (error) throw error;
  return data;
}

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
        scan_id: undefined,
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
        scan_id: inserted.scan_id
      }
    } catch (insertError) {
      console.error("Failed to record scan:", insertError)
      // Still return the scan result even if DB insert fails
      return {
        status: securityStatus,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        scan_id: undefined,
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

// -------------------------------
// Webpage APIs
// -------------------------------

export async function fetchSanitizedHTML(url: string): Promise<string> {
  try {
    const res = await fetch("https://piixwjacgfuymsdixbiw.supabase.co/functions/v1/sanitize-webpage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Fetch failed with status ${res.status}: ${errorText}`);
    }
    return await res.text();
  } catch (error) {
    console.error("Error fetching sanitized HTML:", error);
    throw error;
  }
}

