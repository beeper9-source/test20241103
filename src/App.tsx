import { useEffect, useMemo, useRef, useState } from 'react'

import './App.css'

type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'

type ScheduledMessage = {
  id: string
  message: string
  scheduledAt: string
  status: MessageStatus
  createdAt: string
  sentAt?: string
  error?: string
}

const ACCESS_TOKEN_STORAGE_KEY = 'kakao-scheduler-access-token'
const SCHEDULE_STORAGE_KEY = 'kakao-scheduler-schedules'
const CHECK_INTERVAL_MS = 3000
const DEFAULT_LINK = {
  web_url: 'https://talk.kakao.com',
  mobile_web_url: 'https://talk.kakao.com',
}

const padTime = (value: number) => value.toString().padStart(2, '0')

const getDefaultDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${padTime(now.getMonth() + 1)}-${padTime(now.getDate())}`
}

const getDefaultTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5)
  return `${padTime(now.getHours())}:${padTime(now.getMinutes())}`
}

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '알 수 없음'
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`
}

const ensureValidDate = (date: string, fallback: string) => {
  if (!date) return fallback
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return fallback
  return date
}

const ensureValidTime = (time: string, fallback: string) => {
  if (!time) return fallback
  const [hour, minute] = time.split(':').map(Number)
  if (Number.isInteger(hour) && Number.isInteger(minute)) return time
  return fallback
}

const buildScheduledDate = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const scheduled = new Date()
  scheduled.setFullYear(year, month - 1, day)
  scheduled.setHours(hours, minutes, 0, 0)
  return scheduled
}

const loadToken = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? ''
}

const loadSchedules = (): ScheduledMessage[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(SCHEDULE_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as ScheduledMessage[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      ...item,
      status: item.status ?? 'pending',
    }))
  } catch (error) {
    console.warn('예약 메시지 불러오기 실패', error)
    return []
  }
}

const saveToken = (token: string) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

const saveSchedules = (schedules: ScheduledMessage[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules))
}

const sendKakaoMemo = async (token: string, text: string) => {
  const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: new URLSearchParams({
      template_object: JSON.stringify({
        object_type: 'text',
        text,
        link: DEFAULT_LINK,
      }),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `HTTP ${response.status}${errorText ? ` • ${errorText.slice(0, 200)}` : ''}`,
    )
  }
}

