/* safetyCheckService.ts
import axios from 'axios';

// Define the API response type
type SafetyCheckResult = {
  score: number;
  prediction: 'Safe' | 'Malicious';
};

const API_URL = 'https://predict-service-748275252824.asia-southeast1.run.app/predict';

/**
 * Checks if a URL is safe using the ML API.
 * @param url The URL to check.
 * @returns Promise<SafetyCheckResult>
 
export const checkUrlSafety = async (url: string): Promise<SafetyCheckResult> => {
  try {
    const response = await axios.post<SafetyCheckResult>(
      API_URL,
      { url },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('Safety check failed:', error);
    throw new Error('Failed to verify URL safety');
  }
};
*/
// To run ML API use code below
// Invoke-WebRequest -Uri "https://predict-service-748275252824.asia-southeast1.run.app/predict" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"url":"https://www.google.com"}'


// utils/mlAPI.ts
type MLResult = {
  score: number;
  prediction: "Safe" | "Malicious";
};

/**
 * Calls your ML prediction service.
 */
export const checkUrlWithML = async (url: string): Promise<MLResult> => {
  const response = await fetch("https://predict-service-748275252824.asia-southeast1.run.app/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return response.json();
};