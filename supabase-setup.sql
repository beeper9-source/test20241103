-- 카카오톡 예약 메시지 테이블 생성
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_time ON scheduled_messages(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status_time ON scheduled_messages(status, scheduled_time);

-- 자동으로 updated_at 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_scheduled_messages_updated_at ON scheduled_messages;
CREATE TRIGGER update_scheduled_messages_updated_at
    BEFORE UPDATE ON scheduled_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화 (선택사항)
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정 (개발용, 프로덕션에서는 수정 필요)
CREATE POLICY "Enable read access for all users" ON scheduled_messages
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON scheduled_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON scheduled_messages
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON scheduled_messages
    FOR DELETE USING (true);
