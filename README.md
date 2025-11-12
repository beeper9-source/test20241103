# 카카오톡 예약 메시지 시스템

React + TypeScript + Vite + Supabase로 구축된 카카오톡 예약 메시지 발송 시스템입니다.

## 주요 기능

- ✉️ 메시지 예약 및 자동 발송
- 📅 날짜와 시간 선택
- 📋 예약된 메시지 목록 관리
- 🗑️ 발송 전 메시지 삭제
- ✅ 발송 상태 실시간 업데이트
- 💾 Supabase를 통한 데이터 영구 저장

## 설치 방법

1. 의존성 패키지 설치:
```bash
npm install
```

2. Supabase 데이터베이스 설정:
   - Supabase 프로젝트에 로그인
   - SQL Editor에서 `supabase-setup.sql` 파일의 내용을 실행
   - 테이블이 생성되었는지 확인

3. 개발 서버 실행:
```bash
npm run dev
```

## Supabase 설정

### 1. 테이블 생성

`supabase-setup.sql` 파일을 Supabase SQL Editor에서 실행하면 다음이 생성됩니다:

- `scheduled_messages` 테이블
- 성능 향상을 위한 인덱스
- 자동 타임스탬프 업데이트 트리거
- Row Level Security 정책

### 2. API 키 확인

현재 설정된 Supabase 정보:
- URL: `https://nqwjvrznwzmfytjlpfsk.supabase.co`
- Anon Key: 이미 코드에 포함됨

> ⚠️ **보안 주의**: 프로덕션 환경에서는 환경 변수(.env)를 사용하여 API 키를 관리하세요!

## 데이터베이스 스키마

```sql
scheduled_messages
├── id (UUID, PK)
├── recipient (TEXT) - 받는 사람 이름
├── phone_number (TEXT) - 전화번호
├── message (TEXT) - 메시지 내용
├── scheduled_time (TIMESTAMPTZ) - 예약 시간
├── status (TEXT) - 상태 (pending/sent/failed)
├── created_at (TIMESTAMPTZ) - 생성 시간
└── updated_at (TIMESTAMPTZ) - 수정 시간
```

## 사용 방법

1. **메시지 예약하기**
   - 받는 사람 이름과 전화번호 입력
   - 보낼 메시지 작성
   - 발송할 날짜와 시간 선택
   - "예약하기" 버튼 클릭

2. **예약 메시지 관리**
   - 오른쪽 패널에서 예약된 메시지 목록 확인
   - 각 메시지의 상태 확인 (대기중/발송완료/발송실패)
   - 발송 전 메시지는 삭제 가능

3. **자동 발송**
   - 시스템이 1분마다 발송 시간이 된 메시지를 확인
   - 자동으로 상태가 '발송완료'로 업데이트

## 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Custom CSS
- **State Management**: React Hooks

## 프로젝트 구조

```
/workspace
├── src/
│   ├── App.tsx              # 메인 컴포넌트
│   ├── App.css              # 스타일
│   ├── lib/
│   │   └── supabase.ts      # Supabase 클라이언트 & API
│   ├── types/
│   │   └── message.ts       # TypeScript 타입 정의
│   └── main.tsx             # 엔트리 포인트
├── supabase-setup.sql       # DB 초기화 스크립트
└── README.md
```

## 개발 계획

### 현재 구현된 기능
- ✅ 기본 UI/UX
- ✅ Supabase 연동
- ✅ 메시지 CRUD 작업
- ✅ 스케줄링 로직

### 향후 개선 사항
- [ ] 실제 카카오톡 API 연동
- [ ] 사용자 인증 시스템
- [ ] 메시지 템플릿 기능
- [ ] 반복 예약 기능
- [ ] 이메일/SMS 알림
- [ ] 통계 및 분석 대시보드
- [ ] 모바일 반응형 최적화

## 주의사항

1. **카카오 API 연동**: 현재는 시뮬레이션만 구현되어 있습니다. 실제 카카오톡 메시지를 발송하려면 [카카오 비즈니스 API](https://developers.kakao.com/product/message)에 가입하고 인증이 필요합니다.

2. **브라우저 제약**: 예약 메시지 확인은 1분 간격으로 이루어집니다. 정확한 발송을 위해서는 서버 사이드 크론 작업이 필요합니다.

3. **보안**: 프로덕션 배포 시 RLS 정책을 강화하고 사용자 인증을 구현하세요.

## 라이선스

MIT License

## 문의

버그 리포트나 기능 제안은 이슈를 통해 남겨주세요!
