/**
 * 카카오톡 API 연동을 위한 헬퍼 함수
 * 
 * 실제 카카오톡 메시지 전송은 백엔드 서버에서 처리해야 합니다.
 * 이 파일은 프론트엔드에서 사용할 수 있는 API 호출 예시를 제공합니다.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export interface SendMessageRequest {
  recipient: string
  message: string
}

export interface SendMessageResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * 카카오톡 메시지 전송 API 호출
 * 실제 구현은 백엔드 서버에서 처리됩니다.
 */
export async function sendKakaoMessage(
  recipient: string,
  message: string
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/kakao/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('카카오톡 메시지 전송 실패:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}

/**
 * 예약된 메시지 전송 처리
 * 백엔드에서 스케줄러를 통해 주기적으로 호출되어야 합니다.
 */
export async function processScheduledMessages(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/kakao/process-scheduled`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('예약 메시지 처리 결과:', data)
  } catch (error) {
    console.error('예약 메시지 처리 실패:', error)
  }
}