function App() {
  const [accessToken, setAccessToken] = useState<string>(() => loadToken())
  const [message, setMessage] = useState('')
  const [scheduleDate, setScheduleDate] = useState(() => getDefaultDate())
  const [scheduleTime, setScheduleTime] = useState(() => getDefaultTime())
  const [schedules, setSchedules] = useState<ScheduledMessage[]>(() => loadSchedules())
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const processingRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    saveToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    saveSchedules(schedules)
  }, [schedules])

  useEffect(() => {
    if (!accessToken) return

    const tick = () => {
      const now = Date.now()
      const dueMessages = schedules.filter(
        (item) =>
          item.status === 'pending' &&
          new Date(item.scheduledAt).getTime() <= now &&
          !processingRef.current.has(item.id),
      )

      dueMessages.forEach((item) => {
        void processMessage(item)
      })
    }

    const interval = window.setInterval(tick, CHECK_INTERVAL_MS)
    tick()

    return () => window.clearInterval(interval)
  }, [accessToken, schedules])

  useEffect(() => {
    if (!formError) return
    const timeout = window.setTimeout(() => setFormError(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [formError])

  useEffect(() => {
    if (!infoMessage) return
    const timeout = window.setTimeout(() => setInfoMessage(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [infoMessage])

  const pendingCount = useMemo(
    () => schedules.filter((item) => item.status === 'pending').length,
    [schedules],
  )

  const buildScheduledMessage = (): ScheduledMessage | null => {
    const safeDate = ensureValidDate(scheduleDate, getDefaultDate())
    const safeTime = ensureValidTime(scheduleTime, getDefaultTime())
    const scheduled = buildScheduledDate(safeDate, safeTime)

    if (Number.isNaN(scheduled.getTime())) {
      setFormError('날짜와 시간이 올바르지 않습니다.')
      return null
    }

    if (scheduled.getTime() < Date.now() + 5000) {
      setFormError('예약 시간은 현재 시각보다 최소 5초 이상 뒤여야 합니다.')
      return null
    }

    if (!accessToken.trim()) {
      setFormError('카카오 액세스 토큰을 입력해주세요.')
      return null
    }

    if (!message.trim()) {
      setFormError('보낼 메시지를 입력해주세요.')
      return null
    }

    if (message.length > 1000) {
      setFormError('메시지는 1000자 이내여야 합니다.')
      return null
    }

    const newMessage: ScheduledMessage = {
      id: crypto.randomUUID(),
      message: message.trim(),
      scheduledAt: scheduled.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    return newMessage
  }

  const handleScheduleMessage = () => {
    const created = buildScheduledMessage()
    if (!created) return

    setSchedules((prev) => [...prev, created].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)))
    setMessage('')
    setInfoMessage('예약이 추가되었습니다.')
  }

  const processMessage = async (item: ScheduledMessage) => {
    if (!accessToken) return
    processingRef.current.add(item.id)
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === item.id ? { ...schedule, status: 'sending', error: undefined } : schedule,
      ),
    )

    try {
      await sendKakaoMemo(accessToken, item.message)
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === item.id
            ? { ...schedule, status: 'sent', sentAt: new Date().toISOString(), error: undefined }
            : schedule,
        ),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === item.id
            ? { ...schedule, status: 'failed', error: message }
            : schedule,
        ),
      )
    } finally {
      processingRef.current.delete(item.id)
    }
  }

  const handleSendNow = (id: string) => {
    const target = schedules.find((item) => item.id === id)
    if (!target || processingRef.current.has(id)) return
    void processMessage(target)
  }

  const handleCancel = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id && item.status === 'pending' ? { ...item, status: 'cancelled' } : item,
      ),
    )
  }

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id))
  }

  const handleRetry = (id: string) => {
    const target = schedules.find((item) => item.id === id)
    if (!target) return

    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'pending',
              error: undefined,
              scheduledAt: new Date(Date.now() + 5000).toISOString(),
            }
          : item,
      ),
    )
    setInfoMessage('5초 뒤 재전송을 다시 시도합니다.')
  }

  const handleBulkClear = () => {
    setSchedules((prev) => prev.filter((item) => item.status === 'pending' || item.status === 'sending'))
  }

  const handleTestSend = async () => {
    if (!accessToken) {
      setFormError('카카오 액세스 토큰을 입력해주세요.')
      return
    }

    setIsSendingTest(true)
    try {
      await sendKakaoMemo(accessToken, '[테스트] 카카오톡 메시지 전송이 정상적으로 작동합니다.')
      setInfoMessage('테스트 메시지를 보냈습니다.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '테스트 메시지 전송 중 오류가 발생했습니다.'
      setFormError(message)
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>카카오톡 예약 메시지</h1>
          <p className="header__subtitle">
            Kakao Developers에서 발급한 사용자 액세스 토큰을 이용해 나에게 메시지를 예약 발송합니다.
            창을 닫으면 예약 실행이 중단되므로 백그라운드 작업이 필요하면 별도 서버를 구성하세요.
          </p>
        </div>
        <div className="header__status">
          <span className="header__status-value">{pendingCount}</span>
          <span className="header__status-label">대기 중 예약</span>
        </div>
      </header>

      <main className="main">
        <section className="card">
          <h2>액세스 토큰</h2>
          <p className="card__description">
            카카오 인증 과정을 통해 발급받은 사용자 액세스 토큰을 입력하세요. 토큰은 로컬 스토리지에만
            저장됩니다.
          </p>
          <div className="field">
            <label htmlFor="token">REST API 액세스 토큰</label>
            <textarea
              id="token"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              spellCheck={false}
              rows={3}
            />
          </div>
          <div className="token-actions">
            <button
              type="button"
              className="button button--primary"
              onClick={handleTestSend}
              disabled={!accessToken || isSendingTest}
            >
              {isSendingTest ? '테스트 전송 중...' : '토큰 테스트 메시지 보내기'}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setAccessToken('')
                setInfoMessage('토큰을 삭제했습니다.')
              }}
            >
              토큰 삭제
            </button>
          </div>
        </section>

        <section className="card">
          <h2>메시지 예약</h2>
          <p className="card__description">
            기본 텍스트 템플릿으로 예약 메시지를 발송합니다. 링크 영역은 카카오톡 실행 링크로 자동 설정됩니다.
          </p>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="schedule-date">날짜</label>
              <input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="schedule-time">시간</label>
              <input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="message">메시지 내용</label>
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="예약 메시지를 입력하세요. (최대 1000자)"
              rows={4}
            />
          </div>
          <div className="actions">
            <button type="button" className="button button--primary" onClick={handleScheduleMessage}>
              메시지 예약 추가
            </button>
            <button type="button" className="button button--ghost" onClick={() => setMessage('')}>
              내용 초기화
            </button>
          </div>
          {formError && <p className="alert alert--error">{formError}</p>}
          {infoMessage && <p className="alert alert--info">{infoMessage}</p>}
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <h2>예약 내역</h2>
              <p className="card__description">
                예약된 메시지는 로컬 스토리지에 저장됩니다. 장시간 예약은 창을 닫으면 전송되지 않으니 주의하세요.
              </p>
            </div>
            <div className="card__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={handleBulkClear}
                disabled={!schedules.some((item) => item.status !== 'pending' && item.status !== 'sending')}
              >
                완료/실패 항목 정리
              </button>
            </div>
          </div>

          {schedules.length === 0 ? (
            <p className="empty">예약된 메시지가 없습니다.</p>
          ) : (
            <ul className="schedule-list">
              {schedules.map((item) => (
                <li key={item.id} className={`schedule schedule--${item.status}`}>
                  <div className="schedule__meta">
                    <span className="schedule__status">{item.status}</span>
                    <span className="schedule__time">{formatDateTime(item.scheduledAt)}</span>
                    {item.status === 'sent' && item.sentAt && (
                      <span className="schedule__time schedule__time--sub">
                        전송 완료: {formatDateTime(item.sentAt)}
                      </span>
                    )}
                    {item.status === 'failed' && item.error && (
                      <span className="schedule__error">실패 사유: {item.error}</span>
                    )}
                  </div>
                  <pre className="schedule__message">{item.message}</pre>
                  <div className="schedule__actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleSendNow(item.id)}
                      disabled={
                        item.status !== 'pending' || processingRef.current.has(item.id) || !accessToken
                      }
                    >
                      지금 보내기
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleCancel(item.id)}
                      disabled={item.status !== 'pending'}
                    >
                      예약 취소
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleRetry(item.id)}
                      disabled={item.status !== 'failed'}
                    >
                      재시도
                    </button>
                    <button type="button" className="button button--danger" onClick={() => handleDelete(item.id)}>
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>사용 가이드</h2>
          <ul className="guide-list">
            <li>
              카카오 디벨로퍼스에서 애플리케이션을 등록하고 사용자 토큰 발급 권한(카카오톡 메시지)을
              활성화해야 합니다.
            </li>
            <li>
              액세스 토큰은 최대 6시간 유지됩니다. 만료되면 새 토큰으로 갱신하고 토큰 테스트 전송으로 확인하세요.
            </li>
            <li>현재 구현은 &ldquo;나에게 보내기&rdquo; 기본 텍스트 템플릿만 지원합니다.</li>
            <li>브라우저가 종료되거나 절전 상태가 되면 예약 실행이 중단됩니다. 실서비스에는 서버/워커 구성이 필요합니다.</li>
            <li>카카오 정책에 따라 메시지 전송량과 사용 목적을 반드시 준수하세요.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
