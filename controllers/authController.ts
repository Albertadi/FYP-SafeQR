import { supabase } from "@/utils/supabase"

// -------------------------------
// AUTHENTICATION APIs
// -------------------------------

/**
 * Register a brand-new user in Auth, then seed your public.users profile.
 */
export async function register(email: string, password: string, username: string, fullName?: string) {
  // 1. Create the auth user
  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  })

  if (signUpError) throw signUpError
  if (!user || !user.id) throw new Error("No user returned from signUp")

  // 2. Create the profile row in public.users
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .insert([
      {
        user_id: user.id, // FK → auth.users.id
        username, // username
        email, // email address
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
  const {
    data: { user, session },
    error: signInError,
  } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) throw signInError
  if (!user || !user.id || !session) throw new Error("Invalid signIn response")

  return { user, session }
}


/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // This would be your app's deep link in production
    })
    if (error) throw error
  }
  
  /**
   * Update password during password recovery
   */
  export async function updatePasswordFromRecovery(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return data
  }
  
  /**
   * Listen for password recovery events
   */
  export function onPasswordRecovery(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        callback(session)
      }
    })
  }
/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) throw error
  return session
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Update user auth data (email, password, metadata)
 */
export async function updateUserAuth(updates: {
    email?: string
    password?: string
    data?: Record<string, any>
  }) {
    const { error } = await supabase.auth.updateUser(updates)
    if (error) throw error
  }