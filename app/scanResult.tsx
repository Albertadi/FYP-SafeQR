// app/scanResults.tsx
import ResultTemplate from '@/components/scanner/Results';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

export default function ScanResultScreen() {
  const router = useRouter();
  const { type, url } = useLocalSearchParams<{ type: string; url: string }>();
  const [validURL, setvalidURL] = useState(false);
  const [useracknowledge, setuseracknowledge] = useState(false);

  useEffect(() => {
    if (url) {
      Linking.canOpenURL(url)
        .then(setvalidURL)
        .catch(() => setvalidURL(false));
    }}, [url]);

  const handleBack = () => router.replace('/');

  const handleAcknowledge = () => setuseracknowledge(true);

  const openLink = async () => {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url); // maybe do additional checks before opening
      } else {
        alert('URL not valid.'); // replace with custom alerts
      }
    };

  const openInSandbox = () => {
    // Replace this with your actual sandbox logic
    //Linking.openURL(`https://sandbox-browser.example.com?url=${encodeURIComponent(url)}`);
    console.log("Opening in sandbox environment...")
  };

  if (!type || !url) return null;

  return (
    <ResultTemplate
      status={type as 'safe' | 'malicious' | 'suspicious'}
      url={url}
      validURL={validURL}
      acknowledged={useracknowledge}
      onAcknowledge={handleAcknowledge}
      onBack={handleBack}
      onOpenSandbox={openInSandbox}
      onOpenLink={openLink}
    />
  );
}
