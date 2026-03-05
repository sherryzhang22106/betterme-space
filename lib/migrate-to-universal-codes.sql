-- 修改兑换码表为通用兑换码（不绑定特定产品）
-- 执行此脚本前，请先备份数据库！

-- 1. 删除 product_id 相关的索引
DROP INDEX IF EXISTS idx_codes_product_id;

-- 2. 修改表结构：将 product_id 和 product_name 改为可选
ALTER TABLE redemption_codes
  ALTER COLUMN product_id DROP NOT NULL,
  ALTER COLUMN product_name DROP NOT NULL;

-- 3. 添加新字段：用于记录兑换码实际使用的产品
ALTER TABLE redemption_codes
  ADD COLUMN IF NOT EXISTS used_for_product_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS used_for_product_name VARCHAR(100);

-- 4. 更新现有数据：将 product_id 移到 used_for_product_id（如果已使用）
UPDATE redemption_codes
SET used_for_product_id = product_id,
    used_for_product_name = product_name
WHERE status = 'used';

-- 5. 清空未使用兑换码的 product_id（使其变为通用）
UPDATE redemption_codes
SET product_id = NULL,
    product_name = NULL
WHERE status = 'active';

-- 6. 添加注释说明新的字段用途
COMMENT ON COLUMN redemption_codes.product_id IS '(已废弃) 原产品限制字段';
COMMENT ON COLUMN redemption_codes.product_name IS '(已废弃) 原产品名称字段';
COMMENT ON COLUMN redemption_codes.used_for_product_id IS '实际使用的产品ID';
COMMENT ON COLUMN redemption_codes.used_for_product_name IS '实际使用的产品名称';

-- 说明：
-- - 新生成的兑换码 product_id 和 product_name 为 NULL（通用兑换码）
-- - 使用时记录到 used_for_product_id 和 used_for_product_name
-- - 兑换记录表 redemption_logs 中的 product_id 记录实际使用的产品
