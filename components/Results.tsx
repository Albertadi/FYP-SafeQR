import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  status: 'safe' | 'malicious' | 'suspicious';
  url: string;
  onBack: () => void;
};

const statusConfig = {
  safe: {
    icon: 'checkmark-circle',
    color: 'green',
    title: 'Safe Link Detected',
    message: 'You can safely open this link.',
    buttonColor: 'green',
  },
  malicious: {
    icon: 'close-circle',
    color: 'red',
    title: 'Malicious Link Detected',
    message: 'Opening this link is not recommended.',
    buttonColor: 'red',
  },
  suspicious: {
    icon: 'alert-circle',
    color: 'orange',
    title: 'Suspicious Link Detected',
    message: 'Proceed with caution.',
    buttonColor: 'orange',
  },
};

export default function ResultTemplate({ status, url, onBack }: Props) {
  const config = statusConfig[status];

  const openLink = () => Linking.openURL(url);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SCANNING COMPLETE</Text>
      <Ionicons name={config.icon as any} size={80} color={config.color} style={{ marginVertical: 20 }} />
      <Text style={styles.resultText}>{config.title}</Text>
      <Text style={styles.subText}>{config.message}</Text>
      <Text style={styles.linkText}>{url}</Text>

      <TouchableOpacity
        style={[styles.openButton, { backgroundColor: config.buttonColor }]}
        onPress={openLink}
      >
        <Text style={styles.openButtonText}>Open Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backButton}>Back to Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  header: { fontSize: 20, fontWeight: 'bold' },
  resultText: { fontSize: 18, fontWeight: '600', marginTop: 10 },
  subText: { fontSize: 14, color: '#444', marginVertical: 10 },
  linkText: { fontSize: 16, color: 'blue', marginBottom: 20, textAlign: 'center' },
  openButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  openButtonText: { color: 'white', fontSize: 16 },
  backButton: { color: '#444', marginTop: 10 },
});
