import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '../../lib/auth';

const sql = neon(process.env.DATABASE_URL!);

// 生成随机兑换码
function generateCode(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆的字符
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // 格式化为 XXXX-XXXX-XXXX
  return code.match(/.{1,4}/g)?.join('-') || code;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
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
      // 确保不重复
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
