import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Profile {
  user_id:        string;
  username:       string;
  role:           string;
  account_status: string;
  created_at:     string;
}

export default function HomeScreen({ session }: { session: any }) {
  const rawScheme = useColorScheme();
  const scheme    = rawScheme || 'light';
  const { background, text, tint } = Colors[scheme];

  const userId = session.user.id;
  const [profile, setProfile] = useState<Profile|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('users')
      .select('username, role, account_status, created_at')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }
        setProfile({ ...data, user_id: userId });
        setLoading(false);
      });
  }, [userId]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.loading, { backgroundColor: background }]}>
        <Text style={{ color: text }}>Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.welcome, { color: text }]}>
        Welcome, {profile.username}!
      </Text>
      <Text style={[styles.detail, { color: text }]}>
        Role: {profile.role}
      </Text>
      <Text style={[styles.detail, { color: text }]}>
        Status: {profile.account_status}
      </Text>
      <Text style={[styles.detail, { color: text }]}>
        Member since: {new Date(profile.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.signOutButton}>
        <Button title="Sign Out" onPress={signOut} color={background} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={tint} style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tint }]}
          onPress={signOut}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: Colors[scheme].background }]}>
            {'Sign Out'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, padding:20, alignItems:'center', justifyContent:'center' },
  welcome:      { fontSize:22, fontWeight:'bold', marginBottom:12 },
  detail:       { fontSize:16, marginBottom:8 },
  loading:      { flex:1, alignItems:'center', justifyContent:'center' },

  // signOutButton uses the built in Button component while button and buttonText is the custom button made using TouchableOpacity
  signOutButton:{ marginTop:24, width:'60%', borderRadius:6, overflow:'hidden' },
  button: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    // color is overridden inline from your palette
  },
});
