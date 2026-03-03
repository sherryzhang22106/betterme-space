-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 创建默认管理员账号
-- 用户名: admin
-- 密码: shark0702
INSERT INTO admins (username, password_hash, role)
VALUES ('admin', '$2b$10$nRvBWxB.xpUKg8O4K/Lqv.knfwaf63zZKVSH4qoibs3Dymx1cfESm', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 索引
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
