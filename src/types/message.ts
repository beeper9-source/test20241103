export interface ScheduledMessage {
  id?: string
  recipient: string
  phone_number: string
  message: string
  scheduled_time: string
  status: 'pending' | 'sent' | 'failed'
  created_at?: string
  updated_at?: string
}

export interface MessageFormData {
  recipient: string
  phone_number: string
  message: string
  scheduled_date: string
  scheduled_time: string
}
