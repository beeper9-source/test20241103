-- 카카오톡 예약 메시지 테이블 생성
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id BIGSERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_at ON scheduled_messages(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_sent ON scheduled_messages(sent);

-- RLS (Row Level Security) 정책 설정 (선택사항)
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정 (실제 운영 시에는 더 엄격한 정책 필요)
CREATE POLICY "Allow all operations" ON scheduled_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);
