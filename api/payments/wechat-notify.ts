import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// 授予用户权益
async function grantEntitlement(userId: string, themeId: string, orderId: string) {
  await sql`
    INSERT INTO user_entitlements (user_id, theme_id, order_id, source)
    VALUES (${userId}, ${themeId}, ${orderId}, 'purchase')
    ON CONFLICT (user_id, theme_id) DO NOTHING
  `;
}

// 验证微信支付签名
function verifyWechatSign(data: any, sign: string): boolean {
  // TODO: 实现微信支付签名验证
  // 这里需要根据微信支付文档实现签名验证逻辑
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 微信支付回调数据
    const {
      out_trade_no,      // 商户订单号
      transaction_id,    // 微信支付订单号
      total_fee,         // 订单金额（分）
      result_code,       // 支付结果
      sign              // 签名
    } = req.body;

    console.log('微信支付回调:', req.body);

    // 验证签名
    if (!verifyWechatSign(req.body, sign)) {
      return res.status(400).send(`
        <xml>
          <return_code><![CDATA[FAIL]]></return_code>
          <return_msg><![CDATA[签名验证失败]]></return_msg>
        </xml>
      `);
    }

    // 查询订单
    const [order] = await sql`
      SELECT * FROM orders WHERE id = ${out_trade_no}
    `;

    if (!order) {
      return res.status(404).send(`
        <xml>
          <return_code><![CDATA[FAIL]]></return_code>
          <return_msg><![CDATA[订单不存在]]></return_msg>
        </xml>
      `);
    }

    // 如果订单已经处理过，直接返回成功
    if (order.payment_status === 'paid') {
      return res.status(200).send(`
        <xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
        </xml>
      `);
    }

    // 支付成功
    if (result_code === 'SUCCESS') {
      // 更新订单状态
      await sql`
        UPDATE orders
        SET payment_status = 'paid',
            wechat_transaction_id = ${transaction_id},
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = ${out_trade_no}
      `;

      // 授予用户权益
      await grantEntitlement(order.user_id, order.theme_id, order.id);

      console.log(`订单 ${out_trade_no} 支付成功，已授予权益`);

      return res.status(200).send(`
        <xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
        </xml>
      `);
    } else {
      // 支付失败
      await sql`
        UPDATE orders
        SET payment_status = 'failed',
            updated_at = NOW()
        WHERE id = ${out_trade_no}
      `;

      return res.status(200).send(`
        <xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
        </xml>
      `);
    }

  } catch (error: any) {
    console.error('微信支付回调处理失败:', error);
    return res.status(500).send(`
      <xml>
        <return_code><![CDATA[FAIL]]></return_code>
        <return_msg><![CDATA[系统错误]]></return_msg>
      </xml>
    `);
  }
}
