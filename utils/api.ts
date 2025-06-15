// utils/api.ts
import { supabase } from './supabase'

// -------------------------------
// Interfaces
// -------------------------------

export interface QRScan {
  scan_id: string
  user_id: string
  decoded_content: string
  security_status: string
  scanned_at: string
}

export interface Report {
  report_id: string
  user_id: string
  scan_id: string
  reason: string
  status: "Pending" | "Closed"
  created_at: string
}

// -------------------------------
// QR SCAN APIs
// -------------------------------

// Save new scan result
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

// Get scan history for a user
export async function getScanHistory(user_id: string): Promise<QRScan[]> {
  const { data, error } = await supabase
    .from('qr_scans')
    .select('*')
    .eq('user_id', user_id)
    .order('scanned_at', { ascending: false })

  if (error) throw error
  return data
}

// -------------------------------
// REPORT APIs
// -------------------------------

// Report a suspicious scan
export async function submitReport(payload: {
  user_id: string
  scan_id: string
  reason: string
}): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert([{ ...payload, status: 'Pending' }])
    .select()
    .single()

  if (error) throw error
  return data
}
