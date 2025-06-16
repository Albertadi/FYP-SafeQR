"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/utils/supabase"
import { useRouter } from "expo-router"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert("Login failed: " + error.message)
    } else {
      // Redirect to home tab or dashboard
      router.replace("/(tabs)/home") // Adjust to our structure
    }
  }

  const handleSignUp = () => {
    router.push("/register")
  }

  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600">We're glad to see you again</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>

          <div className="text-center">
            <span className="text-gray-600 text-sm">
              Don’t have an account?{" "}
              <button onClick={handleSignUp} className="text-gray-900 font-medium hover:underline">
                Sign up
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
