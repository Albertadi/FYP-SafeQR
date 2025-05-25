import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { register, signIn } from '@/utils/api';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AuthScreen({ onDone }: { onDone(): void }) {
  const rawScheme = useColorScheme();
  const scheme    = rawScheme || 'light';
  const { background, text, tint } = Colors[scheme];

  const [mode, setMode]       = useState<'login'|'register'>('login');
  const [email, setEmail]     = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await register(email, password, username);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Mode Toggle */}
      <View style={styles.toggle}>
        {(['login','register'] as const).map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)}>
            <Text style={[
              styles.toggleText,
              {
                color: mode === m ? tint : Colors[scheme].tabIconDefault,
                fontWeight: mode === m ? 'bold' : '400'
              }
            ]}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Register needs username */}
      {mode === 'register' && (
        <TextInput
          placeholder="Username"
          placeholderTextColor={Colors[scheme].tabIconDefault}
          style={[styles.input, { borderColor: tint, color: text }]}
          value={username}
          onChangeText={setUsername}
        />
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor={Colors[scheme].tabIconDefault}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { borderColor: tint, color: text }]}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={Colors[scheme].tabIconDefault}
        secureTextEntry
        style={[styles.input, { borderColor: tint, color: text }]}
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonWrapper}>
        <Button
          title={loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          onPress={handle}
          color={background}
          disabled={loading}
        />
      </View>
      <Button title="Back" onPress={onDone} />
    </View>

  );
}

const styles = StyleSheet.create({
  container:     { flex:1, padding:20, justifyContent:'center' },
  toggle:        { flexDirection:'row', justifyContent:'center', marginBottom:24 },
  toggleText:    { fontSize:18, marginHorizontal:16 },
  input:         {
    borderWidth:1,
    borderRadius:6,
    padding:12,
    marginBottom:16
  },
  buttonWrapper: {
    marginTop:8,
    borderRadius:6,
    overflow:'hidden'
  },
});
