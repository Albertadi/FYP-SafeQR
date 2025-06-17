// app/(tabs)/register.tsx
import AuthScreen from '@/components/AuthScreen';
import GetStarted from '@/components/GetStarted';
import HomeScreen from '@/components/HomeScreen';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RegisterHomeScreen() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    // 1) On mount load current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2) Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  // 3) If no session → show login/register
  if (!session && showAuth) {
    return <AuthScreen onDone={() => setShowAuth(false)} />
  } else if (!session) {
    return <GetStarted onAuthPress={() => setShowAuth(true)} />
  }

  // 4) If logged in → show home
  return <HomeScreen session={session} />;
}
