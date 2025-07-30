"use client"

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

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? "light"]
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>

      <TextInput
        secureTextEntry
        placeholder="New password"
        placeholderTextColor={colors.placeholderText}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        secureTextEntry
        placeholder="Confirm password"
        placeholderTextColor={colors.placeholderText}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        style={[styles.button, { backgroundColor: "#000" }]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Resetting..." : "Reset Password"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
