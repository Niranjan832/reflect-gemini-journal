
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Provide default values to prevent runtime errors when env vars are not available
// In production, these should be properly set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
