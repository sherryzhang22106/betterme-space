import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { code, productId, userId } = req.body;

    if (!code || !productId) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 查询兑换码
    const [redemptionCode] = await sql`
      SELECT * FROM redemption_codes
      WHERE code = ${code.toUpperCase().replace(/\s/g, '')}
    `;

    if (!redemptionCode) {
      return res.status(404).json({ success: false, message: '兑换码不存在' });
    }

    // 检查兑换码状态
    if (redemptionCode.status === 'used') {
      return res.status(400).json({
        success: false,
        message: '兑换码已被使用',
        usedAt: redemptionCode.used_at
      });
    }

    if (redemptionCode.status === 'expired') {
      return res.status(400).json({ success: false, message: '兑换码已过期' });
    }

    // 检查是否过期
    if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
      await sql`
        UPDATE redemption_codes
        SET status = 'expired'
        WHERE id = ${redemptionCode.id}
      `;
      return res.status(400).json({ success: false, message: '兑换码已过期' });
    }

    // 检查产品是否匹配
    if (redemptionCode.product_id !== productId) {
      return res.status(400).json({
        success: false,
        message: `此兑换码仅适用于「${redemptionCode.product_name}」`,
        validProduct: redemptionCode.product_name
      });
    }

    // 标记为已使用
    await sql`
      UPDATE redemption_codes
      SET status = 'used',
          used_by = ${userId || null},
          used_at = NOW()
      WHERE id = ${redemptionCode.id}
    `;

    // 记录兑换日志
    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await sql`
      INSERT INTO redemption_logs (code_id, code, user_id, product_id, ip_address, user_agent)
      VALUES (${redemptionCode.id}, ${code}, ${userId || null}, ${productId}, ${ipAddress}, ${userAgent})
    `;

    return res.status(200).json({
      success: true,
      message: '兑换成功',
      data: {
        productId: redemptionCode.product_id,
        productName: redemptionCode.product_name
      }
    });

  } catch (error: any) {
    console.error('验证兑换码失败:', error);
    return res.status(500).json({
      success: false,
      message: '验证兑换码失败',
      error: error.message
    });
  }
}
