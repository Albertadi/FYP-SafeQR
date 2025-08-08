"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import KeyboardAvoidingWrapper from "@/components/ui/KeyboardAvoidingWrapper"
import { Colors } from "@/constants/Colors"
import { getCurrentSession, updatePassword, updateUsername } from "@/controllers/authController"
import { getUserProfile, type UserProfile } from "@/controllers/userProfileController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { validatePassword, type PasswordValidation } from "@/utils/passwordComplexityChecker"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<any>(null)

  // Form fields
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordValidations, setPasswordValidations] = useState<PasswordValidation>({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    isValid: false,
  })

  useEffect(() => {
    // Get initial session
    getCurrentSession()
      .then((session) => setSession(session))
      .catch((err) => {
        console.error("Failed to get session:", err)
        setSession(null)
      })
  }, [])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        // Fetch user profile from public users table
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
        setUsername(profile.username)
      } catch (error: any) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [session])

  const onBack = () => {
    setLoading(false)
    router.replace("/(tabs)/register")
  }

  const handleUpdate = async () => {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirmPassword = confirmPassword.trim()

    if (!trimmedUsername) {
      Alert.alert("Error", "Username is required")
      return
    }

    if (trimmedPassword) {
      if (trimmedPassword !== trimmedConfirmPassword) {
        Alert.alert("Error", "Passwords do not match")
        return
      }

      const validations = validatePassword(trimmedPassword)
      if (!validations.isValid) {
        Alert.alert(
          "Weak Password",
          "Password must have at least 8 characters, include uppercase, lowercase, number, and special symbol."
        )
        return
      }
    }

    const usernameChanged = trimmedUsername !== userProfile?.username
    const passwordChanged = !!trimmedPassword

    if (!usernameChanged && !passwordChanged) {
      Alert.alert("No Changes", "No updates were made.")
      return
    }

    setLoading(true)

    try {
      if (usernameChanged) {
        await updateUsername(session.user.id, trimmedUsername)
      }

      if (passwordChanged) {
        const result = await updatePassword(trimmedPassword)
        if (result === null) {
          Alert.alert("Password Update Failed", "Password update timed out. Please try again")
          setLoading(false)
        }
      }

      const updatedProfile = await getUserProfile(session.user.id)
      if (!updatedProfile) {
        setLoading(false)
        throw new Error("Failed to fetch updated profile")
      }

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: onBack }])
    } catch (error: any) {
      console.error("Update failed:", error)
      Alert.alert("Error", error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingWrapper style={{ backgroundColor: colors.background }} keyboardVerticalOffset={50}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background}]}>
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
                placeholder="Enter new password (leave blank to keep current)"
                placeholderTextColor={colors.placeholderText}
                secureTextEntry
                onChangeText={(text) => {
                  setPassword(text)
                  setPasswordValidations(validatePassword(text))
                  if (text.length === 0) setConfirmPassword("")
                }}
              />
            </View>

            {/* Conditionally render Confirm Password only if password is typed */}
            {password.length > 0 && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.placeholderText}
                  secureTextEntry
                />
              </View>
            )}

          </View>

          {password.length > 0 && (
            <View style={{ marginTop: 15, marginLeft: 15}}>
              {[
                { label: "At least 8 characters", valid: validatePassword(password).length },
                { label: "At least one uppercase letter", valid: validatePassword(password).upper },
                { label: "At least one lowercase letter", valid: validatePassword(password).lower },
                { label: "At least one number", valid: validatePassword(password).number },
                { label: "At least one special character", valid: validatePassword(password).special },
              ].map((rule, idx) => (
                <Text
                  key={idx}
                  style={{
                    color: rule.valid ? "green" : "red",
                    fontSize: 12,
                  }}
                >
                  • {rule.label}
                </Text>
              ))}
            </View>
          )}

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
    </KeyboardAvoidingWrapper>
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
    //paddingVertical: 12,
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
