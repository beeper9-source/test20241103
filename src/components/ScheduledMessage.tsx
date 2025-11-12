import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase, type ScheduledMessage } from '../lib/supabase'
import './ScheduledMessage.css'

export default function ScheduledMessageComponent() {
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('메시지 로드 실패:', err)
      setError('메시지를 불러오는데 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!recipient || !message || !scheduledDate || !scheduledTime) {
      setError('모든 필드를 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)
      
      if (scheduledAt <= new Date()) {
        setError('예약 시간은 현재 시간 이후여야 합니다.')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('scheduled_messages')
        .insert([
          {
            recipient,
            message,
            scheduled_at: scheduledAt.toISOString(),
            sent: false,
          },
        ])

      if (error) throw error

      setSuccess('예약 메시지가 등록되었습니다!')
      setRecipient('')
      setMessage('')
      setScheduledDate('')
      setScheduledTime('')
      await loadMessages()
    } catch (err: any) {
      console.error('메시지 등록 실패:', err)
      setError(err.message || '메시지 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadMessages()
      setSuccess('메시지가 삭제되었습니다.')
    } catch (err: any) {
      setError(err.message || '메시지 삭제에 실패했습니다.')
    }
  }

  const formatScheduledDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm')
    } catch {
      return dateString
    }
  }

  return (
    <section className="card scheduled-message">
      <div className="section-header">
        <h2>카카오톡 예약 메시지</h2>
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="recipient">받는 사람</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="전화번호 또는 카카오톡 ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">메시지 내용</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="전송할 메시지를 입력하세요"
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduledDate">예약 날짜</label>
            <input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduledTime">예약 시간</label>
            <input
              id="scheduledTime"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? '등록 중...' : '예약 메시지 등록'}
        </button>
      </form>

      <div className="messages-list">
        <h3>예약된 메시지 목록</h3>
        {messages.length === 0 ? (
          <p className="empty-state">예약된 메시지가 없습니다.</p>
        ) : (
          <div className="messages-grid">
            {messages.map((msg) => (
              <div key={msg.id} className="message-card">
                <div className="message-card__header">
                  <span className={`status-badge ${msg.sent ? 'status-badge--sent' : 'status-badge--pending'}`}>
                    {msg.sent ? '전송 완료' : '대기 중'}
                  </span>
                  {!msg.sent && msg.id && (
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(msg.id!)}
                      type="button"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="message-card__content">
                  <p className="message-card__recipient">
                    <strong>받는 사람:</strong> {msg.recipient}
                  </p>
                  <p className="message-card__message">{msg.message}</p>
                  <p className="message-card__time">
                    <strong>예약 시간:</strong> {formatScheduledDate(msg.scheduled_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
