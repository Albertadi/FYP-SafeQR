"use client"

import ScanningOverlay from "@/components/scanner/ScanningOverlay"
import GetStarted from "@/components/ui/GetStarted"
import { handleQRScanned, pickImageAndScan } from "@/controllers/scanController"
import { supabase } from "@/utils/supabase"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import { Camera, CameraView } from "expo-camera"
import { requestMediaLibraryPermissionsAsync } from "expo-image-picker"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, BackHandler, Modal, SafeAreaView, StyleSheet, Text, View } from "react-native"

export default function ScannerScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [translucent, setTranslucent] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [frameLayout, setFrameLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isScanningLoading, setIsScanningLoading] = useState(false) // New loading state

  // GetStarted modal states
  const [session, setSession] = useState<any>(null)
  const [showGetStartedModal, setShowGetStartedModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const isFocused = useIsFocused()
  const router = useRouter()

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting Supabase session in ScannerScreen:", sessionError.message)
        // If there's an error and no session, it means the session is truly invalid.
        // Force a sign out to clear any lingering invalid state.
        if (!session) {
          await supabase.auth.signOut() // This will clear local storage and trigger onAuthStateChange
        }
      }

      setSession(session)
      // Show GetStarted modal if no session
      if (!session) {
        setShowGetStartedModal(true)
      }
      setAuthLoading(false)
    }

    checkAuth()

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
        setTimeout(() => {
          router.replace({ pathname: "/permissionDenied", params: { type: "camera" } }) // Redirect users to custom permission denied pages
        }, 0)
      }
      setCameraPermission(status === "granted")
      return true
    } catch (err) {
      console.error("Error requesting camera permission:", err)
      Alert.alert("Unable to access the camera. Please try again.") //replace with custom alert
      return false
    }
  }

  const checkGalleryPermission = async () => {
    try {
      const { status } = await requestMediaLibraryPermissionsAsync()

      const granted = status === "granted"
      setGalleryPermission(granted)

      if (!granted) {
        setTimeout(() => {
          router.replace({ pathname: "/permissionDenied", params: { type: "gallery" } })
        }, 0)
      }

      return granted
    } catch (err) {
      console.error("Error requesting gallery permission:", err)
      Alert.alert("Unable to access the photo library. Please try again.") // replace with custom alert
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
    result:
      | {
          status?: string
          originalContent?: string
          contentType?: string
          scan_id?: string
          parsedData?: any
          googleResult?: "Safe" | "Suspicious" | "Malicious"
          mlResult?: { prediction: "Safe" | "Suspicious" | "Malicious"; score: number }
        }
      | undefined
      | null,
    source: "camera" | "gallery" = "camera",
  ) => {
    try {
      const status = result?.status?.toLowerCase?.()
      const originalContent = result?.originalContent // Corrected to use originalContent
      const contentType = result?.contentType
      const parsedData = result?.parsedData
      const scan_id = result?.scan_id
      const googleResult = result?.googleResult
      const mlResult = result?.mlResult

      if (!originalContent || !status || !contentType || !parsedData) {
        console.error("Missing data in scan result:", { result }) // Added detailed logging
        Alert.alert("Scan failed or unverified. Please try again.") //replace with custom alert
        if (source === "camera") setScanned(false)
        return
      }

      if (["safe", "malicious", "suspicious"].includes(status)) {
        // Stringify parsedData to pass as a URL parameter
        const parsedDataString = JSON.stringify(parsedData)
        const mlResultString = mlResult ? JSON.stringify(mlResult) : undefined

        setTimeout(() => {
          router.replace({
            pathname: "/scanResult",
            params: {
              originalContent, // Pass originalContent
              type: status,
              contentType,
              parsedData: parsedDataString, // Pass stringified data
              scan_id,
              googleResult: googleResult || undefined,
              mlResult: mlResultString || undefined,
            },
          })
        }, 0)
      } else {
        console.log(`Unknown scan status encountered while redirecting scans: ${status}`)
        Alert.alert("Scan failed or unverified. Please try again.") //replace with custom alert
        if (source === "camera") setScanned(false)
      }
    } catch (err) {
      console.error("Redirect scan error:", err)
      Alert.alert("An unexpected error occurred during redirection. Please try again.") //replace with custom alert
      if (source === "camera") setScanned(false)
    }
  }

  /*----------------------------------------------------------------------------
GetStarted Modal Handlers
------------------------------------------------------------------------------*/
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

              setIsScanningLoading(true) // Set loading true before gallery scan
              try {
                const result = await pickImageAndScan(handleQRScanned)
                redirectScans(result, "gallery")
              } catch (err) {
                console.error("Gallery scan error:", err)
                Alert.alert("An unexpected error occurred. Please try again.") //replace with custom alert
              } finally {
                onGalleryScanComplete()
                setIsScanningLoading(false) // Reset loading after gallery scan
              }
            }}
          />
        </SafeAreaView>

        {/* Get Started Modal */}
        <Modal visible={showGetStartedModal} animationType="slide" presentationStyle="pageSheet">
          <GetStarted onProceedAsGuest={handleProceedAsGuest} />
        </Modal>

        {/* Loading Overlay */}
        {isScanningLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Scanning and verifying...</Text>
          </View>
        )}
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
                : async (event) => {
                    setScanned(true) // Prevents camera from non-stop scanning while loading next screen
                    // Check for 'raw' property, which seems to contain the unparsed string
                    const rawContent = event.raw || event.data // Use raw if available, otherwise fallback to data

                    setIsScanningLoading(true) // Set loading true before camera scan
                    try {
                      const result = await handleQRScanned({ type: event.type, data: rawContent }) // Pass rawContent
                      redirectScans(result, "camera")
                    } catch (err) {
                      console.error("Live camera scan error:", err)
                      Alert.alert("An unexpected error occurred. Please try again.") //replace with custom alert
                    } finally {
                      setIsScanningLoading(false) // Reset loading after camera scan
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
                setTranslucent(false)
                setShowLanding(true)
                setTorchEnabled(false) // Turn off torch when closing camera
              }}
              onToggleFlashlight={toggleTorch} // Toggles torch added in camera view
              onPressGallery={async () => {
                // Calls functions from scanner.ts to handle scans from gallery. After scan, prepare for next QR scan
                const granted = await checkGalleryPermission()
                if (!granted) return
                setIsScanningLoading(true) // Set loading true before gallery scan
                try {
                  const result = await pickImageAndScan(handleQRScanned)
                  redirectScans(result, "gallery")
                } catch (err) {
                  console.error("Gallery scan error:", err)
                  Alert.alert("An unexpected error occurred. Please try again.") //replace with custom alert
                } finally {
                  onGalleryScanComplete()
                  setIsScanningLoading(false) // Reset loading after gallery scan
                }
              }}
            />
          )}
      </SafeAreaView>

      {/* Get Started Modal */}
      <Modal visible={showGetStartedModal} animationType="slide" presentationStyle="pageSheet">
        <GetStarted onProceedAsGuest={handleProceedAsGuest} />
      </Modal>

      {/* Loading Overlay */}
      {isScanningLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Scanning and verifying...</Text>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Ensure it's on top
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
})
