// components/Results.tsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  status: 'safe' | 'malicious' | 'suspicious';
  url: string;
  validURL?: boolean;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  onOpenSandbox?: () => void;
  onOpenLink?: () => void;
  onBack: () => void;

};

const statusConfig = {
  safe: {
    icon: 'checkmark-circle',
    color: '#2ecc71',
    title: 'Safe Link Detected',
    message: 'You can safely open this link.',
    buttonColor: '#2ecc71',
  },
  malicious: {
    icon: 'warning',
    color: '#e74c3c',
    title: 'WARNING!\nMalicious Link Detected',
    message: 'The QR you scanned leads to a malicious website or contain harmful content.',
    buttonColor: '#e74c3c',
  },
  suspicious: {
    icon: 'alert-circle',
    color: '#f39c12',
    title: 'WARNING!\nPotential Security Risk',
    message: 'The QR you have scanned may lead to a malicious website or contain harmful content.\nProceed with caution.',
    buttonColor: '#f39c12',
  },
};

export default function ResultTemplate({ status, url, validURL, acknowledged, onAcknowledge, onBack, onOpenSandbox, onOpenLink }: Props) {
  const config = statusConfig[status];
  const isSafe = status === 'safe'; // Safe ratings have slightly different UI from malicious or suspicious ratings

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SCANNING COMPLETE</Text>

      <View style={styles.resultBox}>
        <Ionicons
          name={config.icon as any}
          size={isSafe ? 60 : 120} // Bigger icon for malicious and suspicious ratings
          color={config.color}
          style={styles.icon} />
        <Text
          style={[
            styles.title,
            { color: config.color, fontSize: isSafe ? 18 : 24 }, // Bigger title for malicious and suspicious ratings
          ]}>
          {config.title}</Text>
        <Text style={styles.message}>{config.message}</Text>
      </View>

      <Text>Data scanned from QR Code:</Text>
      <Text style={styles.url}>{url}</Text>

      {validURL && !isSafe && !acknowledged && ( // Additional confirmation for malicious and suspicious
        <TouchableOpacity
          style={[styles.warningButton, { backgroundColor: config.buttonColor }]}
          onPress={onAcknowledge}>
          <Text style={styles.buttonText}>I Understand These Risks{"\n"}And Wish To Proceed</Text>
        </TouchableOpacity>
      )}

      {validURL && isSafe && ( // Open link without sandbox environment
        <TouchableOpacity
          style={[styles.button, { backgroundColor: config.buttonColor }]}
          onPress={onOpenLink}>
          <Text style={styles.buttonText}>Open Link</Text>
        </TouchableOpacity>)}

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>Back to Scan</Text>
      </TouchableOpacity>

      {validURL && !isSafe && acknowledged && ( // Open link in sandbox environment
        <TouchableOpacity
          style={[styles.button, { backgroundColor: config.buttonColor }]}
          onPress={onOpenSandbox}>
          <Text style={styles.buttonText}>Open in Sandbox Environment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 30,
  },
  resultBox: {
    width: 300,
    height: 300,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginBottom: 24,
    elevation: 2,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  url: {
    fontSize: 15,
    color: '#2980b9',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  back: {
    color: '#444',
    fontSize: 15,
    marginTop: 10,
  },
  warningButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    opacity: 0.9,
  },

});
