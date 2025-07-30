"use client"

import FAQScreen from "@/components/profile/FAQScreen"
import ReportHistoryScreen from "@/components/profile/ReportHistoryScreen"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { signOut, suspendUser } from "@/controllers/authController"
import { getUserProfile, type UserProfile } from "@/controllers/userProfileController"
import { useColorScheme } from "@/hooks/useColorScheme"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface ProfileScreenProps {
  session: any
}

export default function ProfileScreen({ session }: ProfileScreenProps) {
  const insets = useSafeAreaInsets()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const [showReportHistory, setReportHistory] = useState(false)
  const [faqVisible, setFaqVisible] = useState(false)

  // Fetch user profile from public users table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
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

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true)
          try {
            await signOut()
          } catch (error) {
            console.error("Logout error:", error)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleDeactivateAccount = () => {
    Alert.alert("Deactivate Account", "You will not be able to use this email address to register for another account in the future.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          (async () => {
            try {
              await suspendUser(session.user.id)
              Alert.alert("Deactivating Account", "Your Account has been deactivated. Signing you out...")
              await signOut()
            } catch (err) {
              console.error("Error suspending user:", err)
              Alert.alert("Error", "Failed to process account deactivation. Please contact support.")
            }
          })()
        },
      },
    ]
    )
  }

  const handleSupport = () => {
    const supportEmail = "fypsafeqr@gmail.com"
    Alert.alert("Contact Support", `You can contact the development team by emailing: ${supportEmail}`,
      [
        { text: "OK", style: "cancel" },
        {
          text: "Email Team",
          onPress: () => {
            const mailtoUrl = `mailto:${supportEmail}`
            Linking.canOpenURL(mailtoUrl)
              .then((supported) => {
                if (!supported) {
                  Alert.alert("Error", `Unable to open email client, please send an email to us manually at ${supportEmail}.`)
                } else {
                  return Linking.openURL(mailtoUrl)
                }
              })
              .catch(() => Alert.alert("Error", "An unexpected error occurred"))
          },
        },
      ]
    )
  }

  const handleFAQ = () => {
    setFaqVisible(true)
  }

  const handleRetry = () => {
    setProfileLoading(true)
    setProfileError(false)

    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
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

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
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
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          </View>
        </View>

        {/* Error Content */}
        <View style={styles.errorContainer}>
          <IconSymbol name="person.crop.circle" size={64} color={colors.secondaryText} />
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

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: "#F44336" }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={[styles.logoutButtonText, { color: "#fff" }]}>{loading ? "LOGGING OUT..." : "LOG OUT"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (showReportHistory) {
    return (
      <ReportHistoryScreen
        onBack={() => setReportHistory(false)}
      />
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="person.crop.circle" size={60} color={colors.secondaryText} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>@{userProfile?.username || "User"}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{session?.user?.email}</Text>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.cardBackground }]}
            onPress=
            {() => router.replace("/editProfile")}>
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* User Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Role</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userProfile?.role?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "User"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Account Status</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: userProfile?.account_status && userProfile.account_status === "active" ? "#4CAF50" : "#F44336",
                },
              ]}
            >
              {userProfile?.account_status
                ? userProfile.account_status.charAt(0).toUpperCase() + userProfile.account_status.slice(1)
                : "Active"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {userProfile?.created_at ? formatMemberSince(userProfile.created_at) : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Setting</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={() => router.push("/(tabs)/scan-history")}
          >
            <IconSymbol name="clock.fill" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Scan History</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={() => setReportHistory(true)}
          >
            <IconSymbol name="exclamationmark.octagon.fill" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>View All Reports</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={handleDeactivateAccount}
          >
            <IconSymbol name="trash.fill" size={20} color="#F44336" />
            <Text style={[styles.menuText, { color: "#F44336" }]}>Deactivate Account</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Other</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={handleSupport}
          >
            <IconSymbol name="info.circle" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Support</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background }]}
            onPress={handleFAQ}
          >
            <IconSymbol name="questionmark.circle" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>FAQ</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
        <FAQScreen visible={faqVisible} onClose={() => setFaqVisible(false)} />

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
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: "italic",
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
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
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
})
