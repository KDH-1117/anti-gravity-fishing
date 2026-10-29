-- ========================================================
-- [안티그래비티 축제 낚시 부스] Supabase 데이터베이스 초기화 스키마
-- Supabase 대시보드 -> SQL Editor -> New Query 에 붙여넣고 RUN을 누르세요.
-- ========================================================

-- 1. 부스 글로벌 설정 테이블 생성
CREATE TABLE IF NOT EXISTS public.booth_settings (
  id INT PRIMARY KEY DEFAULT 1,
  time_limit INT NOT NULL DEFAULT 60,
  cost_text TEXT NOT NULL DEFAULT '1 ESTA',
  display_success INT NOT NULL DEFAULT 50,
  display_keep INT NOT NULL DEFAULT 30,
  display_downgrade INT NOT NULL DEFAULT 20,
  hidden_success INT NOT NULL DEFAULT 25,
  hidden_keep INT NOT NULL DEFAULT 35,
  hidden_downgrade INT NOT NULL DEFAULT 40,
  auth_password TEXT NOT NULL DEFAULT '105fish',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 기본 단일 레코드 삽입 (id=1)
INSERT INTO public.booth_settings (
  id, time_limit, cost_text,
  display_success, display_keep, display_downgrade,
  hidden_success, hidden_keep, hidden_downgrade,
  auth_password
)
VALUES (
  1, 60, '1 ESTA',
  50, 30, 20,
  25, 35, 40,
  '105fish'
)
ON CONFLICT (id) DO NOTHING;

-- 2. 참가자 낚시 점수 및 리더보드 테이블 생성
CREATE TABLE IF NOT EXISTS public.booth_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  rod_level INT NOT NULL DEFAULT 1,
  score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 점수 내림차순 인덱스 (리더보드 고속 조회를 위함)
CREATE INDEX IF NOT EXISTS idx_booth_scores_score_desc ON public.booth_scores(score DESC, created_at ASC);

-- 3. Row Level Security (RLS) 설정: 부스 운영을 위해 익명(anon) 접근 전체 허용
ALTER TABLE public.booth_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booth_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select booth_settings" ON public.booth_settings;
CREATE POLICY "Public select booth_settings" ON public.booth_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update booth_settings" ON public.booth_settings;
CREATE POLICY "Public update booth_settings" ON public.booth_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public select booth_scores" ON public.booth_scores;
CREATE POLICY "Public select booth_scores" ON public.booth_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert booth_scores" ON public.booth_scores;
CREATE POLICY "Public insert booth_scores" ON public.booth_scores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete booth_scores" ON public.booth_scores;
CREATE POLICY "Public delete booth_scores" ON public.booth_scores FOR DELETE USING (true);

-- 4. 실시간(Realtime) 변경 사항 브로드캐스트 활성화
-- 리더보드 점수 갱신 및 관리자 확률 변경 시 연결된 모든 기기가 실시간 즉시 반영되도록 설정
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.booth_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booth_scores;
