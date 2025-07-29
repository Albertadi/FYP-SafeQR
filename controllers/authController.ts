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
      emailRedirectTo: "fypsafeqr://callback",
    },
  })

  if (signUpError) throw new Error("Email not available.")
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

  if (profileError) throw new Error("Email not available.")

  return { user, profile }
}

/**
 * Sign in an existing user, then fetch their profile.
 */
export async function signIn(email: string, password: string) {
  //Check if account suspended
  const { suspended, endDate } = await checkIfSuspended(email)
  if (suspended) {
    const formatted = endDate
      ? ` until ${new Date(endDate).toLocaleString()}`
      : ""
    throw new Error(`Your account has been suspended${formatted}.`)
  }

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
    redirectTo: "fypsafeqr://reset-password",
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
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user?.email) {
      try {
        const { suspended, endDate } = await checkIfSuspended(session.user.email)
        if (suspended) {
          await signOutDueToSuspension(endDate)
          console.warn("User signed out due to suspension.")
          return
        }
      }
      catch (err) {
        console.error("Error during suspension check:", err)
      }
    }
    callback(event, session)
  })
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

export async function suspendUser(user_id: string) {
  try {
    // Insert suspension record
    const { data, error: insertError } = await supabase
      .from("suspensions")
      .insert([
        {
          user_id: user_id,
          start_date: new Date(),
          end_date: new Date("9999-12-31T23:59:59Z"),
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Update user's account status
    const { error: updateError } = await supabase
      .from("users")
      .update({ account_status: "suspended" })
      .eq("user_id", user_id)

    if (updateError) throw updateError

    console.log("User suspended successfully:", data)

  } catch (error) {
    console.error("Error suspending user:", error)
    throw error;
  }
}

export async function checkIfSuspended(email: string): Promise<{ suspended: boolean, endDate?: string }> {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, account_status")
    .eq("email", email)
    .single()

  if (error) { throw new Error("Invalid Login Credentials.") }


  // Retrieve suspension end_date if currently suspended
  if (data.account_status == "suspended") {
    const { data: suspension, error: suspensionError } = await supabase
      .from("suspensions")
      .select("end_date")
      .eq("user_id", data.user_id)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (suspensionError) throw suspensionError

    // No suspension record means not suspended
    if (!suspension) return { suspended: false }

    const now = new Date()
    const endDate = new Date(suspension.end_date)

    if (now >= endDate) {
      // If suspension expired, lift suspension
      const { error: updateError } = await supabase
        .from("users")
        .update({ account_status: "active" })
        .eq("user_id", data.user_id)

      if (updateError) throw updateError

      return { suspended: false }
    }
    return { suspended: true, endDate: suspension.end_date }
  }
  return { suspended: false }
}

export let lastSignOutDueToSuspension = false
export let lastSuspensionEndDate: string | null = null


export function resetSuspensionFlag() {
  lastSignOutDueToSuspension = false
  lastSuspensionEndDate = null

}

export async function signOutDueToSuspension(endDate?: string) {
  lastSignOutDueToSuspension = true
  lastSuspensionEndDate = endDate || null
  await supabase.auth.signOut()
}