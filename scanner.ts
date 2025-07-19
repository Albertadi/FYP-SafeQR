// utils/scanner.ts
import { Camera } from "expo-camera";
import { launchImageLibraryAsync } from "expo-image-picker";
import { recordScan } from "./api";
import { checkUrlSafety as checkWithGoogle } from "./GoogleSafeAPI";
import { checkUrlWithML } from "./mlAPI";
import { parseQrContent, type ParsedQRContent, type QRContentType } from "./qrParser";
import { supabase } from "./supabase";

// Whitelisted domains
const TRUSTED_DOMAINS = [
  'google.com',
  'youtube.com',
  'youtu.be',
  'apple.com',
  'microsoft.com',
  'twitch.tv',
  'https://www.twitch.tv/gorgc',
  'instagram.com'

];

// Only need to update the ScanResult type definition
export type ScanResult =
  | {
      status: "safe" | "malicious" | "suspicious";
      originalContent: string;
      contentType: QRContentType;
      parsedData: ParsedQRContent["data"];
      flaggedBy?: "google" | "ml" | "both" | "whitelist"; // Added "whitelist" here
    }
  | undefined;


export async function handleQRScanned({ type, data }: { type: string; data: string }): Promise<ScanResult> {
  try {
    if (typeof type !== "string" || typeof data !== "string" || data.trim() === "") {
      console.warn("Invalid QR scan data received, ignoring.");
      return;
    }

    const trimmedData = data.trim();
    const parsedContent = parseQrContent(trimmedData);

    if (parsedContent.contentType !== "url") {
      return {
        status: "safe",
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
      };
    }

    // Add this whitelist check right before API calls
    try {
      const domain = new URL(parsedContent.data.url).hostname.replace('www.', '');
      if (TRUSTED_DOMAINS.some(trusted => domain.endsWith(trusted))) {
        return {
          status: "safe",
          originalContent: trimmedData,
          contentType: parsedContent.contentType,
          parsedData: parsedContent.data,
          flaggedBy: "whitelist"
        };
      }
    } catch (e) {
      console.log("URL parsing error, proceeding with checks:", e);
    }

    // Rest of your original code remains unchanged below
    const [googleResult, mlResult] = await Promise.all([
      checkWithGoogle(parsedContent.data.url),
      checkUrlWithML(parsedContent.data.url),
    ]);

    let status: "safe" | "malicious" | "suspicious";
    let flaggedBy: "google" | "ml" | "both" | undefined;

    if (googleResult === "Malicious" && mlResult.prediction === "Malicious") {
      status = "malicious";
      flaggedBy = "both";
    } else if (googleResult === "Malicious") {
      status = "malicious";
      flaggedBy = "google";
    } else if (mlResult.prediction === "Malicious") {
      status = "malicious";
      flaggedBy = "ml";
    } else if (mlResult.score > 0.5) {
      status = "suspicious";
    } else {
      status = "safe";
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      console.warn("No authenticated user, skipping recordScan");
      return {
        status,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        flaggedBy,
      };
    }

    const payload = {
      user_id: session.user.id,
      decoded_content: trimmedData,
      security_status: status,
      content_type: parsedContent.contentType,
    };

    try {
      const inserted = await recordScan(payload);
      console.log("Scan recorded:", inserted);
      return {
        status,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        flaggedBy,
      };
    } catch (insertError) {
      console.error("Failed to record scan:", insertError);
      return {
        status,
        originalContent: trimmedData,
        contentType: parsedContent.contentType,
        parsedData: parsedContent.data,
        flaggedBy,
      };
    }
  } catch (err) {
    console.error("Error in handleQRScanned:", err);
    return;
  }
}

// pickImageAndScan remains completely unchanged
export async function pickImageAndScan(
  handleQRScanned: (result: { type: string; data: string }) => Promise<ScanResult>,
): Promise<ScanResult> {
  const result = await launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });

  if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    if (!uri || typeof uri !== "string") {
      console.warn("Invalid image URI");
      return;
    }
    try {
      const scanResult = await Camera.scanFromURLAsync(uri, ["qr"]);
      console.log("Gallery Scan");
      if (Array.isArray(scanResult) && scanResult.length > 0) {
        const { type, data } = scanResult[0];
        if (type.toString() === "256" && typeof data === "string") {
          const type = "qr";
          return handleQRScanned({ type, data });
        }
      }
    } catch (err) {
      console.error("Failed to scan image:", err);
    }
  }
}