import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 内联权限验证
async function verifyAdmin(req: VercelRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    if (!decoded.userId) {
      return false;
    }

    const [user] = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  // 验证管理员权限
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  try {
    // 总用户数
    const totalUsersResult = await sql`SELECT COUNT(*) as count FROM users`;
    const totalUsers = parseInt(totalUsersResult[0].count) || 0;

    // 总测评记录数
    const totalRecordsResult = await sql`SELECT COUNT(*) as count FROM assessment_records`;
    const totalRecords = parseInt(totalRecordsResult[0].count) || 0;

    // 今日新增用户
    const todayUsersResult = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= CURRENT_DATE
    `;
    const todayUsers = parseInt(todayUsersResult[0].count) || 0;

    // 今日测评数
    const todayRecordsResult = await sql`
      SELECT COUNT(*) as count FROM assessment_records
      WHERE created_at >= CURRENT_DATE
    `;
    const todayRecords = parseInt(todayRecordsResult[0].count) || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRecords,
        todayUsers,
        todayRecords
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, error: '获取统计数据失败' });
  }
}
