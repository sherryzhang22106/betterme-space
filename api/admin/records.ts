import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

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
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId?: string; userId?: string; role?: string };

    // 支持两种 token：新的 adminId 和旧的 userId
    if (decoded.adminId) {
      // 新的管理员 token
      const [admin] = await sql`SELECT id, role FROM admins WHERE id = ${decoded.adminId}`;
      return admin && admin.role === 'admin';
    } else if (decoded.userId) {
      // 兼容旧的用户 token（临时）
      const [user] = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
      return user && user.role === 'admin';
    }

    return false;
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
    const records = await sql`
      SELECT
        r.id,
        r.user_id,
        r.assessment_id,
        r.score,
        r.created_at,
        u.phone,
        u.email
      FROM assessment_records r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    const formattedRecords = records.map(r => ({
      id: r.id,
      userId: r.user_id,
      userAccount: r.phone || r.email || null,
      assessmentId: r.assessment_id,
      score: r.score,
      createdAt: r.created_at
    }));

    return res.status(200).json({
      success: true,
      records: formattedRecords
    });
  } catch (error) {
    console.error('Records error:', error);
    return res.status(500).json({ success: false, error: '获取测评记录失败' });
  }
}
