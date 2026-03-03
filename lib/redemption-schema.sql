-- 兑换码表
CREATE TABLE IF NOT EXISTS redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  product_id VARCHAR(100) NOT NULL, -- 对应 assessment_id，如 'attachment-style', 'love-health' 等
  product_name VARCHAR(100) NOT NULL, -- 产品名称，如 '依恋风格', '恋爱健康指数'
  batch_no VARCHAR(50), -- 批次号，方便批量管理
  status VARCHAR(20) DEFAULT 'active', -- active: 未使用, used: 已使用, expired: 已过期
  used_by UUID REFERENCES users(id), -- 使用者 ID
  used_at TIMESTAMP, -- 使用时间
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id), -- 创建者（管理员）
  expires_at TIMESTAMP, -- 过期时间（可选）
  notes TEXT -- 备注信息
);

-- 兑换记录表
CREATE TABLE IF NOT EXISTS redemption_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES redemption_codes(id),
  code VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  product_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_codes_code ON redemption_codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_product_id ON redemption_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_codes_status ON redemption_codes(status);
CREATE INDEX IF NOT EXISTS idx_codes_batch_no ON redemption_codes(batch_no);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON redemption_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_code_id ON redemption_logs(code_id);

-- 用户表添加角色字段（如果还没有）
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'; -- user, admin
ALTER TABLE users ADD COLUMN IF NOT EXISTS account VARCHAR(50) UNIQUE; -- 统一账号字段
