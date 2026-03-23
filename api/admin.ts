import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
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

    if (decoded.adminId) {
      const [admin] = await sql`SELECT id, role FROM admins WHERE id = ${decoded.adminId}`;
      return { isAdmin: admin && admin.role === 'admin', adminId: decoded.adminId };
    } else if (decoded.userId) {
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
  const { action } = req.query;

  // 管理员登录（无需权限验证）
  if (action === 'login' && req.method === 'POST') {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' });
      }

      const [admin] = await sql`
        SELECT id, username, password_hash, role
        FROM admins
        WHERE username = ${username} AND role = 'admin'
      `;

      if (!admin) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }

      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }

      const token = jwt.sign(
        { adminId: admin.id, username: admin.username, role: admin.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        admin: { id: admin.id, username: admin.username, role: admin.role }
      });
    } catch (error: any) {
      console.error('管理员登录失败:', error);
      return res.status(500).json({ success: false, message: '登录失败', error: error.message });
    }
  }

  // 需要权限验证的操作
  const auth = await verifyAdmin(req);
  if (!auth.isAdmin) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  try {
    // 获取统计数据
    if (action === 'stats' && req.method === 'GET') {
      const totalUsersResult = await sql`SELECT COUNT(*) as count FROM users`;
      const totalRecordsResult = await sql`SELECT COUNT(*) as count FROM assessment_records`;
      const todayUsersResult = await sql`SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE`;
      const todayRecordsResult = await sql`SELECT COUNT(*) as count FROM assessment_records WHERE created_at >= CURRENT_DATE`;

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: parseInt(totalUsersResult[0].count) || 0,
          totalRecords: parseInt(totalRecordsResult[0].count) || 0,
          todayUsers: parseInt(todayUsersResult[0].count) || 0,
          todayRecords: parseInt(todayRecordsResult[0].count) || 0
        }
      });
    }

    // 获取测评记录列表
    if (action === 'records' && req.method === 'GET') {
      const records = await sql`
        SELECT r.id, r.user_id, r.assessment_id, r.score, r.created_at, u.phone, u.email
        FROM assessment_records r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 100
      `;

      return res.status(200).json({
        success: true,
        records: records.map(r => ({
          id: r.id,
          userId: r.user_id,
          userAccount: r.phone || r.email || null,
          assessmentId: r.assessment_id,
          score: r.score,
          createdAt: r.created_at
        }))
      });
    }

    // 获取用户列表
    if (action === 'users' && req.method === 'GET') {
      const users = await sql`
        SELECT id, phone, email, nickname, role, created_at
        FROM users ORDER BY created_at DESC LIMIT 100
      `;

      return res.status(200).json({
        success: true,
        users: users.map(u => ({
          id: u.id,
          account: u.phone || u.email,
          nickname: u.nickname,
          role: u.role || 'user',
          createdAt: u.created_at
        }))
      });
    }

    // 生成兑换码
    if (action === 'generate' && req.method === 'POST') {
      const { count = 1, batchNo, expiresAt, notes } = req.body;

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
          INSERT INTO redemption_codes (code, batch_no, created_by, expires_at, notes)
          VALUES (${code}, ${batchNo || null}, ${auth.adminId}, ${expiresAt || null}, ${notes || null})
          RETURNING id, code, batch_no, status, created_at
        `;
        generatedCodes.push(result);
      }

      return res.status(200).json({
        success: true,
        message: `成功生成 ${count} 个通用兑换码`,
        codes: generatedCodes
      });
    }

    // 获取兑换码列表
    if (action === 'codes' && req.method === 'GET') {
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

      const [{ count: total }] = await sql`SELECT COUNT(*) as count FROM redemption_codes ${whereClause}`;

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

    // 获取兑换码统计
    if (action === 'code-stats' && req.method === 'GET') {
      const [totalCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes`;
      const [usedCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes WHERE status = 'used'`;
      const [activeCodes] = await sql`SELECT COUNT(*) as count FROM redemption_codes WHERE status = 'active'`;

      const recentLogs = await sql`
        SELECT rl.*, rc.product_name, u.account as user_account
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
          usageRate: totalCodes.count > 0 ? ((usedCodes.count / totalCodes.count) * 100).toFixed(2) + '%' : '0%'
        },
        recentLogs
      });
    }

    return res.status(400).json({ success: false, message: '无效的操作' });

  } catch (error: any) {
    console.error('Admin API error:', error);
    return res.status(500).json({ success: false, message: '操作失败', error: error.message });
  }
}
