import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  console.log('getSupabase called')
  
  if (supabaseClient) {
    console.log('returning existing client')
    return supabaseClient
  }

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') ?? '' : ''
  const storedAnon = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') ?? '' : ''

  console.log('stored credentials:', { hasUrl: !!storedUrl, hasKey: !!storedAnon })

  // Use placeholder values if not configured - this prevents crashes
  const supabaseUrl = storedUrl || 'https://placeholder.supabase.co'
  const supabaseAnonKey = storedAnon || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxNTczNjQsImV4cCI6MTk2MDczMzM2NH0.placeholder'

  console.log('creating supabase client with URL:', supabaseUrl)
  
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    console.log('supabase client created successfully')
    return supabaseClient
  } catch (error) {
    console.error('Failed to create supabase client:', error)
    throw error
  }
}

export function setSupabaseConfig(url: string, anonKey: string) {
  console.log('setSupabaseConfig called')
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase_url', url)
    localStorage.setItem('supabase_anon_key', anonKey)
  }
  supabaseClient = createClient(url, anonKey)
  return supabaseClient
}
