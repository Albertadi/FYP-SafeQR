"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { supabase } from "@/utils/supabase"
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
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [birthDay, setBirthDay] = useState("1")
  const [birthMonth, setBirthMonth] = useState("1")
  const [birthYear, setBirthYear] = useState("2000")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("Active")

  useEffect(() => {
    // Load current user data
    if (session?.user) {
      setFullName(session.user.user_metadata?.full_name || "")
      setEmail(session.user.email || "")
      // Username would come from your users table
      setUsername(session.user.user_metadata?.username || "")
    }
  }, [session])

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required")
      return
    }

    setLoading(true)
    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username: username,
        },
      })

      if (authError) throw authError

      // Update email if changed
      if (email !== session.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        })
        if (emailError) throw emailError
      }

      // Update password if provided
      if (password.trim()) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password,
        })
        if (passwordError) throw passwordError
      }

      // TODO: Update your users table with username, birth date, status
      // This would require a database function or API call

      Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: onBack }])
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
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
