"use client"

import { useRouter } from "expo-router"
import { useEffect } from "react"

export default function CallbackScreen() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthRedirect = async () => {
      router.replace("/(tabs)/register")
    }

    handleAuthRedirect()
  }, [])

  return null
}