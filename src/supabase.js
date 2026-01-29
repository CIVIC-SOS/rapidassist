import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the client. If URL/Key are missing/placeholders, Supabase JS will handle the error 
// when a request is made, allowing for better debugging or demo fallbacks in the logic layer.
export const supabase = (supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase