# 카카오톡 API 설정 가이드

## 개요

이 애플리케이션은 카카오톡 예약 메시지를 관리하는 기능을 제공합니다. 실제 카카오톡 메시지 전송을 위해서는 백엔드 서버를 구축하고 카카오톡 비즈니스 API를 연동해야 합니다.

## 데이터베이스 설정

1. Supabase 대시보드에 접속합니다.
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용을 실행하여 테이블을 생성합니다.

## 카카오톡 API 연동 방법

### 1. 카카오톡 비즈니스 API 신청

- [카카오 비즈니스](https://business.kakao.com/)에 접속하여 서비스를 신청합니다.
- 알림톡 또는 친구톡 서비스를 선택합니다.
- 앱 키(App Key)와 시크릿 키(Secret Key)를 발급받습니다.

### 2. 백엔드 서버 구축

카카오톡 API는 서버 사이드에서만 호출할 수 있으므로, 백엔드 서버를 구축해야 합니다.

#### 예시: Node.js/Express 서버

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 카카오톡 메시지 전송
app.post('/api/kakao/send', async (req, res) => {
  const { recipient, message } = req.body;
  
  try {
    // 카카오톡 API 호출
    const kakaoResponse = await axios.post(
      'https://kapi.kakao.com/v2/api/talk/memo/default/send',
      {
        receiver_uuids: [recipient],
        template_object: {
          object_type: 'text',
          text: message,
          link: {
            web_url: '',
            mobile_web_url: '',
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KAKAO_ACCESS_TOKEN}`,
        },
      }
    );

    res.json({ success: true, message: '메시지가 전송되었습니다.' });
  } catch (error) {
    console.error('카카오톡 전송 실패:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 예약된 메시지 처리 (스케줄러에서 호출)
app.post('/api/kakao/process-scheduled', async (req, res) => {
  try {
    const now = new Date().toISOString();
    
    // 전송 대기 중인 메시지 조회
    const { data: messages } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_at', now);

    for (const msg of messages || []) {
      // 카카오톡 메시지 전송
      await sendKakaoMessage(msg.recipient, msg.message);
      
      // 전송 완료 표시
      await supabase
        .from('scheduled_messages')
        .update({ sent: true })
        .eq('id', msg.id);
    }

    res.json({ success: true, processed: messages?.length || 0 });
  } catch (error) {
    console.error('예약 메시지 처리 실패:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('서버가 포트 3000에서 실행 중입니다.');
});
```

### 3. 스케줄러 설정

예약된 메시지를 자동으로 전송하려면 스케줄러를 설정해야 합니다.

#### 옵션 1: Supabase Edge Functions 사용

```typescript
// supabase/functions/process-scheduled-messages/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString()
  
  const { data: messages } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('sent', false)
    .lte('scheduled_at', now)

  // 카카오톡 API 호출 및 메시지 전송 로직
  // ...

  return new Response(JSON.stringify({ processed: messages?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

#### 옵션 2: Cron Job 사용

```bash
# 매 분마다 실행되는 cron job
* * * * * curl -X POST http://localhost:3000/api/kakao/process-scheduled
```

## 환경 변수 설정

백엔드 서버에서 다음 환경 변수를 설정하세요:

```env
SUPABASE_URL=https://nqwjvrznwzmfytjlpfsk.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
KAKAO_ACCESS_TOKEN=your_kakao_access_token
KAKAO_APP_KEY=your_kakao_app_key
KAKAO_SECRET_KEY=your_kakao_secret_key
```

## 프론트엔드 환경 변수

`.env` 파일을 생성하고 다음을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 참고 사항

- 카카오톡 API는 OAuth 인증이 필요합니다.
- 실제 운영 환경에서는 보안을 강화해야 합니다.
- RLS(Row Level Security) 정책을 적절히 설정하세요.
- 카카오톡 API 사용량 제한을 확인하세요.
