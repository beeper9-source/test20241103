# 카카오톡 예약 메시지 시스템 설치 가이드

## 📋 준비사항

- Node.js 18 이상
- Supabase 계정 (무료)
- 텍스트 에디터 (VS Code 권장)

## 🚀 빠른 시작

### 1단계: 프로젝트 설치

```bash
# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 2단계: Supabase 데이터베이스 설정

#### 2-1. Supabase 프로젝트 접속

1. [Supabase](https://supabase.com) 로그인
2. 프로젝트 대시보드 접속: https://supabase.com/dashboard/project/nqwjvrznwzmfytjlpfsk

#### 2-2. 데이터베이스 테이블 생성

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭
3. `supabase-setup.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. 성공 메시지 확인: "Success. No rows returned"

#### 2-3. 테이블 확인

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. `scheduled_messages` 테이블이 생성되었는지 확인
3. 테이블 구조 확인:
   - id (UUID)
   - recipient (TEXT)
   - phone_number (TEXT)
   - message (TEXT)
   - scheduled_time (TIMESTAMPTZ)
   - status (TEXT)
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ)

### 3단계: 애플리케이션 사용

#### 메시지 예약하기

1. **받는 사람**: 이름 입력 (예: 홍길동)
2. **전화번호**: 010-1234-5678 형식으로 입력
3. **메시지**: 보낼 내용 작성
4. **발송 날짜**: 캘린더에서 선택
5. **발송 시간**: 시간 선택
6. **예약하기** 버튼 클릭

#### 예약 메시지 관리

- 오른쪽 패널에서 예약된 메시지 목록 확인
- 상태 확인:
  - 🟡 **대기중**: 발송 대기 중
  - 🟢 **발송완료**: 발송 완료
  - 🔴 **발송실패**: 발송 실패
- **삭제** 버튼으로 대기 중인 메시지 삭제 가능

## ⚙️ 환경 설정 (선택사항)

### API 키 변경

프로덕션 환경에서 사용 시 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://nqwjvrznwzmfytjlpfsk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

`src/lib/supabase.ts` 파일 수정:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 린트 검사
npm run lint
```

## 📱 카카오 API 연동 (고급)

현재는 시뮬레이션만 구현되어 있습니다. 실제 카카오톡 메시지를 발송하려면:

### 1. 카카오 개발자 가입

1. [카카오 개발자 센터](https://developers.kakao.com) 접속
2. 내 애플리케이션 등록
3. API 키 발급

### 2. 카카오톡 메시지 API 설정

1. **알림톡 API** 또는 **비즈메시지 API** 신청
2. 비즈니스 인증 완료
3. 발신 프로필 등록

### 3. 코드 수정

`src/App.tsx`의 `checkAndSendMessages` 함수 수정:

```typescript
const checkAndSendMessages = useCallback(async () => {
  try {
    const pendingMessages = await messageService.getPendingMessages()
    
    for (const msg of pendingMessages) {
      // 카카오 API 호출 예시
      try {
        await fetch('https://kapi.kakao.com/v2/api/talk/memo/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KAKAO_ACCESS_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            template_object: JSON.stringify({
              object_type: 'text',
              text: msg.message,
              link: {
                web_url: 'https://your-site.com',
                mobile_web_url: 'https://your-site.com'
              }
            })
          })
        })
        
        if (msg.id) {
          await messageService.updateMessageStatus(msg.id, 'sent')
        }
      } catch (error) {
        console.error('발송 실패:', error)
        if (msg.id) {
          await messageService.updateMessageStatus(msg.id, 'failed')
        }
      }
    }
    
    if (pendingMessages.length > 0) {
      loadMessages()
    }
  } catch (err) {
    console.error('메시지 확인 실패:', err)
  }
}, [loadMessages])
```

## 🔐 보안 강화 (프로덕션)

### Row Level Security (RLS) 강화

현재는 모든 사용자가 모든 데이터에 접근 가능합니다. 프로덕션에서는:

1. Supabase에서 **Authentication** 활성화
2. SQL Editor에서 RLS 정책 수정:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON scheduled_messages;
DROP POLICY IF EXISTS "Enable insert access for all users" ON scheduled_messages;
DROP POLICY IF EXISTS "Enable update access for all users" ON scheduled_messages;
DROP POLICY IF EXISTS "Enable delete access for all users" ON scheduled_messages;

-- 사용자별 정책 생성
CREATE POLICY "Users can view own messages" ON scheduled_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON scheduled_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON scheduled_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON scheduled_messages
    FOR DELETE USING (auth.uid() = user_id);
```

3. `scheduled_messages` 테이블에 `user_id` 컬럼 추가:

```sql
ALTER TABLE scheduled_messages ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

## 🐛 문제 해결

### 데이터베이스 연결 오류

```
Error: Invalid API key
```

**해결방법**: `src/lib/supabase.ts`의 API 키가 올바른지 확인

### 메시지가 발송되지 않음

**가능한 원인**:
1. 예약 시간이 과거인 경우
2. 브라우저 탭이 비활성화된 경우 (백그라운드 제한)
3. 네트워크 연결 문제

**해결방법**: 
- 미래 시간으로 예약
- 브라우저 탭 활성화 상태 유지
- 네트워크 연결 확인

### 빌드 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📞 지원

- 버그 리포트: GitHub Issues
- 질문: GitHub Discussions
- 이메일: support@example.com

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

---

**제작**: 2025년 11월
**버전**: 1.0.0
