import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 内联权限验证
async function verifyAdmin(req: VercelRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    if (!decoded.userId) {
      return { isAdmin: false };
    }

    const [user] = await sql`SELECT id, role FROM users WHERE id = ${decoded.userId}`;
    return { isAdmin: user && user.role === 'admin', userId: decoded.userId };
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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  // 验证管理员权限
  const auth = await verifyAdmin(req);
  if (!auth.isAdmin) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  try {
    const { productId, productName, count = 1, batchNo, expiresAt, notes } = req.body;

    if (!productId || !productName) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    if (count < 1 || count > 1000) {
      return res.status(400).json({ success: false, message: '生成数量必须在 1-1000 之间' });
    }

    // 批量生成兑换码
    const codes: string[] = [];
    const generatedCodes: any[] = [];

    for (let i = 0; i < count; i++) {
      let code = generateCode();
      while (codes.includes(code)) {
        code = generateCode();
      }
      codes.push(code);
    }

    // 批量插入数据库
    for (const code of codes) {
      const [result] = await sql`
        INSERT INTO redemption_codes (code, product_id, product_name, batch_no, created_by, expires_at, notes)
        VALUES (${code}, ${productId}, ${productName}, ${batchNo || null}, ${auth.userId}, ${expiresAt || null}, ${notes || null})
        RETURNING id, code, product_id, product_name, batch_no, status, created_at
      `;
      generatedCodes.push(result);
    }

    return res.status(200).json({
      success: true,
      message: `成功生成 ${count} 个兑换码`,
      codes: generatedCodes
    });

  } catch (error: any) {
    console.error('生成兑换码失败:', error);
    return res.status(500).json({
      success: false,
      message: '生成兑换码失败',
      error: error.message
    });
  }
}
