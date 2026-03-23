import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { userId, themeId } = req.query;

    if (!userId || !themeId) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 检查用户是否有该主题的权益
    const [entitlement] = await sql`
      SELECT
        e.*,
        t.name as theme_name
      FROM user_entitlements e
      LEFT JOIN themes t ON e.theme_id = t.id
      WHERE e.user_id = ${userId as string}
        AND e.theme_id = ${themeId as string}
        AND (e.expires_at IS NULL OR e.expires_at > NOW())
    `;

    if (entitlement) {
      return res.status(200).json({
        success: true,
        hasAccess: true,
        entitlement: {
          source: entitlement.source,
          expiresAt: entitlement.expires_at,
          createdAt: entitlement.created_at
        }
      });
    }

    // 检查主题是否免费
    const [theme] = await sql`
      SELECT price FROM themes WHERE id = ${themeId as string}
    `;

    if (theme && Number(theme.price) === 0) {
      return res.status(200).json({
        success: true,
        hasAccess: true,
        reason: 'free'
      });
    }

    return res.status(200).json({
      success: true,
      hasAccess: false
    });

  } catch (error: any) {
    console.error('检查权限失败:', error);
    return res.status(500).json({
      success: false,
      message: '检查权限失败',
      error: error.message
    });
  }
}
