// components/PermissionScreen.tsx
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  permType?: 'camera' | 'gallery';
  onOpenSettings?: () => void;
  onBack?: () => void;
};

const configMap = {
  camera: {
    image: require('@/assets/images/permissions/camera_denied.png'),
    title: 'Unable to access camera',
    message: "Please ensure that SafeQR has permission to access your camera in your device's settings.",
  },
  gallery: {
    image: require('@/assets/images/permissions/gallery_denied.png'),
    title: 'Unable to access gallery',
    message: "Please ensure that SafeQR has permission to access your gallery in your device's settings.",
  },
};

export default function PermissionScreen({ permType, onOpenSettings, onBack }: Props) {
  const config = configMap[permType as 'camera' | 'gallery'];

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Image
          source={config.image}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>

      <TouchableOpacity  style={styles.button} onPress={onOpenSettings}>
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity  style={[styles.button, {marginTop : 16}]} onPress={onBack}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 32,
  },
  icon: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
