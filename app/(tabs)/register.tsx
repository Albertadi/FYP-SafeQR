import AuthScreen from "@/components/auth/AuthScreen"
import ProfileScreen from "@/components/profile/ProfileScreen"
import { supabase } from "@/utils/supabase"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

type ScreenMode = "auth" | "profile"

export default function RegisterTab() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [screenMode, setScreenMode] = useState<ScreenMode>("auth")

  useEffect(() => {
    // On mount load current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setScreenMode(data.session ? "profile" : "auth")
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setScreenMode(session ? "profile" : "auth")
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

  // Show different screens based on mode
  if (session && screenMode === "profile") {
    return <ProfileScreen session={session}/>
  }

  // Show auth screen if no session
  return <AuthScreen onDone={() => {}} />
}
