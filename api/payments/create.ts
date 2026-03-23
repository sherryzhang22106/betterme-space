import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// 生成订单ID
function generateOrderId(): string {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// 授予用户权益
async function grantEntitlement(userId: string, themeId: string, orderId: string, source: string) {
  await sql`
    INSERT INTO user_entitlements (user_id, theme_id, order_id, source)
    VALUES (${userId}, ${themeId}, ${orderId}, ${source})
    ON CONFLICT (user_id, theme_id) DO NOTHING
  `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { userId, themeId, paymentMethod, redemptionCode } = req.body;

    if (!themeId || !paymentMethod) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 获取主题信息
    const [theme] = await sql`
      SELECT * FROM themes WHERE id = ${themeId} AND status = 'active'
    `;

    if (!theme) {
      return res.status(404).json({ success: false, message: '主题不存在' });
    }

    const orderId = generateOrderId();
    const amount = Number(theme.price);

    // ==================== 兑换码支付 ====================
    if (paymentMethod === 'redemption') {
      if (!redemptionCode) {
        return res.status(400).json({ success: false, message: '请输入兑换码' });
      }

      // 查询兑换码
      const [code] = await sql`
        SELECT * FROM redemption_codes
        WHERE code = ${redemptionCode.toUpperCase().replace(/\s/g, '')}
      `;

      if (!code) {
        return res.status(404).json({ success: false, message: '兑换码不存在' });
      }

      if (code.status === 'used') {
        return res.status(400).json({
          success: false,
          message: '兑换码已被使用',
          usedAt: code.used_at
        });
      }

      if (code.status === 'expired') {
        return res.status(400).json({ success: false, message: '兑换码已过期' });
      }

      // 检查是否过期
      if (code.expires_at && new Date(code.expires_at) < new Date()) {
        await sql`
          UPDATE redemption_codes
          SET status = 'expired'
          WHERE id = ${code.id}
        `;
        return res.status(400).json({ success: false, message: '兑换码已过期' });
      }

      // 创建订单（已支付状态）
      await sql`
        INSERT INTO orders (id, user_id, theme_id, amount, payment_method, payment_status, redemption_code, paid_at)
        VALUES (${orderId}, ${userId || null}, ${themeId}, ${amount}, 'redemption_code', 'paid', ${redemptionCode}, NOW())
      `;

      // 标记兑换码为已使用
      await sql`
        UPDATE redemption_codes
        SET status = 'used',
            used_by = ${userId || null},
            used_at = NOW(),
            used_for_product_id = ${themeId},
            used_for_product_name = ${theme.name}
        WHERE id = ${code.id}
      `;

      // 记录兑换日志
      const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      await sql`
        INSERT INTO redemption_logs (code_id, code, user_id, product_id, ip_address, user_agent)
        VALUES (${code.id}, ${redemptionCode}, ${userId || null}, ${themeId}, ${ipAddress}, ${userAgent})
      `;

      // 授予权益
      if (userId) {
        await grantEntitlement(userId, themeId, orderId, 'redemption');
      }

      return res.status(200).json({
        success: true,
        message: '兑换成功',
        orderId,
        data: {
          themeId,
          themeName: theme.name
        }
      });
    }

    // ==================== 微信支付 ====================
    if (paymentMethod === 'wechat') {
      if (!userId) {
        return res.status(400).json({ success: false, message: '请先登录' });
      }

      // 创建订单（待支付状态）
      await sql`
        INSERT INTO orders (id, user_id, theme_id, amount, payment_method, payment_status)
        VALUES (${orderId}, ${userId}, ${themeId}, ${amount}, 'wechat', 'pending')
      `;

      // TODO: 调用微信统一下单接口
      // 这里需要集成微信支付 SDK
      // const wechatPayParams = await createWechatOrder(orderId, amount, openid);

      // 临时返回模拟数据
      return res.status(200).json({
        success: true,
        orderId,
        paymentMethod: 'wechat',
        wechatPayParams: {
          // 这些参数需要从微信支付接口获取
          appId: process.env.WECHAT_APPID || '',
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: crypto.randomBytes(16).toString('hex'),
          package: `prepay_id=wx${Date.now()}`,
          signType: 'RSA',
          paySign: 'mock_sign_' + crypto.randomBytes(16).toString('hex')
        },
        message: '请在微信中完成支付'
      });
    }

    return res.status(400).json({ success: false, message: '不支持的支付方式' });

  } catch (error: any) {
    console.error('创建订单失败:', error);
    return res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
}
