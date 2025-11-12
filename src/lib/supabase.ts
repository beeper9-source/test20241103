import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqwjvrznwzmfytjlpfsk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd2p2cnpud3ptZnl0amxwZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ScheduledMessage {
  id?: number
  recipient: string
  message: string
  scheduled_at: string
  sent: boolean
  created_at?: string
}
