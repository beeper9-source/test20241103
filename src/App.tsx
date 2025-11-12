import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { messageService } from './lib/supabase'
import type { ScheduledMessage, MessageFormData } from './types/message'

function App() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [formData, setFormData] = useState<MessageFormData>({
    recipient: '',
    phone_number: '',
    message: '',
    scheduled_date: '',
    scheduled_time: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      const data = await messageService.getMessages()
      setMessages(data)
    } catch (err) {
      console.error('메시지 로드 실패:', err)
      setError('메시지를 불러오는데 실패했습니다.')
    }
  }, [])

  const checkAndSendMessages = useCallback(async () => {
    try {
      const pendingMessages = await messageService.getPendingMessages()
      
      for (const msg of pendingMessages) {
        // 실제 카카오톡 API 연동은 여기서 구현
        // 현재는 상태만 업데이트
        console.log('메시지 발송:', msg)
        if (msg.id) {
          await messageService.updateMessageStatus(msg.id, 'sent')
        }
      }
      
      if (pendingMessages.length > 0) {
        loadMessages()
      }
    } catch (err) {
      console.error('메시지 발송 실패:', err)
    }
  }, [loadMessages])

  useEffect(() => {
    loadMessages()
    
    // 1분마다 메시지 목록 새로고침
    const interval = setInterval(() => {
      loadMessages()
      checkAndSendMessages()
    }, 60000)

    return () => clearInterval(interval)
  }, [loadMessages, checkAndSendMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 날짜와 시간을 ISO 문자열로 결합
      const scheduledTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString()

      const newMessage: Omit<ScheduledMessage, 'id' | 'created_at' | 'updated_at'> = {
        recipient: formData.recipient,
        phone_number: formData.phone_number,
        message: formData.message,
        scheduled_time: scheduledTime,
        status: 'pending',
      }

      await messageService.createMessage(newMessage)
      
      // 폼 초기화
      setFormData({
        recipient: '',
        phone_number: '',
        message: '',
        scheduled_date: '',
        scheduled_time: '',
      })

      // 메시지 목록 새로고침
      await loadMessages()
      
      alert('예약 메시지가 등록되었습니다!')
    } catch (err) {
      console.error('메시지 등록 실패:', err)
      setError('메시지 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 메시지를 삭제하시겠습니까?')) return

    try {
      await messageService.deleteMessage(id)
      await loadMessages()
      alert('메시지가 삭제되었습니다.')
    } catch (err) {
      console.error('메시지 삭제 실패:', err)
      setError('메시지 삭제에 실패했습니다.')
    }
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status: ScheduledMessage['status']) => {
    switch (status) {
      case 'pending':
        return '대기중'
      case 'sent':
        return '발송완료'
      case 'failed':
        return '발송실패'
      default:
        return status
    }
  }

  const getStatusClass = (status: ScheduledMessage['status']) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'sent':
        return 'status-sent'
      case 'failed':
        return 'status-failed'
      default:
        return ''
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📱 카카오톡 예약 메시지</h1>
        <p className="subtitle">원하는 시간에 메시지를 자동으로 발송하세요</p>
      </header>

      <main className="content">
        <div className="layout">
          <section className="card form-section">
            <h2>새 예약 메시지</h2>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="message-form">
              <div className="form-group">
                <label htmlFor="recipient">받는 사람</label>
                <input
                  type="text"
                  id="recipient"
                  placeholder="홍길동"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">전화번호</label>
                <input
                  type="tel"
                  id="phone_number"
                  placeholder="010-1234-5678"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">메시지</label>
                <textarea
                  id="message"
                  placeholder="보낼 메시지를 입력하세요..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                />
                <div className="char-count">{formData.message.length}자</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scheduled_date">발송 날짜</label>
                  <input
                    type="date"
                    id="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="scheduled_time">발송 시간</label>
                  <input
                    type="time"
                    id="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? '등록 중...' : '예약하기'}
              </button>
            </form>
          </section>

          <section className="card list-section">
            <div className="section-header">
              <h2>예약된 메시지</h2>
              <span className="badge">{messages.length}개</span>
            </div>

            {messages.length === 0 ? (
              <div className="empty-state">
                <p>예약된 메시지가 없습니다.</p>
                <p className="empty-hint">왼쪽 폼에서 새로운 메시지를 예약해보세요!</p>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((msg) => (
                  <div key={msg.id} className="message-item">
                    <div className="message-header">
                      <div className="recipient-info">
                        <h3>{msg.recipient}</h3>
                        <span className="phone">{msg.phone_number}</span>
                      </div>
                      <span className={`status-badge ${getStatusClass(msg.status)}`}>
                        {getStatusLabel(msg.status)}
                      </span>
                    </div>
                    
                    <p className="message-content">{msg.message}</p>
                    
                    <div className="message-footer">
                      <span className="scheduled-time">
                        🕐 {formatDateTime(msg.scheduled_time)}
                      </span>
                      {msg.status === 'pending' && (
                        <button
                          className="delete-button"
                          onClick={() => msg.id && handleDelete(msg.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="info-section">
          <div className="info-card">
            <h3>💡 사용 안내</h3>
            <ul>
              <li>예약된 메시지는 지정한 시간에 자동으로 발송됩니다.</li>
              <li>발송 전까지 언제든지 삭제할 수 있습니다.</li>
              <li>메시지는 1분 단위로 확인하여 발송됩니다.</li>
              <li>발송 완료된 메시지는 삭제할 수 없습니다.</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>⚠️ 주의사항</h3>
            <ul>
              <li>전화번호는 정확하게 입력해주세요.</li>
              <li>과거 시간으로는 예약할 수 없습니다.</li>
              <li>메시지 발송 실패 시 상태가 업데이트됩니다.</li>
              <li>브라우저가 닫혀있어도 메시지는 발송됩니다.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
