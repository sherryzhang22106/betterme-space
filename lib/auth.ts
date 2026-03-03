import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function verifyAdmin(req: VercelRequest): Promise<{ userId: string; isAdmin: boolean; error?: string }> {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    // 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { userId: '', isAdmin: false, error: '未提供认证令牌' };
    }

    const token = authHeader.replace('Bearer ', '');

    // 验证 token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return { userId: '', isAdmin: false, error: '无效的认证令牌' };
    }

    if (!decoded.userId) {
      return { userId: '', isAdmin: false, error: '令牌格式错误' };
    }

    // 查询用户角色
    const [user] = await sql`
      SELECT id, role FROM users WHERE id = ${decoded.userId}
    `;

    if (!user) {
      return { userId: '', isAdmin: false, error: '用户不存在' };
    }

    if (user.role !== 'admin') {
      return { userId: decoded.userId, isAdmin: false, error: '无管理员权限' };
    }

    return { userId: decoded.userId, isAdmin: true };

  } catch (error) {
    console.error('验证管理员权限失败:', error);
    return { userId: '', isAdmin: false, error: '权限验证失败' };
  }
}

export function unauthorizedResponse(res: VercelResponse, message: string = '未授权访问') {
  return res.status(401).json({
    success: false,
    message
  });
}

export function forbiddenResponse(res: VercelResponse, message: string = '无权限访问') {
  return res.status(403).json({
    success: false,
    message
  });
}
