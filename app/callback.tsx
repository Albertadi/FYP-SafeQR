"use client"

import { supabase } from "@/utils/supabase"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect } from "react"
import { Alert } from "react-native"

export default function AuthCallbackScreen() {
  const router = useRouter()
  const { token, type } = useLocalSearchParams()

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (!token || typeof token !== "string") {
        Alert.alert("Missing or invalid token")
        router.replace("/(tabs)/register") // fallback
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(token)

      if (error) {
        Alert.alert("Login failed", error.message)
        router.replace("/(tabs)/register")
      } else {
        // Redirect to home page or wherever appropriate
        router.replace("/")
      }
    }

    handleAuthRedirect()
  }, [])

  return null
}
