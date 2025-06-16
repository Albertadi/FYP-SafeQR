"use client"

import { useState } from "react"
import QRScanResult from "./qr-scan-result"
import { Button } from "@/components/ui/button"
import { QrCode, Camera } from "lucide-react"

type ScanState = "scanning" | "result" | "error"

export default function QRScannerApp() {
  const [scanState, setScanState] = useState<ScanState>("scanning")
  const [scannedUrl, setScannedUrl] = useState("www.example.com")

  const handleStartScan = () => {
    // Simulate scanning process
    setScanState("scanning")
    setTimeout(() => {
      setScannedUrl("www.example.com")
      setScanState("result")
    }, 2000)
  }

  const handleOpenLink = (url: string) => {
    // In a real app, this would open the URL
    window.open(https://${url}, "_blank")
  }

  const handleCopyUrl = (url: string) => {
    // URL copying is handled in the component
    console.log("URL copied to clipboard")
  }

  const handleShareUrl = (url: string) => {
    // Sharing logic
    console.log("Sharing URL:", url)
  }

  const handleBackToScan = () => {
    setScanState("scanning")
  }

  if (scanState === "result") {
    return (
      <QRScanResult
        url={scannedUrl}
        onOpenLink={handleOpenLink}
        onCopyUrl={handleCopyUrl}
        onShareUrl={handleShareUrl}
        onBackToScan={handleBackToScan}
      />
    )
  }

  // Scanning Screen
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8">
        <div className="w-32 h-32 border-4 border-white rounded-lg flex items-center justify-center">
          <QrCode className="w-16 h-16 text-white" />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">QR Code Scanner</h1>
          <p className="text-gray-300">
            {scanState === "scanning" ? "Scanning for QR codes..." : "Point your camera at a QR code"}
          </p>
        </div>

        <Button
          onClick={handleStartScan}
          disabled={scanState === "scanning"}
          className="w-full max-w-sm h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg"
        >
          <Camera className="mr-2 h-5 w-5" />
          {scanState === "scanning" ? "Scanning..." : "Start Scan"}
        </Button>
      </div>
    </div>
  )
}