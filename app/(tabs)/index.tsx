"use client"

import ScanningOverlay from "@/components/scanner/ScanningOverlay"
import GetStarted from "@/components/ui/GetStarted"
import { handleQRScanned, pickImageAndScan } from "@/utils/scanner"
import { supabase } from "@/utils/supabase"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import { Camera, CameraView } from "expo-camera"
import { requestMediaLibraryPermissionsAsync } from "expo-image-picker"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { BackHandler, Modal, SafeAreaView, StyleSheet } from "react-native"

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
        setTimeout(() => {
          router.replace({ pathname: "/permissionDenied", params: { type: "camera" } }) // Redirect users to custom permission denied pages
        }, 0)
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
        setTimeout(() => {
          router.replace({ pathname: "/permissionDenied", params: { type: "gallery" } })
        }, 0)
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
    result: { status?: string; originalContent?: string; contentType?: string; parsedData?: any } | undefined | null,
    source: "camera" | "gallery" = "camera",
  ) => {
    try {
      const status = result?.status?.toLowerCase?.()
      const originalContent = result?.originalContent // Corrected to use originalContent
      const contentType = result?.contentType
      const parsedData = result?.parsedData

      if (!originalContent || !status || !contentType || !parsedData) {
        console.error("Missing data in scan result:", { result }) // Added detailed logging
        alert("Scan failed or unverified. Please try again.") //replace with custom alert
        if (source === "camera") setScanned(false)
        return
      }

      if (["safe", "malicious", "suspicious"].includes(status)) {
        // Stringify parsedData to pass as a URL parameter
        const parsedDataString = JSON.stringify(parsedData)
        setTimeout(() => {
          router.replace({
            pathname: "/scanResult",
            params: {
              originalContent, // Pass originalContent
              type: status,
              contentType,
              parsedData: parsedDataString, // Pass stringified data
            },
          })
        }, 0)
      } else {
        console.log(`Unknown scan status encountered while redirecting scans: ${status}`)
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
          <GetStarted onProceedAsGuest={handleProceedAsGuest} />
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
                : async (event) => {
                    // Changed to receive the full event object
                    setScanned(true) // Prevents camera from non-stop scanning while loading next screen
                    // Check for 'raw' property, which seems to contain the unparsed string
                    const rawContent = event.raw || event.data // Use raw if available, otherwise fallback to data

                    try {
                      const result = await handleQRScanned({ type: event.type, data: rawContent }) // Pass rawContent
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
        <GetStarted onProceedAsGuest={handleProceedAsGuest} />
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
