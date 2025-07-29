"use client"

import { supabase } from "@/utils/supabase"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Alert } from "react-native"

export default function CallbackScreen() {
  const router = useRouter()
  const { token, type } = useLocalSearchParams()

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (!token || typeof token !== "string") {
        Alert.alert("Missing or invalid token")
        router.replace("/(tabs)/register")
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(token)

      if (error) {
        Alert.alert("Login failed", error.message)
        router.replace("/(tabs)/register")
        return
      }
      
      // Redirect based on type
      if (type === "signup") {
        Alert.alert("Email confirmed", "Your email has been confirmed. You can login now.")
        router.replace("/(tabs)/register")
      } 
      else if (type === "recovery") {
        router.replace({
          pathname: "/reset-password",
          params: { token },})
      } else {
        // fallback
        router.replace("/(tabs)/register")
      }
    }

    handleAuthRedirect()
  }, [])

  return null
}