"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { supabase } from "@/utils/supabase"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface ProfileScreenProps {
  session: any
  onEditProfile: () => void
}

export default function ProfileScreen({ session, onEditProfile }: ProfileScreenProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true)
          await supabase.auth.signOut()
          setLoading(false)
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone. Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // TODO: Implement account deletion
          Alert.alert("Feature Coming Soon", "Account deletion will be available in a future update.")
        },
      },
    ])
  }

  const handlePlaceholderAction = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="person.crop.circle" size={60} color={colors.secondaryText} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{session?.user?.user_metadata?.full_name || "User"}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{session?.user?.email}</Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.cardBackground }]}
            onPress={onEditProfile}
          >
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Setting</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={() => handlePlaceholderAction("Scan History")}
          >
            <IconSymbol name="clock.fill" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Scan History</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={() => handlePlaceholderAction("Report Details Form")}
          >
            <IconSymbol name="gear" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Report Details Form</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={handleDeleteAccount}
          >
            <IconSymbol name="trash.fill" size={20} color="#F44336" />
            <Text style={[styles.menuText, { color: "#F44336" }]}>Delete Account</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Other</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={() => handlePlaceholderAction("Support")}
          >
            <IconSymbol name="info.circle" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Support</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={() => handlePlaceholderAction("FAQ")}
          >
            <IconSymbol name="questionmark.circle" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>FAQ</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#000" }]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={[styles.logoutButtonText, { color: "#fff" }]}>{loading ? "LOGGING OUT..." : "LOG OUT"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 20,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
