import { supabase } from "@/utils/supabase"

// -------------------------------
// USER PROFILE APIs
// -------------------------------

export interface UserProfile {
  user_id: string
  username: string
  email: string
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
  email: string,
  role = "user",
  account_status = "active",
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      user_id,
      username,
      email,
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
 * Update user profile in public.users table
 */
export async function updateUserProfile(
  user_id: string,
  updates: Partial<Pick<UserProfile, "username" | "email">>,
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
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
 * Check if email is already taken (excluding current user)
 */
export async function isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
  let query = supabase.from("users").select("user_id").eq("email", email.trim().toLowerCase())

  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId)
  }

  const { data } = await query.single()
  return !data // If no data returned, email is available
}

/**
 * Delete user profile from public.users table
 */
export async function deleteUserProfile(user_id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("user_id", user_id)

  if (error) throw error
}
