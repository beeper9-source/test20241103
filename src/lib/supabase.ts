import { createClient } from '@supabase/supabase-js'
import type { ScheduledMessage } from '../types/message'

const supabaseUrl = 'https://nqwjvrznwzmfytjlpfsk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd2p2cnpud3ptZnl0amxwZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const messageService = {
  // 예약 메시지 추가
  async createMessage(message: Omit<ScheduledMessage, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('scheduled_messages')
      .insert([message])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 모든 예약 메시지 조회
  async getMessages() {
    const { data, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .order('scheduled_time', { ascending: true })
    
    if (error) throw error
    return data as ScheduledMessage[]
  },

  // 예약 메시지 삭제
  async deleteMessage(id: string) {
    const { error } = await supabase
      .from('scheduled_messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // 메시지 상태 업데이트
  async updateMessageStatus(id: string, status: ScheduledMessage['status']) {
    const { error } = await supabase
      .from('scheduled_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  },

  // 발송 시간이 된 메시지 조회
  async getPendingMessages() {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', now)
    
    if (error) throw error
    return data as ScheduledMessage[]
  }
}
