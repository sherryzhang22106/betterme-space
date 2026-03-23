-- ============================================
-- 配置驱动的模块化测评系统 - 数据库表结构
-- ============================================

-- 1. 主题表（测评主题配置）
CREATE TABLE IF NOT EXISTS themes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255),
  price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active | inactive | draft
  question_count INT DEFAULT 0,
  estimated_time INT, -- 预计完成时间（分钟）
  ai_enabled BOOLEAN DEFAULT false, -- 是否启用 AI 解析
  ai_system_prompt TEXT, -- AI 系统提示词
  ai_model VARCHAR(50) DEFAULT 'deepseek-chat', -- AI 模型
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 题目表
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(50) REFERENCES themes(id) ON DELETE CASCADE,
  order_num INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'single_choice', -- single_choice | multiple_choice | scale
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 选项表
CREATE TABLE IF NOT EXISTS question_options (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_value INT NOT NULL, -- 选项分值
  order_num INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 评分规则表（结果模板）
CREATE TABLE IF NOT EXISTS scoring_rules (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(50) REFERENCES themes(id) ON DELETE CASCADE,
  min_score INT NOT NULL,
  max_score INT NOT NULL,
  result_title VARCHAR(100) NOT NULL,
  result_content TEXT,
  result_image VARCHAR(255),
  result_tags VARCHAR(255), -- JSON 数组字符串，例如：["外向", "理性"]
  order_num INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  theme_id VARCHAR(50) REFERENCES themes(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL, -- wechat | redemption_code
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending | paid | failed | refunded
  redemption_code VARCHAR(50),
  wechat_order_id VARCHAR(100),
  wechat_transaction_id VARCHAR(100),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. 用户权益表（记录用户已购买的主题）
CREATE TABLE IF NOT EXISTS user_entitlements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  theme_id VARCHAR(50) REFERENCES themes(id) ON DELETE CASCADE,
  order_id VARCHAR(50) REFERENCES orders(id),
  source VARCHAR(20) NOT NULL, -- purchase | redemption | gift
  expires_at TIMESTAMP, -- NULL 表示永久有效
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, theme_id)
);

-- 7. 测评记录表（如果不存在则创建）
CREATE TABLE IF NOT EXISTS assessment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50),
  assessment_id VARCHAR(50),
  theme_id VARCHAR(50),
  answers JSONB,
  score DECIMAL(10,2) DEFAULT 0,
  result_id VARCHAR(50),
  result_title VARCHAR(100),
  result_content TEXT,
  ai_analysis TEXT, -- AI 个性化解析
  ai_status VARCHAR(20) DEFAULT 'pending', -- pending | generating | completed | failed
  duration INTEGER,
  poster_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. 测评统计表
