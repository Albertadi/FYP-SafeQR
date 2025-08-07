"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import KeyboardAvoidingWrapper from "@/components/ui/KeyboardAvoidingWrapper"
import { Colors } from "@/constants/Colors"
import {
  register,
  sendPasswordResetEmail,
  signIn
} from "@/controllers/authController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { validatePassword } from "@/utils/passwordComplexityChecker"
import { useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface AuthScreenProps {
  onDone: () => void
}

type AuthMode = "login" | "signup" | "forgot" | "emailSent" | "resetPassword"

export default function AuthScreen({ onDone }: AuthScreenProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  })

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      onDone()
    } catch (error: any) {
      Alert.alert("Login Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  function validatePasswordLive(password: string) {
    const validations = validatePassword(password)
    setPasswordValidations(validations)
    return validations.isValid
  }


  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }


    if (!validatePasswordLive(password)) {
      Alert.alert(
        "Weak Password",
        "Password must have at least 8 characters, include uppercase, lowercase, number, and special symbol."
      )
      return
    }

    setLoading(true)
    try {
      await register(email, password, username)
      Alert.alert("Success", "Please check your email to verify your account")
      onDone()
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      setMode("emailSent")
    } catch (error: any) {
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderLoginScreen = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>We're glad to see you again</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Email Address"
          placeholderTextColor={colors.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.placeholderText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => setMode("forgot")}>
          <Text style={[styles.forgotLink, { color: colors.secondaryText }]}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: "#000" }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.primaryButtonText, { color: "#fff" }]}>{loading ? "Loading..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode("signup")}>
          <Text style={[styles.linkText, { color: colors.secondaryText }]}>
            Don't have an account? <Text style={{ color: colors.text, fontWeight: "600" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderSignUpScreen = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Username"
          placeholderTextColor={colors.placeholderText}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Email Address"
          placeholderTextColor={colors.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.placeholderText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.placeholderText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {password.length > 0 && (
          <View style={{ marginBottom: 10 }}>
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


        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: "#000" }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={[styles.primaryButtonText, { color: "#fff" }]}>{loading ? "Loading..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode("login")}>
          <Text style={[styles.linkText, { color: colors.secondaryText }]}>
            Already have an account? <Text style={{ color: colors.text, fontWeight: "600" }}>Login Now</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderForgotScreen = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Please enter your email address below to receive a password reset link.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { borderColor: colors.borderColor, color: colors.text }]}
          placeholder="Email"
          placeholderTextColor={colors.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: "#000" }]}
          onPress={handleSendResetEmail}
          disabled={loading}
        >
          <Text style={[styles.primaryButtonText, { color: "#fff" }]}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode("login")} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={16} color={colors.secondaryText} />
          <Text style={[styles.backText, { color: colors.secondaryText }]}>Back to log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderEmailSentScreen = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Email has been sent!</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Please check your inbox and click the reset link to continue.
        </Text>
      </View>

      <View style={styles.emailIconContainer}>
        <View style={[styles.emailIcon, { backgroundColor: "#007AFF" }]}>
          <IconSymbol name="envelope.fill" size={40} color="#fff" />
        </View>
      </View>

      <View style={styles.form}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: "#000" }]} onPress={() => setMode("login")}>
          <Text style={[styles.primaryButtonText, { color: "#fff" }]}>Back to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSendResetEmail}>
          <Text style={[styles.linkText, { color: colors.secondaryText }]}>
            Didn't receive the link? <Text style={{ color: colors.text, fontWeight: "600" }}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )


  return (
    <KeyboardAvoidingWrapper style={{ backgroundColor: colors.background}} textInputValue={password}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {mode === "login" && renderLoginScreen()}
        {mode === "signup" && renderSignUpScreen()}
        {mode === "forgot" && renderForgotScreen()}
        {mode === "emailSent" && renderEmailSentScreen()}
      </SafeAreaView>
    </KeyboardAvoidingWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotLink: {
    textAlign: "right",
    fontSize: 14,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  backText: {
    fontSize: 14,
  },
  emailIconContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  emailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordRequirements: {
    marginTop: -10,
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 12,
    fontStyle: "italic",
  },
})
