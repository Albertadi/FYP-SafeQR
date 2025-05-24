// app/(tabs)/index.tsx
import LandingOverlay from '@/components/LandingOverlay';
import { handleQRScanned, pickImageAndScan } from '@/utils/scanner';

import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import { requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [translucent, setTranslucent] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [frameLayout, setFrameLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const isFocused = useIsFocused();
  const router = useRouter();

  /*----------------------------------------------------------------------------
  Request permissions once when accessing application for the first time
  ------------------------------------------------------------------------------*/
  // Request camera permission
  useEffect(() => {
    if (cameraPermission === null) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');
      })();
    }
  }, []);

  //Request gallery permission
  useEffect(() => {
    if (galleryPermission === null) {
      (async () => {
        const { status } = await requestMediaLibraryPermissionsAsync();
        setGalleryPermission(status === 'granted');
      })();
    }
  }, []);

  // Redirect users to custom permission denied pages 
  if (cameraPermission === false) {
    router.replace('/cameraPermissionDenied');
    return null; // Prevents current screen from rendering anything while user is granting permissions
  }

  if (galleryPermission === false) {
    router.replace('/galleryPermissionDenied');
    return null; // Prevents current screen from rendering anything while user is granting permissions
  }

  /*----------------------------------------------------------------------------
  Resets scanned status to prevent scanner remaining disabled undeer these conditions:
  1) User navigates away from the screen and comes back
  2) Scanner loses focus during scanning
  ------------------------------------------------------------------------------*/
  useEffect(() => {
    if (!isFocused && scanned) setScanned(false);
  }, [isFocused]);

  const onGalleryScanComplete = () => {
    setScanned(false);
  };

  /*----------------------------------------------------------------------------
    Return to landing page functionality with Android back button. 
  ------------------------------------------------------------------------------*/
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (showLanding && translucent) {
          setTranslucent(false); // Switch from translucent to opaque overlay
          setTorchEnabled(false); // Ensure torch is turned off
          return true; // Prevent app exit on first press
        }
        return false; // Allow exit of app on second press
      };
      const backButton = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backButton.remove();
    }, [showLanding, translucent])
  );

  /*----------------------------------------------------------------------------
    Torch function
  ------------------------------------------------------------------------------*/
  const toggleTorch = () => {
    setTorchEnabled((prev) => !prev);
  };

  /*----------------------------------------------------------------------------
    Index tab display
  ------------------------------------------------------------------------------*/
  //Variable to store layout dimensions and pass values to LandingOverlay so that app can swap between landing page and scanning page
  const handleFrameLayoutChange = (layout: { x: number; y: number; width: number; height: number }) => {
    setFrameLayout(layout)
  };

  //Landing page is loaded only once and shown by default
  if (showLanding && !translucent) {
    return (
      <SafeAreaView style={styles.container}>
        <LandingOverlay
          translucent={false}
          onPressCamera={() => {
            setTranslucent(true);
            setShowLanding(true);
          }}
          onFrameLayoutChange={handleFrameLayoutChange} // Pass layout dimensions used for translucent layout to LandingOverlay.tsx
          onPressGallery={async () => { // Calls functions from scanner.ts to handle scans from gallery. After scan, prepare for next QR scan
            try {
              const result = await pickImageAndScan(handleQRScanned);
              if (result?.status?.toLowerCase() === 'safe') {
                router.replace({ pathname: '/safeResults', params: { url: result.url } });
              } else if (result?.status === 'malicious' || result?.status === 'suspicious') {
                router.replace({ pathname: '/maliciousResult', params: { url: result.url } });
              } else {
                alert('Scan failed or unverified. Please try again.'); //replace with custom alert
              }
            } catch (err) {
              console.error('Gallery scan error:', err);
              alert('An unexpected error occurred. Please try again.'); //replace with custom alert
            }
            finally {
              onGalleryScanComplete();
            }
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    // Loads a live camera view
    <SafeAreaView style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : async ({ type, data }) => {
            setScanned(true); //Prevents camera from non-stop scanning while loading next screen
            try {
              const result = await handleQRScanned({ type, data });

              if (result?.status.toLowerCase() === 'safe') {
                router.replace({ pathname: '/safeResults', params: { url: result.url } });
              } else if (result?.status === 'malicious' || result?.status === 'suspicious') {
                router.replace({ pathname: '/maliciousResult', params: { url: result.url } });
              } else {
                alert('Scan failed or unverified. Please try again.'); //replace with custom alert
                setScanned(false);
              }
            } catch (err) {
              console.error('Live camera scan error:', err);
              alert('An unexpected error occurred. Please try again.'); //replace with custom alert
            }
          }}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }} //Read only QR codes
          enableTorch={torchEnabled ? true : false} //Adds torch function if user's environment is too dark
        />
      )}

      {showLanding && translucent && ( //Loads a translucent overlay on top of live camera view. Used to ensure visibility for all other elements on screen.
        <LandingOverlay
          translucent={true}
          frameLayout={frameLayout} // Pass measured frameLayout for live camera cutout
          torchEnabled={torchEnabled}
          onPressCamera={() => { // Resets everything to default values
            setShowLanding(false);
            setTranslucent(false);
            setTorchEnabled(false);
          }}
          onToggleFlashlight={toggleTorch} //Toggles torch added in camera view
          onPressGallery={async () => { // Calls functions from scanner.ts to handle scans from gallery. After scan, prepare for next QR scan
            try {
              const result = await pickImageAndScan(handleQRScanned);
              if (result?.status?.toLowerCase() === 'safe') {
                router.replace({ pathname: '/safeResults', params: { url: result.url } });
              } else if (result?.status === 'malicious' || result?.status === 'suspicious') {
                router.replace({ pathname: '/maliciousResult', params: { url: result.url } });
              } else {
                alert('Scan failed or unverified. Please try again.'); //replace with custom alert
              }
            } catch (err) {
              console.error('Gallery scan error:', err);
              alert('An unexpected error occurred. Please try again.'); //replace with custom alert
            }
            finally {
              onGalleryScanComplete();
            }
          }}
        />
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
