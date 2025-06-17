import AuthScreen from "@/components/AuthScreen"
import EditProfileScreen from "@/components/EditProfileScreen"
import ProfileScreen from "@/components/ProfileScreen"
import { supabase } from "@/utils/supabase"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

type ScreenMode = "auth" | "profile" | "editProfile"

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
  if (screenMode === "editProfile") {
    return <EditProfileScreen session={session} onBack={() => setScreenMode("profile")} />
  }

  if (session && screenMode === "profile") {
    return <ProfileScreen session={session} onEditProfile={() => setScreenMode("editProfile")} />
  }

  // Show auth screen if no session
  return <AuthScreen onDone={() => {}} />
}
