"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { signOut, updateUserAuth } from "@/controllers/authController"
import {
  getUserProfile,
  isUsernameAvailable,
  updateUsername,
  type UserProfile,
} from "@/controllers/userProfileController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface EditProfileScreenProps {
  session: any
  onBack: () => void
}

export default function EditProfileScreen({ session, onBack }: EditProfileScreenProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileError, setProfileError] = useState(false)

  // Form fields
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        // Fetch user profile from public users table
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
        setUsername(profile.username)
        setProfileError(false)
      } catch (error: any) {
        console.error("Error fetching user profile:", error)
        setProfileError(true)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [session])

  const handleUpdate = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required")
      return
    }

    // Check if username is already taken (excluding current user)
    try {
      const available = await isUsernameAvailable(username.trim(), session.user.id)
      if (!available) {
        Alert.alert("Error", "Username is already taken")
        return
      }
    } catch (error) {
      console.error("Error checking username availability:", error)
    }

    setLoading(true)
    try {
      // Prepare auth updates
      const authUpdates: any = {}

      // Update password if provided
      if (password.trim()) {
        if (password.length < 6) {
          Alert.alert("Error", "Password must be at least 6 characters long")
          setLoading(false)
          return
        }
        authUpdates.password = password
      }

      // Update user auth data only if password is being changed
      if (Object.keys(authUpdates).length > 0) {
        await updateUserAuth(authUpdates)
      }

      // Update username in public users table
      await updateUsername(session.user.id, username.trim())

      Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: onBack }])
    } catch (error: any) {
      console.error("Update error:", error)
      Alert.alert("Error", error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setProfileLoading(true)
    setProfileError(false)

    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
        setUsername(profile.username)
        setProfileError(false)
      } catch (error: any) {
        console.error("Error fetching user profile:", error)
        setProfileError(true)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Text style={[{ color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (profileError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Error Content */}
        <View style={styles.errorContainer}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={64} color={colors.secondaryText} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Profile Not Found</Text>
          <Text style={[styles.errorMessage, { color: colors.secondaryText }]}>
            We couldn't find your user profile. This might be a temporary issue.
          </Text>

          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={handleRetry}
            disabled={profileLoading}
          >
            <Text style={[styles.retryButtonText, { color: colors.background }]}>
              {profileLoading ? "Loading..." : "Try Again"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#F44336" }]} onPress={handleLogout}>
            <Text style={[styles.logoutButtonText, { color: "#fff" }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="person.crop.circle" size={60} color={colors.secondaryText} />
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor={colors.placeholderText}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password (leave blank to keep current)"
              placeholderTextColor={colors.placeholderText}
              secureTextEntry
            />
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: "#000" }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={[styles.updateButtonText, { color: "#fff" }]}>{loading ? "UPDATING..." : "UPDATE"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  changePhotoText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  form: {
    paddingHorizontal: 16,
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  updateButton: {
    marginHorizontal: 16,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
