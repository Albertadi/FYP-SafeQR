// app/(tabs)/index.tsx
import { recordScan } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import { useIsFocused } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';


export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean|null>(null);
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned =  async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    alert(`Scanned ${type}: ${data}`);

    try {
      // Get current session for authenticated user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        console.warn('No authenticated user, skipping recordScan');
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
      console.error('Error in handleBarCodeScanned:', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    paragraph: {
      fontSize: 16,
      marginBottom: 100,
    },
    cameraContainer: {
      width: '80%',
      aspectRatio: 1,
      overflow: 'hidden',
      borderRadius: 10,
      marginBottom: 40,
    },
    camera: {
      flex: 1,
    },
    button: {
      backgroundColor: 'blue',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  

  if (hasPermission === null) return <Text>Requesting camera permission…</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {scanned && (
        <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}