CREATE TABLE IF NOT EXISTS assessment_stats (
  assessment_id VARCHAR(50) PRIMARY KEY,
  total_count INTEGER DEFAULT 0,
  avg_score DECIMAL(10,2),
  avg_duration INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. 创建索引
CREATE INDEX IF NOT EXISTS idx_questions_theme ON questions(theme_id, order_num);
CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id, order_num);
CREATE INDEX IF NOT EXISTS idx_scoring_theme ON scoring_rules(theme_id, min_score, max_score);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON user_entitlements(user_id, theme_id);
CREATE INDEX IF NOT EXISTS idx_records_theme ON assessment_records(theme_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_user ON assessment_records(user_id, created_at DESC);

-- 10. 添加字段（如果不存在）
ALTER TABLE assessment_records ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE assessment_records ADD COLUMN IF NOT EXISTS poster_url VARCHAR(500);
ALTER TABLE assessment_records ADD COLUMN IF NOT EXISTS theme_id VARCHAR(50);
ALTER TABLE assessment_records ADD COLUMN IF NOT EXISTS result_title VARCHAR(100);
ALTER TABLE assessment_records ADD COLUMN IF NOT EXISTS result_content TEXT;

-- 11. 示例数据：创建一个完整的 MBTI 主题
INSERT INTO themes (id, name, description, cover_image, price, question_count, estimated_time, status)
VALUES (
  'mbti',
  'MBTI性格测试',
  '通过16种性格类型，深入了解你的性格特质、优势和发展方向',
  '/images/themes/mbti-cover.jpg',
  29.90,
  5,
  10,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 清空并重新插入示例题目
DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE theme_id = 'mbti');
DELETE FROM questions WHERE theme_id = 'mbti';

-- 插入题目
INSERT INTO questions (theme_id, order_num, question_text, question_type) VALUES
  ('mbti', 1, '在社交场合中，你通常会：', 'single_choice'),
  ('mbti', 2, '做决定时，你更倾向于：', 'single_choice'),
  ('mbti', 3, '你对计划的态度是：', 'single_choice'),
  ('mbti', 4, '在工作中，你更喜欢：', 'single_choice'),
  ('mbti', 5, '你处理问题的方式是：', 'scale')
RETURNING id;

-- 插入选项（根据实际 question_id）
WITH q AS (SELECT id, order_num FROM questions WHERE theme_id = 'mbti' ORDER BY order_num)
INSERT INTO question_options (question_id, option_text, option_value, order_num)
SELECT
  q.id,
  case
    when q.order_num = 1 then opt.option_text
    when q.order_num = 2 then opt.option_text
    when q.order_num = 3 then opt.option_text
    when q.order_num = 4 then opt.option_text
  end,
  opt.value,
  opt.order_num
FROM q
CROSS JOIN LATERAL (
  VALUES
    (1, '主动与他人交流，享受社交氛围', 20, 1),
    (1, '等待他人来找你聊天', 10, 2),
    (2, '依靠逻辑和客观分析', 20, 1),
    (2, '考虑他人感受和价值观', 10, 2),
    (3, '提前做好详细计划', 20, 1),
    (3, '随机应变，走一步看一步', 10, 2),
    (4, '独立完成工作，有掌控感', 20, 1),
    (4, '团队协作，碰撞想法', 10, 2)
) AS opt(question_order, option_text, value, order_num)
WHERE q.order_num = opt.question_order;

-- 量表题不需要选项，保持为空

-- 示例评分规则
INSERT INTO scoring_rules (theme_id, min_score, max_score, result_title, result_content, result_tags, order_num)
VALUES
  ('mbti', 0, 40, '内向思考型 (INTJ)', '你倾向于独处和深度思考，善于分析问题。在需要深入研究的领域中表现出色。你喜欢独立工作，注重逻辑和效率。', '["深度思考", "独立", "逻辑型"]', 1),
  ('mbti', 41, 60, '平衡型 (INFJ)', '你兼具理想主义和务实精神，既能理解他人情感，也能做出理性判断。你善于洞察人心，是天生的领导者。', '["同理心", "洞察力", "领导力"]', 2),
  ('mbti', 61, 80, '外向行动型 (ENFP)', '你喜欢社交和行动，善于与人沟通合作。在团队协作中能发挥领导作用，富有创造力和热情。', '["社交达人", "行动派", "创造力"]', 3),
  ('mbti', 81, 100, '完美主义型 (ISTJ)', '你是一个实际和注重事实的个人，可靠性不容怀疑。你做事认真负责，追求完美，是值得信赖的伙伴。', '["责任感", "可靠性", "完美主义"]', 4)
ON CONFLICT DO NOTHING;

-- 12. 注释说明
COMMENT ON TABLE themes IS '测评主题配置表';
COMMENT ON TABLE questions IS '题目表，关联主题';
COMMENT ON TABLE question_options IS '题目选项表，每个选项有对应分值';
COMMENT ON TABLE scoring_rules IS '评分规则表，根据总分匹配结果';
COMMENT ON TABLE orders IS '订单表，记录所有支付订单';
COMMENT ON TABLE user_entitlements IS '用户权益表，记录用户已购买的主题';
COMMENT ON TABLE assessment_records IS '测评记录表，存储用户答题结果';
