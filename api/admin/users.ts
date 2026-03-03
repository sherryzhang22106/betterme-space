import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '../../lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  // 验证管理员权限
  const auth = await verifyAdmin(req);
  if (!auth.isAdmin) {
    if (auth.error === '未提供认证令牌' || auth.error === '无效的认证令牌') {
      return unauthorizedResponse(res, auth.error);
    }
    return forbiddenResponse(res, auth.error);
  }

  try {
    const users = await sql`
      SELECT id, phone, email, nickname, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const formattedUsers = users.map(u => ({
      id: u.id,
      account: u.phone || u.email,
      nickname: u.nickname,
      role: u.role || 'user',
      createdAt: u.created_at
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Users error:', error);
    return res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
}
