import type { QRContentType } from "./qrParser"; // Import QRContentType
import { supabase } from "./supabase"

/**
 * Register a brand-new user in Auth, then seed your public.users profile.
 */
export async function register(email: string, password: string, username: string) {
  // 1. Create the auth user
  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({ email, password })

  if (signUpError) throw signUpError
  if (!user || !user.id) throw new Error("No user returned from signUp")

  // 2. Create the profile row in public.users
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .insert([
      {
        user_id: user.id, // FK → auth.users.id
        username, // username
        email,
        role: "end_user", // default role
        account_status: "active", // default status
      },
    ])
    .select() // return the inserted row
    .single()

  if (profileError) throw profileError

  return { user, profile }
}

/**
 * Sign in an existing user, then fetch their profile.
 */
export async function signIn(email: string, password: string) {
  // 1. Authenticate
  const {
    data: { user, session },
    error: signInError,
  } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) throw signInError
  if (!user || !user.id || !session) throw new Error("Invalid signIn response")

  // 2. Load their profile from public.users
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (profileError) throw profileError

  return { user, session, profile }
}

// -------------------------------
// USER PROFILE APIs
// -------------------------------

export interface UserProfile {
  user_id: string
  username: string
  role: string
  account_status: string
  created_at: string
  updated_at: string
}

/**
 * Get user profile from public.users table
 */
export async function getUserProfile(user_id: string): Promise<UserProfile> {
  const { data, error } = await supabase.from("users").select("*").eq("user_id", user_id).single()

  if (error) throw error
  return data
}

/**
 * Create a new user profile in public.users table
 */
export async function createUserProfile(
  user_id: string,
  username: string,
  role = "user",
  account_status = "active",
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      user_id,
      username,
      role,
      account_status,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update username in public.users table
 */
export async function updateUsername(user_id: string, username: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({
      username: username.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user_id)

  if (error) throw error
}

/**
 * Check if username is already taken (excluding current user)
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  let query = supabase.from("users").select("user_id").eq("username", username.trim())

  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId)
  }

  const { data } = await query.single()
  return !data // If no data returned, username is available
}

/**
 * Update user auth data (email, password, metadata)
 */
export async function updateUserAuth(updates: {
  email?: string
  password?: string
  data?: Record<string, any>
}): Promise<void> {
  const { error } = await supabase.auth.updateUser(updates)
  if (error) throw error
}

// -------------------------------
// QR SCAN APIs
// -------------------------------

export interface QRScan {
  scan_id: string
  user_id: string
  decoded_content: string
  security_status: string
  content_type: QRContentType // Add this line
  scanned_at: string
}

export async function recordScan(
  payload: Pick<QRScan, "user_id" | "decoded_content" | "security_status" | "content_type">, // Update payload type
): Promise<QRScan> {
  const { data, error } = await supabase.from("qr_scans").insert([payload]).select().single()

  if (error) throw error
  return data
}

// Get scan history for a user
export async function getScanHistory(user_id: string): Promise<QRScan[]> {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("user_id", user_id)
    .order("scanned_at", { ascending: false })

  if (error) throw error
  return data
}

// -------------------------------
// REPORT APIs
// -------------------------------

export interface Report {
  report_id: string
  user_id: string
  scan_id: string
  reason: string
  status: string
  created_at: string
}

// Report a suspicious scan
export async function submitReport(payload: {
  user_id: string
  scan_id: string
  reason: string
}): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .insert([{ ...payload, status: "Pending" }])
    .select()
    .single()

  if (error) throw error
  return data
}
