import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function GetStarted({ onAuthPress }: { onAuthPress(): void }) {
    const rawScheme = useColorScheme();
  const scheme = rawScheme || 'light';
  const { background, text, tint } = Colors[scheme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.background}>
        {/* Logo Placeholder */}
        <View style={[styles.logoContainer, { backgroundColor: background }]}>
          <View style={styles.logoPlaceholder}>
            <Text style={{ color: text }}>Logo</Text>
          </View>
        </View>

        {/* Headline and Tagline */}
        <Text style={[styles.headline, { color: text }]}>Get Started</Text>
        <Text style={[styles.tagline, { color: text }]}>
          Scan smart. Stay safe. We've got your back.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tint }]}
            onPress={() => {
              // Placeholder for guest functionality
              console.log('Continue as guest');
            }}
          >
            <Text style={styles.primaryButtonText}>Proceed as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onAuthPress}
          >
            <Text  style={[styles.secondaryButtonText, { color: tint }]}>
              Login / Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoPlaceholder: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 