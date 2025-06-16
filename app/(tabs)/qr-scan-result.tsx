"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, MoreHorizontal, Copy, Share, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface QRScanResultProps {
  url: string
  onOpenLink: (url: string) => void
  onCopyUrl: (url: string) => void
  onShareUrl: (url: string) => void
  onBackToScan: () => void
}

export default function QRScanResult({
  url = "www.example.com",
  onOpenLink,
  onCopyUrl,
  onShareUrl,
  onBackToScan,
}: QRScanResultProps) {
  const [showCopied, setShowCopied] = useState(false)

  const handleOpenLink = () => {
    console.log("Opening link:", url)
    onOpenLink(url)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
      console.log("URL copied:", url)
      onCopyUrl(url)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const handleShareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: "Safe Link",
        url: url,
      })
    } else {
      console.log("Sharing URL:", url)
    }
    onShareUrl(url)
  }

  const handleBackToScan = () => {
    console.log("Back to scan")
    onBackToScan()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900 tracking-wide">SCANNING COMPLETE</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>

        {/* Status Message */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Safe Link Detected</h2>
          <p className="text-gray-600 text-base">You can safely open this link.</p>
        </div>

        {/* URL Display */}
        <div className="text-center">
          <p className="text-blue-600 text-base font-medium underline">{url}</p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          {/* Open Link Button with Menu */}
          <div className="flex gap-2">
            <Button
              onClick={handleOpenLink}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white text-base font-medium rounded-lg transition-colors"
            >
              Open Link
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 border-gray-300 rounded-lg">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareUrl}>
                  <Share className="mr-2 h-4 w-4" />
                  Share URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 text-base font-medium rounded-lg transition-colors"
            >
              <Copy className="mr-2 h-4 w-4" />
              {showCopied ? "Copied!" : "Copy URL"}
            </Button>

            <Button
              onClick={handleShareUrl}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 text-base font-medium rounded-lg transition-colors"
            >
              <Share className="mr-2 h-4 w-4" />
              Share URL
            </Button>

            <Button
              onClick={handleBackToScan}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 text-base font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}