-- 设置管理员账号
-- 请在 Neon 数据库控制台执行此脚本

-- 1. 首先查看现有用户
SELECT id, phone, email, account, role FROM users;

-- 2. 将指定账号设置为管理员（请替换为你的实际账号）
-- 方式1：通过手机号
UPDATE users SET role = 'admin' WHERE phone = '17306405223';

-- 方式2：通过邮箱
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- 方式3：通过 account 字段
-- UPDATE users SET role = 'admin' WHERE account = 'admin';

-- 3. 验证是否设置成功
SELECT id, phone, email, account, role FROM users WHERE role = 'admin';
