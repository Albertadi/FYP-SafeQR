import { supabase } from "@/utils/supabase"

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
  updated_at?: string
}

/**
 * Submit a new report for a suspicious scan
 */
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

/**
 * Get all reports for a user
 */
export async function getUserReports(user_id: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a specific report by ID
 */
export async function getReportById(report_id: string): Promise<Report> {
  const { data, error } = await supabase.from("reports").select("*").eq("report_id", report_id).single()

  if (error) throw error
  return data
}
