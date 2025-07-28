"use client"

import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { supabase } from "@/utils/supabase"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

export default function ResetPasswordScreen() {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? "light"]
    const router = useRouter()

    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleResetPassword = async () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "Passwords do not match.")
            return
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters.")
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password: newPassword })

        setLoading(false)

        if (error) {
            Alert.alert("Error", error.message)
        } else {
            Alert.alert("Success", "Password updated! Please log in again.")
            router.replace("/(tabs)/register")
        }
    }

    const isDisabled =
        loading ||
        !newPassword ||
        !confirmNewPassword ||
        newPassword !== confirmNewPassword ||
        newPassword.length < 6

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Please enter your new password below.</Text>

            <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                style={styles.input}
            />

            <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isDisabled}
                style={[styles.button, isDisabled ? styles.buttonDisabled : styles.buttonEnabled]}
            >
                <Text style={[styles.buttonText, isDisabled ? styles.textDisabled : styles.textEnabled]}>
                    {loading ? "Updating..." : "Update Password"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
    },
    subtitle: {
        marginBottom: 20,
        color: "#666",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonEnabled: {
        backgroundColor: "#000",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        fontWeight: "600",
    },
    textEnabled: {
        color: "#fff",
    },
    textDisabled: {
        color: "#666",
    },
})