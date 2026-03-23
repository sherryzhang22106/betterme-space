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

// 验证微信支付签名
function verifyWechatSign(data: any, sign: string): boolean {
  return true; // TODO: 实现实际签名验证
}

// 创建订单
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const { userId, themeId, paymentMethod, redemptionCode } = req.body;

  if (!themeId || !paymentMethod) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }

  const [theme] = await sql`
    SELECT * FROM themes WHERE id = ${themeId} AND status = 'active'
  `;

  if (!theme) {
    return res.status(404).json({ success: false, message: '主题不存在' });
  }

  const orderId = generateOrderId();
  const amount = Number(theme.price);

  // 兑换码支付
  if (paymentMethod === 'redemption') {
    if (!redemptionCode) {
      return res.status(400).json({ success: false, message: '请输入兑换码' });
    }

    const [code] = await sql`
      SELECT * FROM redemption_codes
      WHERE code = ${redemptionCode.toUpperCase().replace(/\s/g, '')}
    `;

    if (!code) {
      return res.status(404).json({ success: false, message: '兑换码不存在' });
    }

    if (code.status === 'used') {
      return res.status(400).json({ success: false, message: '兑换码已被使用' });
    }

    if (code.status === 'expired' || (code.expires_at && new Date(code.expires_at) < new Date())) {
      return res.status(400).json({ success: false, message: '兑换码已过期' });
    }

    await sql`
      INSERT INTO orders (id, user_id, theme_id, amount, payment_method, payment_status, redemption_code, paid_at)
      VALUES (${orderId}, ${userId || null}, ${themeId}, ${amount}, 'redemption_code', 'paid', ${redemptionCode}, NOW())
    `;

    await sql`
      UPDATE redemption_codes
      SET status = 'used', used_by = ${userId || null}, used_at = NOW(),
          used_for_product_id = ${themeId}, used_for_product_name = ${theme.name}
      WHERE id = ${code.id}
    `;

    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    await sql`
      INSERT INTO redemption_logs (code_id, code, user_id, product_id, ip_address, user_agent)
      VALUES (${code.id}, ${redemptionCode}, ${userId || null}, ${themeId}, ${ipAddress}, ${req.headers['user-agent'] || 'unknown'})
    `;

    if (userId) {
      await grantEntitlement(userId, themeId, orderId, 'redemption');
    }

    return res.status(200).json({ success: true, message: '兑换成功', orderId });
  }

  // 微信支付
  if (paymentMethod === 'wechat') {
    if (!userId) {
      return res.status(400).json({ success: false, message: '请先登录' });
    }

    await sql`
      INSERT INTO orders (id, user_id, theme_id, amount, payment_method, payment_status)
      VALUES (${orderId}, ${userId}, ${themeId}, ${amount}, 'wechat', 'pending')
    `;

    // TODO: 调用微信统一下单接口
    return res.status(200).json({
      success: true,
      orderId,
      paymentMethod: 'wechat',
      wechatPayParams: {
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
}

// 微信支付回调
async function handleNotify(req: VercelRequest, res: VercelResponse) {
  const { out_trade_no, transaction_id, result_code, sign } = req.body;

  console.log('微信支付回调:', req.body);

  if (!verifyWechatSign(req.body, sign)) {
    return res.status(200).send(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>`);
  }

  const [order] = await sql`SELECT * FROM orders WHERE id = ${out_trade_no}`;

  if (!order) {
    return res.status(200).send(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`);
  }

  if (order.payment_status === 'paid') {
    return res.status(200).send(`<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`);
  }

  if (result_code === 'SUCCESS') {
    await sql`
      UPDATE orders SET payment_status = 'paid', wechat_transaction_id = ${transaction_id}, paid_at = NOW(), updated_at = NOW()
      WHERE id = ${out_trade_no}
    `;
    await grantEntitlement(order.user_id, order.theme_id, order.id, 'purchase');
    console.log(`订单 ${out_trade_no} 支付成功`);
    return res.status(200).send(`<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`);
  } else {
    await sql`UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = ${out_trade_no}`;
    return res.status(200).send(`<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`);
  }
}

// 主处理函数
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  try {
    if (req.method === 'POST' && action === 'notify') {
      return handleNotify(req, res);
    }

    if (req.method === 'POST') {
      return handleCreate(req, res);
    }

    return res.status(405).json({ success: false, message: '方法不允许' });
  } catch (error: any) {
    console.error('Payment error:', error);
    return res.status(500).json({ success: false, message: '操作失败', error: error.message });
  }
}
