"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { updateUserAuth } from "@/controllers/authController"
import {
  createUserProfile,
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

  // Form fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [birthDay, setBirthDay] = useState("1")
  const [birthMonth, setBirthMonth] = useState("1")
  const [birthYear, setBirthYear] = useState("2000")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("Active")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        // Load current user data from auth
        setFullName(session.user.user_metadata?.full_name || "")
        setEmail(session.user.email || "")

        // Fetch user profile from public users table
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
        setUsername(profile.username)
        setStatus(profile.account_status)
      } catch (error: any) {
        console.error("Error fetching user profile:", error)
        // If user doesn't exist in users table, create a basic entry
        if (error.code === "PGRST116") {
          try {
            const defaultUsername = session.user.email?.split("@")[0] || "user"
            const newProfile = await createUserProfile(session.user.id, defaultUsername, session.user.email || "")
            setUserProfile(newProfile)
            setUsername(newProfile.username)
            setStatus(newProfile.account_status)
          } catch (createError) {
            console.error("Error creating user profile:", createError)
          }
        }
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [session])

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required")
      return
    }

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
      const authUpdates: any = {
        data: {
          full_name: fullName,
        },
      }

      // Update email if changed
      if (email !== session.user.email) {
        authUpdates.email = email
      }

      // Update password if provided
      if (password.trim()) {
        if (password.length < 6) {
          Alert.alert("Error", "Password must be at least 6 characters long")
          setLoading(false)
          return
        }
        authUpdates.password = password
      }

      // Update user auth data
      await updateUserAuth(authUpdates)

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

  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Text style={[{ color: colors.text }]}>Loading profile...</Text>
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
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Profile picture upload will be available soon")}>
            <Text style={[styles.changePhotoText, { color: colors.tint }]}>Change Profile Pic</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.placeholderText}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

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
            <Text style={[styles.label, { color: colors.text }]}>Birth Date</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { borderColor: colors.borderColor, color: colors.text }]}
                value={birthDay}
                onChangeText={setBirthDay}
                placeholder="DD"
                placeholderTextColor={colors.placeholderText}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { borderColor: colors.borderColor, color: colors.text }]}
                value={birthMonth}
                onChangeText={setBirthMonth}
                placeholder="MM"
                placeholderTextColor={colors.placeholderText}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.dateInput, { borderColor: colors.borderColor, color: colors.text }]}
                value={birthYear}
                onChangeText={setBirthYear}
                placeholder="YYYY"
                placeholderTextColor={colors.placeholderText}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
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

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={[styles.input, { borderColor: colors.borderColor, justifyContent: "center" }]}>
              <Text style={[{ color: colors.text }]}>{status}</Text>
            </View>
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
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "center",
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
})
