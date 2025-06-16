"use client"

import { useState } from "react"
import LoginScreen from "./login-screen"
import LogoutScreen from "./logout-screen"
import { Button } from "@/components/ui/button"

type AppState = "login" | "dashboard" | "logout"

export default function AppWithLogout() {
  const [currentScreen, setCurrentScreen] = useState<AppState>("login")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentScreen("dashboard")
  }

  const handleShowLogout = () => {
    setCurrentScreen("logout")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentScreen("login")
  }

  const handleCancelLogout = () => {
    setCurrentScreen("dashboard")
  }

  if (currentScreen === "login") {
    return (
      <div>
        <LoginScreen />
        {/* Override the login button to actually navigate */}
        <div className="fixed bottom-4 left-4 right-4">
          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white text-base font-medium rounded-lg"
          >
            Demo Login
          </Button>
        </div>
      </div>
    )
  }

  if (currentScreen === "logout") {
    return <LogoutScreen onCancel={handleCancelLogout} onLogout={handleLogout} />
  }

  // Dashboard/Main App Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Dashboard!</h1>
        <p className="text-gray-600">You are now logged in.</p>

        <Button
          onClick={handleShowLogout}
          variant="outline"
          className="w-full h-12 border-gray-300 text-gray-900 hover:bg-gray-100 text-base font-medium rounded-lg"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}