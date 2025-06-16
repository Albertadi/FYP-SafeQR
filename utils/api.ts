// utils/api.ts
import { supabase } from './supabase'

/**
 * Register a brand-new user in Auth, then seed your public.users profile.
 */
export async function register(
  email: string,
  password: string,
  username: string
) {
  // 1. Create the auth user
  const {
    data: { user },
    error: signUpError
  } = await supabase.auth.signUp({ email, password })

  if (signUpError) throw signUpError
  if (!user || !user.id) throw new Error('No user returned from signUp')

  // 2. Create the profile row in public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert([
      {
        user_id: user.id,           // FK → auth.users.id
        username,                   // username
        role: 'end_user',           // default role
        account_status: 'active'    // default status
      }
    ])
    .select()                      // return the inserted row
    .single()

  if (profileError) throw profileError

  return { user, profile }
}

/**
 * Sign in an existing user, then fetch their profile.
 */
export async function signIn(
  email: string,
  password: string
) {
  // 1. Authenticate
  const {
    data: { user, session },
    error: signInError
  } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) throw signInError
  if (!user || !user.id || !session) throw new Error('Invalid signIn response')

  // 2. Load their profile from public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError) throw profileError

  return { user, session, profile }
}

export interface QRScan {
  scan_id: string
  user_id: string
  decoded_content: string
  security_status: string
  scanned_at: string
}

export async function recordScan(
  payload: Pick<QRScan, 'user_id' | 'decoded_content' | 'security_status'>
): Promise<QRScan> {
  const { data, error } = await supabase
    .from('qr_scans')
    .insert([payload])
    .select()       
    .single()       

  if (error) throw error
  return data
}

// …and so on for reports, suspensions, etc.
