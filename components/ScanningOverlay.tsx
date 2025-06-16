// components/ScanningOverlay.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  translucent?: boolean;
  frameLayout?: { x: number; y: number; width: number; height: number } | null;
  onPressCamera: () => void;
  onFrameLayoutChange?: (layout: { x: number; y: number; width: number; height: number }) => void;
  onToggleFlashlight?: () => void;
  torchEnabled?: boolean;
  onPressGallery?: () => void;
};

export default function ScanningOverlay({
  translucent = false, frameLayout, onPressCamera, onFrameLayoutChange, onToggleFlashlight, torchEnabled = false, onPressGallery }: Props) {
  return (
    <View style={[styles.container, translucent ? styles.transparent : styles.opaque]}>
      {/* Cutout Mask if translucent */}
      {translucent && frameLayout && (
        <>
          <View style={[styles.overlayBlock, { top: 0, left: 0, right: 0, height: frameLayout.y }]} />
          <View style={[styles.overlayBlock, { top: frameLayout.y + frameLayout.height, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.overlayBlock, { top: frameLayout.y, height: frameLayout.height, left: 0, width: frameLayout.x }]} />
          <View style={[styles.overlayBlock, { top: frameLayout.y, height: frameLayout.height, left: frameLayout.x + frameLayout.width, right: 0 }]} />
        </>
      )}

      <Text style={styles.title}>Scan QR code</Text>
      <Text style={styles.subtitle}>
        Place QR code inside the frame to scan{'\n'}Keep your device steady to get results quickly
      </Text>

      <Image
        source={
          translucent
            ? require('@/assets/images/qr_frame.png')
            : require('@/assets/images/qr_frame_placeholder.png')
        }
        style={styles.qrImage}
        resizeMode="contain"
        onLayout={
          !translucent && onFrameLayoutChange
            ? (event: LayoutChangeEvent) => {
              onFrameLayoutChange(event.nativeEvent.layout);
            }
            : undefined} />

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={translucent ? undefined : onPressCamera}>
        <Ionicons name="camera-outline" size={32} color="black" />
      </TouchableOpacity>

      <View style={styles.bottomIcons}>
        <TouchableOpacity style={styles.iconCircle} onPress={onToggleFlashlight}>
          <Ionicons name={torchEnabled ? 'flashlight' : 'flashlight-outline'} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCircle} onPress={onPressGallery}>
          <MaterialIcons name="photo-library" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  opaque: {
    backgroundColor: 'rgb(255,255,255)',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  bottomIcons: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  iconCircle: {
    backgroundColor: '#eee',
    borderRadius: 32,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayBlock: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
