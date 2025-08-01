import { checkUrlSafety as checkGoogleSafety } from "@/utils/GoogleSafeAPI"

export interface MLPredictionResponse {
  score: number
  prediction: "Safe" | "Suspicious" | "Malicious"
}

export interface SafetyCheckResult {
  googleResult: "Safe" | "Malicious" | "Suspicious"
  mlResult: MLPredictionResponse
  overallStatus: "Safe" | "Suspicious" | "Malicious"
}

/**
 * Call the ML API to check URL safety
 */
export async function callMLAPI(url: string): Promise<MLPredictionResponse> {
  try {
    const response = await fetch("https://predict-service-748275252824.asia-southeast1.run.app/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(`ML API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return {
      score: data.score,
      prediction: data.prediction,
    }
  } catch (error) {
    console.error("ML API error:", error)
    throw new Error("Failed to analyze URL with ML service")
  }
}

/**
 * Check URL safety using both Google Safe Browsing API and ML API
 * Returns combined results and overall safety status
 */
export async function checkUrlSafetyComprehensive(url: string): Promise<SafetyCheckResult> {
  try {
    // Run both checks in parallel
    const [googleResult, mlResult] = await Promise.all([checkGoogleSafety(url), callMLAPI(url)])

    // Determine overall status based on both results
    let overallStatus: "Safe" | "Suspicious" | "Malicious"

    const isGoogleSafe = googleResult === "Safe"
    const isMLSafe = mlResult.prediction === "Safe"
    const isGoogleMalicious = googleResult === "Malicious"
    const isMLMalicious = mlResult.prediction === "Malicious"

    if (isGoogleSafe && isMLSafe) {
      // Both are safe
      overallStatus = "Safe"
    } else if (isGoogleMalicious && isMLMalicious) {
      // Both are malicious
      overallStatus = "Malicious"
    } else {
      // Any combination of suspicious/malicious from either API
      overallStatus = "Suspicious"
    }

    return {
      googleResult,
      mlResult,
      overallStatus,
    }
  } catch (error) {
    console.error("Error during comprehensive URL safety check:", error)
    throw error
  }
}

/**
 * Get safety status display text
 */
export function getSafetyStatusText(status: "Safe" | "Suspicious" | "Malicious"): string {
  switch (status) {
    case "Safe":
      return "Safe"
    case "Suspicious":
      return "Suspicious"
    case "Malicious":
      return "Malicious"
    default:
      return "Unknown"
  }
}

/**
 * Get safety status color
 */
export function getSafetyStatusColor(status: "Safe" | "Suspicious" | "Malicious"): string {
  switch (status) {
    case "Safe":
      return "#4CAF50"
    case "Suspicious":
      return "#FF9800"
    case "Malicious":
      return "#F44336"
    default:
      return "#666"
  }
}
