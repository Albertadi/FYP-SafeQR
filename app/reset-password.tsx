"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { updatePasswordFromRecovery } from "@/controllers/authController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (password.length < 6) {
      Alert.alert("Password too short", "Minimum 6 characters required.")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please re-enter your passwords.")
      return
    }

    try {
      setLoading(true)
      await updatePasswordFromRecovery(password)
      Alert.alert("Success", "Your password has been updated.")
      router.replace("/(tabs)/register")
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not reset password.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.replace("/(tabs)/register")
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Reset Password</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              placeholder="Enter new password"
              placeholderTextColor={colors.placeholderText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
              placeholder="Confirm new password"
              placeholderTextColor={colors.placeholderText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementText, { color: colors.secondaryText }]}>
              Password must be at least 6 characters long
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: "#000" }]}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={[styles.resetButtonText, { color: "#fff" }]}>
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  form: {
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
  passwordRequirements: {
    marginTop: -10,
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  resetButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
