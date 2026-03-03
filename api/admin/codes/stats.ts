import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 验证管理员权限
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const [user] = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }

    // 统计数据
    const [totalCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes`;
    const [usedCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes WHERE status = 'used'`;
    const [activeCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes WHERE status = 'active'`;

    // 按产品统计
    const productStats = await sql`
      SELECT
        product_id,
        product_name,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM redemption_codes
      GROUP BY product_id, product_name
      ORDER BY total DESC
    `;

    // 最近使用记录
    const recentLogs = await sql`
      SELECT
        rl.*,
        rc.product_name,
        u.account as user_account
      FROM redemption_logs rl
      LEFT JOIN redemption_codes rc ON rl.code_id = rc.id
      LEFT JOIN users u ON rl.user_id = u.id
      ORDER BY rl.created_at DESC
      LIMIT 10
    `;

    return res.status(200).json({
      success: true,
      stats: {
        total: Number(totalCodes.count),
        used: Number(usedCodes.count),
        active: Number(activeCodes.count),
        usageRate: totalCodes.count > 0
          ? ((usedCodes.count / totalCodes.count) * 100).toFixed(2) + '%'
          : '0%'
      },
      productStats,
      recentLogs
    });

  } catch (error: any) {
    console.error('获取兑换码统计失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取兑换码统计失败',
      error: error.message
    });
  }
}
