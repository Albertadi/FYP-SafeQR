// app/(tabs)/index.tsx
import { recordScan } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import LandingOverlay from '@/components/LandingOverlay';

import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, BackHandler  } from 'react-native';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [translucent, setTranslucent] = useState(false);
  const [frameLayout, setFrameLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const isFocused = useIsFocused();


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) setScanned(false);
  }, [isFocused]);

  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      if (showLanding && translucent) {
        // Go back to opaque landing page
        setTranslucent(false);
        setTorchEnabled(false);
        return true; // Prevent default behavior
      }
      return false; // Allow default back behavior (exit screen)
    };

    const backButton = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backButton.remove();
  }, [showLanding, translucent])
);

  const toggleTorch = () => {
    setTorchEnabled((prev) => !prev);
  };

  const handleQRScanned = async ({ type, data }: { type: string; data: string }) => {
    alert(`Scanned ${type}: ${data}`); //placeholder
    setScanned(true);

    try {// Get current session for authenticated user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        console.warn('No authenticated user, skipping recordScan');
        // store on local storage. (Will probably have to do an import history once user signs up)
        return;
      }

      // Insert a new row into qr_scans
      const payload = {
        user_id: session.user.id,
        decoded_content: data,
        security_status: 'Safe',  // ← PLACEHOLDER SECURITY STATUS
      };

      try {
        const inserted = await recordScan(payload);
        console.log('Scan recorded:', inserted);
      } catch (insertError) {
        console.error('Failed to record scan:', insertError);
      }

    } catch (err) {
      console.error('Error in handleQRScanned:', err);
    }
  };

  if (hasPermission === null) return <Text>Requesting camera permission…</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  //swap between opaque & translucent landing pages
  const handleFrameLayoutChange = (layout: { x: number; y: number; width: number; height: number }) => {
    setFrameLayout(layout)
  };

  //load opaque landing page first
  if (showLanding && !translucent) {
    return (
      <SafeAreaView style={styles.container}>
        <LandingOverlay
          translucent={false}
          onPressCamera={() => {
            setTranslucent(true);
            setShowLanding(true);
          }}
          onFrameLayoutChange={handleFrameLayoutChange} //Pass layout callback used for translucent layout
        />
      </SafeAreaView>
    );
  }

  //load translucent layout & QR scanning function
  return (
    <SafeAreaView style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleQRScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          enableTorch={torchEnabled ? true : false}
        />
      )}

      {showLanding && translucent && (
        <LandingOverlay
          translucent={true}
          frameLayout={frameLayout} // Pass measured frameLayout for cutout overlays
          onPressCamera={() => {
            setShowLanding(false);
            setTranslucent(false);
            setTorchEnabled(false);
          }}
          onToggleFlashlight={toggleTorch}
        />
      )}

      {scanned && !showLanding && (
        <Button title="Tap to Scan Again" onPress={() => { setScanned(false); setShowLanding(true); setTranslucent(true); }} />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
