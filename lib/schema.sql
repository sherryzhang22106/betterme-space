-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT phone_or_email CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- 答题记录表
CREATE TABLE IF NOT EXISTS assessment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  assessment_id VARCHAR(100) NOT NULL,
  answers JSONB NOT NULL,
  score DECIMAL(10,2),
  dimension_scores JSONB,
  result_id VARCHAR(100),
  duration INTEGER,
  poster_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_records_user_id ON assessment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_assessment_id ON assessment_records(assessment_id);

-- 测评统计表
CREATE TABLE IF NOT EXISTS assessment_stats (
  assessment_id VARCHAR(100) PRIMARY KEY,
  total_count INTEGER DEFAULT 0,
  avg_score DECIMAL(10,2),
  avg_duration INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);
