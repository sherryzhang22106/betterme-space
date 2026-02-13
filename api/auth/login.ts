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

    if (!account || !password) {
      return res.status(400).json({ error: '请填写账号和密码' });
    }

    // 判断是手机号还是邮箱
    const phoneRegex = /^1[3-9]\d{9}$/;
    const isPhone = phoneRegex.test(account);

    // 查找用户
    let users;
    if (isPhone) {
      users = await sql`
        SELECT id, phone, email, password_hash, nickname, avatar, created_at
        FROM users WHERE phone = ${account}
      `;
    } else {
      users = await sql`
        SELECT id, phone, email, password_hash, nickname, avatar, created_at
        FROM users WHERE email = ${account}
      `;
    }

    if (users.length === 0) {
      return res.status(400).json({ error: '账号不存在' });
    }

    const user = users[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: '密码错误' });
    }

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
    console.error('Login error:', error);
    return res.status(500).json({ error: '登录失败: ' + (error.message || '未知错误') });
  }
}
