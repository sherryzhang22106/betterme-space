import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 内联权限验证
async function verifyAdmin(req: VercelRequest): Promise<{ isAdmin: boolean; adminId?: string }> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId?: string; userId?: string; role?: string };

    // 支持两种 token：新的 adminId 和旧的 userId
    if (decoded.adminId) {
      // 新的管理员 token
      const [admin] = await sql`SELECT id, role FROM admins WHERE id = ${decoded.adminId}`;
      return { isAdmin: admin && admin.role === 'admin', adminId: decoded.adminId };
    } else if (decoded.userId) {
      // 兼容旧的用户 token（临时）
      const [user] = await sql`SELECT id, role FROM users WHERE id = ${decoded.userId}`;
      return { isAdmin: user && user.role === 'admin', adminId: decoded.userId };
    }

    return { isAdmin: false };
  } catch (error) {
    return { isAdmin: false };
  }
}

// 生成随机兑换码
function generateCode(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.match(/.{1,4}/g)?.join('-') || code;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 验证管理员权限
  const auth = await verifyAdmin(req);
  if (!auth.isAdmin) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  const { action } = req.query;

  try {
    // 生成兑换码
    if (action === 'generate' && req.method === 'POST') {
      const { productId, productName, count = 1, batchNo, expiresAt, notes } = req.body;

      if (!productId || !productName) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }

      if (count < 1 || count > 1000) {
        return res.status(400).json({ success: false, message: '生成数量必须在 1-1000 之间' });
      }

      const codes: string[] = [];
      const generatedCodes: any[] = [];

      for (let i = 0; i < count; i++) {
        let code = generateCode();
        while (codes.includes(code)) {
          code = generateCode();
        }
        codes.push(code);
      }

      for (const code of codes) {
        const [result] = await sql`
          INSERT INTO redemption_codes (code, product_id, product_name, batch_no, created_by, expires_at, notes)
          VALUES (${code}, ${productId}, ${productName}, ${batchNo || null}, ${auth.adminId}, ${expiresAt || null}, ${notes || null})
          RETURNING id, code, product_id, product_name, batch_no, status, created_at
        `;
        generatedCodes.push(result);
      }

      return res.status(200).json({
        success: true,
        message: `成功生成 ${count} 个兑换码`,
        codes: generatedCodes
      });
    }

    // 获取兑换码列表
    if (action === 'list' && req.method === 'GET') {
      const { status, productId, batchNo, page = 1, limit = 50 } = req.query;

      let conditions = [];
      if (status) conditions.push(sql`status = ${status}`);
      if (productId) conditions.push(sql`product_id = ${productId}`);
      if (batchNo) conditions.push(sql`batch_no = ${batchNo}`);

      const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

      const offset = (Number(page) - 1) * Number(limit);

      const codes = await sql`
        SELECT * FROM redemption_codes
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${Number(limit)} OFFSET ${offset}
      `;

      const [{ count: total }] = await sql`
        SELECT COUNT(*) as count FROM redemption_codes
        ${whereClause}
      `;

      return res.status(200).json({
        success: true,
        codes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          totalPages: Math.ceil(Number(total) / Number(limit))
        }
      });
    }

    // 获取统计数据
    if (action === 'stats' && req.method === 'GET') {
      const [totalCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes`;
      const [usedCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes WHERE status = 'used'`;
      const [activeCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes WHERE status = 'active'`;

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
    }

    return res.status(400).json({ success: false, message: '无效的操作' });

  } catch (error: any) {
    console.error('兑换码管理失败:', error);
    return res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
}
