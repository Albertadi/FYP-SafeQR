"use client"

import AuthScreen from "@/components/AuthScreen"
import HomeScreen from "@/components/HomeScreen"
import { supabase } from "@/utils/supabase"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

export default function RegisterTab() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount load current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // Main content based on session state
  if (session) {
    return <HomeScreen session={session} />
  }

  // Show auth screen directly if no session
  return <AuthScreen onDone={() => {}} />
}
