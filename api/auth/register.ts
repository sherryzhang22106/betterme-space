import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { account, password } = req.body || {};

    // 验证输入
    if (!account || !password) {
      return res.status(400).json({ error: '请填写账号和密码' });
    }

    // 验证账号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isPhone = phoneRegex.test(account);
    const isEmail = emailRegex.test(account);

    if (!isPhone && !isEmail) {
      return res.status(400).json({ error: '请输入正确的手机号或邮箱格式' });
    }

    // 验证密码强度
    if (password.length < 8) {
      return res.status(400).json({ error: '密码长度至少8位' });
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: '密码需包含字母和数字' });
    }

    // 检查账号是否已存在
    let existing;
    if (isPhone) {
      existing = await sql`SELECT id FROM users WHERE phone = ${account}`;
    } else {
      existing = await sql`SELECT id FROM users WHERE email = ${account}`;
    }

    if (existing.length > 0) {
      return res.status(400).json({ error: '该账号已被注册' });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    let result;
    if (isPhone) {
      result = await sql`
        INSERT INTO users (phone, password_hash)
        VALUES (${account}, ${passwordHash})
        RETURNING id, phone, email, nickname, avatar, created_at
      `;
    } else {
      result = await sql`
        INSERT INTO users (email, password_hash)
        VALUES (${account}, ${passwordHash})
        RETURNING id, phone, email, nickname, avatar, created_at
      `;
    }

    const user = result[0];
    const userData = {
      id: user.id,
      account: user.phone || user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      createdAt: user.created_at,
    };

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ user: userData, token });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: '注册失败: ' + (error.message || '未知错误') });
  }
}
