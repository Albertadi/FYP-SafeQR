"use client"

import ScanningOverlay from "@/components/ScanningOverlay"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { handleQRScanned, pickImageAndScan } from "@/utils/scanner"
import { supabase } from "@/utils/supabase"

import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import { Camera, CameraView } from "expo-camera"
import { requestMediaLibraryPermissionsAsync } from "expo-image-picker"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { BackHandler, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ScannerScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [translucent, setTranslucent] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [frameLayout, setFrameLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  // GetStarted modal states
  const [session, setSession] = useState<any>(null)
  const [showGetStartedModal, setShowGetStartedModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const isFocused = useIsFocused()
  const router = useRouter()
  const rawScheme = useColorScheme()
  const scheme = rawScheme || "light"
  const colors = Colors[scheme]

  // Check authentication state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      // Show GetStarted modal if no session
      if (!data.session) {
        setShowGetStartedModal(true)
      }
      setAuthLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        // User logged in, hide modal
        setShowGetStartedModal(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  /*----------------------------------------------------------------------------
  Request permissions once when accessing application for the first time or when
  permissions are revoked
  ------------------------------------------------------------------------------*/
  const checkCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync()
      if (status !== "granted") {
        router.replace({ pathname: "/permissionDenied", params: { type: "camera" } }) // Redirect users to custom permission denied pages
      }
      setCameraPermission(status === "granted")
      return true
    } catch (err) {
      console.error("Error requesting camera permission:", err)
      alert("Unable to access the camera. Please try again.") //replace with custom alert
      return false
    }
  }

  const checkGalleryPermission = async () => {
    try {
      const { status } = await requestMediaLibraryPermissionsAsync()

      const granted = status === "granted"
      setGalleryPermission(granted)

      if (!granted) {
        router.replace({ pathname: "/permissionDenied", params: { type: "gallery" } })
      }

      return granted
    } catch (err) {
      console.error("Error requesting gallery permission:", err)
      alert("Unable to access the photo library. Please try again.") // replace with custom alert
      return false
    }
  }

  /*----------------------------------------------------------------------------
  Resets scanned status to prevent scanner from remaining disabled under these conditions:
  1) User navigates away from the screen and comes back
  2) Scanner loses focus during scanning
  ------------------------------------------------------------------------------*/
  useEffect(() => {
    if (!isFocused && scanned) setScanned(false)
  }, [isFocused]) //re-run useEffect when camera permissions changes between [null, true, false]

  const onGalleryScanComplete = () => {
    setScanned(false)
  }

  /*----------------------------------------------------------------------------
    Return to landing page with Android back button. 
  ------------------------------------------------------------------------------*/
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (showLanding && translucent) {
          setTranslucent(false) // Switch from translucent to opaque overlay
          setTorchEnabled(false) // Ensure torch is turned off
          return true // Prevent app exit on first press
        }
        return false // Allow exit of app on second press
      }
      const backButton = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => backButton.remove()
    }, [showLanding, translucent]),
  )

  /*----------------------------------------------------------------------------
    Torch function
  ------------------------------------------------------------------------------*/
  const toggleTorch = () => {
    setTorchEnabled((prev) => !prev)
  }

  /*----------------------------------------------------------------------------
    Page Redirect after scanning QR from camera or gallery
  ------------------------------------------------------------------------------*/
  const redirectScans = (
    result: { status?: string; url?: string } | undefined | null,
    source: "camera" | "gallery" = "camera",
  ) => {
    try {
      const status = result?.status?.toLowerCase?.()
      const url = result?.url

      if (!url || !status) {
        alert("Scan failed or unverified. Please try again.") //replace with custom alert
        if (source === "camera") setScanned(false)
        return
      }

      if (["safe", "malicious", "suspicious"].includes(status)) {
        router.replace({ pathname: "/scanResult", params: { url, type: status } })
      } else {
        console.log("Unknown scan status encountered while redirecting scans: ${status}")
        alert("Scan failed or unverified. Please try again.") //replace with custom alert
        if (source === "camera") setScanned(false)
      }
    } catch (err) {
      console.error("Redirect scan error:", err)
      alert("An unexpected error occurred during redirection. Please try again.") //replace with custom alert
      if (source === "camera") setScanned(false)
    }
  }

  /*----------------------------------------------------------------------------
    GetStarted Modal Handlers
  ------------------------------------------------------------------------------*/
  const handleLoginPress = () => {
    setShowGetStartedModal(false)
    router.push("/(tabs)/register")
  }

  const handleProceedAsGuest = () => {
    setShowGetStartedModal(false)
  }

  /*----------------------------------------------------------------------------
    Index tab display
  ------------------------------------------------------------------------------*/
  // Variable to store layout dimensions and pass values to LandingOverlay so that app can swap between landing page and scanning page
  const handleFrameLayoutChange = (layout: { x: number; y: number; width: number; height: number }) => {
    setFrameLayout(layout)
  }

  // Landing page is loaded only once and shown by default
  if (showLanding && !translucent) {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <ScanningOverlay
            translucent={false}
            onPressCamera={async () => {
              const granted = await checkCameraPermission()
              if (!granted) return

              setTranslucent(true)
              setShowLanding(true)
            }}
            onFrameLayoutChange={handleFrameLayoutChange} // Pass layout dimensions used for translucent layout to LandingOverlay.tsx
            onPressGallery={async () => {
              // Calls functions from scanner.ts to handle scans from gallery. After scan, prepare for next QR scan
              const granted = await checkGalleryPermission()
              if (!granted) return

              try {
                const result = await pickImageAndScan(handleQRScanned)
                redirectScans(result, "gallery")
              } catch (err) {
                console.error("Gallery scan error:", err)
                alert("An unexpected error occurred. Please try again.") //replace with custom alert
              } finally {
                onGalleryScanComplete()
              }
            }}
          />
        </SafeAreaView>

        {/* Get Started Modal */}
        <Modal visible={showGetStartedModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: "space-between", paddingVertical: 40 }}>
              {/* Logo/Icon Section */}
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <IconSymbol name="qrcode.viewfinder" size={80} color={colors.tint} />
                <Text style={{ fontSize: 32, fontWeight: "bold", marginTop: 20, marginBottom: 8, color: colors.text }}>
                  QR Scanner
                </Text>
                <Text style={{ fontSize: 16, textAlign: "center", lineHeight: 24, color: colors.secondaryText }}>
                  Scan QR codes safely and securely
                </Text>
              </View>

              {/* Features Section */}
              <View style={{ gap: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <IconSymbol name="shield.checkered" size={24} color={colors.tint} />
                  <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>Security scanning</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <IconSymbol name="clock.fill" size={24} color={colors.tint} />
                  <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>Scan history</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <IconSymbol name="link" size={24} color={colors.tint} />
                  <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>Link management</Text>
                </View>
              </View>

              {/* Buttons Section */}
              <View style={{ gap: 16 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.tint,
                    paddingVertical: 16,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={handleLoginPress}
                >
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.background }}>
                    Login / Create Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ paddingVertical: 16, alignItems: "center" }} onPress={handleProceedAsGuest}>
                  <Text style={{ fontSize: 16, fontWeight: "500", color: colors.tint }}>Proceed as Guest</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </>
    )
  }

  return (
    <>
      {/* Loads a live camera view */}
      <SafeAreaView style={styles.container}>
        {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={
              scanned
                ? undefined
                : async ({ type, data }) => {
                    setScanned(true) // Prevents camera from non-stop scanning while loading next screen
                    try {
                      const result = await handleQRScanned({ type, data })
                      redirectScans(result, "camera")
                    } catch (err) {
                      console.error("Live camera scan error:", err)
                      alert("An unexpected error occurred. Please try again.") //replace with custom alert
                    }
                  }
            }
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }} // Read only QR codes
            enableTorch={torchEnabled ? true : false} // Adds torch function if user's environment is too dark
          />
        )}

        {showLanding &&
          translucent && ( // Loads a translucent overlay on top of live camera view. Used to ensure visibility for all other elements on screen.
            <ScanningOverlay
              translucent={true}
              frameLayout={frameLayout} // Pass measured frameLayout for live camera cutout
              torchEnabled={torchEnabled}
              onPressCamera={async () => {
                // Resets everything to default values
                const granted = await checkCameraPermission()
                if (!granted) return

                setShowLanding(false)
                setTranslucent(false)
                setTorchEnabled(false)
              }}
              onToggleFlashlight={toggleTorch} // Toggles torch added in camera view
              onPressGallery={async () => {
                // Calls functions from scanner.ts to handle scans from gallery. After scan, prepare for next QR scan
                const granted = await checkGalleryPermission()
                if (!granted) return
                try {
                  const result = await pickImageAndScan(handleQRScanned)
                  redirectScans(result, "gallery")
                } catch (err) {
                  console.error("Gallery scan error:", err)
                  alert("An unexpected error occurred. Please try again.") //replace with custom alert
                } finally {
                  onGalleryScanComplete()
                }
              }}
            />
          )}
      </SafeAreaView>

      {/* Get Started Modal */}
      <Modal visible={showGetStartedModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: "space-between", paddingVertical: 40 }}>
            {/* Logo/Icon Section */}
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <IconSymbol name="qrcode.viewfinder" size={80} color={colors.tint} />
              <Text style={{ fontSize: 32, fontWeight: "bold", marginTop: 20, marginBottom: 8, color: colors.text }}>
                QR Scanner
              </Text>
              <Text style={{ fontSize: 16, textAlign: "center", lineHeight: 24, color: colors.secondaryText }}>
                Scan QR codes safely and securely
              </Text>
            </View>

            {/* Features Section */}
            <View style={{ gap: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <IconSymbol name="shield.checkered" size={24} color={colors.tint} />
                <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>Security scanning</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <IconSymbol name="clock.fill" size={24} color={colors.tint} />
                <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>Scan history</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <IconSymbol name="link" size={24} color={colors.tint} />
                <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>Link management</Text>
              </View>
            </View>

            {/* Buttons Section */}
            <View style={{ gap: 16 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.tint,
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={handleLoginPress}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.background }}>
                  Login / Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ paddingVertical: 16, alignItems: "center" }} onPress={handleProceedAsGuest}>
                <Text style={{ fontSize: 16, fontWeight: "500", color: colors.tint }}>Proceed as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})
