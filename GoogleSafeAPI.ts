const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SAFE_BROWSING_KEY || ""; 

const SAFE_BROWSING_API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

export async function checkUrlSafety(url: string): Promise<'Safe' | 'Malicious' | 'Suspicious'> {
  try {
    const response = await fetch(
      `${SAFE_BROWSING_API_URL}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'FYP', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    const data = await response.json();
console.log('🟦 Google Safe Browsing API response:', JSON.stringify(data, null, 2));

if (data && data.matches && data.matches.length > 0) {
  return 'Malicious';
}
return 'Safe';


  } catch (error) {
    console.error('Google Safe Browsing API error:', error);
    // Default to Safe or Unsafe based on your preference
    return 'Suspicious';
  }
}

