"use client"

import LoginRequiredScreen from "@/components/LoginRequiredScreen"
import ScanHistoryList from "@/components/ScanHistoryScreen"
import { supabase } from "@/utils/supabase"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

export default function ScanHistoryScreen() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setLoading(false)
    }

    checkAuth()

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

  // Show login prompt if not authenticated
  if (!session) {
    return <LoginRequiredScreen />
  }

  // Show scan history if authenticated
  return <ScanHistoryList />
}
