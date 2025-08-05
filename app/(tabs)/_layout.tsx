"use client"

import { Tabs, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Platform } from "react-native"

import { HapticTab } from "@/components/ui/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { Colors } from "@/constants/Colors"
import {
  getCurrentSession,
  lastSignOutDueToSuspension,
  lastSuspensionEndDate,
  onAuthStateChange,
  resetSuspensionFlag,
} from "@/controllers/authController"
import { useColorScheme } from "@/hooks/useColorScheme"

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    getCurrentSession()
      .then((session) => setSession(session))
      .catch((err) => {
        console.error("Failed to get session:", err)
        setSession(null)
      })

    // Listen for auth changes
    const { data } = onAuthStateChange((_event, session) => {
      if (_event === "PASSWORD_RECOVERY") {
        console.log("Navigating to password reset screen...")
        router.replace("/reset-password")
        return
      }

      if (!session && lastSignOutDueToSuspension) {
        const untilDate = lastSuspensionEndDate ? ` until ${new Date(lastSuspensionEndDate).toLocaleString()}` : ""

        Alert.alert("Signed Out", `Your account has been suspended ${untilDate} and you have been signed out.`, [
          { text: "OK", onPress: () => resetSuspensionFlag() },
        ])
      }
      setSession(session)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="newspaper" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate-qr"
        options={{
          title: "Generate QR",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.checkered" color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode.viewfinder" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan-history"
        options={{
          title: "Scan History",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: session ? "Home" : "Register",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={session ? "house.fill" : "person.crop.circle.badge.plus"} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
