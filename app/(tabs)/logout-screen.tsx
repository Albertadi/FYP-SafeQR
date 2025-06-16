"use client"

import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { useRouter } from "expo-router"

export default function LogoutScreen() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Logout failed:", error.message)
      return
    }
    console.log("User logged out")
    router.replace("/(tabs)/login-screen") // Or our actual login route
  }

  const handleCancel = () => {
    console.log("Logout cancelled")
    router.back() // Or navigate to a safe screen (e.g., /home)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* User Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-900" />
          </div>
        </div>

        {/* Confirmation Text */}
        <div className="text-center space-y-2">
          <p className="text-gray-900 text-lg">Are you sure you want to</p>
          <p className="text-gray-900 text-lg">log out?</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-900 text-base font-medium rounded-lg transition-colors"
          >
            Cancel
          </Button>

          <Button
            onClick={handleLogout}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white text-base font-medium rounded-lg transition-colors"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
